import type { Actor } from "@shared/types";
import type { EncounterDefinition } from "@/state/encounters";
import { computeTurnQueue } from "./queue";
import { createEvent } from "./events";
import type { CombatState, CombatActorState } from "./types";

interface CreateCombatStateOptions {
  encounter: EncounterDefinition;
  allies: Actor[];
  seed?: number;
}

export function createCombatState({
  encounter,
  allies,
  seed = Math.floor(Math.random() * 1_000_000),
}: CreateCombatStateOptions): CombatState {
  const entities: Record<string, CombatActorState> = {};
  const allyStates: CombatActorState[] = allies.map((actor, index) => {
    const id = `ally-${actor.id}-${index}`;
    const entry: CombatActorState = {
      id,
      actor,
      side: "ally",
      currentHP: actor.stats.maxHP,
      currentSP: actor.stats.maxSP,
      statuses: [],
      canAct: true,
    };
    entities[id] = entry;
    return entry;
  });

  const enemyStates: CombatActorState[] = encounter.enemies.map((actor, index) => {
    const id = `enemy-${actor.id}-${index}`;
    const entry: CombatActorState = {
      id,
      actor,
      side: "enemy",
      currentHP: actor.stats.maxHP,
      currentSP: actor.stats.maxSP,
      statuses: [],
      canAct: true,
    };
    entities[id] = entry;
    return entry;
  });

  const canExtraTurnThisRound: Record<string, boolean> = {};
  Object.keys(entities).forEach((id) => {
    canExtraTurnThisRound[id] = true;
  });

  const totalLimit = allyStates.length + enemyStates.length;
  const fullOrder = computeTurnQueue(
    { allies: allyStates, enemies: enemyStates, round: 1, seed },
    { limit: Math.max(12, totalLimit) },
  );
  const activeActorId = fullOrder[0] ?? null;
  const remainder = fullOrder.slice(1);
  const queue = [activeActorId, ...remainder]
    .filter((value): value is string => typeof value === "string")
    .slice(0, 7);

  const startEvent = createEvent("StartRound", {
    round: 1,
    message: "Round 1 begins.",
  });

  return {
    encounterId: encounter.id,
    encounterName: encounter.name,
    round: 1,
    queue,
    activeActorId,
    canExtraTurnThisRound,
    phase: determineInitialPhase(activeActorId, entities),
    lastEvents: [],
    eventsLog: [startEvent],
    entities,
    ended: false,
    winner: undefined,
    turnHistory: [],
    telemetry: {
      turnsTaken: 0,
      weaknessHits: 0,
      guardsUsed: 0,
      targetCancels: 0,
      extraTurns: 0,
      fpsSpikes: 0,
    },
    initiativeSeed: seed,
    internal: {
      order: remainder,
      weaknessTracker: {},
      extraTurnQueued: null,
    },
  };
}

function determineInitialPhase(activeActorId: string | null, entities: Record<string, CombatActorState>) {
  if (!activeActorId) return "idle";
  const active = entities[activeActorId];
  if (!active) return "idle";
  return active.side === "ally" ? "selectCommand" : "idle";
}
