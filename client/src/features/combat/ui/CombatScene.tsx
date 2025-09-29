import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useCombat } from "../hooks/useCombat";
import { useTurnQueue } from "../hooks/useTurnQueue";
import { useTargeting } from "../hooks/useTargeting";
import { Battlefield } from "./components/Battlefield";
import { TurnQueuePanel } from "./components/TurnQueuePanel";
import { CommandPanel } from "./components/CommandPanel";
import { BattleLog } from "./components/BattleLog";
import { SkillTooltip } from "./components/SkillTooltip";
import { useCombatCopy } from "./combatI18n";
import { skills as skillsMap } from "@/state/content";
import type { CombatState } from "../logic/types";
import type { Skill } from "@shared/types";

export function CombatScene() {
  const combat = useCombat();
  const copy = useCombatCopy();
  const { state, inventory } = combat;
  const turnQueue = useTurnQueue(state);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const targeting = useTargeting({
    combat: state,
    updateSelection: combat.updateSelection,
    onConfirm: handleTargetsConfirmed,
    onCancel: combat.clearSelection,
    registerCancel: combat.registerTargetCancel,
  });

  const panelMode: "root" | "skills" | "items" = useMemo(() => {
    if (!state) return "root";
    if (state.phase === "selectSkill") {
      if (state.selection?.command === "skill") return "skills";
      if (state.selection?.command === "item") return "items";
    }
    return "root";
  }, [state]);

  const active = state?.activeActorId ? state.entities[state.activeActorId] : undefined;
  const playerTurn = active?.side === "ally" && !state?.ended;

  useEffect(() => {
    if (!state) return;
    if (targeting.mode === "single" && targeting.selectedIds.length === 1) {
      targeting.confirm();
    } else if (
      targeting.mode === "multi" &&
      targeting.selectedIds.length === targeting.validTargetIds.length &&
      targeting.validTargetIds.length > 0
    ) {
      targeting.confirm();
    }
  }, [state, targeting]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!playerTurn || !state) return;
      if (event.repeat) return;
      if (state.phase === "selectCommand") {
        switch (event.code) {
          case "Digit1":
            event.preventDefault();
            handleCommand("skill");
            break;
          case "Digit2":
            event.preventDefault();
            handleCommand("item");
            break;
          case "Digit3":
            event.preventDefault();
            handleCommand("attack");
            break;
          case "Digit4":
            event.preventDefault();
            handleCommand("guard");
            break;
          case "Digit5":
            event.preventDefault();
            handleCommand("end");
            break;
          default:
            break;
        }
      }
      if (event.code === "Escape") {
        event.preventDefault();
        targeting.cancel();
        combat.clearSelection();
        combat.setPhase("selectCommand");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [playerTurn, state, targeting, combat]);

  if (!combat.ready || !state) {
    return <p className="p-8 text-center text-slate-200">{copy.loading}</p>;
  }

  return (
    <div className="grid h-full w-full grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-4">
        <TurnQueuePanel items={turnQueue} entities={state.entities} />
        <CommandPanel
          state={state}
          inventory={inventory}
          mode={panelMode}
          onCommand={handleCommand}
          onSkill={handleSkillSelect}
          onItem={handleItemSelect}
          onBack={() => combat.clearSelection()}
          disabled={!playerTurn || state.phase === "resolving"}
          hoveredSkill={hoveredSkill}
          setHoveredSkill={setHoveredSkill}
        />
      </div>

      <Battlefield
        state={state}
        targeting={targeting}
        onTargetClick={handleTargetClick}
        onTargetHover={handleTargetHover}
      />

      <div className="flex flex-col gap-4">
        <div className="min-h-[120px]">
          <SkillTooltip skill={hoveredSkill ? skillsMap[hoveredSkill] : undefined} />
        </div>
        <BattleLog events={state.eventsLog} entities={state.entities} />
      </div>
    </div>
  );

  function handleCommand(command: "attack" | "skill" | "item" | "guard" | "end") {
    if (!state || !playerTurn) return;
    switch (command) {
      case "attack":
        combat.beginCommand("attack");
        break;
      case "skill":
        combat.beginCommand("skill");
        break;
      case "item":
        combat.beginCommand("item");
        break;
      case "guard":
        combat.executePlayerAction({ type: "guard" });
        combat.clearSelection();
        break;
      case "end":
        combat.executePlayerAction({ type: "end" });
        combat.clearSelection();
        break;
      default:
        break;
    }
  }

  function handleSkillSelect(skill: Skill) {
    if (!state || !playerTurn) return;
    combat.updateSelection(() => ({ command: "skill", skillId: skill.id, targetIds: [] }));
    combat.setPhase(skill.targets === "all" ? "selectCommand" : "selectTarget");
    if (skill.targets === "all") {
      const targets = collectTargetsForSkill(state, skill);
      if (targets.length) {
        combat.executePlayerAction({ type: "skill", skillId: skill.id, targetIds: targets });
        combat.clearSelection();
      }
    }
  }

  function handleItemSelect(itemId: string) {
    if (!state || !playerTurn) return;
    combat.updateSelection((prev) => ({ command: "item", itemId, targetIds: prev?.targetIds ?? [] }));
    combat.setPhase("selectTarget");
  }

  function handleTargetClick(id: string) {
    targeting.toggleTarget(id);
  }

  function handleTargetHover(id: string | null) {
    targeting.setHover(id);
  }

  function handleTargetsConfirmed(targetIds: string[]) {
    if (!state || !playerTurn) return;
    const selection = state.selection;
    if (!selection?.command) return;
    switch (selection.command) {
      case "attack": {
        const targetId = targetIds[0];
        if (targetId) {
          combat.executePlayerAction({ type: "attack", targetId });
          combat.clearSelection();
        }
        break;
      }
      case "skill": {
        if (!selection.skillId) return;
        combat.executePlayerAction({ type: "skill", skillId: selection.skillId, targetIds });
        combat.clearSelection();
        break;
      }
      case "item": {
        if (!selection.itemId) return;
        const targetId = targetIds[0];
        if (targetId) {
          combat.executePlayerAction({ type: "item", itemId: selection.itemId, targetId });
          combat.clearSelection();
        }
        break;
      }
      default:
        break;
    }
  }
}

function collectTargetsForSkill(state: CombatState, skill: Skill) {
  const active = state.activeActorId ? state.entities[state.activeActorId] : undefined;
  if (!active) return [] as string[];
  const targetSide = active.side === "ally" ? "enemy" : "ally";
  return Object.values(state.entities)
    .filter((entity) => entity.side === targetSide && entity.currentHP > 0)
    .map((entity) => entity.id);
}

