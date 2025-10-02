import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createCombatState } from "../logic/state";
import { resolveAction } from "../logic/resolver";
import type {
  CombatAction,
  CombatCommand,
  CombatPhase,
  CombatSelection,
  CombatState,
} from "../logic/types";
import { isAlive } from "../logic/status";
import { skills as skillsMap } from "@/state/content";
import { itemCatalog } from "@/state/items";
import { getEncounter, getPartyLineup, useGame } from "@/state/GameContext";
import type { Actor } from "@shared/types";
import type { EncounterDefinition } from "@/state/encounters";

const DIFFICULTY_PER_SHARD = 0.12;
type PlayerActionInput =
  | { type: "attack"; targetId: string }
  | { type: "skill"; skillId: string; targetIds: string[] }
  | { type: "item"; itemId: string; targetId: string }
  | { type: "guard" }
  | { type: "end" };

interface UseCombatResult {
  state: CombatState | null;
  inventory: Array<{ id: string; qty: number }>;
  ready: boolean;
  beginCommand(command: CombatCommand): void;
  setPhase(phase: CombatPhase): void;
  updateSelection(updater: (prev: CombatSelection | undefined) => CombatSelection | undefined): void;
  clearSelection(): void;
  execute(action: CombatAction): void;
  executePlayerAction(action: PlayerActionInput): void;
  registerTargetCancel(): void;
}

export function useCombat(): UseCombatResult {
  const { state: gameState, resolveCombat: resolveEncounter, adjustInventory } = useGame();
  const encounter = useMemo(() => getEncounter(gameState.activeEncounterId), [gameState.activeEncounterId]);
  const [combat, setCombat] = useState<CombatState | null>(null);
  const [inventory, setInventory] = useState(gameState.inventory);
  const inventoryRef = useRef(inventory);
  const resolvedRef = useRef(false);
  const aiTimeoutRef = useRef<number | null>(null);
  const fpsSpikeRef = useRef(0);

  useEffect(() => {
    inventoryRef.current = inventory;
  }, [inventory]);

  useEffect(() => {
    let rafId = 0;
    let last = performance.now();
    const tick = (time: number) => {
      if (time - last > 17) {
        fpsSpikeRef.current += 1;
      }
      last = time;
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    setInventory(gameState.inventory);
  }, [gameState.inventory]);

  useEffect(() => {
    if (!encounter) {
      setCombat(null);
      resolvedRef.current = false;
      return;
    }
    const partyActors = preparePartyActors(
      gameState.flags,
      getPartyLineup(gameState.party),
      gameState.unlockedSkills ?? {},
    );
    const scaledEncounter = scaleEncounter(encounter, gameState.shardsCollected);
    const initial = createCombatState({ encounter: scaledEncounter, allies: partyActors });
    setCombat(initial);
    resolvedRef.current = false;
  }, [encounter, gameState.flags, gameState.party]);

  useEffect(() => {
    if (!combat || !encounter || !combat.ended || resolvedRef.current) return;
    resolvedRef.current = true;
    const lastMessages = combat.eventsLog.slice(-6).map((event) => event.message ?? event.type);
    resolveEncounter({
      encounterId: encounter.id,
      victory: combat.winner === "allies",
      messages: lastMessages,
      rewards: encounter.reward,
    });
    logTelemetry(combat);
  }, [combat, encounter, resolveEncounter]);

  const synchroniseInventory = useCallback(
    (prevSlots: Array<{ id: string; qty: number }>, nextSlots: Array<{ id: string; qty: number }>) => {
      const previous = new Map(prevSlots.map((slot) => [slot.id, slot.qty]));
      const next = new Map(nextSlots.map((slot) => [slot.id, slot.qty]));

      next.forEach((qty, id) => {
        const prevQty = previous.get(id) ?? 0;
        const delta = qty - prevQty;
        if (delta !== 0) adjustInventory(id, delta);
        previous.delete(id);
      });

      previous.forEach((qty, id) => {
        if (qty !== 0) adjustInventory(id, -qty);
      });
    },
    [adjustInventory],
  );

  const applyFpsSpikes = useCallback((nextState: CombatState) => {
    if (!fpsSpikeRef.current) return;
    nextState.telemetry = {
      ...nextState.telemetry,
      fpsSpikes: nextState.telemetry.fpsSpikes + fpsSpikeRef.current,
    };
    fpsSpikeRef.current = 0;
  }, []);

  const execute = useCallback(
    (action: CombatAction) => {
      setCombat((prev) => {
        if (!prev) return prev;
        const prevInventory = inventoryRef.current;
        const result = resolveAction(prev, action, {
          skills: skillsMap,
          inventory: prevInventory,
          itemCatalog,
        });
        applyFpsSpikes(result.state);
        setInventory(result.inventory);
        inventoryRef.current = result.inventory;
        synchroniseInventory(prevInventory, result.inventory);
        return result.state;
      });
    },
    [applyFpsSpikes, synchroniseInventory],
  );

  const executePlayerAction = useCallback(
    (partial: PlayerActionInput) => {
      setCombat((prev) => {
        if (!prev || !prev.activeActorId) return prev;
        const action = buildPlayerAction(partial, prev.activeActorId);
        const prevInventory = inventoryRef.current;
        const result = resolveAction(prev, action, {
          skills: skillsMap,
          inventory: prevInventory,
          itemCatalog,
        });
        applyFpsSpikes(result.state);
        setInventory(result.inventory);
        inventoryRef.current = result.inventory;
        synchroniseInventory(prevInventory, result.inventory);
        return result.state;
      });
    },
    [applyFpsSpikes, synchroniseInventory],
  );

  useEffect(() => {
    if (!combat || combat.ended) return;
    const activeId = combat.activeActorId;
    if (!activeId) return;
    const active = combat.entities[activeId];
    if (!active || active.side !== "enemy") return;

    if (aiTimeoutRef.current) {
      window.clearTimeout(aiTimeoutRef.current);
    }

    aiTimeoutRef.current = window.setTimeout(() => {
      const action = chooseEnemyAction(combat);
      if (action) execute(action);
    }, 420);

    return () => {
      if (aiTimeoutRef.current) {
        window.clearTimeout(aiTimeoutRef.current);
        aiTimeoutRef.current = null;
      }
    };
  }, [combat, execute]);

  const beginCommand = useCallback((command: CombatCommand) => {
    setCombat((prev) => {
      if (!prev) return prev;
      const base: CombatSelection = { command };
      let phase: CombatPhase = "selectCommand";
      if (command === "skill" || command === "item") {
        phase = "selectSkill";
      } else if (command === "attack") {
        phase = "selectTarget";
      }
      return { ...prev, selection: base, phase };
    });
  }, []);

  const setPhase = useCallback((phase: CombatPhase) => {
    setCombat((prev) => (prev ? { ...prev, phase } : prev));
  }, []);

  const updateSelection = useCallback((updater: (prev: CombatSelection | undefined) => CombatSelection | undefined) => {
    setCombat((prev) => {
      if (!prev) return prev;
      const nextSelection = updater(prev.selection);
      return { ...prev, selection: nextSelection };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setCombat((prev) => (prev ? { ...prev, selection: undefined, phase: "selectCommand" } : prev));
  }, []);

  const registerTargetCancel = useCallback(() => {
    setCombat((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        telemetry: { ...prev.telemetry, targetCancels: prev.telemetry.targetCancels + 1 },
      };
    });
  }, []);

  return {
    state: combat,
    inventory,
    ready: Boolean(combat && encounter),
    beginCommand,
    setPhase,
    updateSelection,
    clearSelection,
    execute,
    executePlayerAction,
    registerTargetCancel,
  };
}

function scaleEncounter(encounter: EncounterDefinition, shardsCollected: number): EncounterDefinition {
  if (!encounter) return encounter;
  if (shardsCollected <= 0) {
    return {
      ...encounter,
      enemies: encounter.enemies.map((enemy) => ({
        ...enemy,
        stats: { ...enemy.stats },
        skills: [...enemy.skills],
        weaknesses: enemy.weaknesses ? [...enemy.weaknesses] : undefined,
        resistances: enemy.resistances ? [...enemy.resistances] : undefined,
      })),
    };
  }
  const modifier = 1 + shardsCollected * DIFFICULTY_PER_SHARD;
  return {
    ...encounter,
    enemies: encounter.enemies.map((enemy) => scaleActor(enemy, modifier)),
  };
}

function scaleActor(actor: Actor, modifier: number): Actor {
  return {
    ...actor,
    stats: {
      ...actor.stats,
      maxHP: Math.round(actor.stats.maxHP * modifier),
      str: Math.max(1, Math.round(actor.stats.str * modifier)),
      mag: Math.max(1, Math.round(actor.stats.mag * modifier)),
    },
    skills: [...actor.skills],
    weaknesses: actor.weaknesses ? [...actor.weaknesses] : undefined,
    resistances: actor.resistances ? [...actor.resistances] : undefined,
  };
}

function buildPlayerAction(partial: PlayerActionInput, sourceId: string): CombatAction {
  switch (partial.type) {
    case "attack":
      return { type: "attack", sourceId, targetId: partial.targetId };
    case "skill":
      return { type: "skill", sourceId, skillId: partial.skillId, targetIds: partial.targetIds };
    case "item":
      return { type: "item", sourceId, itemId: partial.itemId, targetId: partial.targetId };
    case "guard":
      return { type: "guard", sourceId };
    case "end":
    default:
      return { type: "end", sourceId };
  }
}

function preparePartyActors(
  flags: Record<string, boolean>,
  lineup: Actor[],
  unlockedSkillMap: Record<string, string[]>,
) {
  return lineup.map((actor) => {
    const unlockedSkills = unlockedSkillMap[actor.id];
    const baseSkills = unlockedSkills && unlockedSkills.length ? unlockedSkills : actor.skills;
    const clone: Actor = {
      ...actor,
      stats: { ...actor.stats },
      skills: [...baseSkills],
      weaknesses: actor.weaknesses ? [...actor.weaknesses] : undefined,
      resistances: actor.resistances ? [...actor.resistances] : undefined,
    };
    if (!flags.unlockCompanionSkill) {
      clone.skills = clone.skills.filter((skillId) => skillId !== "twin_resonance");
    } else if (!clone.skills.includes("twin_resonance") && actor.skills.includes("twin_resonance")) {
      clone.skills = [...clone.skills, "twin_resonance"];
    }
    return clone;
  });
}



function chooseEnemyAction(state: CombatState): CombatAction | null {
  const activeId = state.activeActorId;
  if (!activeId) return null;
  const attacker = state.entities[activeId];
  if (!attacker || attacker.side !== "enemy" || !isAlive(attacker)) return null;

  const opponents = Object.values(state.entities).filter(
    (entity) => entity.side === "ally" && isAlive(entity),
  );
  if (!opponents.length) return null;

  const usableSkills = attacker.actor.skills
    .map((id) => skillsMap[id])
    .filter((skill): skill is NonNullable<typeof skill> => Boolean(skill))
    .filter((skill) => attacker.currentSP >= skill.costSP);

  const singleTarget = usableSkills.find((skill) => skill.targets === "one");
  if (singleTarget) {
    const target = chooseLowestHP(opponents);
    return {
      type: "skill",
      sourceId: attacker.id,
      skillId: singleTarget.id,
      targetIds: [target.id],
    };
  }

  const aoe = usableSkills.find((skill) => skill.targets === "all");
  if (aoe) {
    return {
      type: "skill",
      sourceId: attacker.id,
      skillId: aoe.id,
      targetIds: opponents.map((entity) => entity.id),
    };
  }

  const target = chooseLowestHP(opponents);
  return {
    type: "attack",
    sourceId: attacker.id,
    targetId: target.id,
  };
}

function chooseLowestHP(candidates: CombatState["entities"][string][]) {
  return candidates.reduce((lowest, entity) => {
    if (!lowest) return entity;
    const lowestPct = lowest.currentHP / lowest.actor.stats.maxHP;
    const currentPct = entity.currentHP / entity.actor.stats.maxHP;
    return currentPct < lowestPct ? entity : lowest;
  });
}

function logTelemetry(state: CombatState) {
  const { telemetry } = state;
  const summary = {
    rounds: state.round,
    turnsTaken: telemetry.turnsTaken,
    weaknessHits: telemetry.weaknessHits,
    extraTurns: telemetry.extraTurns,
    guardsUsed: telemetry.guardsUsed,
    targetCancels: telemetry.targetCancels,
    fpsSpikes: telemetry.fpsSpikes,
  };
  if (typeof window !== "undefined") {
    console.table(summary);
  } else {
    // eslint-disable-next-line no-console
    console.log("Combat telemetry", summary);
  }
}





