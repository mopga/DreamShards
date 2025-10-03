import React, { createContext, useContext, useMemo, useState } from "react";
import worldPanorama from "@/assets/intro/world_panorama.png";
import fractureImage from "@/assets/intro/fracture.png";
import dreamCityImage from "@/assets/intro/dream_city.png";
import palacesImage from "@/assets/intro/palaces.png";
import birthImage from "@/assets/intro/birth.png";
import heroPortrait from "@/assets/characters/hero_portrait.png";
import listerPortrait from "@/assets/characters/lister.png";
import listerPortraitAlt from "@/assets/characters/lister_portrait_alt.png";
import beachImage from "@/assets/locations/beach.png";
import beachArrival from "@/assets/locations/beach_arrival.png";
import beachLister from "@/assets/locations/beach_lister.png";

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
  | "saveModalTitle"
  | "saveModalDescription"
  | "saveNameLabel"
  | "saveNamePlaceholder"
  | "saveConfirm"
  | "saveDefaultNamePrefix"
  | "saveAutoLabel"
  | "saveManualLabel"
  | "saveUnnamed"
  | "loadModalTitle"
  | "loadModalDescription"
  | "loadModalEmpty"
  | "commonClose"
  | "commonCancel"
  | "confirmLatestTitle"
  | "confirmLatestMessage"
  | "confirmLatestConfirm"
  | "confirmLatestCancel"
  | "saveEndingDefaultName"
  | "endingTitle"
  | "endingSuccess"
  | "endingFailure"
  | "endingShardsPrefix"
  | "endingShardFallback"
  | "endingShardLine1"
  | "endingShardLine2"
  | "endingShardLine3"
  | "endingResonance"
  | "endingSaveButton"
  | "endingWakeButton"
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
  | "levelLabel"
  | "xpLabel"
  | "skillUnlockTitle"
  | "skillUnlockDescription"
  | "skillUnlockButton"
  | "skillUnlockLog"
  | "speakerHero"
  | "speakerLister"
  | "hero.default_name"
  | "hero.name"
  | "lister.name";

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
    saveModalTitle: "Create Save",
    saveModalDescription: "Name this moment so you can return to it later.",
    saveNameLabel: "Save Name",
    saveNamePlaceholder: "Enter a name",
    saveConfirm: "Save Dream",
    saveDefaultNamePrefix: "Dream of",
    saveAutoLabel: "Last Dream",
    saveManualLabel: "Manual Save",
    saveUnnamed: "Unnamed Dream",
    loadModalTitle: "Load Dream",
    loadModalDescription: "Choose a memory to call back from the tide.",
    loadModalEmpty: "No saves found yet.",
    commonClose: "Close",
    commonCancel: "Cancel",
    confirmLatestTitle: "Load Latest Dream?",
    confirmLatestMessage: "Are you sure you want to load the most recent dream?",
    confirmLatestConfirm: "Yes, Load",
    confirmLatestCancel: "Stay",
    saveEndingDefaultName: "Ending Echo",
    endingTitle: "The Dream Settles",
    endingSuccess: "The Avatar dissolves, leaving only the tide and a promise of quieter dreams.",
    endingFailure: "Fear still lingers, but the palace no longer holds the same power.",
    endingShardsPrefix: "Shards gathered",
    endingShardFallback: "echoes waiting to be found",
    endingShardLine1: "A whisper of courage",
    endingShardLine2: "A steadying breath",
    endingShardLine3: "A shared heartbeat",
    endingResonance: "Senna and Io trade a knowing glance; their resonance lingers even after waking.",
    endingSaveButton: "Save This Ending",
    endingWakeButton: "Wake Up",
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
    "levelLabel": "Lv.",
    "xpLabel": "XP",
    "skillUnlockTitle": "New Skill Unlocked",
    "skillUnlockDescription": "{{actor}} can now use {{skill}}.",
    "skillUnlockButton": "Continue",
    "skillUnlockLog": "{{actor}} mastered {{skill}}!",
    "hero.default_name": "Dreamer",
    "hero.name": "Hero",
    "lister.name": "Lister",
  },
  ru: {
    title: "\u041e\u0441\u043a\u043e\u043b\u043a\u0438 \u0441\u043d\u043e\u0432",
    subtitle: "\u0421\u043b\u0435\u0434\u0443\u0439 \u0437\u0430 \u043b\u0443\u043d\u043d\u043e\u0439 \u0432\u043e\u043b\u043d\u043e\u0439 \u043a \u0414\u0432\u043e\u0440\u0446\u0443 \u0421\u0442\u0440\u0430\u0445\u0430.",
    menuDescription: "\u041e\u0434\u043d\u0430 \u043d\u043e\u0447\u044c, \u043e\u0434\u0438\u043d \u0434\u0432\u043e\u0440\u0435\u0446, \u0441\u043e\u0442\u043a\u0430\u043d\u043d\u044b\u0439 \u0438\u0437 \u0441\u0442\u0440\u0430\u0445\u0430.",
    menuLogResume: "\u041f\u0440\u0438\u043b\u0438\u0432 \u043f\u043e\u043c\u043d\u0438\u0442, \u0433\u0434\u0435 \u0442\u044b \u043e\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u043b\u0441\u044f.",
    begin: "\u041d\u0430\u0447\u0430\u0442\u044c \u0441\u043e\u043d",
    continue: "\u041f\u0440\u0438\u0441\u043b\u0443\u0448\u0430\u0442\u044c\u0441\u044f \u043a \u044d\u0445\u0443 (\u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0430)",
    reset: "\u0421\u0442\u0435\u0440\u0435\u0442\u044c \u043f\u0430\u043c\u044f\u0442\u044c",
    saveLocal: "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c",
    loadLocal: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c",
    pushRemote: "\u0412\u044b\u043d\u0435\u0441\u0442\u0438 \u043a \u0431\u0435\u0440\u0435\u0433\u0443",
    saveModalTitle: "\u041d\u043e\u0432\u043e\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435",
    saveModalDescription: "\u0414\u0430\u0439 \u0438\u043c\u044f \u044d\u0442\u043e\u043c\u0443 \u043c\u0433\u043d\u043e\u0432\u0435\u043d\u0438\u044e, \u0447\u0442\u043e\u0431\u044b \u0432\u0435\u0440\u043d\u0443\u0442\u044c\u0441\u044f \u043a \u043d\u0435\u043c\u0443 \u043f\u043e\u0437\u0436\u0435.",
    saveNameLabel: "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
    saveNamePlaceholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435",
    saveConfirm: "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0441\u043e\u043d",
    saveDefaultNamePrefix: "\u0421\u043e\u043d \u043e\u0442",
    saveAutoLabel: "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u0441\u043e\u043d",
    saveManualLabel: "\u0420\u0443\u0447\u043d\u043e\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435",
    saveUnnamed: "\u0421\u043e\u043d \u0431\u0435\u0437 \u0438\u043c\u0435\u043d\u0438",
    loadModalTitle: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0441\u043e\u043d",
    loadModalDescription: "\u0412\u044b\u0431\u0435\u0440\u0438 \u0432\u043e\u0441\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u0435, \u043a\u043e\u0442\u043e\u0440\u043e\u0435 \u0445\u043e\u0447\u0435\u0448\u044c \u0432\u0435\u0440\u043d\u0443\u0442\u044c \u0438\u0437 \u043f\u0440\u0438\u043b\u0438\u0432\u0430.",
    loadModalEmpty: "\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f \u0435\u0449\u0451 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b.",
    commonClose: "\u0417\u0430\u043a\u0440\u044b\u0442\u044c",
    commonCancel: "\u041e\u0442\u043c\u0435\u043d\u0430",
    confirmLatestTitle: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u0441\u043e\u043d?",
    confirmLatestMessage: "\u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u0441\u043e\u043d?",
    confirmLatestConfirm: "\u0414\u0430, \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c",
    confirmLatestCancel: "\u041e\u0441\u0442\u0430\u0442\u044c\u0441\u044f",
    saveEndingDefaultName: "\u042d\u0445\u043e \u0444\u0438\u043d\u0430\u043b\u0430",
    endingTitle: "\u0421\u043e\u043d \u0443\u0441\u043f\u043e\u043a\u0430\u0438\u0432\u0430\u0435\u0442\u0441\u044f",
    endingSuccess: "\u0410\u0432\u0430\u0442\u0430\u0440 \u0440\u0430\u0441\u0442\u0432\u043e\u0440\u044f\u0435\u0442\u0441\u044f, \u043e\u0441\u0442\u0430\u0432\u043b\u044f\u044f \u043b\u0438\u0448\u044c \u043f\u0440\u0438\u043b\u0438\u0432 \u0438 \u043e\u0431\u0435\u0449\u0430\u043d\u0438\u0435 \u0442\u0438\u0445\u0438\u0445 \u0433\u0440\u0451\u0437.",
    endingFailure: "\u0421\u0442\u0440\u0430\u0445 \u0435\u0449\u0451 \u0434\u0435\u0440\u0436\u0438\u0442\u0441\u044f, \u043d\u043e \u0434\u0432\u043e\u0440\u0435\u0446 \u0431\u043e\u043b\u044c\u0448\u0435 \u043d\u0435 \u0432\u043b\u0430\u0441\u0442\u0432\u0443\u0435\u0442 \u043d\u0430\u0434 \u0442\u043e\u0431\u043e\u0439.",
    endingShardsPrefix: "\u0421\u043e\u0431\u0440\u0430\u043d\u043d\u044b\u0435 \u043e\u0441\u043a\u043e\u043b\u043a\u0438",
    endingShardFallback: "\u044d\u0445\u043e\u043c \u0436\u0434\u0443\u0442, \u0447\u0442\u043e\u0431\u044b \u0438\u0445 \u043d\u0430\u0439\u0442\u0438",
    endingShardLine1: "\u0428\u0451\u043f\u043e\u0442 \u043c\u0443\u0436\u0435\u0441\u0442\u0432\u0430",
    endingShardLine2: "\u0412\u044b\u0440\u043e\u0432\u043d\u0435\u043d\u043d\u043e\u0435 \u0434\u044b\u0445\u0430\u043d\u0438\u0435",
    endingShardLine3: "\u0415\u0434\u0438\u043d\u044b\u0439 \u0440\u0438\u0442\u043c \u0441\u0435\u0440\u0434\u0446\u0430",
    endingResonance: "\u0421\u0435\u043d\u043d\u0430 \u0438 \u0418\u043e \u0431\u0440\u043e\u0441\u0430\u044e\u0442 \u0434\u0440\u0443\u0433 \u0434\u0440\u0443\u0433\u0443 \u043f\u043e\u043d\u0438\u043c\u0430\u044e\u0449\u0438\u0439 \u0432\u0437\u0433\u043b\u044f\u0434; \u0438\u0445 \u0440\u0435\u0437\u043e\u043d\u0430\u043d\u0441 \u043d\u0435 \u0442\u0430\u0435\u0442 \u0434\u0430\u0436\u0435 \u043f\u043e\u0441\u043b\u0435 \u043f\u0440\u043e\u0431\u0443\u0436\u0434\u0435\u043d\u0438\u044f.",
    endingSaveButton: "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0444\u0438\u043d\u0430\u043b",
    endingWakeButton: "\u041f\u0440\u043e\u0431\u0443\u0434\u0438\u0442\u044c\u0441\u044f",
    localeLabel: "\u042f\u0437\u044b\u043a",
    introNext: "\u0414\u0430\u043b\u0435\u0435",
    introSkip: "\u041f\u0440\u043e\u043f\u0443\u0441\u0442\u0438\u0442\u044c",
    introBegin: "\u041d\u0430\u0447\u0430\u0442\u044c",
    introContinue: "\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c",
    nameModalTitle: "\u041d\u0430\u0437\u043e\u0432\u0438 \u0421\u043d\u043e\u0432\u0438\u0434\u0446\u0430",
    nameModalDescription: "\u0428\u0451\u043f\u043e\u0442\u044b \u0436\u0434\u0443\u0442 \u0438\u043c\u044f, \u043a\u043e\u0442\u043e\u0440\u043e\u0435 \u0442\u044b \u043d\u0435\u0441\u0451\u0448\u044c \u043c\u0435\u0436\u0434\u0443 \u043c\u0438\u0440\u0430\u043c\u0438.",
    namePlaceholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043c\u044f",
    nameConfirm: "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c",
    nameRandom: "\u0421\u043b\u0443\u0447\u0430\u0439\u043d\u043e\u0435 \u0438\u043c\u044f",
    nameErrorLength: "\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439\u0442\u0435 2\u201316 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432.",
    nameErrorCharset: "\u0422\u043e\u043b\u044c\u043a\u043e \u0431\u0443\u043a\u0432\u044b RU/EN, \u043f\u0440\u043e\u0431\u0435\u043b, \u0430\u043f\u043e\u0441\u0442\u0440\u043e\u0444, \u0434\u0435\u0444\u0438\u0441.",
    namingHint: "\u0414\u0432\u043e\u0440\u0435\u0446 \u0437\u0430\u043f\u043e\u043c\u043d\u0438\u0442, \u043a\u0430\u043a \u0442\u044b \u0440\u0435\u0448\u0438\u0448\u044c \u043d\u0430\u0437\u044b\u0432\u0430\u0442\u044c\u0441\u044f.",
    mode_menu: "\u041c\u0435\u043d\u044e",
    mode_intro_world: "\u0418\u0441\u0442\u043e\u043a\u0438",
    mode_intro_birth: "\u041f\u0440\u043e\u0431\u0443\u0436\u0434\u0435\u043d\u0438\u0435",
    mode_intro_beach: "\u041b\u0443\u043d\u043d\u044b\u0439 \u0431\u0435\u0440\u0435\u0433",
    mode_naming: "\u0418\u043c\u044f",
    mode_dialogue: "\u0414\u0438\u0430\u043b\u043e\u0433",
    mode_exploration: "\u0418\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435",
    mode_combat: "\u0411\u043e\u0439",
    mode_ending: "\u0424\u0438\u043d\u0430\u043b",
    shardsLabel: "\u043e\u0441\u043a\u043e\u043b\u043a\u0438",
    speakerHero: "\u0422\u044b",
    speakerLister: "\u041b\u0438\u0441\u0442\u0435\u0440",
    "levelLabel": "\u0423\u0440.",
    "xpLabel": "\u041e\u041f",
    "skillUnlockTitle": "\u041d\u043e\u0432\u044b\u0439 \u043d\u0430\u0432\u044b\u043a",
    "skillUnlockDescription": "{{actor}} \u043e\u0441\u0432\u043e\u0438\u043b {{skill}}.",
    "skillUnlockButton": "\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u044c",
    "skillUnlockLog": "{{actor}} \u043e\u0441\u0432\u043e\u0438\u043b {{skill}}!",
    "hero.default_name": "\u0421\u043d\u043e\u0432\u0438\u0434\u0435\u0446",
    "hero.name": "\u0413\u0435\u0440\u043e\u0439",
    "lister.name": "\u041b\u0438\u0441\u0442\u0435\u0440",
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
  { id: "world-1", text: "Somewhere on the fringes of the cosmos lies a world woven entirely from dreams.", image: worldPanorama, alt: "Dream panorama" },
  { id: "world-2", text: "Its halls once shimmered with color and laughter, until the first nightmares arrived.", image: worldPanorama, alt: "Nightmares draw near" },
  { id: "world-3", text: "Nightmares birthed dark Shadows and shattered the Heart that sustained the dream.", image: fractureImage, alt: "World fracture" },
  { id: "world-4", text: "The Heart splintered into shards that scattered across the realm.", image: fractureImage, alt: "Shards spill from the wound" },
  { id: "world-5", text: "Great Nightmares raised Palaces from the fragments and enslaved the Shadows within.", image: dreamCityImage, alt: "Forsaken dream city" },
  { id: "world-6", text: "Only a handful of dreamers with unbroken Will still rise to resist.", image: dreamCityImage, alt: "Dreamers in the lost city" },
];

const worldSlidesRU: StorySlide[] = [
  { id: "world-1", text: "\u0413\u0434\u0435-\u0442\u043e \u043d\u0430 \u043e\u043a\u0440\u0430\u0438\u043d\u0430\u0445 \u043a\u043e\u0441\u043c\u043e\u0441\u0430 \u043b\u0435\u0436\u0438\u0442 \u043c\u0438\u0440, \u0446\u0435\u043b\u0438\u043a\u043e\u043c \u0441\u043e\u0442\u043a\u0430\u043d\u043d\u044b\u0439 \u0438\u0437 \u0441\u043d\u043e\u0432.", image: worldPanorama, alt: "\u041f\u0430\u043d\u043e\u0440\u0430\u043c\u0430 \u043c\u0438\u0440\u0430 \u0441\u043d\u043e\u0432" },
  { id: "world-2", text: "\u0415\u0433\u043e \u0437\u0430\u043b\u044b \u043a\u043e\u0433\u0434\u0430-\u0442\u043e \u0441\u0438\u044f\u043b\u0438 \u043a\u0440\u0430\u0441\u043a\u0430\u043c\u0438 \u0438 \u0441\u043c\u0435\u0445\u043e\u043c, \u043f\u043e\u043a\u0430 \u043d\u0435 \u043f\u0440\u0438\u0448\u043b\u0438 \u043f\u0435\u0440\u0432\u044b\u0435 \u043a\u043e\u0448\u043c\u0430\u0440\u044b.", image: worldPanorama, alt: "\u041a\u043e\u0448\u043c\u0430\u0440\u044b \u043f\u043e\u0434\u0441\u0442\u0443\u043f\u0430\u044e\u0442" },
  { id: "world-3", text: "\u041a\u043e\u0448\u043c\u0430\u0440\u044b \u043f\u043e\u0440\u043e\u0434\u0438\u043b\u0438 \u0442\u0451\u043c\u043d\u044b\u0445 \u0422\u0435\u043d\u0435\u0439 \u0438 \u0440\u0430\u0441\u043a\u043e\u043b\u043e\u043b\u0438 \u0421\u0435\u0440\u0434\u0446\u0435, \u0447\u0442\u043e \u043f\u0438\u0442\u0430\u043b\u043e \u044d\u0442\u043e\u0442 \u0441\u043e\u043d.", image: fractureImage, alt: "\u0420\u0430\u0441\u043a\u043e\u043b\u043e\u0442\u044b\u0439 \u043c\u0438\u0440" },
  { id: "world-4", text: "\u0421\u0435\u0440\u0434\u0446\u0435 \u0440\u0430\u0441\u0441\u044b\u043f\u0430\u043b\u043e\u0441\u044c \u043d\u0430 \u043e\u0441\u043a\u043e\u043b\u043a\u0438, \u0440\u0430\u0437\u043b\u0435\u0442\u0435\u0432\u0448\u0438\u0435\u0441\u044f \u043f\u043e \u0432\u0441\u0435\u043c\u0443 \u0446\u0430\u0440\u0441\u0442\u0432\u0443.", image: fractureImage, alt: "\u041e\u0441\u043a\u043e\u043b\u043a\u0438 \u0432\u044b\u043f\u043b\u0435\u0441\u043a\u0438\u0432\u0430\u044e\u0442\u0441\u044f \u043d\u0430\u0440\u0443\u0436\u0443" },
  { id: "world-5", text: "\u0412\u0435\u043b\u0438\u043a\u0438\u0435 \u041a\u043e\u0448\u043c\u0430\u0440\u044b \u0441\u043b\u043e\u0436\u0438\u043b\u0438 \u0438\u0437 \u043e\u0431\u043b\u043e\u043c\u043a\u043e\u0432 \u0434\u0432\u043e\u0440\u0446\u044b \u0438 \u043f\u043e\u0440\u0430\u0431\u043e\u0442\u0438\u043b\u0438 \u0422\u0435\u043d\u0435\u0439 \u0432\u043d\u0443\u0442\u0440\u0438.", image: dreamCityImage, alt: "\u041f\u043e\u043a\u0438\u043d\u0443\u0442\u044b\u0439 \u0433\u043e\u0440\u043e\u0434 \u0441\u043d\u043e\u0432" },
  { id: "world-6", text: "\u041b\u0438\u0448\u044c \u043d\u0435\u043c\u043d\u043e\u0433\u0438\u0435 \u0441\u043d\u043e\u0432\u0438\u0434\u0446\u044b \u0441 \u043d\u0435\u0441\u0433\u0438\u0431\u0430\u0435\u043c\u043e\u0439 \u0432\u043e\u043b\u0435\u0439 \u0432\u0441\u0451 \u0435\u0449\u0451 \u0433\u043e\u0442\u043e\u0432\u044b \u0441\u043e\u043f\u0440\u043e\u0442\u0438\u0432\u043b\u044f\u0442\u044c\u0441\u044f.", image: dreamCityImage, alt: "\u0421\u043d\u043e\u0432\u0438\u0434\u0446\u044b \u0432 \u0437\u0430\u0442\u0435\u0440\u044f\u043d\u043d\u043e\u043c \u0433\u043e\u0440\u043e\u0434\u0435" },
];

const birthSlidesEN: StorySlide[] = [
  { id: "birth-1", text: "The resistance poured its remaining Hope into summoning a new champion.", image: birthImage, alt: "Birth of hero" },
  { id: "birth-2", text: "From the abyss a pure Will stirred, reaching for the remnants of light.", image: birthImage, alt: "Will awakens" },
  { id: "birth-3", text: "You were born from darkness, craving warmth and joy lost to the world.", image: heroPortrait, alt: "Hero portrait" },
  { id: "birth-4", text: "Give this Will a name, creator, so the dream may know its guardian.", image: birthImage, alt: "Name the hero" },
];

const birthSlidesRU: StorySlide[] = [
  { id: "birth-1", text: "\u0421\u043e\u043f\u0440\u043e\u0442\u0438\u0432\u043b\u0435\u043d\u0438\u0435 \u0432\u043b\u043e\u0436\u0438\u043b\u043e \u043e\u0441\u0442\u0430\u0442\u043a\u0438 \u0441\u0432\u043e\u0435\u0439 \u041d\u0430\u0434\u0435\u0436\u0434\u044b, \u0447\u0442\u043e\u0431\u044b \u043f\u0440\u0438\u0437\u0432\u0430\u0442\u044c \u043d\u043e\u0432\u043e\u0433\u043e \u0437\u0430\u0449\u0438\u0442\u043d\u0438\u043a\u0430.", image: birthImage, alt: "\u0420\u043e\u0436\u0434\u0435\u043d\u0438\u0435 \u0433\u0435\u0440\u043e\u044f" },
  { id: "birth-2", text: "\u0418\u0437 \u0431\u0435\u0437\u0434\u043d\u044b \u043f\u043e\u0442\u044f\u043d\u0443\u043b\u0430\u0441\u044c \u0447\u0438\u0441\u0442\u0430\u044f \u0412\u043e\u043b\u044f, \u0442\u044f\u043d\u0443\u0449\u0430\u044f\u0441\u044f \u043a \u043e\u0441\u043a\u043e\u043b\u043a\u0430\u043c \u0441\u0432\u0435\u0442\u0430.", image: birthImage, alt: "\u041f\u0440\u043e\u0431\u0443\u0436\u0434\u0430\u044e\u0449\u0430\u044f\u0441\u044f \u0432\u043e\u043b\u044f" },
  { id: "birth-3", text: "\u0422\u044b \u0431\u044b\u043b \u0440\u043e\u0436\u0434\u0435\u043d \u0438\u0437 \u0442\u044c\u043c\u044b, \u0436\u0430\u0436\u0434\u0443\u0449\u0435\u0439 \u0442\u0435\u043f\u043b\u0430 \u0438 \u0440\u0430\u0434\u043e\u0441\u0442\u0438, \u043f\u043e\u0442\u0435\u0440\u044f\u043d\u043d\u044b\u0445 \u0434\u043b\u044f \u043c\u0438\u0440\u0430.", image: heroPortrait, alt: "\u041f\u043e\u0440\u0442\u0440\u0435\u0442 \u0433\u0435\u0440\u043e\u044f" },
  { id: "birth-4", text: "\u0414\u0430\u0440\u0443\u0439 \u044d\u0442\u043e\u0439 \u0412\u043e\u043b\u0435 \u0438\u043c\u044f, \u0442\u0432\u043e\u0440\u0435\u0446, \u0447\u0442\u043e\u0431\u044b \u0441\u043e\u043d \u0443\u0437\u043d\u0430\u043b \u0441\u0432\u043e\u0435\u0433\u043e \u0441\u0442\u0440\u0430\u0436\u0430.", image: birthImage, alt: "\u041d\u0430\u0437\u043e\u0432\u0438 \u0433\u0435\u0440\u043e\u044f" },
];

const beachBeatsEN: BeachBeat[] = [
  { id: "beach-1", text: "...Where am I? The sand hums with cold starlight.", image: beachArrival, alt: "Moonlit arrival", speaker: "hero" },
  { id: "beach-2", text: "A figure approaches, lantern flickering like a captured dawn.", image: beachArrival, alt: "Silhouette on the shore", speaker: "narrator" },
  { id: "beach-3", text: "\"Welcome, warrior of release,\" the stranger says. \"We pulled you from oblivion, but the ritual was shattered.\"", image: listerPortraitAlt, alt: "Lister speaks", speaker: "lister" },
  { id: "beach-4", text: "Lister gestures toward distant palaces shimmering beyond the tide.", image: dreamCityImage, alt: "Distant palaces", speaker: "narrator" },
  { id: "beach-5", text: "\"Your memories and strength are scattered among dream shards. Gather them, and the world will breathe again.\"", image: listerPortraitAlt, alt: "Lister explains", speaker: "lister" },
  { id: "beach-6", text: "Follow the moonlit path, {{hero}}. I will wait here, guarding the shore between worlds.", image: beachLister, alt: "Lister on the shore", speaker: "lister" },
];

const beachBeatsRU: BeachBeat[] = [
  { id: "beach-1", text: "...\u0413\u0434\u0435 \u044f? \u041f\u0435\u0441\u043e\u043a \u0437\u0432\u0435\u043d\u0438\u0442 \u043e\u0442 \u0445\u043e\u043b\u043e\u0434\u043d\u043e\u0433\u043e \u0437\u0432\u0435\u0437\u0434\u043d\u043e\u0433\u043e \u0441\u0432\u0435\u0442\u0430.", image: beachArrival, alt: "\u041f\u0440\u0438\u0431\u044b\u0442\u0438\u0435 \u043d\u0430 \u0431\u0435\u0440\u0435\u0433", speaker: "hero" },
  { id: "beach-2", text: "\u041a \u0431\u0435\u0440\u0435\u0433\u0443 \u0448\u0430\u0433 \u0437\u0430 \u0448\u0430\u0433\u043e\u043c \u043f\u043e\u0434\u0445\u043e\u0434\u0438\u0442 \u0441\u0438\u043b\u0443\u044d\u0442 \u0441 \u0442\u0430\u043d\u0446\u0443\u044e\u0449\u0438\u043c \u0444\u043e\u043d\u0430\u0440\u0451\u043c.", image: beachArrival, alt: "\u0421\u0438\u043b\u0443\u044d\u0442 \u043d\u0430 \u0431\u0435\u0440\u0435\u0433\u0443", speaker: "narrator" },
  { id: "beach-3", text: "\u0414\u043e\u0431\u0440\u043e \u043f\u043e\u0436\u0430\u043b\u043e\u0432\u0430\u0442\u044c, \u0432\u043e\u0438\u043d \u043e\u0441\u0432\u043e\u0431\u043e\u0436\u0434\u0435\u043d\u0438\u044f, \u2014 \u043f\u0440\u043e\u0438\u0437\u043d\u043e\u0441\u0438\u0442 \u043d\u0435\u0437\u043d\u0430\u043a\u043e\u043c\u0435\u0446. \u041c\u044b \u0432\u044b\u0440\u0432\u0430\u043b\u0438 \u0442\u0435\u0431\u044f \u0438\u0437 \u043d\u0435\u0431\u044b\u0442\u0438\u044f, \u043d\u043e \u0440\u0438\u0442\u0443\u0430\u043b \u0431\u044b\u043b \u0441\u043b\u043e\u043c\u0430\u043d.", image: listerPortraitAlt, alt: "\u041b\u0438\u0441\u0442\u0435\u0440 \u0433\u043e\u0432\u043e\u0440\u0438\u0442", speaker: "lister" },
  { id: "beach-4", text: "\u041b\u0438\u0441\u0442\u0435\u0440 \u0443\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u0442 \u043d\u0430 \u0434\u0432\u043e\u0440\u0446\u044b, \u043c\u0435\u0440\u0446\u0430\u044e\u0449\u0438\u0435 \u0437\u0430 \u043f\u0440\u0438\u043b\u0438\u0432\u043e\u043c.", image: dreamCityImage, alt: "\u0414\u0430\u043b\u0451\u043a\u0438\u0435 \u0434\u0432\u043e\u0440\u0446\u044b", speaker: "narrator" },
  { id: "beach-5", text: "\u0422\u0432\u043e\u0438 \u0432\u043e\u0441\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u044f \u0438 \u0441\u0438\u043b\u0430 \u0440\u0430\u0441\u0441\u044b\u043f\u0430\u043b\u0438\u0441\u044c \u043f\u043e \u043e\u0441\u043a\u043e\u043b\u043a\u0430\u043c \u0441\u043d\u043e\u0432. \u0421\u043e\u0431\u0435\u0440\u0438 \u0438\u0445 \u2014 \u0438 \u043c\u0438\u0440 \u0441\u043d\u043e\u0432\u0430 \u0432\u0437\u0434\u043e\u0445\u043d\u0451\u0442.", image: listerPortraitAlt, alt: "\u041b\u0438\u0441\u0442\u0435\u0440 \u043e\u0431\u044a\u044f\u0441\u043d\u044f\u0435\u0442", speaker: "lister" },
  { id: "beach-6", text: "\u0421\u043b\u0435\u0434\u0443\u0439 \u043f\u043e \u043b\u0443\u043d\u043d\u043e\u0439 \u0442\u0440\u043e\u043f\u0435, {{hero}}. \u042f \u043f\u043e\u0434\u043e\u0436\u0434\u0443 \u0437\u0434\u0435\u0441\u044c, \u043e\u0445\u0440\u0430\u043d\u044f\u044f \u0433\u0440\u0430\u043d\u0438\u0446\u0443 \u043c\u0435\u0436\u0434\u0443 \u043c\u0438\u0440\u0430\u043c\u0438.", image: beachLister, alt: "\u041b\u0438\u0441\u0442\u0435\u0440 \u043d\u0430 \u0431\u0435\u0440\u0435\u0433\u0443", speaker: "lister" },
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
        "\u041b\u0438\u0440\u0430",
        "\u0410\u044d\u0440\u043e\u043d",
        "\u0421\u0435\u043d\u0442\u0440\u0430",
        "\u041a\u0430\u044d\u043b\u044c",
        "\u041c\u0438\u0440\u0430",
        "\u041e\u0440\u0438\u043d",
        "\u0412\u0435\u043b\u0438\u0441",
        "\u0418\u0440\u0438\u0441",
        "\u0421\u0430\u0431\u043b\u044f",
        "\u041d\u0438\u043a\u0441",
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




