import React, { useEffect, useRef } from "react";
import type { CombatEvent, CombatState } from "../../logic/types";
import { useCombatCopy } from "../combatI18n";
import { formatTemplate } from "../formatters";
import { useHeroName } from "@/state/hooks";

interface BattleLogProps {
  events: CombatEvent[];
  entities: CombatState["entities"];
}

export function BattleLog({ events, entities }: BattleLogProps) {
  const copy = useCombatCopy();
  const heroName = useHeroName();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [events]);

  return (
    <aside className="relative flex h-full flex-col">
      <header className="flex items-center justify-between rounded-t-2xl border border-slate-800/70 bg-slate-950/80 px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
        <span>{copy.logTitle}</span>
      </header>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto rounded-b-2xl border border-t-0 border-slate-800/70 bg-slate-950/60 p-4 font-mono text-[13px] text-slate-200"
      >
        {events.map((event) => (
          <p key={event.id} className="mb-1 leading-tight last:mb-0">
            {renderEventLine(event, entities, copy, heroName)}
          </p>
        ))}
      </div>
    </aside>
  );
}

function renderEventLine(
  event: CombatEvent,
  entities: CombatState["entities"],
  copy: ReturnType<typeof useCombatCopy>,
  heroName: string,
) {
  const getName = (entityId: string | undefined) => {
    if (!entityId) return "";
    const entity = entities[entityId];
    if (!entity) return "";
    if (entity.actor.id === "hero") {
      return heroName;
    }
    return copy.actorNames[entity.actor.id] ?? entity.actor.name;
  };
  switch (event.type) {
    case "Hit": {
      const src = getName(event.sourceId);
      const tgt = getName(event.targetId);
      return formatTemplate(copy.log.hit, { src, tgt, dmg: event.amount });
    }
    case "WeaknessTriggered": {
      const src = getName(event.sourceId);
      return formatTemplate(copy.log.weakness, { src });
    }
    case "Guard": {
      const src = getName(event.sourceId);
      return formatTemplate(copy.log.guard, { src });
    }
    case "Death": {
      const tgt = getName(event.targetId);
      return formatTemplate(copy.log.death, { tgt });
    }
    case "Heal": {
      const src = getName(event.sourceId);
      const tgt = getName(event.targetId);
      return formatTemplate(copy.log.heal, { src, tgt, dmg: event.amount });
    }
    case "ItemUsed": {
      const src = getName(event.sourceId);
      return formatTemplate(copy.log.item, { src, item: event.itemId });
    }
    case "TurnEnded": {
      const src = getName(event.sourceId);
      return formatTemplate(copy.log.end, { src });
    }
    case "StartRound":
      return formatTemplate(copy.turnOf, { name: `${copy.roundLabel} ${event.round}` });
    default:
      return event.message ?? event.type;
  }
}



