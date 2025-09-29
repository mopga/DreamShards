import React from "react";
import { getDialogueNode, useGame } from "@/state/GameContext";
import { useHeroName } from "@/state/hooks";

function canShowChoice(
  requires: Record<string, boolean> | undefined,
  flags: Record<string, boolean>,
) {
  if (!requires) return true;
  return Object.entries(requires).every(([key, value]) => {
    const current = !!flags[key];
    return current === value;
  });
}

function applyHero(text: string, hero: string) {
  if (!text) return text;
  return text.replace(/\{\{hero\}\}/gi, hero);
}

export function DialogueView() {
  const { state, advanceDialogue } = useGame();
  const hero = useHeroName();
  const session = state.dialogue;

  if (!session) {
    return (
      <div className="rounded-lg border border-slate-700/60 bg-slate-900/80 p-6 text-slate-200">
        <p>No voices are calling right now.</p>
      </div>
    );
  }

  const node = getDialogueNode(session.nodes, session.currentId);
  if (!node) {
    return (
      <div className="rounded-lg border border-rose-700/40 bg-rose-900/40 p-6 text-rose-100">
        <p>The dream failed to recall this memory.</p>
      </div>
    );
  }

  const choices = node.choices?.filter((choice) =>
    canShowChoice(choice.requiresFlags, state.flags),
  );

  return (
    <div className="mx-auto max-w-3xl rounded-lg border border-indigo-500/60 bg-slate-900/90 p-8 shadow-lg shadow-indigo-900/30">
      <h2 className="text-xl font-semibold text-indigo-200">Dream Beach</h2>
      <p className="mt-4 text-lg leading-relaxed text-slate-100">{applyHero(node.text, hero)}</p>

      <div className="mt-6 flex flex-col gap-3">
        {choices?.map((choice) => (
          <button
            key={applyHero(choice.label, hero)}
            className="rounded-md border border-indigo-500/50 bg-indigo-500/20 px-4 py-3 text-left text-indigo-100 transition hover:bg-indigo-500/40"
            onClick={() => advanceDialogue(choice.next, choice.setFlags)}
          >
            {applyHero(choice.label, hero)}
          </button>
        ))}
        {!choices?.length && !node.end && (
          <button
            className="rounded-md border border-slate-500/50 bg-slate-500/10 px-4 py-2 text-left text-slate-200"
            onClick={() => advanceDialogue("start")}
          >
            Listen to the surf again
          </button>
        )}
      </div>
    </div>
  );
}

