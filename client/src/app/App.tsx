import React, { useEffect } from "react";
import { GameProvider, useGame } from "@/state/GameContext";
import { MainMenu } from "@/components/MainMenu";
import { DialogueView } from "@/features/dialogue/DialogueView";
import { ExplorationView } from "@/features/exploration/ExplorationView";
import { CombatView } from "@/features/combat/CombatView";
import { EndingView } from "@/components/EndingView";
import { loadSnapshot, saveSnapshot, pushSnapshotToServer } from "@/features/save/saveSystem";

export function App() {
  return (
    <GameProvider>
      <DreamShell />
    </GameProvider>
  );
}

function DreamShell() {
  const { state } = useGame();

  useEffect(() => {
    if (state.mode !== "menu") {
      saveSnapshot(state);
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-930 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <TopBar />
        <main className="mt-6">
          {state.mode === "menu" && <MainMenu />}
          {state.mode === "dialogue" && <DialogueView />}
          {state.mode === "exploration" && <ExplorationView />}
          {state.mode === "combat" && <CombatView />}
          {state.mode === "ending" && <EndingView />}
        </main>
      </div>
    </div>
  );
}

function TopBar() {
  const { state, hydrate } = useGame();

  const handleSave = () => {
    saveSnapshot(state);
  };

  const handleLoad = () => {
    const snapshot = loadSnapshot();
    if (snapshot) {
      hydrate(snapshot.state);
    }
  };

  const handleRemoteSave = async () => {
    await pushSnapshotToServer(state);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-700/60 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
      <div>
        <p className="font-semibold text-indigo-200">Shards of Dreams</p>
        <p className="text-xs text-slate-400">
          Mode: {state.mode} | Shards: {state.shardsCollected}/3
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md border border-slate-600 px-3 py-1.5 hover:bg-slate-700/50"
          onClick={handleSave}
        >
          Save Local
        </button>
        <button
          className="rounded-md border border-slate-600 px-3 py-1.5 hover:bg-slate-700/50"
          onClick={handleLoad}
        >
          Load Local
        </button>
        <button
          className="rounded-md border border-indigo-500/60 px-3 py-1.5 text-indigo-200 hover:bg-indigo-500/20"
          onClick={handleRemoteSave}
        >
          Push to Shore (/api/save)
        </button>
      </div>
    </div>
  );
}
