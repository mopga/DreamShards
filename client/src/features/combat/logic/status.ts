import type { CombatActorState, CombatStatus } from "./types";

export function isAlive(entity?: CombatActorState) {
  if (!entity) return false;
  return entity.currentHP > 0;
}

export function hasStatus(entity: CombatActorState, status: CombatStatus) {
  return entity.statuses.includes(status);
}

export function addStatus(entity: CombatActorState, status: CombatStatus) {
  if (!hasStatus(entity, status)) {
    entity.statuses = [...entity.statuses, status];
  }
}

export function removeStatus(entity: CombatActorState, status: CombatStatus) {
  if (hasStatus(entity, status)) {
    entity.statuses = entity.statuses.filter((value) => value !== status);
  }
}
