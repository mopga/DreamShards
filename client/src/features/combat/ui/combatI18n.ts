import type { Element } from "@shared/types";
import { useLocale } from "@/state/LocaleContext";

type LocalizedSkill = {
  name: string;
  description: string;
};

type ActorNames = Record<string, string>;

type CombatLocale = {
  loading: string;
  turnOf: string;
  roundLabel: string;
  queue: string;
  bonusTurn: string;
  logTitle: string;
  commands: Record<"attack" | "skills" | "items" | "guard" | "end" | "back", string>;
  tooltips: Record<"waiting" | "noSkillTarget" | "noSp" | "noItems" | "targetInvalid" | "extraTurn", string>;
  statuses: Record<"vulnerable" | "weakened" | "guarded", string>;
  log: Record<"hit" | "weakness" | "guard" | "status" | "death" | "heal" | "item" | "end", string>;
  overlays: Record<"hp" | "sp", string>;
  elements: Record<Element, string>;
  skills: Record<string, LocalizedSkill>;
  actorNames: ActorNames;
};

const combatLocale: Record<"en" | "ru", CombatLocale> = {
  en: {
    loading: "The dream is assembling combat data...",
    turnOf: "Turn: {{name}}",
    roundLabel: "Round",
    queue: "Queue",
    bonusTurn: "Bonus Turn",
    logTitle: "Battle Log",
    commands: {
      attack: "Attack",
      skills: "Skills",
      items: "Items",
      guard: "Guard",
      end: "End Turn",
      back: "Back",
    },
    tooltips: {
      waiting: "Shadows are moving...",
      noSkillTarget: "No valid targets",
      noSp: "Not enough SP",
      noItems: "No usable items",
      targetInvalid: "Target unavailable",
      extraTurn: "Gained this round",
    },
    statuses: {
      vulnerable: "vulnerable",
      weakened: "weakened",
      guarded: "guarded",
    },
    log: {
      hit: "{{src}} hits {{tgt}} for {{dmg}} damage.",
      weakness: "Weakness! {{src}} gains an extra turn.",
      guard: "{{src}} braces behind a veil.",
      status: "{{tgt}}: {{status}}",
      death: "{{tgt}} falls.",
      heal: "{{src}} restores {{dmg}} to {{tgt}}.",
      item: "{{src}} uses {{item}}.",
      end: "{{src}} ends their turn.",
    },
    overlays: {
      hp: "HP",
      sp: "SP",
    },
    elements: {
      physical: "Physical",
      fire: "Fire",
      ice: "Ice",
      electric: "Electric",
      psychic: "Psychic",
      void: "Void",
    },
    skills: {
      luminous_strike: {
        name: "Luminous Strike",
        description: "A focused blow that cuts through shadow silhouettes.",
      },
      ember_burst: {
        name: "Ember Burst",
        description: "Ignites lingering doubts to leave foes weakened.",
      },
      frost_lattice: {
        name: "Frost Lattice",
        description: "Crystalline chill binds a group of shadows at once.",
      },
      voltaic_chain: {
        name: "Voltaic Chain",
        description: "A flash of insight that shocks a single foe open.",
      },
      mind_pierce: {
        name: "Mind Pierce",
        description: "A concentrated psychic lance that exploits exposed thoughts.",
      },
      veil_guard: {
        name: "Veil Guard",
        description: "A sweeping pulse that batters foes behind a wavering veil.",
      },
      echo_shield: {
        name: "Echo Shield",
        description: "Resonant waves rebound, pushing damage back across the dream tide.",
      },
      lunar_mark: {
        name: "Lunar Mark",
        description: "A crescent brand that leaves shadows exposed to the moonlight.",
      },
      twin_resonance: {
        name: "Twin Resonance",
        description: "Synchronized pulse with a trusted companion, rattling all foes.",
      },
    },
    actorNames: {
      shadow_crawler: "Shadow Crawler",
      shadow_screamer: "Shadow Screamer",
      fear_avatar: "Avatar of Fear",
      hero: "Dreamer",
      lister: "Lister",
    },
  },
  ru: {
    loading: "Сон собирает данные боя...",
    turnOf: "Ход: {{name}}",
    roundLabel: "Раунд",
    queue: "Очередь",
    bonusTurn: "Бонусный ход",
    logTitle: "Журнал боя",
    commands: {
      attack: "Атака",
      skills: "Навыки",
      items: "Предметы",
      guard: "Защита",
      end: "Завершить ход",
      back: "Назад",
    },
    tooltips: {
      waiting: "Тени перегруппируются...",
      noSkillTarget: "Нет подходящих целей",
      noSp: "Недостаточно SP",
      noItems: "Нет доступных предметов",
      targetInvalid: "Цель недоступна",
      extraTurn: "Получено в этом раунде",
    },
    statuses: {
      vulnerable: "уязвим",
      weakened: "ослаблен",
      guarded: "под защитой",
    },
    log: {
      hit: "{{src}} бьёт {{tgt}} на {{dmg}} урона.",
      weakness: "Слабое место! {{src}} получает дополнительный ход.",
      guard: "{{src}} укрывается за покровом.",
      status: "{{tgt}}: {{status}}",
      death: "{{tgt}} падает.",
      heal: "{{src}} восстанавливает {{dmg}} для {{tgt}}.",
      item: "{{src}} использует {{item}}.",
      end: "{{src}} завершает ход.",
    },
    overlays: {
      hp: "HP",
      sp: "SP",
    },
    elements: {
      physical: "Физический",
      fire: "Огонь",
      ice: "Лёд",
      electric: "Молния",
      psychic: "Психика",
      void: "Пустота",
    },
    skills: {
      luminous_strike: {
        name: "Лучезарный удар",
        description: "Сфокусированный толчок, рассекающий силуэты теней.",
      },
      ember_burst: {
        name: "Вспышка углей",
        description: "Зажигает цепкие сомнения и оставляет врагов ослабленными.",
      },
      frost_lattice: {
        name: "Ледяная решётка",
        description: "Кристальный холод сковывает группу теней.",
      },
      voltaic_chain: {
        name: "Электрическая цепь",
        description: "Вспышка прозрения оглушает одиночную цель.",
      },
      mind_pierce: {
        name: "Пронзение сознания",
        description: "Сконцентрированный психический луч взламывает открытые мысли.",
      },
      veil_guard: {
        name: "Страж завесы",
        description: "Разбитая волна сбивает врагов за мерцающей завесой.",
      },
      echo_shield: {
        name: "Эхо-щит",
        description: "Резонансные волны отражают урон обратно по приливу снов.",
      },
      lunar_mark: {
        name: "Лунная метка",
        description: "Лунный знак оставляет тени открытыми для лунного света.",
      },
      twin_resonance: {
        name: "Двойной резонанс",
        description: "Синхронный импульс с надёжным напарником оглушает всех врагов.",
      },
    },
    actorNames: {
      shadow_crawler: "Ползущая тень",
      shadow_screamer: "Кричащая тень",
      fear_avatar: "Аватар страха",
      hero: "Сновидец",
      lister: "Листер",
    },
  },
};

export type { CombatLocale };

export function useCombatCopy() {
  const { locale } = useLocale();
  return combatLocale[locale] ?? combatLocale.en;
}
