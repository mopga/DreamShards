import type { Actor } from "@shared/types";
import { enemies } from "./content";

export interface EncounterDefinition {
  id: string;
  name: string;
  description: string;
  enemies: Actor[];
  boss?: boolean;
  reward?: {
    shards?: number;
    items?: Array<{ id: string; qty: number }>;
  };
}

function cloneActor(actor: Actor): Actor {
  return {
    ...actor,
    stats: { ...actor.stats },
    skills: [...actor.skills],
    weaknesses: actor.weaknesses ? [...actor.weaknesses] : undefined,
    resistances: actor.resistances ? [...actor.resistances] : undefined,
  };
}

export const encounters: Record<string, EncounterDefinition> = {
  shadow_pack: {
    id: "shadow_pack",
    name: "First Echo",
    description: "Tattered shadows gather around the cracked mirrors.",
    enemies: [cloneActor(enemies.shadow_crawler), cloneActor(enemies.shadow_screamer)],
    reward: { items: [{ id: "dream_tonic", qty: 1 }] },
  },
  fear_avatar_final: {
    id: "fear_avatar_final",
    name: "Avatar of Fear",
    description: "A towering figure woven from anxious silhouettes.",
    enemies: [cloneActor(enemies.fear_avatar)],
    boss: true,
    reward: { shards: 0 },
  },
};