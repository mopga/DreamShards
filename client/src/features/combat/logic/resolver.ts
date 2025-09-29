import type { Skill } from "@shared/types";
import type { ItemDefinition } from "@/state/items";
import { computeTurnQueue } from "./queue";
import { createEvent } from "./events";
import type {
  CombatAction,
  CombatActorState,
  CombatEvent,
  CombatState,
  CombatStatus,
} from "./types";
import { addStatus, hasStatus, isAlive, removeStatus } from "./status";

interface ResolveActionContext {
  skills: Record<string, Skill>;
  inventory: Array<{ id: string; qty: number }>;
  itemCatalog: Record<string, ItemDefinition>;
}

export interface ResolveActionResult {
  state: CombatState;
  events: CombatEvent[];
  inventory: Array<{ id: string; qty: number }>;
}

export function resolveAction(
  state: CombatState,
  action: CombatAction,
  context: ResolveActionContext,
): ResolveActionResult {
  if (state.ended) {
    return { state, events: [], inventory: context.inventory };
  }

  const next = cloneCombatState(state);
  const events: CombatEvent[] = [];
  const source = next.entities[action.sourceId];
  let inventory = context.inventory.map((slot) => ({ ...slot }));

  if (!source || !isAlive(source)) {
    return { state: next, events, inventory };
  }

  next.phase = "resolving";

  switch (action.type) {
    case "attack":
      handleAttack(next, source, action.targetId, undefined, events);
      break;
    case "skill":
      handleSkill(next, source, action.skillId, action.targetIds, context.skills, events);
      break;
    case "guard":
      handleGuard(next, source, events);
      break;
    case "item":
      inventory = handleItem(next, source, action.itemId, action.targetId, inventory, context, events);
      break;
    case "end":
      events.push(
        createEvent("TurnEnded", {
          sourceId: source.id,
          message: "combat.events.end_turn",
        }),
      );
      break;
    default:
      break;
  }

  advanceTurn(next, source, events);
  updatePhase(next);
  next.lastEvents = events;
  next.eventsLog = [...next.eventsLog, ...events].slice(-60);
  if (events.length) {
    next.turnHistory = [...next.turnHistory, events];
  }

  determineWinner(next);

  return { state: next, events, inventory };
}

function handleAttack(
  state: CombatState,
  source: CombatActorState,
  targetId: string,
  skill: Skill | undefined,
  events: CombatEvent[],
) {
  const target = state.entities[targetId];
  if (!target) {
    events.push(
      createEvent("Miss", {
        sourceId: source.id,
        targetId,
        message: "combat.events.miss",
      }),
    );
    return;
  }

  const resolution = resolveDamage(state, source, target, skill, events);
  if (resolution.weaknessHit) {
    events.push(
      createEvent("WeaknessTriggered", {
        sourceId: source.id,
        targetId: target.id,
        element: skill?.element,
        message: "combat.events.weakness",
      }),
    );
  }
}

function handleSkill(
  state: CombatState,
  source: CombatActorState,
  skillId: string,
  targetIds: string[],
  skills: Record<string, Skill>,
  events: CombatEvent[],
) {
  const skill = skills[skillId];
  if (!skill) {
    return;
  }

  if (source.currentSP < skill.costSP) {
    events.push(
      createEvent("Miss", {
        sourceId: source.id,
        targetId: targetIds[0] ?? "unknown",
        message: "combat.events.no_sp",
      }),
    );
    return;
  }

  source.currentSP = Math.max(0, source.currentSP - skill.costSP);

  if (skill.targets === "one") {
    const target = state.entities[targetIds[0] ?? ""];
    if (target) {
      const resolution = resolveDamage(state, source, target, skill, events);
      if (resolution.weaknessHit) {
        events.push(
          createEvent("WeaknessTriggered", {
            sourceId: source.id,
            targetId: target.id,
            element: skill.element,
            message: "combat.events.weakness",
          }),
        );
      }
    }
  } else {
    const candidates = targetIds.length
      ? targetIds.map((id) => state.entities[id]).filter(isAlive)
      : Object.values(state.entities).filter((entity) => entity.side !== source.side && isAlive(entity));
    candidates.forEach((target) => {
      const resolution = resolveDamage(state, source, target, skill, events);
      if (resolution.weaknessHit) {
        events.push(
          createEvent("WeaknessTriggered", {
            sourceId: source.id,
            targetId: target.id,
            element: skill.element,
            message: "combat.events.weakness",
          }),
        );
      }
    });
  }
}

function handleGuard(state: CombatState, source: CombatActorState, events: CombatEvent[]) {
  addStatus(source, "guarded");
  events.push(
    createEvent("Guard", {
      sourceId: source.id,
      message: "combat.events.guard",
    }),
  );
  state.telemetry.guardsUsed += 1;
}

function handleItem(
  state: CombatState,
  source: CombatActorState,
  itemId: string,
  targetId: string,
  inventory: Array<{ id: string; qty: number }>,
  context: ResolveActionContext,
  events: CombatEvent[],
) {
  const nextInventory = inventory.map((slot) => ({ ...slot }));
  const slot = nextInventory.find((entry) => entry.id === itemId);
  if (!slot || slot.qty <= 0) {
    events.push(
      createEvent("Miss", {
        sourceId: source.id,
        targetId,
        message: "combat.events.no_item",
      }),
    );
    return inventory;
  }

  const item = context.itemCatalog[itemId];
  const target = state.entities[targetId];
  if (!item || !target) {
    return inventory;
  }

  if (item.healHP) {
    const before = target.currentHP;
    target.currentHP = Math.min(target.actor.stats.maxHP, target.currentHP + item.healHP);
    const delta = target.currentHP - before;
    if (delta > 0) {
      events.push(
        createEvent("Heal", {
          sourceId: source.id,
          targetId: target.id,
          amount: delta,
          message: "combat.events.heal",
        }),
      );
    }
  }

  if (item.healSP) {
    const before = target.currentSP;
    target.currentSP = Math.min(target.actor.stats.maxSP, target.currentSP + item.healSP);
    const delta = target.currentSP - before;
    if (delta > 0) {
      events.push(
        createEvent("Heal", {
          sourceId: source.id,
          targetId: target.id,
          amount: delta,
          message: "combat.events.restore_sp",
        }),
      );
    }
  }

  slot.qty -= 1;
  events.push(
    createEvent("ItemUsed", {
      sourceId: source.id,
      itemId,
      targetId: target.id,
      message: "combat.events.item",
    }),
  );

  return nextInventory.filter((entry) => entry.qty > 0);
}

function resolveDamage(
  state: CombatState,
  attacker: CombatActorState,
  target: CombatActorState,
  skill: Skill | undefined,
  events: CombatEvent[],
) {
  if (!isAlive(target)) {
    return { weaknessHit: false };
  }

  const element = skill?.element ?? "physical";
  const offense = element === "physical" ? attacker.actor.stats.str : attacker.actor.stats.mag;
  const defense = element === "physical" ? target.actor.stats.def : target.actor.stats.res;

  let baseDamage = Math.max(4, Math.round(offense * 1.4 - defense * 0.8));
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

  const weaknesses = new Set(target.actor.weaknesses ?? []);
  const resistances = new Set(target.actor.resistances ?? []);
  const weaknessHit = weaknesses.has(element as any);
  if (weaknessHit) {
    baseDamage = Math.round(baseDamage * 1.4);
  }
  if (resistances.has(element as any)) {
    baseDamage = Math.round(baseDamage * 0.7);
  }

  const damage = Math.max(1, baseDamage);
  target.currentHP = Math.max(0, target.currentHP - damage);
  removeStatus(target, "guarded");

  if (skill?.applies) {
    skill.applies.forEach((status) => addStatus(target, status as CombatStatus));
  }

  events.push(
    createEvent("Hit", {
      sourceId: attacker.id,
      targetId: target.id,
      amount: damage,
      element,
      isWeakness: weaknessHit,
      message: "combat.events.hit",
    }),
  );

  if (target.currentHP <= 0) {
    target.canAct = false;
    events.push(
      createEvent("Death", {
        targetId: target.id,
        message: "combat.events.death",
      }),
    );
  }

  if (weaknessHit) {
    state.telemetry.weaknessHits += 1;
    maybeQueueExtraTurn(state, attacker, events);
  }

  return { weaknessHit };
}

function maybeQueueExtraTurn(state: CombatState, attacker: CombatActorState, events: CombatEvent[]) {
  if (!state.canExtraTurnThisRound[attacker.id]) {
    return;
  }
  state.canExtraTurnThisRound[attacker.id] = false;
  state.internal.extraTurnQueued = attacker.id;
  state.telemetry.extraTurns += 1;
  events.push(
    createEvent("ExtraTurnGranted", {
      sourceId: attacker.id,
      message: "combat.events.extra_turn",
    }),
  );
}

function advanceTurn(state: CombatState, source: CombatActorState, events: CombatEvent[]) {
  state.telemetry.turnsTaken += 1;

  state.internal.order = state.internal.order.filter((id) => {
    if (id === source.id) {
      return false;
    }
    const entity = state.entities[id];
    return entity ? isAlive(entity) : false;
  });

  let nextActiveId: string | undefined;
  const extra = state.internal.extraTurnQueued;
  if (extra && isAlive(state.entities[extra])) {
    nextActiveId = extra;
    state.internal.extraTurnQueued = null;
  } else if (state.internal.order.length) {
    nextActiveId = state.internal.order.shift();
  } else {
    nextActiveId = startNewRound(state, events);
  }

  if (!nextActiveId) {
    state.activeActorId = null;
    state.queue = [];
    return;
  }

  state.activeActorId = nextActiveId;
  state.queue = buildDisplayQueue(state, nextActiveId);
}

function startNewRound(state: CombatState, events: CombatEvent[]) {
  const alive = Object.values(state.entities).filter(isAlive);
  if (!alive.length) {
    return undefined;
  }

  state.round += 1;
  resetExtraTurnMap(state, alive);

  const allies = alive.filter((entity) => entity.side === "ally");
  const enemies = alive.filter((entity) => entity.side === "enemy");
  const limit = Math.max(12, alive.length);
  const order = computeTurnQueue(
    { allies, enemies, round: state.round, seed: state.initiativeSeed },
    { limit },
  );
  const nextActiveId = order[0];
  state.internal.order = order.slice(1);

  const startEvent = createEvent("StartRound", {
    round: state.round,
    message: "combat.events.start_round",
  });
  events.push(startEvent);

  return nextActiveId;
}

function buildDisplayQueue(state: CombatState, activeId: string) {
  const combined = [activeId, ...state.internal.order];
  const deduped: string[] = [];
  for (const id of combined) {
    if (typeof id === "string" && !deduped.includes(id) && isAlive(state.entities[id])) {
      deduped.push(id);
    }
    if (deduped.length >= 7) {
      break;
    }
  }
  return deduped;
}

function resetExtraTurnMap(state: CombatState, alive: CombatActorState[]) {
  state.canExtraTurnThisRound = alive.reduce<Record<string, boolean>>((acc, entity) => {
    acc[entity.id] = true;
    return acc;
  }, {});
}

function updatePhase(state: CombatState) {
  if (state.ended || !state.activeActorId) {
    state.phase = "idle";
    return;
  }
  const active = state.entities[state.activeActorId];
  if (!active || !isAlive(active)) {
    state.phase = "idle";
    return;
  }
  state.phase = active.side === "ally" ? "selectCommand" : "idle";
}

function determineWinner(state: CombatState) {
  const alliesAlive = Object.values(state.entities).some((entity) => entity.side === "ally" && isAlive(entity));
  const enemiesAlive = Object.values(state.entities).some((entity) => entity.side === "enemy" && isAlive(entity));

  if (!enemiesAlive) {
    state.ended = true;
    state.winner = "allies";
    state.phase = "idle";
  } else if (!alliesAlive) {
    state.ended = true;
    state.winner = "enemies";
    state.phase = "idle";
  }
}

function cloneCombatState(state: CombatState): CombatState {
  return {
    ...state,
    queue: [...state.queue],
    canExtraTurnThisRound: { ...state.canExtraTurnThisRound },
    selection: state.selection
      ? {
          command: state.selection.command,
          skillId: state.selection.skillId,
          targetIds: state.selection.targetIds ? [...state.selection.targetIds] : undefined,
        }
      : undefined,
    lastEvents: [...state.lastEvents],
    eventsLog: [...state.eventsLog],
    entities: Object.fromEntries(
      Object.entries(state.entities).map(([id, entity]) => [
        id,
        {
          ...entity,
          statuses: [...entity.statuses],
        },
      ]),
    ),
    turnHistory: state.turnHistory.map((turn) => [...turn]),
    telemetry: { ...state.telemetry },
    internal: {
      order: [...state.internal.order],
      weaknessTracker: { ...state.internal.weaknessTracker },
      extraTurnQueued: state.internal.extraTurnQueued ?? null,
    },
  };
}










