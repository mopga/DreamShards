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
      hero: "Dreamer",
      lister: "Lister",
    },
  },
  ru: {
    loading: "\u0421\u043e\u043d \u0441\u043e\u0431\u0438\u0440\u0430\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0435 \u0431\u043e\u044f...",
    turnOf: "\u0425\u043e\u0434: {{name}}",
    roundLabel: "\u0420\u0430\u0443\u043d\u0434",
    queue: "\u041e\u0447\u0435\u0440\u0435\u0434\u044c",
    bonusTurn: "\u0411\u043e\u043d\u0443\u0441\u043d\u044b\u0439 \u0445\u043e\u0434",
    logTitle: "\u0416\u0443\u0440\u043d\u0430\u043b \u0431\u043e\u044f",
    commands: {
      attack: "\u0410\u0442\u0430\u043a\u0430",
      skills: "\u041d\u0430\u0432\u044b\u043a\u0438",
      items: "\u041f\u0440\u0435\u0434\u043c\u0435\u0442\u044b",
      guard: "\u0417\u0430\u0449\u0438\u0442\u0430",
      end: "\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044c \u0445\u043e\u0434",
      back: "\u041d\u0430\u0437\u0430\u0434",
    },
    tooltips: {
      waiting: "\u0422\u0435\u043d\u0438 \u043f\u0435\u0440\u0435\u0433\u0440\u0443\u043f\u043f\u0438\u0440\u0443\u044e\u0442\u0441\u044f...",
      noSkillTarget: "\u041d\u0435\u0442 \u043f\u043e\u0434\u0445\u043e\u0434\u044f\u0449\u0438\u0445 \u0446\u0435\u043b\u0435\u0439",
      noSp: "\u041d\u0435\u0434\u043e\u0441\u0442\u0430\u0442\u043e\u0447\u043d\u043e SP",
      noItems: "\u041d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u043f\u0440\u0435\u0434\u043c\u0435\u0442\u043e\u0432",
      targetInvalid: "\u0426\u0435\u043b\u044c \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430",
      extraTurn: "\u041f\u043e\u043b\u0443\u0447\u0435\u043d\u043e \u0432 \u044d\u0442\u043e\u043c \u0440\u0430\u0443\u043d\u0434\u0435",
    },
    statuses: {
      vulnerable: "\u0443\u044f\u0437\u0432\u0438\u043c",
      weakened: "\u043e\u0441\u043b\u0430\u0431\u043b\u0435\u043d",
      guarded: "\u043f\u043e\u0434 \u0437\u0430\u0449\u0438\u0442\u043e\u0439",
    },
    log: {
      hit: "{{src}} \u0431\u044c\u0435\u0442 {{tgt}} \u043d\u0430 {{dmg}} \u0443\u0440\u043e\u043d\u0430.",
      weakness: "\u0421\u043b\u0430\u0431\u043e\u0435 \u043c\u0435\u0441\u0442\u043e! {{src}} \u043f\u043e\u043b\u0443\u0447\u0430\u0435\u0442 \u0434\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0445\u043e\u0434.",
      guard: "{{src}} \u0443\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u0437\u0430 \u043f\u043e\u043a\u0440\u043e\u0432\u043e\u043c.",
      status: "{{tgt}}: {{status}}",
      death: "{{tgt}} \u043f\u0430\u0434\u0430\u0435\u0442.",
      heal: "{{src}} \u0432\u043e\u0441\u0441\u0442\u0430\u043d\u0430\u0432\u043b\u0438\u0432\u0430\u0435\u0442 {{dmg}} \u0434\u043b\u044f {{tgt}}.",
      item: "{{src}} \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442 {{item}}.",
      end: "{{src}} \u0437\u0430\u0432\u0435\u0440\u0448\u0430\u0435\u0442 \u0445\u043e\u0434.",
    },
    overlays: {
      hp: "HP",
      sp: "SP",
    },
    elements: {
      physical: "\u0424\u0438\u0437\u0438\u0447\u0435\u0441\u043a\u0438\u0439",
      fire: "\u041e\u0433\u043e\u043d\u044c",
      ice: "\u041b\u0451\u0434",
      electric: "\u041c\u043e\u043b\u043d\u0438\u044f",
      psychic: "\u041f\u0441\u0438\u0445\u0438\u043a\u0430",
      void: "\u041f\u0443\u0441\u0442\u043e\u0442\u0430",
    },
    skills: {
      luminous_strike: {
        name: "\u041b\u0443\u0447\u0435\u0437\u0430\u0440\u043d\u044b\u0439 \u0443\u0434\u0430\u0440",
        description: "\u0421\u0444\u043e\u043a\u0443\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0439 \u0442\u043e\u043b\u0447\u043e\u043a, \u0440\u0430\u0441\u0441\u0435\u043a\u0430\u044e\u0449\u0438\u0439 \u0441\u0438\u043b\u0443\u044d\u0442\u044b \u0442\u0435\u043d\u0435\u0439.",
      },
      ember_burst: {
        name: "\u0412\u0441\u043f\u044b\u0448\u043a\u0430 \u0443\u0433\u043b\u0435\u0439",
        description: "\u0417\u0430\u0436\u0438\u0433\u0430\u0435\u0442 \u0446\u0435\u043f\u043a\u0438\u0435 \u0441\u043e\u043c\u043d\u0435\u043d\u0438\u044f \u0438 \u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u0432\u0440\u0430\u0433\u043e\u0432 \u043e\u0441\u043b\u0430\u0431\u043b\u0435\u043d\u043d\u044b\u043c\u0438.",
      },
      frost_lattice: {
        name: "\u041b\u0435\u0434\u044f\u043d\u0430\u044f \u0440\u0435\u0448\u0451\u0442\u043a\u0430",
        description: "\u041a\u0440\u0438\u0441\u0442\u0430\u043b\u044c\u043d\u044b\u0439 \u0445\u043e\u043b\u043e\u0434 \u0441\u043a\u043e\u0432\u044b\u0432\u0430\u0435\u0442 \u0433\u0440\u0443\u043f\u043f\u0443 \u0442\u0435\u043d\u0435\u0439.",
      },
      voltaic_chain: {
        name: "\u042d\u043b\u0435\u043a\u0442\u0440\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u0446\u0435\u043f\u044c",
        description: "\u0412\u0441\u043f\u044b\u0448\u043a\u0430 \u043f\u0440\u043e\u0437\u0440\u0435\u043d\u0438\u044f \u043e\u0433\u043b\u0443\u0448\u0430\u0435\u0442 \u043e\u0434\u0438\u043d\u043e\u0447\u043d\u0443\u044e \u0446\u0435\u043b\u044c.",
      },
      mind_pierce: {
        name: "\u041f\u0440\u043e\u043d\u0437\u0435\u043d\u0438\u0435 \u0441\u043e\u0437\u043d\u0430\u043d\u0438\u044f",
        description: "\u0421\u043a\u043e\u043d\u0446\u0435\u043d\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0439 \u043f\u0441\u0438\u0445\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u043b\u0443\u0447 \u0432\u0437\u043b\u0430\u043c\u044b\u0432\u0430\u0435\u0442 \u043e\u0442\u043a\u0440\u044b\u0442\u044b\u0435 \u043c\u044b\u0441\u043b\u0438.",
      },
      twin_resonance: {
        name: "\u0414\u0432\u043e\u0439\u043d\u043e\u0439 \u0440\u0435\u0437\u043e\u043d\u0430\u043d\u0441",
        description: "\u0421\u0438\u043d\u0445\u0440\u043e\u043d\u043d\u044b\u0439 \u0438\u043c\u043f\u0443\u043b\u044c\u0441 \u0441 \u043d\u0430\u0434\u0451\u0436\u043d\u044b\u043c \u043d\u0430\u043f\u0430\u0440\u043d\u0438\u043a\u043e\u043c \u043e\u0433\u043b\u0443\u0448\u0430\u0435\u0442 \u0432\u0441\u0435\u0445 \u0432\u0440\u0430\u0433\u043e\u0432.",
      },
    },
    actorNames: {
      shadow_crawler: "\u041f\u043e\u043b\u0437\u0443\u0449\u0430\u044f \u0442\u0435\u043d\u044c",
      shadow_screamer: "\u041a\u0440\u0438\u0447\u0430\u0449\u0430\u044f \u0442\u0435\u043d\u044c",
      fear_avatar: "\u0410\u0432\u0430\u0442\u0430\u0440 \u0441\u0442\u0440\u0430\u0445\u0430",
      hero: "\u0421\u043d\u043e\u0432\u0438\u0434\u0435\u0446",
      lister: "\u041b\u0438\u0441\u0442\u0435\u0440",
    },
  },
};

export type { CombatLocale };

export function useCombatCopy() {
  const { locale } = useLocale();
  return combatLocale[locale] ?? combatLocale.en;
}








