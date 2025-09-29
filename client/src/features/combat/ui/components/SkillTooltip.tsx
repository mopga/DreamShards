import React from "react";
import type { Skill } from "@shared/types";

interface SkillTooltipProps {
  skill?: Skill;
}

export function SkillTooltip({ skill }: SkillTooltipProps) {
  if (!skill) return null;
  return (
    <div className="pointer-events-none rounded-2xl border border-indigo-500/50 bg-slate-950/90 p-4 text-sm text-slate-100 shadow-lg">
      <header className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-indigo-200">
        <span>{skill.name}</span>
        <span>{skill.costSP} SP</span>
      </header>
      <p className="text-xs text-slate-300">{skill.description}</p>
    </div>
  );
}
