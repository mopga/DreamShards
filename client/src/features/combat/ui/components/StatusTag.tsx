import React from "react";
import type { CombatStatus } from "../../logic/types";
import { useCombatCopy } from "../combatI18n";
import { statusIcon } from "../../icons/StatusIcons";

interface StatusTagProps {
  status: CombatStatus;
}

export function StatusTag({ status }: StatusTagProps) {
  const copy = useCombatCopy();
  const label = copy.statuses[status];
  const Icon = statusIcon(status);
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-800/90 px-3 py-1 text-xs text-slate-200">
      <Icon className="h-3.5 w-3.5" title={label} />
      <span>{label}</span>
    </span>
  );
}
