import type { Actor, ActorBlueprint } from "@shared/types";
import actorData from "@shared/content/actors.json" assert { type: "json" };

const blueprints = actorData as ActorBlueprint[];
const blueprintMap = Object.fromEntries(blueprints.map((entry) => [entry.id, entry])) as Record<string, ActorBlueprint>;

export type PartyMemberId = "hero" | "lister";

function resolveStats(id: PartyMemberId) {
  const blueprint = blueprintMap[id];
  const stats = blueprint?.baseStats;
  if (!stats) {
    throw new Error(`Missing actor blueprint for ${id}`);
  }
  return { ...stats };
}

function resolveName(id: PartyMemberId) {
  return blueprintMap[id]?.nameKey ?? id;
}

export const partyActors: Record<PartyMemberId, Actor> = {
  hero: {
    id: "hero",
    name: resolveName("hero"),
    stats: resolveStats("hero"),
    skills: ["luminous_strike", "ember_burst", "mind_pierce", "veil_guard"],
    weaknesses: ["ice"],
  },
  lister: {
    id: "lister",
    name: resolveName("lister"),
    stats: resolveStats("lister"),
    skills: ["echo_shield", "lunar_mark", "twin_resonance"],
    resistances: ["psychic"],
    weaknesses: ["electric"],
  },
};

