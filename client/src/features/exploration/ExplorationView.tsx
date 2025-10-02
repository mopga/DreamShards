import React, { useMemo } from "react";
import { palaceLayout } from "@/state/content";
import { getEncounter, useGame } from "@/state/GameContext";
import { LogPanel } from "@/components/LogPanel";

const roomIndex = new Map(palaceLayout.rooms.map((room) => [room.id, room]));

type RoomMetadata = {
  name: string;
  description: string;
};

const roomMetadata: Record<string, RoomMetadata> = {
  entry: {
    name: "Вход",
    description: "Лунный портал ведёт в сердце дворца. Тихий ветер приносит солёный запах берега.",
  },
  hall: {
    name: "Зал эха",
    description: "Колонны напевают забытые страхи. Здесь роятся слабые тени, испытывая вашу решимость.",
  },
  library: {
    name: "Лабиринт томов",
    description: "Полки, наполненные тревожными хрониками, охраняют первый осколок. Страж ревниво следит за каждым шагом.",
  },
  gallery: {
    name: "Галерея отражений",
    description: "Картины оживают и шепчут чужие кошмары. Второй осколок прячется среди разбитых рам.",
  },
  vault: {
    name: "Сокровищница шрама",
    description: "Три запечатанных сердца бьются в унисон, охраняемые последним стражем. Здесь скрыт финальный осколок.",
  },
  gate: {
    name: "Врата Аватара",
    description: "За этими воротами дремлет сам страх. Лишь собрав все осколки, вы сможете бросить ему вызов.",
  },
};

const roomPositions: Record<string, { x: number; y: number }> = {
  entry: { x: 12, y: 52 },
  hall: { x: 36, y: 52 },
  library: { x: 58, y: 28 },
  gallery: { x: 58, y: 76 },
  vault: { x: 82, y: 52 },
  gate: { x: 92, y: 18 },
};

const difficultyLabels: Record<string, string> = {
  weak: "Слабые тени",
  mid: "Опасные эхо",
  hard: "Неумолимые страхи",
};

function formatRoomId(id: string) {
  const meta = roomMetadata[id];
  if (meta) return meta.name;
  return id.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ExplorationView() {
  const { state, moveToRoom, collectShard, startEncounter, openDialogue } = useGame();
  const baseRoom = roomIndex.get(state.location.roomId);
  const roomState = baseRoom ? state.roomStates[baseRoom.id] : undefined;
  const room = baseRoom
    ? ({ ...baseRoom, ...roomState } as typeof baseRoom & { shardCollected?: boolean })
    : undefined;

  const edges = useMemo(() => {
    const connections: Array<[string, string]> = [];
    const seen = new Set<string>();
    palaceLayout.rooms.forEach((current) => {
      current.neighbors.forEach((neighborId) => {
        const key = [current.id, neighborId].sort().join(":");
        if (seen.has(key)) return;
        if (!roomIndex.has(neighborId)) return;
        seen.add(key);
        connections.push([current.id, neighborId]);
      });
    });
    return connections;
  }, []);

  if (!room) {
    return <p className="text-rose-200">The palace cannot remember this chamber.</p>;
  }

  const guardEncounter = getEncounter(room.guardEncounter);
  const guardCleared = guardEncounter
    ? state.flags[`encounter_${guardEncounter.id}_cleared`]
    : false;
  const shardAvailable = room.shardId && !state.flags[room.shardId] && guardCleared;

  const bossEncounter = getEncounter(palaceLayout.bossEncounterId);
  const bossCleared = bossEncounter
    ? state.flags[`encounter_${bossEncounter.id}_cleared`]
    : false;

  const shardsNeeded = Math.max(0, 3 - state.shardsCollected);
  const accessibleRooms = new Set([room.id, ...room.neighbors]);
  const metadata = roomMetadata[room.id];
  const dangerLabel = room.encounterTable ? difficultyLabels[room.encounterTable] : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <div className="space-y-6">
        <div className="rounded-lg border border-slate-700/60 bg-slate-900/80 p-6 text-slate-100">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-300/80">Карта дворца</p>
              <h2 className="text-2xl font-semibold text-indigo-100">{formatRoomId(room.id)}</h2>
            </div>
            <button
              className="rounded-md border border-indigo-500/50 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200 transition hover:bg-indigo-500/30"
              onClick={() => openDialogue()}
            >
              Вернуться на Пляж Снов
            </button>
          </header>

          <div className="relative mt-6 aspect-square rounded-md border border-slate-700/50 bg-slate-950/60">
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {edges.map(([from, to]) => {
                const start = roomPositions[from];
                const end = roomPositions[to];
                if (!start || !end) return null;
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="url(#pathGradient)"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    opacity={0.4}
                  />
                );
              })}
              <defs>
                <linearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>

            {palaceLayout.rooms.map((mapRoom) => {
              const position = roomPositions[mapRoom.id];
              if (!position) return null;
              const isCurrent = mapRoom.id === room.id;
              const isAccessible = accessibleRooms.has(mapRoom.id);
              return (
                <button
                  key={mapRoom.id}
                  type="button"
                  disabled={!isAccessible}
                  onClick={() => {
                    if (mapRoom.id !== room.id) {
                      moveToRoom(mapRoom.id);
                    }
                  }}
                  className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-widest transition focus:outline-none focus:ring-2 focus:ring-cyan-400/80 ${
                    isCurrent
                      ? "border-cyan-300/80 bg-cyan-400/20 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.35)]"
                      : isAccessible
                        ? "border-indigo-400/60 bg-slate-900/80 text-indigo-100 hover:border-cyan-300/80 hover:text-cyan-100"
                        : "cursor-not-allowed border-slate-700/60 bg-slate-900/40 text-slate-500"
                  }`}
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                >
                  {formatRoomId(mapRoom.id)}
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-3">
            {dangerLabel && (
              <p className="text-sm text-slate-300/90">
                Угроза: <span className="text-indigo-200">{dangerLabel}</span>
              </p>
            )}

            {shardAvailable && (
              <button
                className="block w-full rounded-md border border-amber-400/80 bg-amber-400/20 px-4 py-3 text-left text-sm text-amber-100 transition hover:bg-amber-400/30"
                onClick={() => collectShard(room.shardId!)}
              >
                Собрать осколок, мерцающий в воздухе.
              </button>
            )}

            {guardEncounter && !guardCleared && (
              <button
                className="block w-full rounded-md border border-rose-500/60 bg-rose-500/20 px-4 py-3 text-left text-sm text-rose-100 transition hover:bg-rose-500/30"
                onClick={() => startEncounter(guardEncounter.id)}
              >
                Бросить вызов стражу: {guardEncounter.name}
              </button>
            )}

            {guardEncounter && guardCleared && (
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                Страж отступил. Комната спит спокойно.
              </div>
            )}

            {room.type === "boss" && bossEncounter && (
              <button
                className="block w-full rounded-md border border-fuchsia-500/60 bg-fuchsia-500/20 px-4 py-3 text-left text-sm text-fuchsia-100 transition hover:bg-fuchsia-500/30 disabled:cursor-not-allowed disabled:border-fuchsia-500/20 disabled:bg-fuchsia-500/10 disabled:text-fuchsia-200/40"
                disabled={state.shardsCollected < 3 || bossCleared}
                onClick={() => startEncounter(bossEncounter.id)}
              >
                {bossCleared
                  ? "Аватар страха уже повержен."
                  : shardsNeeded > 0
                    ? `Врата закрыты. Нужны ещё ${shardsNeeded} осколка.`
                    : `Открыть врата и сразиться: ${bossEncounter.name}`}
              </button>
            )}
          </div>
        </div>

        <LogPanel entries={state.log} />
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border border-slate-700/60 bg-slate-900/80 p-4 text-slate-100">
          <h3 className="text-base font-semibold text-indigo-200">Осколки {state.shardsCollected} / 3</h3>
          <p className="mt-2 text-sm text-slate-300">
            Соберите все три осколка, чтобы открыть Врата Аватара.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {["shard1", "shard2", "shard3"].map((shardKey, index) => (
              <li key={shardKey} className="flex items-center justify-between rounded-md bg-slate-800/60 px-3 py-2">
                <span>
                  Осколок {index + 1}
                  <span className="ml-2 text-xs uppercase tracking-widest text-slate-400">
                    {index === 0 ? "Библиотека" : index === 1 ? "Галерея" : "Сокровищница"}
                  </span>
                </span>
                <span className={state.flags[shardKey] ? "text-emerald-300" : "text-slate-500"}>
                  {state.flags[shardKey] ? "Пробуждён" : "Спит"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-700/60 bg-slate-900/80 p-4 text-slate-100">
          <h3 className="text-base font-semibold text-indigo-200">Описание комнаты</h3>
          <p className="mt-2 text-lg font-medium text-indigo-100">{metadata?.name ?? formatRoomId(room.id)}</p>
          <p className="mt-2 text-sm text-slate-300">
            {metadata?.description ?? "Эта комната всё ещё формируется во снах."}
          </p>
        </div>

        <div className="rounded-lg border border-slate-700/60 bg-slate-900/80 p-4 text-slate-100">
          <h3 className="text-base font-semibold text-indigo-200">Отряд</h3>
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
