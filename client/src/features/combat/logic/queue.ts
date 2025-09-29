import { QueueContext } from "./types";

interface ComputeOptions {
  previousQueue?: string[];
  limit?: number;
  excludeIds?: Set<string>;
}

export function computeTurnQueue(
  { allies, enemies, round, seed }: QueueContext,
  { previousQueue, limit = 7, excludeIds }: ComputeOptions = {},
): string[] {
  const alive = [...allies, ...enemies].filter((entity) => entity.currentHP > 0 && entity.canAct);
  const base = alive.sort((a, b) => {
    const agiDelta = b.actor.stats.agi - a.actor.stats.agi;
    if (agiDelta !== 0) return agiDelta;
    const luckDelta = (b.actor.stats.luck ?? 0) - (a.actor.stats.luck ?? 0);
    if (luckDelta !== 0) return luckDelta;
    return tieBreak(a.id, b.id, seed, round);
  });

  const candidateIds = base
    .map((entity) => entity.id)
    .filter((id) => !excludeIds || !excludeIds.has(id));

  if (!previousQueue?.length) {
    return candidateIds.slice(0, limit);
  }

  const merged: string[] = [];
  const seen = new Set<string>();

  for (const id of previousQueue) {
    if (candidateIds.includes(id) && !seen.has(id)) {
      merged.push(id);
      seen.add(id);
    }
  }

  for (const id of candidateIds) {
    if (!seen.has(id)) {
      merged.push(id);
      seen.add(id);
    }
  }

  return merged.slice(0, limit);
}

function tieBreak(a: string, b: string, seed: number, round: number) {
  const hashA = hashString(`${a}-${seed}-${round}`);
  const hashB = hashString(`${b}-${seed}-${round}`);
  return hashB - hashA;
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
