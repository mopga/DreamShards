import { useCallback, useEffect, useMemo, useState } from "react";
import type { CombatState, CombatSelection } from "../logic/types";
import { isAlive } from "../logic/status";
import { skills as skillsMap } from "@/state/content";

interface UseTargetingOptions {
  combat: CombatState | null;
  updateSelection: (updater: (prev: CombatSelection | undefined) => CombatSelection | undefined) => void;
  onConfirm(targetIds: string[]): void;
  onCancel(): void;
  registerCancel(): void;
}

export interface TargetingState {
  selectedIds: string[];
  hoverId: string | null;
  validTargetIds: string[];
  mode: "none" | "single" | "multi" | "auto";
  side: "ally" | "enemy" | "self" | null;
  toggleTarget(id: string): void;
  setHover(id: string | null): void;
  confirm(): void;
  cancel(): void;
  isValid(id: string): boolean;
}

interface TargetingMeta {
  mode: TargetingState["mode"];
  side: TargetingState["side"];
  validTargetIds: string[];
}

export function useTargeting({ combat, updateSelection, onConfirm, onCancel, registerCancel }: UseTargetingOptions): TargetingState {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const targeting = useMemo<TargetingMeta>(() => computeTargetingMeta(combat), [combat]);

  useEffect(() => {
    setSelectedIds([]);
    setHoverId(null);
  }, [targeting.mode, targeting.side, combat?.selection?.skillId, combat?.selection?.itemId]);

  const toggleTarget = useCallback(
    (id: string) => {
      if (!targeting.validTargetIds.includes(id)) return;
      setSelectedIds((prev) => {
        let next: string[];
        if (targeting.mode === "single") {
          next = prev.includes(id) ? [] : [id];
        } else if (targeting.mode === "multi") {
          next = prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id];
        } else {
          next = prev;
        }
        updateSelection((selection) => {
          if (!selection) return selection;
          return { ...selection, targetIds: next };
        });
        return next;
      });
    },
    [targeting.validTargetIds, targeting.mode, updateSelection],
  );

  const confirm = useCallback(() => {
    if (!combat) return;
    if (targeting.mode === "none") {
      onConfirm([]);
      return;
    }
    if (targeting.mode === "auto") {
      updateSelection((selection) => {
        if (!selection) return selection;
        return { ...selection, targetIds: targeting.validTargetIds };
      });
      onConfirm(targeting.validTargetIds);
      return;
    }
    const required = targeting.mode === "single" ? 1 : targeting.validTargetIds.length;
    if (selectedIds.length >= required) {
      const chosen = selectedIds.slice(0, required);
      updateSelection((selection) => {
        if (!selection) return selection;
        return { ...selection, targetIds: chosen };
      });
      onConfirm(chosen);
    }
  }, [combat, targeting, selectedIds, onConfirm, updateSelection]);

  const cancel = useCallback(() => {
    setSelectedIds([]);
    setHoverId(null);
    updateSelection((selection) => {
      if (!selection) return selection;
      const { command, skillId, itemId } = selection;
      if (!command) return undefined;
      return { command, skillId, itemId };
    });
    registerCancel();
    onCancel();
  }, [onCancel, registerCancel, updateSelection]);

  const setHover = useCallback((id: string | null) => {
    setHoverId(id);
  }, []);

  return {
    selectedIds,
    hoverId,
    validTargetIds: targeting.validTargetIds,
    mode: targeting.mode,
    side: targeting.side,
    toggleTarget,
    setHover,
    confirm,
    cancel,
    isValid: (id: string) => targeting.validTargetIds.includes(id),
  };
}

function computeTargetingMeta(combat: CombatState | null): TargetingMeta {
  if (!combat) {
    return { mode: "none", side: null, validTargetIds: [] as string[] };
  }

  const selection = combat.selection;
  if (!selection || !selection.command) {
    return { mode: "none", side: null, validTargetIds: [] as string[] };
  }

  const activeId = combat.activeActorId;
  const active = activeId ? combat.entities[activeId] : undefined;
  if (!active || !isAlive(active)) {
    return { mode: "none", side: null, validTargetIds: [] as string[] };
  }

  switch (selection.command) {
    case "attack": {
      const side = active.side === "ally" ? "enemy" : "ally";
      return {
        mode: "single",
        side,
        validTargetIds: getSideTargets(combat, side),
      };
    }
    case "skill": {
      if (!selection.skillId) {
        return { mode: "none", side: null, validTargetIds: [] as string[] };
      }
      const skill = skillsMap[selection.skillId];
      if (!skill) {
        return { mode: "none", side: null, validTargetIds: [] as string[] };
      }
      const side = active.side === "ally" ? "enemy" : "ally";
      const targets = getSideTargets(combat, side);
      return {
        mode: skill.targets === "all" ? "auto" : "single",
        side,
        validTargetIds: targets,
      };
    }
    case "item":
      return {
        mode: "single",
        side: "ally",
        validTargetIds: getSideTargets(combat, "ally"),
      };
    default:
      return { mode: "none", side: null, validTargetIds: [] as string[] };
  }
}

function getSideTargets(combat: CombatState, side: "ally" | "enemy") {
  return Object.values(combat.entities)
    .filter((entity) => entity.side === side && isAlive(entity))
    .map((entity) => entity.id);
}

