import React, { useMemo } from "react";
import { StorySequence } from "./StorySequence";
import { useGame } from "@/state/GameContext";
import { getBirthSlides, useLocale } from "@/state/LocaleContext";

export function BirthIntro() {
  const { completeBirthIntro } = useGame();
  const { locale } = useLocale();
  const slides = useMemo(() => getBirthSlides(locale), [locale]);

  return (
    <StorySequence
      slides={slides}
      onComplete={completeBirthIntro}
      onSkip={completeBirthIntro}
      finalLabelKey="introBegin"
    />
  );
}
