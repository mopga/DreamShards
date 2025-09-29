import React, { createContext, useContext, useMemo, useState } from "react";

export type Locale = "en" | "ru";

export type TranslationKey =
  | "title"
  | "subtitle"
  | "menuDescription"
  | "menuLogResume"
  | "begin"
  | "continue"
  | "reset"
  | "saveLocal"
  | "loadLocal"
  | "pushRemote"
  | "localeLabel"
  | "introNext"
  | "introSkip"
  | "introBegin"
  | "nameModalTitle"
  | "nameModalDescription"
  | "namePlaceholder"
  | "nameConfirm"
  | "nameRandom"
  | "nameErrorLength"
  | "nameErrorCharset"
  | "namingHint"
  | "mode_menu"
  | "mode_intro"
  | "mode_naming"
  | "mode_dialogue"
  | "mode_exploration"
  | "mode_combat"
  | "mode_ending"
  | "shardsLabel";

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    title: "Shards of Dreams",
    subtitle: "Follow the moonlit tide into the Palace of Fear.",
    menuDescription: "A single night, a single palace woven from fear.",
    menuLogResume: "The surf remembers where you left off.",
    begin: "Begin the Dream",
    continue: "Listen for Echoes (Load)",
    reset: "Reset Memory",
    saveLocal: "Save Local",
    loadLocal: "Load Local",
    pushRemote: "Push to Shore",
    localeLabel: "Language",
    introNext: "Next",
    introSkip: "Skip",
    introBegin: "Begin",
    nameModalTitle: "Name the Dreamer",
    nameModalDescription: "Whispers gather, waiting for the name you carry between worlds.",
    namePlaceholder: "Enter a name",
    nameConfirm: "Confirm",
    nameRandom: "Random Name",
    nameErrorLength: "Use 2-16 characters.",
    nameErrorCharset: "Only RU/EN letters, spaces, apostrophe, hyphen.",
    namingHint: "The palace remembers what you choose to be called.",
    mode_menu: "Menu",
    mode_intro: "Intro",
    mode_naming: "Naming",
    mode_dialogue: "Dialogue",
    mode_exploration: "Exploration",
    mode_combat: "Combat",
    mode_ending: "Ending",
    shardsLabel: "shards",
  },
  ru: {
    title: "Осколки снов",
    subtitle: "Иди за полосой лунной воды в Дворец Страха.",
    menuDescription: "Одна ночь, один дворец, сплетённый из страха.",
    menuLogResume: "Прилив помнит, где ты остановился.",
    begin: "Новая игра",
    continue: "Слушать эхо (Загрузка)",
    reset: "Сбросить память",
    saveLocal: "Сохранить",
    loadLocal: "Загрузить",
    pushRemote: "Отправить к берегу",
    localeLabel: "Язык",
    introNext: "Далее",
    introSkip: "Пропустить",
    introBegin: "Начать",
    nameModalTitle: "Назови героя",
    nameModalDescription: "Шёпоты ждут, пока ты назовёшь себя между мирами.",
    namePlaceholder: "Введите имя",
    nameConfirm: "Подтвердить",
    nameRandom: "Случайное имя",
    nameErrorLength: "От 2 до 16 символов.",
    nameErrorCharset: "Только буквы RU/EN, пробел, апостроф, дефис.",
    namingHint: "Дворец запомнит, как тебя зовут.",
    mode_menu: "Меню",
    mode_intro: "Интро",
    mode_naming: "Имя",
    mode_dialogue: "Диалог",
    mode_exploration: "Исследование",
    mode_combat: "Бой",
    mode_ending: "Финал",
    shardsLabel: "осколков",
  },
};

interface LocaleContextValue {
  locale: Locale;
  setLocale(locale: Locale): void;
  toggleLocale(): void;
  t(key: TranslationKey): string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      toggleLocale: () => setLocaleState((prev) => (prev === "en" ? "ru" : "en")),
      t: (key) => translations[locale][key],
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}

export function getIntroSlides(locale: Locale) {
  return locale === "ru"
    ? [
        "Ночь собирается, словно карта, сложенная не теми руками.",
        "Вода звенит светом, а воздух пахнет забвением.",
        "Ты просыпаешься — но это сон. И сон требует имени.",
      ]
    : [
        "Night folds itself like a map in unfamiliar hands.",
        "Water rings with light, the air scented with forgetting.",
        "You awaken — yet this is still a dream. And the dream demands a name.",
      ];
}

export function getRandomNames(locale: Locale) {
  return locale === "ru"
    ? [
        "Астра",
        "Лисандр",
        "Илия",
        "Мира",
        "Севен",
        "Рен",
        "Эллар",
        "Ная",
        "Орн",
        "Виола",
      ]
    : [
        "Lyra",
        "Aeron",
        "Sentra",
        "Cael",
        "Mira",
        "Orin",
        "Velis",
        "Iris",
        "Sable",
        "Nyx",
      ];
}

