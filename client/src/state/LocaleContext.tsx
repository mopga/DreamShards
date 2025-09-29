import React, { createContext, useContext, useMemo, useState } from "react";
import worldImage from "@/assets/intro/world.png";
import nightmareImage from "@/assets/intro/nightmare.png";
import heartImage from "@/assets/intro/heart.png";
import palacesImage from "@/assets/intro/palaces.png";
import heroesImage from "@/assets/intro/heroes.png";
import birthImage from "@/assets/intro/birth.png";
import heroSilhouette from "@/assets/characters/hero.png";
import listerPortrait from "@/assets/characters/lister.png";
import beachImage from "@/assets/locations/beach.png";

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
  | "introContinue"
  | "nameModalTitle"
  | "nameModalDescription"
  | "namePlaceholder"
  | "nameConfirm"
  | "nameRandom"
  | "nameErrorLength"
  | "nameErrorCharset"
  | "namingHint"
  | "mode_menu"
  | "mode_intro_world"
  | "mode_intro_birth"
  | "mode_intro_beach"
  | "mode_naming"
  | "mode_dialogue"
  | "mode_exploration"
  | "mode_combat"
  | "mode_ending"
  | "shardsLabel"
  | "speakerHero"
  | "speakerLister";

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
    introContinue: "Continue",
    nameModalTitle: "Name the Dreamer",
    nameModalDescription: "Whispers gather, waiting for the name you carry between worlds.",
    namePlaceholder: "Enter a name",
    nameConfirm: "Confirm",
    nameRandom: "Random Name",
    nameErrorLength: "Use 2-16 characters.",
    nameErrorCharset: "Only RU/EN letters, spaces, apostrophe, hyphen.",
    namingHint: "The palace remembers what you choose to be called.",
    mode_menu: "Menu",
    mode_intro_world: "Origins",
    mode_intro_birth: "Awakening",
    mode_intro_beach: "Moonlit Shore",
    mode_naming: "Naming",
    mode_dialogue: "Dialogue",
    mode_exploration: "Exploration",
    mode_combat: "Combat",
    mode_ending: "Ending",
    shardsLabel: "shards",
    speakerHero: "You",
    speakerLister: "Lister",
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
    introContinue: "Продолжить",
    nameModalTitle: "Назови героя",
    nameModalDescription: "Шёпоты ждут, пока ты назовёшь себя между мирами.",
    namePlaceholder: "Введите имя",
    nameConfirm: "Подтвердить",
    nameRandom: "Случайное имя",
    nameErrorLength: "От 2 до 16 символов.",
    nameErrorCharset: "Только буквы RU/EN, пробел, апостроф, дефис.",
    namingHint: "Дворец запомнит, как тебя зовут.",
    mode_menu: "Меню",
    mode_intro_world: "Истоки",
    mode_intro_birth: "Пробуждение",
    mode_intro_beach: "Лунный берег",
    mode_naming: "Имя",
    mode_dialogue: "Диалог",
    mode_exploration: "Исследование",
    mode_combat: "Бой",
    mode_ending: "Финал",
    shardsLabel: "осколков",
    speakerHero: "Ты",
    speakerLister: "Листер",
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

export interface StorySlide {
  id: string;
  text: string;
  image: string;
  alt: string;
}

export interface BeachBeat {
  id: string;
  text: string;
  image: string;
  alt: string;
  speaker: "hero" | "lister" | "narrator";
}

const worldSlidesEN: StorySlide[] = [
  { id: "world-1", text: "Somewhere on the fringes of the cosmos lies a world woven entirely from dreams.", image: worldImage, alt: "Dream world" },
  { id: "world-2", text: "Its halls once shimmered with color and laughter, until the first nightmares arrived.", image: nightmareImage, alt: "Nightmares distort" },
  { id: "world-3", text: "Nightmares birthed dark Shadows and shattered the Heart that sustained the dream.", image: heartImage, alt: "Shattered heart" },
  { id: "world-4", text: "The Heart splintered into shards that scattered across the realm.", image: heartImage, alt: "Heart shards" },
  { id: "world-5", text: "Great Nightmares raised Palaces from the fragments and enslaved the Shadows within.", image: palacesImage, alt: "Nightmare palaces" },
  { id: "world-6", text: "Only a handful of dreamers with unbroken Will still rise to resist.", image: heroesImage, alt: "Dream heroes" },
];

const worldSlidesRU: StorySlide[] = [
  { id: "world-1", text: "Где-то на окраине вселенной существует мир, сотканный из снов.", image: worldImage, alt: "Мир сна" },
  { id: "world-2", text: "Он был полон красок и радости, пока в него не пришли кошмары.", image: nightmareImage, alt: "Кошмары" },
  { id: "world-3", text: "Кошмары породили Тени и разбили Сердце, державшее мир целым.", image: heartImage, alt: "Разбитое сердце" },
  { id: "world-4", text: "Сердце раскололось на осколки, рассеянные по всем пределам.", image: heartImage, alt: "Осколки сердца" },
  { id: "world-5", text: "Великие кошмары воздвигли Дворцы и подчинили себе Теней — осколки душ.", image: palacesImage, alt: "Дворцы кошмаров" },
  { id: "world-6", text: "Лишь немногие герои с крепкой Волей до сих пор сопротивляются.", image: heroesImage, alt: "Герои" },
];

const birthSlidesEN: StorySlide[] = [
  { id: "birth-1", text: "The resistance poured its remaining Hope into summoning a new champion.", image: birthImage, alt: "Birth of hero" },
  { id: "birth-2", text: "From the abyss a pure Will stirred, reaching for the remnants of light.", image: birthImage, alt: "Will awakens" },
  { id: "birth-3", text: "You were born from darkness, craving warmth and joy lost to the world.", image: heroSilhouette, alt: "Hero silhouette" },
  { id: "birth-4", text: "Give this Will a name, creator, so the dream may know its guardian.", image: birthImage, alt: "Name the hero" },
];

const birthSlidesRU: StorySlide[] = [
  { id: "birth-1", text: "Сопротивление вложило остатки Надежды в призыв нового защитника.", image: birthImage, alt: "Рождение героя" },
  { id: "birth-2", text: "Из бездны шевельнулась чистая Воля, тянущаяся к последним огням света.", image: birthImage, alt: "Воля просыпается" },
  { id: "birth-3", text: "Ты родился из тьмы с жаждой света и счастья, украденных у мира.", image: heroSilhouette, alt: "Силуэт героя" },
  { id: "birth-4", text: "Дай этой Воле имя, творец, чтобы сны узнали своего хранителя.", image: birthImage, alt: "Назови героя" },
];

const beachBeatsEN: BeachBeat[] = [
  { id: "beach-1", text: "...Where am I? The sand hums with cold starlight.", image: beachImage, alt: "Moonlit beach", speaker: "hero" },
  { id: "beach-2", text: "A figure approaches, lantern flickering like a captured dawn.", image: listerPortrait, alt: "Lister arrives", speaker: "narrator" },
  { id: "beach-3", text: "\"Welcome, warrior of release,\" the stranger says. \"We pulled you from oblivion, but the ritual was shattered.\"", image: listerPortrait, alt: "Lister speaks", speaker: "lister" },
  { id: "beach-4", text: "Lister gestures toward distant palaces shimmering beyond the tide.", image: palacesImage, alt: "Distant palaces", speaker: "narrator" },
  { id: "beach-5", text: "\"Your memories and strength are scattered among dream shards. Gather them, and the world will breathe again.\"", image: listerPortrait, alt: "Lister explains", speaker: "lister" },
  { id: "beach-6", text: "Follow the moonlit path, {{hero}}. I will wait here, guarding the shore between worlds.", image: beachImage, alt: "Moonlit shore", speaker: "lister" },
];

const beachBeatsRU: BeachBeat[] = [
  { id: "beach-1", text: "...Где я? Песок поёт холодным звездным светом.", image: beachImage, alt: "Лунный берег", speaker: "hero" },
  { id: "beach-2", text: "Силуэт с фонарём в руках приближается, будто несёт пленённый рассвет.", image: listerPortrait, alt: "Приходит Листер", speaker: "narrator" },
  { id: "beach-3", text: "\"Добро пожаловать, воин освобождения,\" говорит незнакомец. \"Мы вырвали тебя из небытия, но ритуал сорвался.\"", image: listerPortrait, alt: "Листер говорит", speaker: "lister" },
  { id: "beach-4", text: "Листер указывает на далёкие дворцы, мерцающие за приливом.", image: palacesImage, alt: "Далёкие дворцы", speaker: "narrator" },
  { id: "beach-5", text: "\"Твои память и сила рассеяны в осколках. Собери их — и мир снова вздохнёт.\"", image: listerPortrait, alt: "Листер объясняет", speaker: "lister" },
  { id: "beach-6", text: "Следуй по лунной тропе, {{hero}}. Я останусь здесь, храня границу между мирами.", image: beachImage, alt: "Лунный берег", speaker: "lister" },
];

export function getWorldSlides(locale: Locale): StorySlide[] {
  return locale === "ru" ? worldSlidesRU : worldSlidesEN;
}

export function getBirthSlides(locale: Locale): StorySlide[] {
  return locale === "ru" ? birthSlidesRU : birthSlidesEN;
}

export function getBeachBeats(locale: Locale): BeachBeat[] {
  return locale === "ru" ? beachBeatsRU : beachBeatsEN;
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

