import { skills as skillsMap } from "@/state/content";
import { itemCatalog } from "@/state/items";
import type { Actor, Skill } from "@shared/types";
import type { EncounterDefinition } from "@/state/encounters";
import type { AppState } from "@/state/GameContext";

export type CombatStatus = "vulnerable" | "weakened" | "guarded";

export interface CombatantState {
  id: string;
  actor: Actor;
  side: "party" | "enemy";
  currentHP: number;
  currentSP: number;
  statuses: CombatStatus[];
}

export interface CombatSnapshot {
  encounter: EncounterDefinition;
  combatants: Record<string, CombatantState>;
  order: string[];
  turnIndex: number;
  round: number;
  log: string[];
  weaknessTracker: Record<string, number>;
  extraAction: boolean;
  ended: boolean;
  winner?: "party" | "enemy";
}

export type CombatAction =
  | { type: "attack"; targetId: string }
  | { type: "guard" }
  | { type: "skill"; skillId: string; target: "one" | "all"; targetId?: string }
  | { type: "item"; itemId: string; targetId: string }
  | { type: "end" };

interface CreateOptions {
  party: Actor[];
  encounter: EncounterDefinition;
  shardCount: number;
  flags: Record<string, boolean>;
}

export function createCombatState({ party, encounter, shardCount, flags }: CreateOptions): CombatSnapshot {
  const combatants: Record<string, CombatantState> = {};
  const order: string[] = [];

  party.forEach((actor, index) => {
    const id = `party-${actor.id}-${index}`;
    combatants[id] = {
      id,
      actor,
      side: "party",
      currentHP: actor.stats.maxHP,
      currentSP: actor.stats.maxSP,
      statuses: [],
    };
    order.push(id);
  });

  encounter.enemies.forEach((enemy, index) => {
    const adjusted = adjustEnemyForProgression(enemy, shardCount, flags);
    const id = `enemy-${enemy.id}-${index}`;
    combatants[id] = {
      id,
      actor: adjusted,
      side: "enemy",
      currentHP: adjusted.stats.maxHP,
      currentSP: adjusted.stats.maxSP,
      statuses: [],
    };
    order.push(id);
  });

  order.sort((a, b) => combatants[b].actor.stats.agi - combatants[a].actor.stats.agi);

  const state: CombatSnapshot = {
    encounter,
    combatants,
    order,
    turnIndex: 0,
    round: 1,
    log: [
      encounter.boss
        ? "The Avatar manifests, its voice a chorus of quivering mirrors."
        : "Shadows coil into shape."
    ],
    weaknessTracker: {},
    extraAction: false,
    ended: false,
  };

  // Opening debuff from beach flag
  if (encounter.boss && flags.bossOpeningDebuff) {
    Object.values(combatants)
      .filter((entity) => entity.side === "enemy")
      .forEach((entity) => applyStatus(entity, "weakened"));
    state.log.push("Lister's echo dulls the Avatar's first strike.");
  }

  const active = getActiveCombatant(state);
  if (active) {
    removeStatus(active, "guarded");
  }

  return state;
}

function adjustEnemyForProgression(actor: Actor, shardCount: number, flags: Record<string, boolean>) {
  const clone: Actor = {
    ...actor,
    stats: { ...actor.stats },
    skills: [...actor.skills],
    weaknesses: actor.weaknesses ? [...actor.weaknesses] : undefined,
    resistances: actor.resistances ? [...actor.resistances] : undefined,
  };

  if (clone.ai !== "boss") {
    return clone;
  }

  if (shardCount >= 1 && clone.resistances?.length) {
    clone.resistances = clone.resistances.slice(1);
  }
  if (shardCount >= 2 && clone.resistances?.length) {
    clone.resistances = clone.resistances.slice(1);
  }
  if (flags.unlockCompanionSkill && !clone.weaknesses?.includes("psychic")) {
    clone.weaknesses = [...(clone.weaknesses ?? []), "psychic"];
  }

  return clone;
}

export function getActiveCombatant(state: CombatSnapshot) {
  const activeId = state.order[state.turnIndex];
  return state.combatants[activeId];
}

export function performAction(
  current: CombatSnapshot,
  action: CombatAction,
  options: { inventory: AppState["inventory"]; flags: Record<string, boolean> },
): { next: CombatSnapshot; inventory: AppState["inventory"]; log: string[] } {
  if (current.ended) {
    return { next: current, inventory: options.inventory, log: [] };
  }

  const state = cloneState(current);
  const actor = getActiveCombatant(state);
  if (!actor || actor.currentHP <= 0) {
    advanceTurn(state);
    return { next: state, inventory: options.inventory, log: [] };
  }

  const logEntries: string[] = [];
  let inventory = options.inventory.map((entry) => ({ ...entry }));

  switch (action.type) {
    case "attack": {
      const result = resolveAttack(state, actor, action.targetId, "physical", undefined);
      logEntries.push(result.message);
      if (result.weaknessHit) {
        logEntries.push(`${actor.actor.name} seizes an extra breath of action!`);
      }
      break;
    }
    case "guard":
      removeStatus(actor, "vulnerable");
      applyStatus(actor, "guarded");
      state.log.push(`${actor.actor.name} braces against the dark.`);
      break;
    case "skill": {
      const skill = skillsMap[action.skillId];
      if (!skill) {
        logEntries.push("That skill is only a half-remembered dream.");
        break;
      }
      if (actor.currentSP < skill.costSP) {
        logEntries.push("Not enough SP to channel that memory.");
        break;
      }
      actor.currentSP -= skill.costSP;
      if (action.target === "one" && action.targetId) {
        const result = resolveAttack(state, actor, action.targetId, skill.element, skill);
        logEntries.push(result.message);
        if (result.weaknessHit) {
          logEntries.push(`${actor.actor.name} rides the weakness into another action!`);
        }
      } else {
        Object.values(state.combatants)
          .filter((combatant) => combatant.side !== actor.side && combatant.currentHP > 0)
          .forEach((target) => {
            const result = resolveAttack(state, actor, target.id, skill.element, skill);
            logEntries.push(result.message);
            if (result.weaknessHit) {
              logEntries.push(`${actor.actor.name} rides the weakness into another action!`);
            }
          });
      }
      break;
    }
    case "item": {
      const slot = inventory.find((entry) => entry.id === action.itemId && entry.qty > 0);
      const item = itemCatalog[action.itemId];
      if (!slot || !item) {
        logEntries.push("The item slips through your fingers.");
        break;
      }
      const target = state.combatants[action.targetId];
      if (!target || target.side !== "party") {
        logEntries.push("No ally to receive the item.");
        break;
      }
      if (item.healHP) {
        target.currentHP = Math.min(target.actor.stats.maxHP, target.currentHP + item.healHP);
      }
      if (item.healSP) {
        target.currentSP = Math.min(target.actor.stats.maxSP, target.currentSP + item.healSP);
      }
      slot.qty -= 1;
      logEntries.push(`${actor.actor.name} shares ${item.name}.`);
      break;
    }
    case "end":
      logEntries.push(`${actor.actor.name} yields the initiative.`);
      break;
  }

  state.log.push(...logEntries);
  determineWinner(state);

  if (!state.extraAction || action.type === "guard" || action.type === "item") {
    advanceTurn(state);
  } else {
    state.extraAction = false;
  }

  determineWinner(state);

  return { next: state, inventory, log: logEntries };
}

function resolveAttack(
  state: CombatSnapshot,
  attacker: CombatantState,
  targetId: string,
  element: Skill["element"] | "physical",
  skill?: Skill,
) {
  const target = state.combatants[targetId];
  if (!target || target.currentHP <= 0) {
    return { message: "The attack finds only fading mist.", weaknessHit: false };
  }

  const offenseStat = element === "physical" ? attacker.actor.stats.str : attacker.actor.stats.mag;
  const defenseStat = element === "physical" ? target.actor.stats.def : target.actor.stats.res;

  let baseDamage = Math.max(4, Math.round(offenseStat * 1.4 - defenseStat * 0.8));
  if (skill) {
    baseDamage = Math.round(baseDamage * skill.power);
  }

  if (hasStatus(attacker, "weakened")) {
    baseDamage = Math.round(baseDamage * 0.8);
  }
  if (hasStatus(target, "vulnerable")) {
    baseDamage = Math.round(baseDamage * 1.3);
  }
  if (hasStatus(target, "guarded")) {
    baseDamage = Math.round(baseDamage * 0.5);
  }

  const weaknesses = target.actor.weaknesses ?? [];
  const resistances = target.actor.resistances ?? [];
  const weaknessHit = weaknesses.includes(element as any);
  if (weaknessHit) {
    baseDamage = Math.round(baseDamage * 1.4);
  }
  if (resistances.includes(element as any)) {
    baseDamage = Math.round(baseDamage * 0.7);
  }

  const damage = Math.max(1, baseDamage);
  target.currentHP = Math.max(0, target.currentHP - damage);
  removeStatus(target, "guarded");

  if (skill?.applies) {
    skill.applies.forEach((status) => applyStatus(target, status));
  }

  maybeGrantExtraAction(state, attacker, weaknessHit);

  return {
    message: `${attacker.actor.name} hits ${target.actor.name} for ${damage} damage${weaknessHit ? " (weakness!)" : ""}.`,
    weaknessHit,
  };
}

function advanceTurn(state: CombatSnapshot) {
  if (state.ended) return;
  const originalIndex = state.turnIndex;
  const size = state.order.length;
  for (let i = 0; i < size; i++) {
    const nextIndex = (originalIndex + 1 + i) % size;
    if (nextIndex === 0 && originalIndex !== 0) {
      state.round += 1;
      state.weaknessTracker = {};
    }
    const candidate = state.combatants[state.order[nextIndex]];
    if (candidate && candidate.currentHP > 0) {
      state.turnIndex = nextIndex;
      removeStatus(candidate, "guarded");
      state.extraAction = false;
      return;
    }
  }
}

function determineWinner(state: CombatSnapshot) {
  const partyAlive = Object.values(state.combatants).some(
    (entity) => entity.side === "party" && entity.currentHP > 0,
  );
  const enemiesAlive = Object.values(state.combatants).some(
    (entity) => entity.side === "enemy" && entity.currentHP > 0,
  );

  if (!enemiesAlive) {
    state.ended = true;
    state.winner = "party";
  } else if (!partyAlive) {
    state.ended = true;
    state.winner = "enemy";
  }
}

function maybeGrantExtraAction(state: CombatSnapshot, attacker: CombatantState, weaknessHit: boolean) {
  if (!weaknessHit) {
    return;
  }
  const lastRound = state.weaknessTracker[attacker.id];
  if (lastRound === state.round) {
    state.extraAction = false;
    return;
  }
  state.weaknessTracker[attacker.id] = state.round;
  state.extraAction = true;
}

function hasStatus(entity: CombatantState, status: CombatStatus) {
  return entity.statuses.includes(status);
}

function applyStatus(entity: CombatantState, status: CombatStatus) {
  if (!entity.statuses.includes(status)) {
    entity.statuses = [...entity.statuses, status];
  }
}

function removeStatus(entity: CombatantState, status: CombatStatus) {
  if (entity.statuses.includes(status)) {
    entity.statuses = entity.statuses.filter((entry) => entry !== status);
  }
}

function cloneState(state: CombatSnapshot): CombatSnapshot {
  const combatants: Record<string, CombatantState> = {};
  for (const [id, entity] of Object.entries(state.combatants)) {
    combatants[id] = {
      id,
      actor: {
        ...entity.actor,
        stats: { ...entity.actor.stats },
        skills: [...entity.actor.skills],
        weaknesses: entity.actor.weaknesses ? [...entity.actor.weaknesses] : undefined,
        resistances: entity.actor.resistances ? [...entity.actor.resistances] : undefined,
      },
      side: entity.side,
      currentHP: entity.currentHP,
      currentSP: entity.currentSP,
      statuses: [...entity.statuses],
    };
  }
  return {
    encounter: state.encounter,
    combatants,
    order: [...state.order],
    turnIndex: state.turnIndex,
    round: state.round,
    log: [...state.log],
    weaknessTracker: { ...state.weaknessTracker },
    extraAction: state.extraAction,
    ended: state.ended,
    winner: state.winner,
  };
}




