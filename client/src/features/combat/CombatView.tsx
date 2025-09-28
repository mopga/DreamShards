import React, { useEffect, useMemo, useState } from "react";
import { performAction, createCombatState, getActiveCombatant, type CombatAction, type CombatSnapshot } from "./combatEngine";
import { getEncounter, getPartyLineup, useGame } from "@/state/GameContext";
import type { Actor } from "@shared/types";
import { skills as skillsMap } from "@/state/content";
import { itemCatalog } from "@/state/items";

export function CombatView() {
  const { state, resolveCombat, adjustInventory } = useGame();
  const encounter = useMemo(() => getEncounter(state.activeEncounterId), [state.activeEncounterId]);
  const [combatState, setCombatState] = useState<CombatSnapshot | null>(null);
  const [inventory, setInventory] = useState(state.inventory);
  const [resolved, setResolved] = useState(false);
  const [menuState, setMenuState] = useState<"root" | "skills" | "items">("root");

  useEffect(() => {
    if (!encounter) return;
    const partyActors = preparePartyActors(state.flags, getPartyLineup(state.party));
    const snapshot = createCombatState({
      party: partyActors,
      encounter,
      shardCount: state.shardsCollected,
      flags: state.flags,
    });
    setCombatState(snapshot);
    setInventory(state.inventory);
    setResolved(false);
    setMenuState("root");
  }, [encounter, state.flags, state.party, state.shardsCollected, state.inventory]);

  useEffect(() => {
    if (!combatState || resolved || !combatState.ended) return;
    setResolved(true);
    resolveCombat({
      encounterId: encounter?.id ?? "unknown",
      victory: combatState.winner === "party",
      messages: combatState.log.slice(-6),
      rewards: encounter?.reward,
    });
  }, [combatState, resolved, resolveCombat, encounter]);

  useEffect(() => {
    if (!combatState || combatState.ended) return;
    const active = getActiveCombatant(combatState);
    if (!active || active.side !== "enemy") return;

    const timeout = setTimeout(() => {
      const action = chooseEnemyAction(combatState, active);
      step(action);
    }, 600);

    return () => clearTimeout(timeout);
  }, [combatState]);

  if (!combatState || !encounter) {
    return <p className="text-slate-200">The dream is assembling combat data...</p>;
  }

  const active = getActiveCombatant(combatState);
  const isPlayerTurn = active?.side === "party";

  const party = Object.values(combatState.combatants).filter((entity) => entity.side === "party");
  const enemies = Object.values(combatState.combatants).filter((entity) => entity.side === "enemy");

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="rounded-lg border border-slate-700/60 bg-slate-900/80 p-6">
        <header className="mb-4 flex items-center justify-between text-indigo-200">
          <h2 className="text-xl font-semibold">{encounter.name}</h2>
          <span className="text-sm text-indigo-300">Round {combatState.round}</span>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Allies</h3>
            <ul className="mt-2 space-y-2">
              {party.map((member) => (
                <BattleRow key={member.id} entity={member} isActive={active?.id === member.id} />
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Shadows</h3>
            <ul className="mt-2 space-y-2">
              {enemies.map((foe) => (
                <BattleRow key={foe.id} entity={foe} isActive={active?.id === foe.id} />
              ))}
            </ul>
          </div>
        </section>

        <LogFeed entries={combatState.log} />
      </div>

      <aside className="space-y-4">
        <TurnOrderPanel state={combatState} />
        {isPlayerTurn ? (
          <CommandPanel
            active={active}
            enemies={enemies}
            party={party}
            inventory={inventory}
            menuState={menuState}
            setMenuState={setMenuState}
            onAction={step}
          />
        ) : (
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/70 p-4 text-sm text-slate-300">
            The shadows are moving...
          </div>
        )}
      </aside>
    </div>
  );

  function step(action: CombatAction) {
    if (!combatState) return;
    const result = performAction(combatState, action, {
      inventory,
      flags: state.flags,
    });
    setCombatState(result.next);
    setInventory(result.inventory);
    synchroniseInventory(inventory, result.inventory);
    setMenuState("root");
  }

  function synchroniseInventory(prev: typeof inventory, next: typeof inventory) {
    const lookup = new Map(next.map((entry) => [entry.id, entry.qty]));
    prev.forEach((entry) => {
      const current = lookup.get(entry.id) ?? 0;
      const delta = current - entry.qty;
      if (delta !== 0) {
        adjustInventory(entry.id, delta);
      }
      lookup.delete(entry.id);
    });
    for (const [id, qty] of lookup.entries()) {
      adjustInventory(id, qty);
    }
  }
}

function preparePartyActors(flags: Record<string, boolean>, lineup: Actor[]) {
  return lineup.map((actor) => {
    const clone: Actor = {
      ...actor,
      stats: { ...actor.stats },
      skills: [...actor.skills],
      weaknesses: actor.weaknesses ? [...actor.weaknesses] : undefined,
      resistances: actor.resistances ? [...actor.resistances] : undefined,
    };
    if (!flags.unlockCompanionSkill) {
      clone.skills = clone.skills.filter((skillId) => skillId !== "twin_resonance");
    }
    return clone;
  });
}

function chooseEnemyAction(state: CombatSnapshot, actor: ReturnType<typeof getActiveCombatant>) {
  const enemyTargets = Object.values(state.combatants).filter(
    (entity) => entity.side === "party" && entity.currentHP > 0,
  );
  const skills = actor?.actor.skills.map((id) => skillsMap[id]).filter(Boolean) ?? [];
  const usable = skills.find((skill) => {
    const combatant = state.combatants[actor!.id];
    return combatant.currentSP >= (skill?.costSP ?? 0);
  });

  if (usable && enemyTargets.length) {
    return {
      type: "skill",
      skillId: usable.id,
      target: usable.targets,
      targetId: usable.targets === "one" ? enemyTargets[0].id : undefined,
    } as CombatAction;
  }

  if (enemyTargets.length) {
    return { type: "attack", targetId: enemyTargets[0].id } as CombatAction;
  }

  return { type: "end" } as CombatAction;
}

function BattleRow({ entity, isActive }: { entity: CombatSnapshot["combatants"][string]; isActive: boolean }) {
  const hpPercent = Math.round((entity.currentHP / entity.actor.stats.maxHP) * 100);
  const spPercent = Math.round((entity.currentSP / entity.actor.stats.maxSP) * 100);
  const statuses = entity.statuses.join(", ");

  return (
    <li className={`rounded-md border px-3 py-2 ${isActive ? "border-indigo-400 bg-indigo-500/10" : "border-slate-700 bg-slate-800/60"}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-100">{entity.actor.name}</span>
        <span className="text-xs text-slate-400">{hpPercent}% HP</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-700">
        <div className="h-full bg-rose-400" style={{ width: `${hpPercent}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
        <span>SP {spPercent}%</span>
        <span>{statuses || "stable"}</span>
      </div>
    </li>
  );
}

function TurnOrderPanel({ state }: { state: CombatSnapshot }) {
  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-900/80 p-4 text-sm text-slate-300">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Turn Order</h3>
      <ol className="mt-2 space-y-1">
        {state.order.map((id, index) => {
          const entity = state.combatants[id];
          const label = entity.actor.name;
          const active = index === state.turnIndex;
          return (
            <li key={id} className={active ? "text-indigo-200" : "text-slate-400"}>
              {active ? "? " : ""}
              {label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function LogFeed({ entries }: { entries: string[] }) {
  return (
    <div className="mt-6 max-h-48 overflow-y-auto rounded-md border border-slate-700/60 bg-slate-950/70 p-3 text-sm text-slate-200">
      {entries.slice(-8).map((entry, index) => (
        <p key={`${index}-${entry.slice(0, 12)}`} className="mb-1 last:mb-0">
          {entry}
        </p>
      ))}
    </div>
  );
}

function CommandPanel({
  active,
  enemies,
  party,
  inventory,
  menuState,
  setMenuState,
  onAction,
}: {
  active?: CombatSnapshot["combatants"][string];
  enemies: CombatSnapshot["combatants"][string][];
  party: CombatSnapshot["combatants"][string][];
  inventory: { id: string; qty: number }[];
  menuState: "root" | "skills" | "items";
  setMenuState: (state: "root" | "skills" | "items") => void;
  onAction: (action: CombatAction) => void;
}) {
  if (!active) return null;
  const actorSkills = active.actor.skills
    .map((id) => skillsMap[id])
    .filter(Boolean)
    .filter((skill) => active.currentSP >= skill.costSP || skill.costSP === 0);

  if (menuState === "skills") {
    return (
      <div className="rounded-lg border border-indigo-500/50 bg-indigo-500/10 p-4 text-sm text-indigo-100">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-200">Skills</h3>
        <ul className="mt-2 space-y-2">
          {actorSkills.map((skill) => (
            <li key={skill.id}>
              {skill.targets === "one" ? (
                <div className="flex flex-col gap-2">
                  <span>{skill.name} ({skill.costSP} SP)</span>
                  <div className="flex flex-wrap gap-2">
                    {enemies
                      .filter((enemy) => enemy.currentHP > 0)
                      .map((enemy) => (
                        <button
                          key={enemy.id}
                          className="rounded-md border border-indigo-400/40 px-3 py-1 text-xs uppercase tracking-wide hover:bg-indigo-500/40"
                          onClick={() => onAction({ type: "skill", skillId: skill.id, target: "one", targetId: enemy.id })}
                        >
                          {enemy.actor.name}
                        </button>
                      ))}
                  </div>
                </div>
              ) : (
                <button
                  className="w-full rounded-md border border-indigo-400/40 px-3 py-2 text-left hover:bg-indigo-500/40"
                  onClick={() => onAction({ type: "skill", skillId: skill.id, target: "all" })}
                >
                  {skill.name} ({skill.costSP} SP) - all foes
                </button>
              )}
            </li>
          ))}
        </ul>
        <button
          className="mt-4 w-full rounded-md border border-indigo-200/40 px-3 py-2 text-center text-xs uppercase tracking-wide hover:bg-indigo-500/30"
          onClick={() => setMenuState("root")}
        >
          Back
        </button>
      </div>
    );
  }

  if (menuState === "items") {
    return (
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-200">Items</h3>
        <ul className="mt-2 space-y-2">
          {inventory
            .filter((slot) => slot.qty > 0)
            .map((slot) => {
              const item = itemCatalog[slot.id];
              return (
                <li key={slot.id} className="rounded-md border border-amber-300/40 px-3 py-2">
                  <p className="font-medium">{item?.name ?? slot.id}  x{slot.qty}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {party
                      .filter((member) => member.currentHP > 0)
                      .map((member) => (
                        <button
                          key={`${slot.id}-${member.id}`}
                          className="rounded-md border border-amber-200/40 px-2 py-1 text-xs uppercase tracking-wide hover:bg-amber-400/30"
                          onClick={() => onAction({ type: "item", itemId: slot.id, targetId: member.id })}
                        >
                          {member.actor.name}
                        </button>
                      ))}
                  </div>
                </li>
              );
            })}
        </ul>
        <button
          className="mt-4 w-full rounded-md border border-amber-300/40 px-3 py-2 text-center text-xs uppercase tracking-wide hover:bg-amber-400/30"
          onClick={() => setMenuState("root")}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-900/80 p-4 text-sm text-slate-200">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Commands</h3>
      <div className="mt-3 space-y-2">
        <button
          className="w-full rounded-md border border-slate-500/50 px-3 py-2 text-left uppercase tracking-wide hover:bg-slate-700/40"
          onClick={() => setMenuState("skills")}
        >
          Skills
        </button>
        <button
          className="w-full rounded-md border border-slate-500/50 px-3 py-2 text-left uppercase tracking-wide hover:bg-slate-700/40"
          onClick={() => setMenuState("items")}
        >
          Items
        </button>
        {enemies
          .filter((enemy) => enemy.currentHP > 0)
          .map((enemy) => (
            <button
              key={enemy.id}
              className="w-full rounded-md border border-rose-500/40 px-3 py-2 text-left uppercase tracking-wide text-rose-200 hover:bg-rose-500/20"
              onClick={() => onAction({ type: "attack", targetId: enemy.id })}
            >
              Attack {enemy.actor.name}
            </button>
          ))}
        <button
          className="w-full rounded-md border border-slate-500/50 px-3 py-2 text-left uppercase tracking-wide hover:bg-slate-700/40"
          onClick={() => onAction({ type: "guard" })}
        >
          Guard
        </button>
        <button
          className="w-full rounded-md border border-slate-500/50 px-3 py-2 text-left uppercase tracking-wide hover:bg-slate-700/40"
          onClick={() => onAction({ type: "end" })}
        >
          End Turn
        </button>
      </div>
    </div>
  );
}


