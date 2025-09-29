import React, { useEffect } from "react";
import { GameProvider, useGame } from "@/state/GameContext";
import { MainMenu } from "@/components/MainMenu";
import { DialogueView } from "@/features/dialogue/DialogueView";
import { ExplorationView } from "@/features/exploration/ExplorationView";
import { CombatView } from "@/features/combat/CombatView";
import { EndingView } from "@/components/EndingView";
import { loadSnapshot, saveSnapshot, pushSnapshotToServer } from "@/features/save/saveSystem";
import { IntroSequence } from "@/features/intro/IntroSequence";
import { HeroNameModal } from "@/features/hero/HeroNameModal";
import { useLocale, TranslationKey, LocaleProvider } from "@/state/LocaleContext";
import { Save, Upload, Download, Languages } from "lucide-react";

export function App() {
  return (
    <LocaleProvider>
      <GameProvider>
        <DreamShell />
      </GameProvider>
    </LocaleProvider>
  );
}

function DreamShell() {
  const { state } = useGame();
  const { t } = useLocale();

  useEffect(() => {
    if (state.mode === "menu" || state.mode === "intro" || state.mode === "naming") {
      return;
    }
    saveSnapshot(state);
  }, [state]);

  const showTopBar = state.mode !== "intro" && state.mode !== "naming";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#030616] via-[#060922] to-[#010109] text-slate-100">
      <ParallaxBackdrop />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8">
        {showTopBar && <TopBar />}
        <main className={`mt-6 flex-1 ${showTopBar ? "" : "flex items-center"}`}>
          {state.mode === "menu" && <MainMenu />}
          {state.mode === "intro" && <IntroSequence />}
          {state.mode === "naming" && <HeroNameModal />}
          {state.mode === "dialogue" && <DialogueView />}
          {state.mode === "exploration" && <ExplorationView />}
          {state.mode === "combat" && <CombatView />}
          {state.mode === "ending" && <EndingView />}
        </main>
        {showTopBar && (
          <footer className="mt-auto pb-2 text-center text-xs text-slate-500">
            {t("subtitle")}
          </footer>
        )}
      </div>
    </div>
  );
}

function TopBar() {
  const { state, hydrate } = useGame();
  const { t, toggleLocale, locale } = useLocale();
  const modeKey = `mode_${state.mode}` as TranslationKey;
  const modeLabel = t(modeKey);
  const shardsLabel = t("shardsLabel");

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
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-500/30 bg-white/5 p-4 text-sm text-slate-200 shadow-[0_0_30px_rgba(76,106,255,0.12)] backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-indigo-500/20 p-2 shadow-inner shadow-indigo-500/30">
          <span className="text-lg font-semibold tracking-wide text-indigo-200">
            {t("title")}
          </span>
        </div>
        <span className="hidden text-xs uppercase tracking-widest text-slate-400 md:inline">
          {modeLabel} • {state.shardsCollected}/3 {shardsLabel}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ToolbarButton icon={<Save size={16} />} label={t("saveLocal")} onClick={handleSave} />
        <ToolbarButton icon={<Download size={16} />} label={t("loadLocal")} onClick={handleLoad} />
        <ToolbarButton icon={<Upload size={16} />} label={t("pushRemote")} onClick={handleRemoteSave} />
        <button
          onClick={toggleLocale}
          className="flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/15 px-3 py-1.5 text-xs uppercase tracking-widest text-indigo-100 transition hover:border-indigo-200/70 hover:bg-indigo-500/25"
        >
          <Languages size={16} />
          {locale.toUpperCase()}
        </button>
      </div>
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border border-slate-400/30 bg-slate-800/40 px-3 py-1.5 text-xs uppercase tracking-widest text-slate-200 transition hover:border-indigo-300/60 hover:bg-indigo-500/20"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ParallaxBackdrop() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(88,104,255,0.25),_transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 dream-dots opacity-30" />
      <div className="pointer-events-none absolute inset-0 animate-parallax-slow bg-[radial-gradient(circle_at_center,_rgba(115,159,255,0.18),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 animate-parallax-fast bg-[radial-gradient(circle_at_bottom,_rgba(64,43,88,0.35),_transparent_60%)]" />
    </>
  );
}

export default App;

