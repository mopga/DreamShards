import React, { useMemo } from "react";
import { StorySequence } from "./StorySequence";
import { useGame } from "@/state/GameContext";
import { getBirthSlides, useLocale } from "@/state/LocaleContext";
import heroPortrait from "@/assets/characters/hero_portrait.png";

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
      renderOverlay={() => (
        <div className="pointer-events-none absolute inset-0">
          <img src={heroPortrait} alt="Hero portrait" className="h-full w-full object-cover" />
        </div>
      )}
    />
  );
}
