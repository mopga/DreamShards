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

function cloneActorWithStats(actor: Actor, overrides?: Partial<Actor["stats"]>): Actor {
  const copy = cloneActor(actor);
  if (overrides) {
    copy.stats = { ...copy.stats, ...overrides };
  }
  return copy;
}

export const encounters: Record<string, EncounterDefinition> = {
  guard1: {
    id: "guard1",
    name: "Страж Библиотеки",
    description: "Бестелесный рыцарь охраняет первый осколок среди безмолвных полок.",
    enemies: [cloneActor(enemies.shadow_crawler)],
    reward: { items: [{ id: "dream_tonic", qty: 1 }] },
  },
  guard2: {
    id: "guard2",
    name: "Страж Галереи",
    description: "Рой стеклянных химер срывается с рам, защищая сияющую сердцевину.",
    enemies: [cloneActorWithStats(enemies.shadow_screamer, { maxHP: 70, mag: 12 })],
    reward: { items: [{ id: "dream_tonic", qty: 1 }] },
  },
  guard3: {
    id: "guard3",
    name: "Страж Сокровищницы",
    description: "Сгусток страха складывается в две фигуры, что движутся как единое целое.",
    enemies: [
      cloneActorWithStats(enemies.shadow_screamer, {
        maxHP: 84,
        str: 10,
        mag: 13,
        def: 8,
        res: 8,
      }),
    ],
    reward: { items: [{ id: "dream_tonic", qty: 2 }] },
  },
  boss_fear: {
    id: "boss_fear",
    name: "Аватар страха",
    description: "Гигантский силуэт, сотканный из колебаний и дрожи каждого шагнувшего внутрь.",
    enemies: [cloneActor(enemies.fear_avatar)],
    boss: true,
    reward: { shards: 0 },
  },
};
