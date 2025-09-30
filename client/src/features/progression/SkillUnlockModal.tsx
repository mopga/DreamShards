import React from "react";
import { useGame } from "@/state/GameContext";
import { useHeroName } from "@/state/hooks";
import { useCombatCopy } from "@/features/combat/ui/combatI18n";
import { useLocale } from "@/state/LocaleContext";
import { formatTemplate } from "@/features/combat/ui/formatters";

interface SkillUnlockModalProps {
  notification: {
    actorId: string;
    skillId: string;
  };
  onConfirm(): void;
}

export function SkillUnlockModal({ notification, onConfirm }: SkillUnlockModalProps) {
  const { addLogEntry } = useGame();
  const { t } = useLocale();
  const heroName = useHeroName();
  const combatCopy = useCombatCopy();

  const skillCopy = combatCopy.skills[notification.skillId] ?? {
    name: notification.skillId,
    description: "",
  };

  const fallbackActorName = notification.actorId === "hero" ? heroName : t("lister.name");
  const actorName =
    combatCopy.actorNames[notification.actorId] ?? fallbackActorName ?? t("hero.name");

  const handleConfirm = () => {
    const logMessage = formatTemplate(t("skillUnlockLog"), {
      actor: actorName,
      skill: skillCopy.name,
    });
    addLogEntry(logMessage);
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/75 backdrop-blur">
      <div className="max-w-lg rounded-3xl border border-indigo-400/40 bg-slate-900/90 p-8 text-slate-100 shadow-[0_0_40px_rgba(80,105,255,0.35)]">
        <h2 className="text-xl font-semibold text-indigo-100">{t("skillUnlockTitle")}</h2>
        <p className="mt-3 text-sm text-slate-300">
          {formatTemplate(t("skillUnlockDescription"), {
            actor: actorName,
            skill: skillCopy.name,
          })}
        </p>
        <div className="mt-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
          <h3 className="text-lg font-semibold text-indigo-100">{skillCopy.name}</h3>
          <p className="mt-2 text-sm text-indigo-200/80">{skillCopy.description}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleConfirm}
            className="rounded-full border border-indigo-400/50 bg-indigo-500/20 px-5 py-2 text-sm uppercase tracking-widest text-indigo-100 transition hover:border-indigo-200/70 hover:bg-indigo-500/35"
          >
            {t("skillUnlockButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
