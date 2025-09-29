import React, { useEffect, useMemo, useState } from "react";
import { useGame } from "@/state/GameContext";
import { useLocale, getBeachBeats, BeachBeat } from "@/state/LocaleContext";

const TYPE_INTERVAL = 40;

function applyHero(text: string, hero: string) {
  if (!text) return text;
  return text.replace(/\{\{hero\}\}/gi, hero);
}

export function BeachArrival() {
  const { state, completeBeachIntro } = useGame();
  const { locale, t } = useLocale();
  const beats = useMemo<BeachBeat[]>(() => getBeachBeats(locale), [locale]);
  const heroName = state.heroName && state.heroName.trim().length > 0 ? state.heroName : t("speakerHero");

  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const current = beats[index];
  const isLast = index === beats.length - 1;
  const nextLabel = isLast ? t("introContinue") : t("introNext");

  useEffect(() => {
    const fullText = applyHero(current?.text ?? "", heroName).trim();
    setDisplayed("");
    setIsTyping(true);

    if (!fullText) {
      setIsTyping(false);
      return;
    }

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
    return () => window.clearTimeout(frame);
  }, [current, heroName]);

  const handleNext = () => {
    if (isTyping) {
      setDisplayed(applyHero(current?.text ?? "", heroName));
      setIsTyping(false);
      return;
    }
    if (isLast) {
      completeBeachIntro();
    } else {
      setIndex((prev) => prev + 1);
    }
  };

  const speakerLabel = useMemo(() => {
    if (!current) return "";
    switch (current.speaker) {
      case "hero":
        return t("speakerHero");
      case "lister":
        return t("speakerLister");
      default:
        return "";
    }
  }, [current, t]);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="relative w-full overflow-hidden rounded-3xl border border-indigo-500/30 bg-slate-900/50 shadow-[0_0_40px_rgba(72,94,255,0.25)]">
        {current && (
          <img
            key={current.id}
            src={current.image}
            alt={current.alt}
            className="h-64 w-full object-cover object-center md:h-80 image-fade"
          />
        )}
      </div>

      <div className="w-full max-w-3xl rounded-3xl border border-indigo-300/30 bg-slate-950/70 px-6 py-6 shadow-[0_0_50px_rgba(60,90,200,0.25)] backdrop-blur">
        {speakerLabel && (
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-300">{speakerLabel}</p>
        )}
        <p className="mt-2 min-h-[130px] text-lg leading-8 text-indigo-100">
          {displayed}
          {isTyping && <span className="animate-pulse text-indigo-300">▋</span>}
        </p>
        <div className="mt-6 flex items-center justify-end gap-3 text-sm uppercase tracking-widest text-indigo-100">
          <button
            className="rounded-full border border-indigo-400/40 bg-indigo-500/20 px-5 py-2 transition hover:border-indigo-200/80 hover:bg-indigo-500/35"
            onClick={handleNext}
          >
            {nextLabel}
          </button>
          <button
            className="rounded-full border border-slate-500/40 bg-slate-700/30 px-5 py-2 text-slate-200 transition hover:border-slate-200/50 hover:bg-slate-700/50"
            onClick={completeBeachIntro}
          >
            {t("introSkip")}
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {beats.map((beat, idx) => (
            <span
              key={beat.id}
              className={`h-2 w-7 rounded-full transition ${idx === index ? "bg-indigo-400" : "bg-indigo-900"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
