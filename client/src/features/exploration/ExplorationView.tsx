import React, { useMemo } from "react";
import clsx from "clsx";
import { palaceLayout } from "@/state/content";
import { getEncounter, useGame } from "@/state/GameContext";
import { LogPanel } from "@/components/LogPanel";

const roomIndex = new Map(palaceLayout.rooms.map((room) => [room.id, room]));
const shardRooms = palaceLayout.rooms.filter((room) => room.shardId);

type RoomMetadata = {
  name: string;
  description: string;
};

const roomMetadata: Record<string, RoomMetadata> = {
  r1: {
    name: "Портал прилива",
    description:
      "Небольшой зал, где серебряный песок образует спирали. Здесь начинается путь в сердце дворца.",
  },
  r2: {
    name: "Мозаичный коридор",
    description:
      "Стенки мерцают витражами, откликаясь на каждый шаг. Эхо прошлого подталкивает вперёд.",
  },
  r3: {
    name: "Колодец отражений",
    description:
      "Гладь зеркальной воды прячет первый осколок. Чтобы коснуться его света, нужно обойти бдительного стража.",
  },
  r4: {
    name: "Зал резонансов",
    description:
      "Тяжёлые балки гудят низким басом. Здесь страх проверяет стойкость голоса героя.",
  },
  r5: {
    name: "Оранжерея искр",
    description:
      "Осколок сияет среди хрустальных лиан, шепчущих о забытых обещаниях. Тень-страж сторожит сияние.",
  },
  r6: {
    name: "Туманный перевал",
    description:
      "Проход сужается, скрываясь в завесе тумана. Каждый шаг сопровождает тяжёлое дыхание дворца.",
  },
  r7: {
    name: "Сад статуй",
    description:
      "Мраморные фигуры тянутся к третьему осколку. Их взгляды оживают, когда вы приближаетесь.",
  },
  r8: {
    name: "Атриум шёпотов",
    description:
      "Стены покрыты письменами, которые перешёптываются друг с другом. Здесь страх проверяет терпение.",
  },
  r9: {
    name: "Неф свечей",
    description:
      "Сотни свечей качаются в унисон, охраняя четвёртый осколок. Их пламя реагирует на каждую мысль.",
  },
  r10: {
    name: "Преддверие трона",
    description:
      "Последний коридор перед тронным залом. Здесь караулит самый преданный страж дворца.",
  },
  boss: {
    name: "Тронный зал Страха",
    description:
      "Сердце дворца. Здесь ждёт Аватар, питающийся собранными сомнениями.",
  },
};

const roomPositions: Record<string, { x: number; y: number }> = {
  r1: { x: 14, y: 22 },
  r2: { x: 36, y: 22 },
  r3: { x: 58, y: 22 },
  r4: { x: 78, y: 28 },
  r5: { x: 78, y: 46 },
  r6: { x: 56, y: 46 },
  r7: { x: 34, y: 46 },
  r8: { x: 12, y: 46 },
  r9: { x: 12, y: 68 },
  r10: { x: 34, y: 68 },
  boss: { x: 56, y: 84 },
};

const difficultyLabels: Record<string, string> = {
  weak: "Слабые тени",
  mid: "Опасные эхо",
  hard: "Неумолимые страхи",
};

const typeStyles: Record<string, { base: string; glyph: string; label: string }> = {
  entry: {
    base: "border-cyan-400/70 bg-cyan-500/10 text-cyan-200",
    glyph: "◎",
    label: "Вход",
  },
  combat: {
    base: "border-indigo-400/60 bg-indigo-500/10 text-indigo-200",
    glyph: "⚔",
    label: "Схватка",
  },
  shard: {
    base: "border-amber-400/70 bg-amber-400/15 text-amber-200",
    glyph: "✶",
    label: "Осколок",
  },
  boss: {
    base: "border-fuchsia-500/70 bg-fuchsia-500/20 text-fuchsia-200",
    glyph: "♛",
    label: "Трон",
  },
  default: {
    base: "border-slate-600/70 bg-slate-800/60 text-slate-200",
    glyph: "•",
    label: "Комната",
  },
};

function formatRoomId(id: string) {
  const meta = roomMetadata[id];
  if (meta) return meta.name;
  return id.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ExplorationView() {
  const { state, moveToRoom, collectShard, startEncounter, openDialogue, claimRoomLoot } = useGame();
  const baseRoom = roomIndex.get(state.location.roomId);
  const roomState = baseRoom ? state.roomStates[baseRoom.id] : undefined;
  const room = baseRoom
    ? ({ ...baseRoom, ...roomState } as typeof baseRoom & {
        shardCollected?: boolean;
        lootClaimed?: boolean;
      })
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
  const guardCleared = guardEncounter ? state.flags[`encounter_${guardEncounter.id}_cleared`] : false;
  const shardAvailable = room.shardId && !state.flags[room.shardId] && guardCleared;
  const lootAvailable = Boolean(room.loot && !room.lootClaimed);
  const lootAlreadyClaimed = Boolean(room.loot && room.lootClaimed);

  const bossEncounter = getEncounter(palaceLayout.bossEncounterId);
  const bossCleared = bossEncounter ? state.flags[`encounter_${bossEncounter.id}_cleared`] : false;

  const totalShards = shardRooms.length;
  const shardsNeeded = Math.max(0, totalShards - state.shardsCollected);
  const accessibleRooms = new Set([room.id, ...room.neighbors]);
  const metadata = roomMetadata[room.id];
  const dangerLabel = room.encounterTable ? difficultyLabels[room.encounterTable] : undefined;
  const typeAppearance = typeStyles[room.type] ?? typeStyles.default;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)]">
        <section className="space-y-6 rounded-xl border border-slate-700/60 bg-slate-900/80 p-6 text-slate-100 shadow-lg shadow-slate-950/40">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-300/80">Мини-карта дворца</p>
              <h2 className="text-2xl font-semibold text-indigo-100">{formatRoomId(room.id)}</h2>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{typeAppearance.label}</p>
            </div>
            <button
              className="rounded-md border border-indigo-500/50 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200 transition hover:bg-indigo-500/30"
              onClick={() => openDialogue()}
            >
              Вернуться на Пляж Снов
            </button>
          </header>

          <div className="space-y-3 text-sm text-slate-300">
            {dangerLabel && (
              <p>
                Угроза поблизости: <span className="text-indigo-200">{dangerLabel}</span>
              </p>
            )}
            {room.shardId && !guardCleared && (
              <p className="text-amber-200">
                Осколок рядом, но страж всё ещё на посту.
              </p>
            )}
            {guardEncounter && guardCleared && (
              <p className="text-emerald-200">Страж отступил. Осколок открыт.</p>
            )}
          </div>

          <div className="relative mx-auto w-full max-w-3xl">
            <div className="relative aspect-[11/5] overflow-hidden rounded-lg border border-slate-800/60 bg-slate-950/80">
              <div
                className="pointer-events-none absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
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
                      strokeWidth={2}
                      strokeLinecap="round"
                      opacity={0.45}
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
                const isNeighbor = room.neighbors.includes(mapRoom.id);
                const appearance = typeStyles[mapRoom.type] ?? typeStyles.default;

                return (
                  <button
                    key={mapRoom.id}
                    type="button"
                    aria-current={isCurrent}
                    aria-label={formatRoomId(mapRoom.id)}
                    disabled={!isAccessible || isCurrent}
                    onClick={() => {
                      if (!isCurrent) {
                        moveToRoom(mapRoom.id);
                      }
                    }}
                    className={clsx(
                      "group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.2em] transition",
                      isAccessible ? "text-slate-200" : "cursor-not-allowed text-slate-600/70",
                    )}
                    style={{ left: `${position.x}%`, top: `${position.y}%` }}
                  >
                    <span
                      className={clsx(
                        "relative flex h-14 w-14 items-center justify-center rounded-full border text-base transition",
                        appearance.base,
                        isNeighbor && !isCurrent &&
                          "border-cyan-300/80 text-cyan-100 shadow-[0_0_20px_rgba(94,234,212,0.25)]",
                        isCurrent &&
                          "border-cyan-200/90 bg-cyan-400/20 text-cyan-50 shadow-[0_0_26px_rgba(165,243,252,0.55)]",
                        !isAccessible && !isCurrent && "border-slate-700/40 text-slate-600/70",
                      )}
                    >
                      {isCurrent ? (
                        <span className="text-lg">★</span>
                      ) : (
                        <span className="text-lg">{appearance.glyph}</span>
                      )}
                    </span>
                    <span className="max-w-[7rem] text-center text-slate-300/90">
                      {formatRoomId(mapRoom.id)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-200">
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

            {lootAvailable && room.loot && (
              <button
                className="block w-full rounded-md border border-sky-400/70 bg-sky-400/20 px-4 py-3 text-left text-sm text-sky-100 transition hover:bg-sky-400/30"
                onClick={() => claimRoomLoot(room.id)}
              >
                {room.loot.actionLabel ?? "Обыскать комнату"}
              </button>
            )}

            {lootAlreadyClaimed && (
              <div className="rounded-md border border-sky-300/40 bg-sky-300/10 px-4 py-3 text-sm text-sky-100">
                Комната уже обыскана.
              </div>
            )}

            {room.type === "boss" && bossEncounter && (
              <button
                className="block w-full rounded-md border border-fuchsia-500/60 bg-fuchsia-500/20 px-4 py-3 text-left text-sm text-fuchsia-100 transition hover:bg-fuchsia-500/30 disabled:cursor-not-allowed disabled:border-fuchsia-500/20 disabled:bg-fuchsia-500/10 disabled:text-fuchsia-200/40"
                disabled={state.shardsCollected < totalShards || bossCleared}
                onClick={() => startEncounter(bossEncounter.id)}
              >
                {bossCleared
                  ? "Аватар страха уже повержен."
                  : shardsNeeded > 0
                    ? `Врата закрыты. Нужны ещё ${shardsNeeded} ${shardsNeeded === 1 ? "осколок" : "осколка"}.`
                    : `Открыть врата и сразиться: ${bossEncounter.name}`}
              </button>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/80 p-4 text-slate-100">
            <h3 className="text-base font-semibold text-indigo-200">
              Осколки {state.shardsCollected} / {totalShards}
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Соберите все осколки, чтобы открыть путь в тронный зал.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {shardRooms.map((shardRoom, index) => {
                const shardId = shardRoom.shardId!;
                const collected = Boolean(state.flags[shardId]);
                const shardMeta = roomMetadata[shardRoom.id];
                return (
                  <li
                    key={shardId}
                    className="flex items-center justify-between rounded-md bg-slate-800/60 px-3 py-2"
                  >
                    <span>
                      Осколок {index + 1}
                      <span className="ml-2 text-xs uppercase tracking-widest text-slate-400">
                        {shardMeta?.name ?? formatRoomId(shardRoom.id)}
                      </span>
                    </span>
                    <span className={collected ? "text-emerald-300" : "text-slate-500"}>
                      {collected ? "Пробуждён" : "Спит"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-700/60 bg-slate-900/80 p-4 text-slate-100">
            <h3 className="text-base font-semibold text-indigo-200">Описание комнаты</h3>
            <p className="mt-2 text-lg font-medium text-indigo-100">{metadata?.name ?? formatRoomId(room.id)}</p>
            <p className="mt-2 text-sm text-slate-300">
              {metadata?.description ?? "Эта комната всё ещё формируется во снах."}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700/60 bg-slate-900/80 p-4 text-slate-100">
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

      <LogPanel className="mt-2" entries={state.log} />
    </div>
  );
}
