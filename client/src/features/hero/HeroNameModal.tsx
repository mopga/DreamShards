import React, { useMemo, useState } from "react";
import { useGame } from "@/state/GameContext";
import { useLocale, getRandomNames } from "@/state/LocaleContext";
import heroPortrait from "@/assets/characters/hero_portrait.png";

const NAME_REGEX = /^[A-Za-zА-Яа-яЁё\s'\-]{2,16}$/;

export function HeroNameModal() {
  const { confirmHeroName } = useGame();
  const { t, locale } = useLocale();
  const candidates = useMemo(() => getRandomNames(locale), [locale]);

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validate = (value: string) => {
    if (value.length < 2 || value.length > 16) {
      setError(t("nameErrorLength"));
      return false;
    }
    if (!NAME_REGEX.test(value)) {
      setError(t("nameErrorCharset"));
      return false;
    }
    setError(null);
    return true;
  };

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (validate(trimmed)) {
      confirmHeroName(trimmed);
    }
  };

  const handleRandom = () => {
    const randomName = candidates[Math.floor(Math.random() * candidates.length)] ?? "";
    setName(randomName);
    validate(randomName);
  };

  return (
    <div className="relative z-10 flex w-full items-center justify-center">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur" />
      <div className="relative max-w-2xl rounded-3xl border border-indigo-400/30 bg-slate-900/90 p-8 text-slate-100 shadow-[0_0_40px_rgba(90,126,255,0.25)]">
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-indigo-600/30 via-transparent to-purple-500/20" />
        <div className="grid gap-6 md:grid-cols-[240px_1fr] md:items-center">
          <div className="overflow-hidden rounded-2xl border border-indigo-500/40 bg-indigo-500/10">
            <img src={heroPortrait} alt={t("speakerHero")}
              className="h-full w-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-indigo-100">{t("nameModalTitle")}</h2>
            <p className="mt-2 text-sm text-slate-300">{t("nameModalDescription")}</p>
            <div className="mt-6">
              <input
                value={name}
                onChange={(event) => {
                  const value = event.target.value;
                  setName(value);
                  if (error) {
                    validate(value);
                  }
                }}
                placeholder={t("namePlaceholder")}
                className="w-full rounded-full border border-indigo-400/40 bg-slate-950/60 px-5 py-3 text-center text-lg tracking-wide text-indigo-100 outline-none transition focus:border-indigo-200/80 focus:bg-slate-900"
              />
              {error ? (
                <p className="mt-2 text-sm text-rose-300">{error}</p>
              ) : (
                <p className="mt-2 text-xs uppercase tracking-widest text-indigo-200/70">{t("namingHint")}</p>
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <button
                className="rounded-full border border-indigo-400/50 bg-indigo-500/30 px-5 py-2 text-sm uppercase tracking-widest text-indigo-100 transition hover:border-indigo-200/80 hover:bg-indigo-500/45"
                onClick={handleConfirm}
              >
                {t("nameConfirm")}
              </button>
              <button
                className="rounded-full border border-slate-400/40 bg-slate-800/50 px-5 py-2 text-sm uppercase tracking-widest text-slate-200 transition hover:border-slate-200/60 hover:bg-slate-700/50"
                onClick={handleRandom}
              >
                {t("nameRandom")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
