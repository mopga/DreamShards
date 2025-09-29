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
      twin_resonance: {
        name: "Twin Resonance",
        description: "Synchronized pulse with a trusted companion, rattling all foes.",
      },
    },
    actorNames: {
      shadow_crawler: "Shadow Crawler",
      shadow_screamer: "Shadow Screamer",
      fear_avatar: "Avatar of Fear",
      dreamer: "The Dreamer",
      senna: "Senna",
      io: "Io",
    },
  },
  ru: {
    loading: "Сон собирает данные боя...",
    turnOf: "Ход: {{name}}",
    roundLabel: "Раунд",
    queue: "Очередь",
    bonusTurn: "Бонус-ход",
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
      waiting: "Тени двигаются...",
      noSkillTarget: "Нет подходящих целей",
      noSp: "Недостаточно SP",
      noItems: "Нет предметов",
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
      weakness: "Слабость! {{src}} получает дополнительный ход.",
      guard: "{{src}} занимает защитную стойку.",
      status: "{{tgt}}: {{status}}",
      death: "{{tgt}} повержен.",
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
      electric: "Электричество",
      psychic: "Психика",
      void: "Пустота",
    },
    skills: {
      luminous_strike: {
        name: "Сияющий удар",
        description: "Прицельный удар, рассеивающий силуэты теней.",
      },
      ember_burst: {
        name: "Вспышка искр",
        description: "Воспламеняет тлеющие сомнения и ослабляет врага.",
      },
      frost_lattice: {
        name: "Ледяная решётка",
        description: "Кристальный холод разом сковывает группу теней.",
      },
      voltaic_chain: {
        name: "Вольтовая цепь",
        description: "Вспышка озарения, что шокирует и раскрывает цель.",
      },
      mind_pierce: {
        name: "Пробой разума",
        description: "Сконцентрированный психический луч пронзает открытые мысли.",
      },
      twin_resonance: {
        name: "Двойной резонанс",
        description: "Синхронный импульс с напарником сотрясает всех противников.",
      },
    },
    actorNames: {
      shadow_crawler: "Теневой ползун",
      shadow_screamer: "Теневой вопящий",
      fear_avatar: "Аватар страха",
      dreamer: "Сновидец",
      senna: "Сенна",
      io: "Ио",
    },
  },
};

export type { CombatLocale };

export function useCombatCopy() {
  const { locale } = useLocale();
  return combatLocale[locale] ?? combatLocale.en;
}
