import React from "react";
import type { CombatTelemetryCounters } from "../logic/types";
import { useCombatCopy } from "./combatI18n";

interface CombatTelemetryPanelProps {
  telemetry: CombatTelemetryCounters;
  rounds: number;
}

export function CombatTelemetryPanel({ telemetry, rounds }: CombatTelemetryPanelProps) {
  const copy = useCombatCopy();

  const rows: { key: keyof CombatTelemetryCounters; label: string; value: number }[] = [
    { key: "turnsTaken", label: copy.telemetry.turnsTaken, value: telemetry.turnsTaken },
    { key: "weaknessHits", label: copy.telemetry.weaknessHits, value: telemetry.weaknessHits },
    { key: "extraTurns", label: copy.telemetry.extraTurns, value: telemetry.extraTurns },
    { key: "guardsUsed", label: copy.telemetry.guardsUsed, value: telemetry.guardsUsed },
    { key: "targetCancels", label: copy.telemetry.targetCancels, value: telemetry.targetCancels },
    { key: "fpsSpikes", label: copy.telemetry.fpsSpikes, value: telemetry.fpsSpikes },
  ];

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-white/5 p-4 text-sm backdrop-blur-md">
      <div className="mb-3 text-xs uppercase tracking-widest text-indigo-300">
        {copy.telemetryTitle}
      </div>
      <div className="mb-1 text-3xl font-bold text-indigo-100">{rounds}</div>
      <div className="mb-3 text-xs uppercase tracking-wider text-slate-400">
        {copy.telemetry.rounds}
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map(({ key, label, value }) => (
          <div key={key} className="flex justify-between gap-4 text-xs text-slate-300">
            <span className="text-slate-400">{label}</span>
            <span className="font-mono text-indigo-200">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
