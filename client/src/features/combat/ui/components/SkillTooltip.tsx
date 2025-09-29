import React from "react";
import type { Skill } from "@shared/types";
import { useCombatCopy } from "../combatI18n";
import { elementIconMap } from "../../icons/elementIcons";

interface SkillTooltipProps {
  skill?: Skill;
}

export function SkillTooltip({ skill }: SkillTooltipProps) {
  const copy = useCombatCopy();
  if (!skill) return null;
  const localized = copy.skills[skill.id] ?? { name: skill.name, description: skill.description };
  const ElementIcon = elementIconMap[skill.element];
  const elementLabel = copy.elements[skill.element];

  return (
    <div className="pointer-events-none rounded-2xl border border-indigo-500/50 bg-slate-950/90 p-4 text-sm text-slate-100 shadow-lg">
      <header className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-indigo-200">
        <span className="flex items-center gap-2">
          <ElementIcon className="h-4 w-4" title={elementLabel} />
          {localized.name}
        </span>
        <span>{skill.costSP} SP</span>
      </header>
      <p className="text-xs text-slate-300">{localized.description}</p>
    </div>
  );
}
