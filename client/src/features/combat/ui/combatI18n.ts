import { useLocale } from "@/state/LocaleContext";

const combatLocale = {
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
  },
  ru: {
    loading: "Сон собирает данные боя...",
    turnOf: "Ход: {{name}}",
    roundLabel: "Раунд",
    queue: "Очередь",
    bonusTurn: "Бонус-ход",
    logTitle: "Журнал",
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
      extraTurn: "Уже получен",
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
  },
};

export type CombatLocale = typeof combatLocale.en;

export function useCombatCopy() {
  const { locale } = useLocale();
  return combatLocale[locale] ?? combatLocale.en;
}



