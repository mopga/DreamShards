import React from "react";
import {
  loadSnapshot,
  subscribeToSnapshotChange,
  type SaveFile,
} from "@/features/save/saveSystem";
import { useGame } from "@/state/GameContext";
import { useLocale } from "@/state/LocaleContext";

export function MainMenu() {
  const { startNewGame, resetToMenu, hydrate, addLogEntry } = useGame();
  const { t } = useLocale();
  const [snapshot, setSnapshot] = React.useState<SaveFile | null>(() => loadSnapshot());

  React.useEffect(() => {
    const unsubscribe = subscribeToSnapshotChange((saves) => {
      setSnapshot(saves[0] ?? null);
    });
    return unsubscribe;
  }, []);

  const handleContinue = () => {
    if (snapshot) {
      addLogEntry(t("menuLogResume"));
      hydrate(snapshot.state);
    }
  };

  const hasSnapshot = Boolean(snapshot);

  return (
    <div className="relative flex w-full flex-col items-center justify-center gap-10 py-16 text-center">
      <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute bottom-12 left-16 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute right-24 top-10 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="space-y-5">
        <h1 className="text-5xl font-semibold uppercase tracking-[0.4em] text-indigo-100 drop-shadow-md md:text-6xl dream-pulse">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-lg text-base text-indigo-200/80 fade-in-delayed">
          {t("menuDescription")}
        </p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-4">
        <MenuButton onClick={startNewGame} variant="primary">
          {t("begin")}
        </MenuButton>
        <MenuButton onClick={handleContinue} variant="secondary" disabled={!hasSnapshot}>
          {t("continue")}
        </MenuButton>
        <MenuButton onClick={resetToMenu} variant="ghost">
          {t("reset")}
        </MenuButton>
      </div>
    </div>
  );
}

type MenuVariant = "primary" | "secondary" | "ghost";

function MenuButton({
  children,
  onClick,
  variant,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: MenuVariant;
  disabled?: boolean;
}) {
  const base =
    "rounded-full px-10 py-3 text-lg font-medium transition-transform duration-300 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
  const styles: Record<MenuVariant, string> = {
    primary:
      "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-[0_20px_40px_rgba(79,70,229,0.35)] hover:from-indigo-400 hover:to-purple-400",
    secondary:
      "border border-indigo-400/70 text-indigo-100 bg-indigo-500/15 hover:bg-indigo-500/25 shadow-[0_10px_25px_rgba(56,189,248,0.15)]",
    ghost:
      "border border-slate-500/60 text-slate-200 bg-slate-900/40 hover:bg-slate-800/60",
  };

  return (
    <button
      className={`${base} ${styles[variant]} ${
        disabled ? "cursor-not-allowed opacity-50 hover:scale-100" : ""
      }`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
