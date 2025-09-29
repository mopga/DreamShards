import React from "react";
import type { CombatCommand, CombatState } from "../../logic/types";
import type { Skill } from "@shared/types";
import { skills as skillsMap } from "@/state/content";
import { itemCatalog } from "@/state/items";
import { useCombatCopy } from "../combatI18n";
import { StarIcon, BagIcon, SwordIcon, ShieldIcon, HourglassIcon, BackIcon } from "../../icons/ActionIcons";
import { elementIconMap } from "../../icons/elementIcons";

interface CommandPanelProps {
  state: CombatState;
  inventory: Array<{ id: string; qty: number }>;
  mode: "root" | "skills" | "items";
  onCommand(command: CombatCommand): void;
  onSkill(skill: Skill): void;
  onItem(itemId: string): void;
  onBack(): void;
  disabled?: boolean;
  hoveredSkill: string | null;
  setHoveredSkill(id: string | null): void;
}

export function CommandPanel({
  state,
  inventory,
  mode,
  onCommand,
  onSkill,
  onItem,
  onBack,
  disabled,
  hoveredSkill,
  setHoveredSkill,
}: CommandPanelProps) {
  const copy = useCombatCopy();
  const active = state.activeActorId ? state.entities[state.activeActorId] : undefined;

  if (!active || active.side !== "ally") {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 text-sm text-slate-300">
        {copy.tooltips.waiting}
      </div>
    );
  }

  if (mode === "skills") {
    return (
      <SkillsPanel
        actor={active}
        onBack={onBack}
        onSkill={onSkill}
        hoveredSkill={hoveredSkill}
        setHoveredSkill={setHoveredSkill}
      />
    );
  }

  if (mode === "items") {
    return <ItemsPanel inventory={inventory} onBack={onBack} onItem={onItem} />;
  }

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
      <div className="grid gap-2">
        <CommandButton
          hotkey="1"
          label={copy.commands.skills}
          icon={<StarIcon className="h-5 w-5" title={copy.commands.skills} />}
          onClick={() => onCommand("skill")}
          disabled={disabled || active.actor.skills.length === 0}
        />
        <CommandButton
          hotkey="2"
          label={copy.commands.items}
          icon={<BagIcon className="h-5 w-5" title={copy.commands.items} />}
          onClick={() => onCommand("item")}
          disabled={disabled || !inventory.some((slot) => slot.qty > 0)}
        />
        <CommandButton
          hotkey="3"
          label={copy.commands.attack}
          icon={<SwordIcon className="h-5 w-5" title={copy.commands.attack} />}
          onClick={() => onCommand("attack")}
          disabled={disabled}
        />
        <CommandButton
          hotkey="4"
          label={copy.commands.guard}
          icon={<ShieldIcon className="h-5 w-5" title={copy.commands.guard} />}
          onClick={() => onCommand("guard")}
          disabled={disabled}
        />
        <CommandButton
          hotkey="5"
          label={copy.commands.end}
          icon={<HourglassIcon className="h-5 w-5" title={copy.commands.end} />}
          onClick={() => onCommand("end")}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

interface CommandButtonProps {
  hotkey: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

function CommandButton({ hotkey, label, icon, onClick, disabled }: CommandButtonProps) {
  return (
    <button
      type="button"
      className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/70 px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide text-slate-100 transition hover:border-indigo-400/70 hover:bg-indigo-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
      onClick={onClick}
      disabled={disabled}
      data-hotkey={hotkey}
    >
      <span className="flex items-center gap-3">{icon}{label}</span>
      <kbd className="rounded bg-slate-800/80 px-2 py-1 text-xs font-semibold text-slate-400">{hotkey}</kbd>
    </button>
  );
}

interface SkillsPanelProps {
  actor: CombatState["entities"][string];
  onBack(): void;
  onSkill(skill: Skill): void;
  hoveredSkill: string | null;
  setHoveredSkill(id: string | null): void;
}

function SkillsPanel({ actor, onBack, onSkill, hoveredSkill, setHoveredSkill }: SkillsPanelProps) {
  const copy = useCombatCopy();
  const skills = actor.actor.skills.map((id) => skillsMap[id]).filter((skill): skill is Skill => Boolean(skill));

  return (
    <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/40 p-4 text-sm text-indigo-100">
      <header className="mb-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-indigo-200">{copy.commands.skills}</span>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs uppercase tracking-wide text-indigo-300 hover:text-indigo-100"
        >
          <BackIcon className="h-4 w-4" title={copy.commands.back} />
          {copy.commands.back}
        </button>
      </header>
      <ul className="flex flex-col gap-2">
        {skills.map((skill) => {
          const afford = actor.currentSP >= skill.costSP;
          const localized = copy.skills[skill.id] ?? { name: skill.name, description: skill.description };
          const ElementIcon = elementIconMap[skill.element];
          const elementLabel = copy.elements[skill.element] ?? skill.element;
          return (
            <li key={skill.id}>
              <button
                type="button"
                onClick={() => afford && onSkill(skill)}
                onMouseEnter={() => setHoveredSkill(skill.id)}
                onMouseLeave={() => setHoveredSkill(null)}
                className={`flex w-full flex-col gap-1 rounded-xl border px-3 py-3 text-left transition ${
                  afford
                    ? "border-indigo-400/50 bg-indigo-500/10 hover:border-indigo-300/70 hover:bg-indigo-500/20"
                    : "border-indigo-300/30 bg-indigo-500/5 opacity-60"
                } ${hoveredSkill === skill.id ? "ring-1 ring-indigo-300" : ""}`}
                disabled={!afford}
              >
                <span className="flex items-center justify-between text-sm font-semibold text-indigo-100">
                  <span className="flex items-center gap-2">
                    <ElementIcon className="h-4 w-4" title={elementLabel} />
                    {localized.name}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-indigo-200">{skill.costSP} SP</span>
                </span>
                <p className="text-xs text-indigo-200/80">{localized.description}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface ItemsPanelProps {
  inventory: Array<{ id: string; qty: number }>;
  onBack(): void;
  onItem(id: string): void;
}

function ItemsPanel({ inventory, onBack, onItem }: ItemsPanelProps) {
  const copy = useCombatCopy();
  const usable = inventory.filter((slot) => slot.qty > 0);

  if (!usable.length) {
    return (
      <div className="rounded-2xl border border-amber-500/40 bg-amber-950/40 p-4 text-sm text-amber-100">
        <header className="mb-3 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-amber-200">{copy.commands.items}</span>
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-xs uppercase tracking-wide text-amber-200">
            <BackIcon className="h-4 w-4" title={copy.commands.back} />
            {copy.commands.back}
          </button>
        </header>
        <p className="text-xs text-amber-200/80">{copy.tooltips.noItems}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-500/40 bg-amber-950/40 p-4 text-sm text-amber-100">
      <header className="mb-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-amber-200">{copy.commands.items}</span>
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-xs uppercase tracking-wide text-amber-200">
          <BackIcon className="h-4 w-4" title={copy.commands.back} />
          {copy.commands.back}
        </button>
      </header>
      <ul className="flex flex-col gap-2">
        {usable.map((slot) => {
          const item = itemCatalog[slot.id];
          return (
            <li key={slot.id}>
              <button
                type="button"
                onClick={() => onItem(slot.id)}
                className="flex w-full items-center justify-between rounded-xl border border-amber-400/60 bg-amber-500/10 px-4 py-3 text-left hover:border-amber-300/80 hover:bg-amber-500/20"
              >
                <div>
                  <p className="font-semibold text-amber-100">{item?.name ?? slot.id}</p>
                  <p className="text-xs text-amber-200/80">{item?.description ?? ""}</p>
                </div>
                <span className="rounded bg-amber-400/20 px-2 py-1 text-xs font-semibold">×{slot.qty}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}



