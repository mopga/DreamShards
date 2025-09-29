import React, { useEffect, useMemo, useState } from "react";
import { StorySlide, useLocale, TranslationKey } from "@/state/LocaleContext";

interface StorySequenceProps {
  slides: StorySlide[];
  onComplete(): void;
  onSkip(): void;
  finalLabelKey?: TranslationKey;
}

const TYPE_INTERVAL = 40;

export function StorySequence({ slides, onComplete, onSkip, finalLabelKey }: StorySequenceProps) {
  const { t } = useLocale();
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const currentSlide = useMemo(() => slides[index], [slides, index]);
  const isLast = index === slides.length - 1;
  const nextLabel = isLast ? t(finalLabelKey ?? "introContinue") : t("introNext");

  useEffect(() => {
    setDisplayed("");
    setIsTyping(true);
    const full = (currentSlide?.text ?? "").trim();
    if (!full) {
      setIsTyping(false);
      return;
    }

    let pointer = 0;
    let frame: number;

    function tick() {
      pointer += 1;
      setDisplayed(full.slice(0, pointer));
      if (pointer < full.length) {
        frame = window.setTimeout(tick, TYPE_INTERVAL);
      } else {
        setIsTyping(false);
      }
    }

    frame = window.setTimeout(tick, TYPE_INTERVAL);

    return () => {
      window.clearTimeout(frame);
    };
  }, [currentSlide]);

  const handleNext = () => {
    if (isTyping) {
      setDisplayed(currentSlide?.text ?? "");
      setIsTyping(false);
      return;
    }
    if (isLast) {
      onComplete();
    } else {
      setIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="relative w-full overflow-hidden rounded-3xl border border-indigo-500/30 bg-slate-900/50 shadow-[0_0_40px_rgba(72,94,255,0.25)]">
        {currentSlide && (
          <img
            key={currentSlide.id}
            src={currentSlide.image}
            alt={currentSlide.alt}
            className="h-64 w-full object-cover object-center md:h-80 image-fade"
          />
        )}
      </div>

      <div className="w-full max-w-3xl rounded-3xl border border-indigo-300/30 bg-slate-950/70 px-6 py-6 shadow-[0_0_50px_rgba(60,90,200,0.25)] backdrop-blur">
        <p className="min-h-[140px] text-lg leading-8 text-indigo-100">
          {displayed}
          {isTyping && <span className="animate-pulse text-indigo-300">▋</span>}
        </p>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {slides.map((slide, idx) => (
              <span
                key={slide.id}
                className={`h-2 w-8 rounded-full transition ${idx === index ? "bg-indigo-400" : "bg-indigo-900"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm uppercase tracking-widest text-indigo-100">
            <button
              className="rounded-full border border-indigo-400/40 bg-indigo-500/20 px-5 py-2 transition hover:border-indigo-200/80 hover:bg-indigo-500/35"
              onClick={handleNext}
            >
              {nextLabel}
            </button>
            <button
              className="rounded-full border border-slate-500/40 bg-slate-700/30 px-5 py-2 text-slate-200 transition hover:border-slate-200/50 hover:bg-slate-700/50"
              onClick={onSkip}
            >
              {t("introSkip")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
