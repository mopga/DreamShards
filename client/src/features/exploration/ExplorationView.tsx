import React, { useMemo } from "react";
import { palaceLayout } from "@/state/content";
import { getEncounter, useGame } from "@/state/GameContext";
import { LogPanel } from "@/components/LogPanel";

const roomIndex = new Map(palaceLayout.rooms.map((room) => [room.id, room]));

export function ExplorationView() {
  const { state, moveToRoom, collectShard, startEncounter, openDialogue } = useGame();
  const room = roomIndex.get(state.location.roomId);

  const encounter = useMemo(() => getEncounter(room?.encounterId), [room]);
  const encounterCleared = state.flags[`encounter_${room?.encounterId}_cleared`];

  if (!room) {
    return <p className="text-rose-200">The palace cannot remember this chamber.</p>;
  }

  const shardAvailable = room.shardId && !state.flags[room.shardId];

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="rounded-lg border border-slate-700/60 bg-slate-900/80 p-6 text-slate-100">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold capitalize">{room.id.replace(/_/g, " ")}</h2>
            <p className="text-sm text-slate-400">Room type: {room.type}</p>
          </div>
          <button
            className="rounded-md border border-indigo-500/50 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200 transition hover:bg-indigo-500/30"
            onClick={() => openDialogue()}
          >
            Return to Dream Beach
          </button>
        </header>

        <section className="mt-5">
          <h3 className="text-lg font-medium text-indigo-200">Paths</h3>
          <div className="mt-3 flex flex-wrap gap-3">
            {room.neighbors.map((neighbor) => (
              <button
                key={neighbor}
                className="rounded-md border border-slate-600 bg-slate-800/70 px-4 py-2 text-sm uppercase tracking-wide transition hover:border-indigo-400 hover:bg-indigo-500/20"
                onClick={() => moveToRoom(neighbor)}
              >
                {neighbor.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 space-y-3">
          {shardAvailable && (
            <button
              className="block w-full rounded-md border border-amber-400/80 bg-amber-400/20 px-4 py-3 text-left text-amber-100 transition hover:bg-amber-400/30"
              onClick={() => collectShard(room.shardId!)}
            >
              Collect the dream shard pulsing here.
            </button>
          )}

          {encounter && !encounterCleared && (
            <button
              className="block w-full rounded-md border border-rose-500/60 bg-rose-500/20 px-4 py-3 text-left text-rose-100 transition hover:bg-rose-500/30"
              onClick={() => startEncounter(encounter.id)}
            >
              Face the {encounter.name}
            </button>
          )}

          {encounter && encounterCleared && (
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              This chamber is calm. The shadows remember their defeat.
            </div>
          )}
        </section>

        <LogPanel entries={state.log} />
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border border-slate-700/60 bg-slate-900/80 p-4">
          <h3 className="text-base font-semibold text-indigo-200">Shards</h3>
          <p className="mt-2 text-sm text-slate-300">
            {state.shardsCollected} / 3 collected
          </p>
          <ul className="mt-3 space-y-1 text-sm text-slate-400">
            {["shard1", "shard2", "shard3"].map((shardKey) => (
              <li key={shardKey}>
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-indigo-400 align-middle" />
                {shardKey.toUpperCase()}: {state.flags[shardKey] ? "Awake" : "Sleeping"}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-700/60 bg-slate-900/80 p-4">
          <h3 className="text-base font-semibold text-indigo-200">Party</h3>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            {state.party.map((member) => (
              <li key={member} className="rounded-md bg-slate-800/60 px-3 py-2">
                {member}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
