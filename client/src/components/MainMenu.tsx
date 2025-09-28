import React from "react";
import { loadSnapshot } from "@/features/save/saveSystem";
import { useGame } from "@/state/GameContext";

export function MainMenu() {
  const { startNewGame, resetToMenu, hydrate, addLogEntry } = useGame();

  const handleContinue = () => {
    const snapshot = loadSnapshot();
    if (snapshot) {
      addLogEntry("The surf remembers where you left off.");
      hydrate(snapshot.state);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-slate-100">
      <h1 className="text-4xl font-semibold tracking-wide">Shards of Dreams</h1>
      <p className="max-w-md text-center text-slate-300">
        A single night, a single palace woven from fear. Gather the shards, listen to Lister, and face the Avatar.
      </p>
      <div className="flex flex-col gap-3">
        <button
          className="rounded-full bg-indigo-500 px-10 py-3 text-lg font-medium shadow-lg shadow-indigo-800/40 transition hover:bg-indigo-400"
          onClick={startNewGame}
        >
          Begin the Dream
        </button>
        <button
          className="rounded-full border border-indigo-400 px-10 py-3 text-lg text-indigo-200 transition hover:bg-indigo-500/20"
          onClick={handleContinue}
        >
          Listen for Echoes (Load)
        </button>
        <button
          className="rounded-full border border-slate-600 px-10 py-3 text-sm text-slate-300 transition hover:bg-slate-700/40"
          onClick={resetToMenu}
        >
          Reset Memory
        </button>
      </div>
    </div>
  );
}
