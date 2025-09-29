import React from "react";
import type { CombatActorState } from "../../logic/types";
import { StatusTag } from "./StatusTag";

interface ActorCardProps {
  actor: CombatActorState;
  isActive?: boolean;
  isNext?: boolean;
  isTargetable?: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  disabledReason?: string;
  onSelect?: () => void;
  onHover?: (hovering: boolean) => void;
  side: "ally" | "enemy";
  className?: string;
  displayName?: string;
}

export function ActorCard({
  actor,
  isActive,
  isNext,
  isTargetable = false,
  isSelected = false,
  isHovered = false,
  disabledReason,
  onSelect,
  onHover,
  side,
  className = "",
  displayName,
}: ActorCardProps) {
  const Component: any = onSelect ? "button" : "div";
  const hpPct = Math.max(0, Math.round((actor.currentHP / actor.actor.stats.maxHP) * 100));
  const spPct = Math.max(0, Math.round((actor.currentSP / actor.actor.stats.maxSP) * 100));
  const statusList = actor.statuses;
  const name = displayName ?? actor.actor.name;
  const interactivity = Boolean(onSelect);
  const title = disabledReason ?? name;

  return (
    <Component
      type={interactivity ? "button" : undefined}
      className={
        `group relative flex w-full flex-col gap-3 rounded-xl border bg-slate-900/70 p-4 shadow-sm transition-all ${className} ` +
        (isActive ? "border-indigo-400/90 shadow-indigo-500/30 focus-pop " : "border-slate-700/70 ") +
        (isTargetable ? "ring-1 ring-offset-2 ring-offset-slate-900 " : "") +
        (isSelected ? "bg-indigo-500/10 " : "") +
        (isHovered ? "ring-1 ring-indigo-300/60 " : "") +
        (!interactivity ? "cursor-default" : isTargetable ? "cursor-pointer hover:border-indigo-300/80" : "cursor-not-allowed opacity-60")
      }
      onClick={interactivity ? (isTargetable ? onSelect : undefined) : undefined}
      onMouseEnter={onHover ? () => onHover(true) : undefined}
      onMouseLeave={onHover ? () => onHover(false) : undefined}
      onFocus={onHover ? () => onHover(true) : undefined}
      onBlur={onHover ? () => onHover(false) : undefined}
      disabled={interactivity && !isTargetable}
      title={title}
      aria-pressed={interactivity ? isSelected : undefined}
      aria-disabled={interactivity && !isTargetable ? true : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full border text-lg font-semibold uppercase ${
              side === "ally" ? "border-emerald-400/70 text-emerald-200" : "border-rose-400/70 text-rose-200"
            } ${isActive ? "animate-bounce-soft" : ""}`}
          >
            {initials(name)}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-100">{name}</span>
            <span className="text-xs uppercase tracking-wide text-slate-400">
              {side === "ally" ? "Allies" : "Shadows"}
            </span>
          </div>
        </div>
        {isNext && !isActive ? (
          <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-xs uppercase tracking-wide text-indigo-200">
            Next
          </span>
        ) : null}
      </div>

      <div className="space-y-2">
        <Progress label="HP" percent={hpPct} tone="danger" />
        <Progress label="SP" percent={spPct} tone="focus" />
      </div>

      {statusList.length ? (
        <div className="flex flex-wrap gap-2">
          {statusList.map((status) => (
            <StatusTag key={`${actor.id}-${status}`} status={status} />
          ))}
        </div>
      ) : null}
    </Component>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2);
}

function Progress({ label, percent, tone }: { label: string; percent: number; tone: "danger" | "focus" }) {
  const barClass = tone === "danger" ? "bg-rose-400" : "bg-sky-400";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
        <div className={`h-full transition-all ${barClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

