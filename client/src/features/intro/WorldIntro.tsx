import React, { useMemo } from "react";
import { StorySequence } from "./StorySequence";
import { useGame } from "@/state/GameContext";
import { getWorldSlides, useLocale } from "@/state/LocaleContext";

export function WorldIntro() {
  const { completeWorldIntro } = useGame();
  const { locale } = useLocale();
  const slides = useMemo(() => getWorldSlides(locale), [locale]);

  return (
    <StorySequence
      slides={slides}
      onComplete={completeWorldIntro}
      onSkip={completeWorldIntro}
    />
  );
}
