import React from "react";
import { useCombatCopy } from "../combatI18n";
import type { CombatState } from "../../logic/types";
import type { TurnQueueItem } from "../../hooks/useTurnQueue";
import { ExtraTurnBadge } from "./ExtraTurnBadge";

interface TurnQueuePanelProps {
  items: TurnQueueItem[];
  entities: CombatState["entities"];
}

export function TurnQueuePanel({ items, entities }: TurnQueuePanelProps) {
  const copy = useCombatCopy();
  return (
    <aside className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-inner">
      <header className="mb-3 flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
        <span>{copy.queue}</span>
        <span>{items.length}</span>
      </header>
      <ol className="flex flex-col gap-2">
        {items.map((entry) => {
          const actor = entry.actor;
          if (!actor) return null;
          const hpPct = Math.max(0, Math.round((actor.currentHP / actor.actor.stats.maxHP) * 100));
          return (
            <li
              key={entry.id}
              className={
                "relative flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition " +
                (entry.isActive
                  ? "border-indigo-400/80 bg-indigo-500/10 shadow-md shadow-indigo-900/40"
                  : entry.isNext
                  ? "border-indigo-400/40 bg-slate-900/70"
                  : "border-slate-800/80 bg-slate-900/40")
              }
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold uppercase ${
                  actor.side === "ally" ? "border-emerald-400/70 text-emerald-200" : "border-rose-400/70 text-rose-200"
                }`}
              >
                {initials(actor.actor.name)}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium text-slate-100">{actor.actor.name}</span>
                  <span className="text-[11px] uppercase tracking-wide text-slate-500">{hpPct}%</span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-slate-800/80">
                  <div className="h-full rounded-full bg-rose-400" style={{ width: `${hpPct}%` }} />
                </div>
              </div>
              {!entry.isActive && entry.hasExtraTurnBadge ? (
                <ExtraTurnBadge />
              ) : null}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2);
}
