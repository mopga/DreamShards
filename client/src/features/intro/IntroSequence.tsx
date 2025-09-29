import React, { useEffect, useMemo, useState } from "react";
import { useGame } from "@/state/GameContext";
import { useLocale, getIntroSlides } from "@/state/LocaleContext";

const TYPE_INTERVAL = 45;

export function IntroSequence() {
  const { completeIntro } = useGame();
  const { t, locale } = useLocale();
  const slides = useMemo(() => getIntroSlides(locale), [locale]);

  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayed("");
    setIsTyping(true);
    const fullText = slides[index] ?? "";
    let pointer = 0;
    let frame: number;

    function tick() {
      pointer += 1;
      setDisplayed(fullText.slice(0, pointer));
      if (pointer < fullText.length) {
        frame = window.setTimeout(tick, TYPE_INTERVAL);
      } else {
        setIsTyping(false);
      }
    }

    frame = window.setTimeout(tick, TYPE_INTERVAL);

    return () => {
      window.clearTimeout(frame);
    };
  }, [index, slides]);

  const handleNext = () => {
    const full = slides[index] ?? "";
    if (isTyping) {
      setDisplayed(full);
      setIsTyping(false);
      return;
    }
    if (index < slides.length - 1) {
      setIndex((prev) => prev + 1);
    } else {
      completeIntro();
    }
  };

  const handleSkip = () => {
    completeIntro();
  };

  return (
    <div className="relative flex min-h-[60vh] w-full items-center justify-center">
      <div className="relative max-w-3xl rounded-3xl border border-indigo-500/30 bg-slate-950/80 p-10 text-center shadow-[0_0_50px_rgba(72,94,255,0.25)] backdrop-blur">
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/20" />
        <p className="min-h-[140px] text-xl leading-8 text-indigo-100 transition-opacity duration-300">
          {displayed}
          {isTyping && <span className="animate-pulse text-indigo-300">?</span>}
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 text-sm uppercase tracking-widest text-indigo-100">
          <button
            className="rounded-full border border-indigo-400/40 bg-indigo-500/20 px-6 py-2 transition hover:border-indigo-200/70 hover:bg-indigo-500/35"
            onClick={handleNext}
          >
            {index < slides.length - 1 ? t("introNext") : t("introBegin")}
          </button>
          <button
            className="rounded-full border border-slate-500/40 bg-slate-700/30 px-6 py-2 text-slate-200 transition hover:border-slate-200/50 hover:bg-slate-700/50"
            onClick={handleSkip}
          >
            {t("introSkip")}
          </button>
        </div>
      </div>
    </div>
  );
}

