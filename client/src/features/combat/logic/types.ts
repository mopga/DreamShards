import type { Actor, Skill, Element } from "@shared/types";

export type CombatSide = "ally" | "enemy";
export type CombatPhase = "idle" | "selectCommand" | "selectSkill" | "selectTarget" | "resolving";
export type CombatCommand = "attack" | "guard" | "skill" | "item" | "end";
export type CombatStatus = "vulnerable" | "weakened" | "guarded";

export interface CombatActorState {
  id: string;
  actor: Actor;
  side: CombatSide;
  currentHP: number;
  currentSP: number;
  statuses: CombatStatus[];
  canAct: boolean;
  portrait?: string;
}

export interface CombatSelection {
  command?: CombatCommand;
  skillId?: string;
  itemId?: string;
  targetIds?: string[];
}

export type CombatEventType =
  | "StartRound"
  | "EndRound"
  | "Hit"
  | "Crit"
  | "Miss"
  | "Heal"
  | "Guard"
  | "WeaknessTriggered"
  | "ExtraTurnGranted"
  | "ApplyStatus"
  | "RemoveStatus"
  | "Death"
  | "ItemUsed"
  | "TurnEnded";

export interface CombatEventBase<T extends CombatEventType> {
  id: string;
  type: T;
  timestamp: number;
  message?: string;
}

export type CombatEvent =
  | (CombatEventBase<"StartRound"> & { round: number })
  | (CombatEventBase<"EndRound"> & { round: number })
  | (CombatEventBase<"Hit"> & {
      sourceId: string;
      targetId: string;
      amount: number;
      element?: Element;
      isWeakness: boolean;
    })
  | (CombatEventBase<"Crit"> & {
      sourceId: string;
      targetId: string;
      amount: number;
      element?: Element;
    })
  | (CombatEventBase<"Miss"> & { sourceId: string; targetId: string })
  | (CombatEventBase<"Heal"> & { sourceId: string; targetId: string; amount: number })
  | (CombatEventBase<"Guard"> & { sourceId: string })
  | (CombatEventBase<"WeaknessTriggered"> & { sourceId: string; targetId: string; element?: Element })
  | (CombatEventBase<"ExtraTurnGranted"> & { sourceId: string })
  | (CombatEventBase<"ApplyStatus"> & { targetId: string; status: CombatStatus })
  | (CombatEventBase<"RemoveStatus"> & { targetId: string; status: CombatStatus })
  | (CombatEventBase<"Death"> & { targetId: string })
  | (CombatEventBase<"ItemUsed"> & { sourceId: string; itemId: string; targetId?: string })
  | (CombatEventBase<"TurnEnded"> & { sourceId: string });

export interface CombatActionAttack {
  type: "attack";
  sourceId: string;
  targetId: string;
}

export interface CombatActionGuard {
  type: "guard";
  sourceId: string;
}

export interface CombatActionSkill {
  type: "skill";
  sourceId: string;
  skillId: string;
  targetIds: string[];
}

export interface CombatActionItem {
  type: "item";
  sourceId: string;
  itemId: string;
  targetId: string;
}

export interface CombatActionEnd {
  type: "end";
  sourceId: string;
}

export type CombatAction =
  | CombatActionAttack
  | CombatActionGuard
  | CombatActionSkill
  | CombatActionItem
  | CombatActionEnd;

export interface CombatTelemetryCounters {
  turnsTaken: number;
  weaknessHits: number;
  guardsUsed: number;
  targetCancels: number;
  extraTurns: number;
  fpsSpikes: number;
}

export interface CombatState {
  encounterId: string;
  encounterName: string;
  round: number;
  queue: string[];
  activeActorId: string | null;
  canExtraTurnThisRound: Record<string, boolean>;
  phase: CombatPhase;
  selection?: CombatSelection;
  lastEvents: CombatEvent[];
  eventsLog: CombatEvent[];
  entities: Record<string, CombatActorState>;
  ended: boolean;
  winner?: "allies" | "enemies";
  turnHistory: CombatEvent[][];
  telemetry: CombatTelemetryCounters;
  initiativeSeed: number;
  internal: {
    order: string[];
    weaknessTracker: Record<string, number>;
    extraTurnQueued?: string | null;
  };
}

export interface QueueContext {
  allies: CombatActorState[];
  enemies: CombatActorState[];
  round: number;
  seed: number;
}

export interface CombatResources {
  skills: Record<string, Skill>;
}
