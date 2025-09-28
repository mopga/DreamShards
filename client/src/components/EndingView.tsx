import React from "react";
import { clearSnapshot, saveSnapshot } from "@/features/save/saveSystem";
import { useGame } from "@/state/GameContext";

export function EndingView() {
  const { state, resetToMenu } = useGame();

  const shardLines = ["A whisper of courage", "A steadying breath", "A shared heartbeat"];
  const collectedLines = shardLines.slice(0, state.shardsCollected).join(", ");

  const ending = state.shardsCollected === 3
    ? "The Avatar dissolves, leaving only the tide and a promise of quieter dreams."
    : "Fear still lingers, but the palace no longer holds the same power.";

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-indigo-500/60 bg-slate-900/90 p-8 text-slate-100">
      <h2 className="text-3xl font-semibold text-indigo-200">The Dream Settles</h2>
      <p className="mt-4 text-lg">{ending}</p>

      {state.shardsCollected > 0 && (
        <p className="mt-3 text-sm text-slate-300">
          Shards gathered: {state.shardsCollected} - {collectedLines || "echoes waiting to be found"}.
        </p>
      )}

      {state.flags.unlockCompanionSkill && (
        <p className="mt-3 text-sm text-slate-300">
          Senna and Io trade a knowing glance; their resonance lingers even after waking.
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="rounded-md border border-indigo-400/60 bg-indigo-500/20 px-4 py-2 text-sm uppercase tracking-wide hover:bg-indigo-500/30"
          onClick={() => saveSnapshot(state)}
        >
          Save This Ending
        </button>
        <button
          className="rounded-md border border-rose-400/60 bg-rose-500/20 px-4 py-2 text-sm uppercase tracking-wide hover:bg-rose-500/30"
          onClick={() => {
            clearSnapshot();
            resetToMenu();
          }}
        >
          Wake Up
        </button>
      </div>
    </div>
  );
}

