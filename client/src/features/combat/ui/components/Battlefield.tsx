import React from "react";
import type { CombatEvent, CombatState } from "../../logic/types";
import { useCombatCopy } from "../combatI18n";
import { formatTemplate } from "../formatters";
import { ActorCard } from "./ActorCard";
import type { TargetingState } from "../../hooks/useTargeting";
import { DamageFloat } from "./DamageFloat";
import { useHeroName } from "@/state/hooks";

interface BattlefieldProps {
  state: CombatState;
  targeting: TargetingState;
  onTargetClick(id: string): void;
  onTargetHover(id: string | null): void;
}

export function Battlefield({ state, targeting, onTargetClick, onTargetHover }: BattlefieldProps) {
  const copy = useCombatCopy();
  const heroName = useHeroName();
  const allies = Object.values(state.entities).filter((entity) => entity.side === "ally");
  const enemies = Object.values(state.entities).filter((entity) => entity.side === "enemy");

  const active = state.activeActorId ? state.entities[state.activeActorId] : undefined;
  const getName = (entity: CombatState["entities"][string]) => {
    if (entity.actor.id === "hero") {
      return heroName;
    }
    return copy.actorNames[entity.actor.id] ?? entity.actor.name;
  };
  const hitTargets = new Set(
    state.lastEvents.filter((event) => event.type === "Hit").map((event) => event.targetId),
  );
  const healTargets = new Map(
    state.lastEvents
      .filter((event): event is Extract<CombatEvent, { type: "Heal" }> => event.type === "Heal")
      .map((event) => [event.targetId, event.amount]),
  );
  const damageTargets = new Map(
    state.lastEvents
      .filter((event): event is Extract<CombatEvent, { type: "Hit" }> => event.type === "Hit")
      .map((event) => [event.targetId, event.amount]),
  );

  return (
    <section className="relative flex flex-col gap-4 rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6 shadow-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          {allies.map((actor) => (
            <div key={actor.id} className="relative">
              <ActorCard
                actor={actor}
                side="ally"
                displayName={getName(actor)}
                isActive={state.activeActorId === actor.id}
                isNext={state.queue[1] === actor.id}
                isTargetable={targeting.validTargetIds.includes(actor.id)}
                isSelected={targeting.selectedIds.includes(actor.id)}
                isHovered={targeting.hoverId === actor.id}
                onSelect={targeting.validTargetIds.includes(actor.id) ? () => onTargetClick(actor.id) : undefined}
                onHover={targeting.validTargetIds.includes(actor.id) ? (hover) => onTargetHover(hover ? actor.id : null) : undefined}
                disabledReason={
                  targeting.validTargetIds.includes(actor.id)
                    ? undefined
                    : targeting.mode !== "none"
                    ? copy.tooltips.targetInvalid
                    : undefined
                }
                className={hitTargets.has(actor.id) ? "hit-shake" : ""}
              />
              {damageTargets.has(actor.id) ? (
                <DamageFloat amount={damageTargets.get(actor.id)!} variant="hit" className="absolute -top-3 right-4" />
              ) : null}
              {healTargets.has(actor.id) ? (
                <DamageFloat amount={healTargets.get(actor.id)!} variant="heal" className="absolute -top-3 right-4" />
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {enemies.map((actor) => (
            <div key={actor.id} className="relative">
              <ActorCard
                actor={actor}
                side="enemy"
                displayName={getName(actor)}
                isActive={state.activeActorId === actor.id}
                isNext={state.queue[1] === actor.id}
                isTargetable={targeting.validTargetIds.includes(actor.id)}
                isSelected={targeting.selectedIds.includes(actor.id)}
                isHovered={targeting.hoverId === actor.id}
                onSelect={targeting.validTargetIds.includes(actor.id) ? () => onTargetClick(actor.id) : undefined}
                onHover={targeting.validTargetIds.includes(actor.id) ? (hover) => onTargetHover(hover ? actor.id : null) : undefined}
                disabledReason={
                  targeting.validTargetIds.includes(actor.id)
                    ? undefined
                    : targeting.mode !== "none"
                    ? copy.tooltips.targetInvalid
                    : undefined
                }
                className={hitTargets.has(actor.id) ? "hit-shake" : ""}
              />
              {damageTargets.has(actor.id) ? (
                <DamageFloat amount={damageTargets.get(actor.id)!} variant="hit" className="absolute -top-3 right-4" />
              ) : null}
              {healTargets.has(actor.id) ? (
                <DamageFloat amount={healTargets.get(actor.id)!} variant="heal" className="absolute -top-3 right-4" />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {active ? (
        <div className="mt-2 rounded-full border border-slate-800/70 bg-slate-900/70 px-4 py-2 text-center text-sm text-slate-200">
          {formatTemplate(copy.turnOf, { name: getName(active) })}
        </div>
      ) : null}
    </section>
  );
}




