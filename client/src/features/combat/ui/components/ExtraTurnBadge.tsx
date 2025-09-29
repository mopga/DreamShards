import React from "react";
import { useCombatCopy } from "../combatI18n";

export function ExtraTurnBadge() {
  const copy = useCombatCopy();
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-1 text-[10px] uppercase tracking-wide text-indigo-200 animate-extra-turn">
      <span className="h-2 w-2 rounded-full bg-indigo-300" />
      {copy.bonusTurn}
    </span>
  );
}
