import React, { useEffect } from "react";
import { GameProvider, useGame } from "@/state/GameContext";
import { MainMenu } from "@/components/MainMenu";
import { SkillUnlockModal } from "@/features/progression/SkillUnlockModal";
import { DialogueView } from "@/features/dialogue/DialogueView";
import { ExplorationView } from "@/features/exploration/ExplorationView";
import { CombatView } from "@/features/combat/CombatView";
import { EndingView } from "@/components/EndingView";
import {
  getAllSnapshots,
  saveSnapshot,
  subscribeToSnapshotChange,
  type SaveFile,
} from "@/features/save/saveSystem";
import { WorldIntro } from "@/features/intro/WorldIntro";
import { BirthIntro } from "@/features/intro/BirthIntro";
import { BeachArrival } from "@/features/intro/BeachArrival";
import { HeroNameModal } from "@/features/hero/HeroNameModal";
import { useLocale, LocaleProvider, TranslationKey } from "@/state/LocaleContext";
import { progressionLevels } from "@/state/content";
import { Save, Upload, Download, Languages } from "lucide-react";
import { SaveModal, LoadModal, ConfirmLatestModal } from "@/features/save/SaveModals";

export default function App() {
  return (
    <LocaleProvider>
      <GameProvider>
        <DreamShell />
      </GameProvider>
    </LocaleProvider>
  );
}

function DreamShell() {
  const { state, acknowledgeSkillUnlock } = useGame();
  const { t } = useLocale();

  useEffect(() => {
    if (state.mode === "menu" || state.mode === "intro_world" || state.mode === "intro_birth" || state.mode === "intro_beach" || state.mode === "naming") {
      return;
    }
    saveSnapshot(state);
  }, [state]);

  const showTopBar = !["intro_world", "intro_birth", "intro_beach", "naming"].includes(state.mode);
  const pendingUnlock = state.skillUnlockQueue?.[0];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#030616] via-[#060922] to-[#010109] text-slate-100">
      <ParallaxBackdrop />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8">
        {showTopBar && <TopBar />}
        <main className={`mt-6 flex-1 ${showTopBar ? "" : "flex items-center"}`}>
          {state.mode === "menu" && <MainMenu />}
          {state.mode === "intro_world" && <WorldIntro />}
          {state.mode === "intro_birth" && <BirthIntro />}
          {state.mode === "naming" && <HeroNameModal />}
          {state.mode === "intro_beach" && <BeachArrival />}
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
      {pendingUnlock ? (
        <SkillUnlockModal notification={pendingUnlock} onConfirm={acknowledgeSkillUnlock} />
      ) : null}
    </div>
  );
}

function TopBar() {
  const { state, hydrate } = useGame();
  const { t, toggleLocale, locale } = useLocale();
  const [snapshots, setSnapshots] = React.useState<SaveFile[]>(() => getAllSnapshots());
  const [isSaveModalOpen, setSaveModalOpen] = React.useState(false);
  const [isLoadModalOpen, setLoadModalOpen] = React.useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = React.useState(false);
  const modeKey = (`mode_${state.mode}`) as TranslationKey;
  const modeLabel = t(modeKey);
  const shardsLabel = t("shardsLabel");
  const progression = state.progression ?? { level: 1, xp: 0 };
  const maxLevelIndex = progressionLevels.length - 1;
  const nextThreshold = progression.level >= maxLevelIndex ? null : progressionLevels[progression.level];
  const levelLabel = t("levelLabel");
  const xpLabel = t("xpLabel");
  const xpDisplay = nextThreshold !== null ? `${progression.xp}/${nextThreshold}` : `${progression.xp}`;
  const summaryLine = `${modeLabel} | ${state.shardsCollected}/3 ${shardsLabel} | ${levelLabel} ${progression.level} | ${xpDisplay} ${xpLabel}`;

  React.useEffect(() => {
    const unsubscribe = subscribeToSnapshotChange(setSnapshots);
    return unsubscribe;
  }, []);

  const latestSnapshot = snapshots[0] ?? null;
  const hasSnapshot = Boolean(latestSnapshot);

  const handleSave = () => {
    setSaveModalOpen(true);
  };

  const handleLoad = () => {
    setLoadModalOpen(true);
  };

  const handleConfirmSave = (name: string) => {
    saveSnapshot(state, name.trim());
    setSaveModalOpen(false);
  };

  const handleLoadSnapshot = (save: SaveFile) => {
    hydrate(save.state);
    setLoadModalOpen(false);
  };

  const handlePushToShore = () => {
    if (!latestSnapshot) {
      return;
    }
    if (state.mode === "menu") {
      hydrate(latestSnapshot.state);
    } else {
      setConfirmModalOpen(true);
    }
  };

  const handleConfirmLatest = () => {
    if (latestSnapshot) {
      hydrate(latestSnapshot.state);
    }
    setConfirmModalOpen(false);
  };

  const handleCancelConfirm = () => {
    setConfirmModalOpen(false);
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
          {summaryLine}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ToolbarButton icon={<Save size={16} />} label={t("saveLocal")} onClick={handleSave} />
        <ToolbarButton
          icon={<Download size={16} />}
          label={t("loadLocal")}
          onClick={handleLoad}
          disabled={!hasSnapshot}
        />
        <ToolbarButton
          icon={<Upload size={16} />}
          label={t("pushRemote")}
          onClick={handlePushToShore}
          disabled={!hasSnapshot}
        />
        <button
          onClick={toggleLocale}
          className="flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/15 px-3 py-1.5 text-xs uppercase tracking-widest text-indigo-100 transition hover:border-indigo-200/70 hover:bg-indigo-500/25"
        >
          <Languages size={16} />
          {locale.toUpperCase()}
        </button>
      </div>

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onConfirm={handleConfirmSave}
      />
      <LoadModal
        isOpen={isLoadModalOpen}
        onClose={() => setLoadModalOpen(false)}
        saves={snapshots}
        onSelect={handleLoadSnapshot}
      />
      <ConfirmLatestModal
        isOpen={isConfirmModalOpen}
        onCancel={handleCancelConfirm}
        onConfirm={handleConfirmLatest}
      />
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-full border border-slate-400/30 bg-slate-800/40 px-3 py-1.5 text-xs uppercase tracking-widest text-slate-200 transition hover:border-indigo-300/60 hover:bg-indigo-500/20 ${disabled ? "cursor-not-allowed opacity-40 hover:border-slate-400/30 hover:bg-slate-800/40" : ""}`}
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











