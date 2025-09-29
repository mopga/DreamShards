import { useMemo } from "react";
import type { CombatState } from "../logic/types";
import type { CombatActorState } from "../logic/types";
import { isAlive } from "../logic/status";

export interface TurnQueueItem {
  id: string;
  actor?: CombatActorState;
  isActive: boolean;
  isNext: boolean;
  index: number;
  isAlive: boolean;
  hasExtraTurnBadge: boolean;
}

export function useTurnQueue(state: CombatState | null) {
  return useMemo<TurnQueueItem[]>(() => {
    if (!state) return [];
    return state.queue.map((id, index) => {
      const actor = state.entities[id];
      const alive = actor ? isAlive(actor) : false;
      return {
        id,
        actor,
        isActive: index === 0,
        isNext: index === 1,
        index,
        isAlive: alive,
        hasExtraTurnBadge: !state.canExtraTurnThisRound[id],
      } satisfies TurnQueueItem;
    });
  }, [state]);
}
