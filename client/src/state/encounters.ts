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
  e_w1: {
    id: "e_w1",
    name: "Шёпот тени",
    description: "Одинокий сторож ночи пытается отрезать путь.",
    enemies: [cloneActor(enemies.shadow_crawler)],
  },
  e_w2: {
    id: "e_w2",
    name: "Тени в паре",
    description: "Два стража страха синхронно обступают вас.",
    enemies: [cloneActor(enemies.shadow_crawler), cloneActor(enemies.shadow_crawler)],
  },
  e_m1: {
    id: "e_m1",
    name: "Рёв призрачной трубы",
    description: "Тень-скример взламывает тишину высокими аккордами.",
    enemies: [cloneActor(enemies.shadow_screamer)],
  },
  e_m2: {
    id: "e_m2",
    name: "Дежурство дозорных",
    description: "Слаженная пара тени и крика пытается загнать вас в угол.",
    enemies: [cloneActor(enemies.shadow_crawler), cloneActor(enemies.shadow_screamer)],
  },
  e_h1: {
    id: "e_h1",
    name: "Хор расколотых зеркал",
    description: "Две Screamer-тени вплетают голоса в смертельный дуэт.",
    enemies: [cloneActor(enemies.shadow_screamer), cloneActor(enemies.shadow_screamer)],
  },
  e_h2: {
    id: "e_h2",
    name: "Осадный символ",
    description: "Укреплённая Screamer несёт резонансные печати страха.",
    enemies: [
      cloneActorWithStats(enemies.shadow_screamer, {
        maxHP: 86,
        mag: 13,
        res: 9,
      }),
    ],
  },
  guard1: {
    id: "guard1",
    name: "Страж Библиотеки",
    description: "Бестелесный рыцарь охраняет первый осколок среди безмолвных полок.",
    enemies: [cloneActor(enemies.shadow_crawler)],
    reward: { items: [{ id: "dream_tonic", qty: 1 }] },
  },
  guard_watch: {
    id: "guard_watch",
    name: "Дежурный страж",
    description: "Единичная тень подмечает каждое движение в караульной комнате.",
    enemies: [cloneActorWithStats(enemies.shadow_crawler, { maxHP: 50, def: 7 })],
    reward: { items: [{ id: "dream_tonic", qty: 2 }] },
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
  guard_royal: {
    id: "guard_royal",
    name: "Стражи Опочивальни",
    description: "Пара закованных теней охраняет тайны королевской спальни.",
    enemies: [
      cloneActorWithStats(enemies.shadow_screamer, { maxHP: 72, str: 9, mag: 12 }),
      cloneActorWithStats(enemies.shadow_screamer, { maxHP: 72, str: 9, mag: 12 }),
    ],
    reward: { items: [{ id: "royal_diary_page", qty: 1 }] },
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
