import { CombatEvent, CombatEventType } from "./types";

let fallbackCounter = 0;

export function createEvent<T extends CombatEventType>(
  type: T,
  payload: Omit<Extract<CombatEvent, { type: T }>, "type" | "id" | "timestamp">,
): Extract<CombatEvent, { type: T }> {
  fallbackCounter += 1;
  const id = `${type}-${Date.now()}-${fallbackCounter}`;
  return {
    ...payload,
    type,
    id,
    timestamp: Date.now(),
  } as Extract<CombatEvent, { type: T }>;
}
