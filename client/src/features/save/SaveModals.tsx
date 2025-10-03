import React from "react";
import { useLocale } from "@/state/LocaleContext";
import type { SaveFile } from "@/features/save/saveSystem";

function useFormattedTimestamp(timestamp: number) {
  const { locale } = useLocale();
  return React.useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(timestamp));
    } catch {
      return new Date(timestamp).toLocaleString();
    }
  }, [timestamp, locale]);
}

function ModalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur" />
      <div className="relative max-h-[80vh] w-full max-w-lg overflow-hidden rounded-3xl border border-indigo-400/30 bg-slate-900/95 p-6 text-slate-100 shadow-[0_0_40px_rgba(90,126,255,0.25)]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-indigo-600/20 via-transparent to-purple-600/20" />
        {children}
      </div>
    </div>
  );
}

export function SaveModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}) {
  const { t, locale } = useLocale();
  const [name, setName] = React.useState("");
  const [suggested, setSuggested] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    const formatter = new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const label = formatter.format(new Date());
    const suggestion = `${t("saveDefaultNamePrefix")} ${label}`;
    setSuggested(suggestion);
    setName(suggestion);
  }, [isOpen, locale, t]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    const trimmed = name.trim();
    onConfirm(trimmed || suggested);
  };

  return (
    <ModalShell>
      <h2 className="text-xl font-semibold text-indigo-100">{t("saveModalTitle")}</h2>
      <p className="mt-2 text-sm text-slate-300">{t("saveModalDescription")}</p>
      <div className="mt-5 space-y-2">
        <label className="block text-xs uppercase tracking-widest text-indigo-200/80">
          {t("saveNameLabel")}
        </label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("saveNamePlaceholder")}
          className="w-full rounded-full border border-indigo-400/40 bg-slate-950/60 px-5 py-3 text-center text-sm tracking-wide text-indigo-100 outline-none transition focus:border-indigo-200/80 focus:bg-slate-900"
        />
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-full border border-slate-500/50 bg-slate-800/50 px-4 py-2 text-xs uppercase tracking-widest text-slate-200 transition hover:border-slate-300/60 hover:bg-slate-700/60"
        >
          {t("commonCancel")}
        </button>
        <button
          onClick={handleSubmit}
          className="rounded-full border border-indigo-300/60 bg-indigo-500/40 px-4 py-2 text-xs uppercase tracking-widest text-indigo-100 transition hover:border-indigo-200/80 hover:bg-indigo-500/60"
        >
          {t("saveConfirm")}
        </button>
      </div>
    </ModalShell>
  );
}

export function LoadModal({
  isOpen,
  onClose,
  onSelect,
  saves,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (save: SaveFile) => void;
  saves: SaveFile[];
}) {
  const { t } = useLocale();

  if (!isOpen) {
    return null;
  }

  return (
    <ModalShell>
      <h2 className="text-xl font-semibold text-indigo-100">{t("loadModalTitle")}</h2>
      <p className="mt-2 text-sm text-slate-300">{t("loadModalDescription")}</p>
      <div className="mt-5 max-h-60 space-y-3 overflow-y-auto pr-2">
        {saves.length === 0 ? (
          <p className="text-sm text-slate-400">{t("loadModalEmpty")}</p>
        ) : (
          saves.map((save) => (
            <LoadEntry key={save.id} save={save} onSelect={onSelect} />
          ))
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="rounded-full border border-slate-500/50 bg-slate-800/50 px-4 py-2 text-xs uppercase tracking-widest text-slate-200 transition hover:border-slate-300/60 hover:bg-slate-700/60"
        >
          {t("commonClose")}
        </button>
      </div>
    </ModalShell>
  );
}

function LoadEntry({ save, onSelect }: { save: SaveFile; onSelect: (save: SaveFile) => void }) {
  const { t } = useLocale();
  const formatted = useFormattedTimestamp(save.timestamp);
  const title = save.kind === "auto" ? t("saveAutoLabel") : save.name || t("saveUnnamed");

  return (
    <button
      onClick={() => onSelect(save)}
      className="w-full rounded-2xl border border-indigo-400/30 bg-slate-800/60 px-4 py-3 text-left transition hover:border-indigo-200/60 hover:bg-slate-800"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-indigo-100">{title}</p>
          <p className="text-xs uppercase tracking-widest text-indigo-200/70">{save.kind === "manual" ? t("saveManualLabel") : t("saveAutoLabel")}</p>
        </div>
        <span className="text-xs text-slate-300">{formatted}</span>
      </div>
    </button>
  );
}

export function ConfirmLatestModal({
  isOpen,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useLocale();

  if (!isOpen) {
    return null;
  }

  return (
    <ModalShell>
      <h2 className="text-xl font-semibold text-indigo-100">{t("confirmLatestTitle")}</h2>
      <p className="mt-2 text-sm text-slate-300">{t("confirmLatestMessage")}</p>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-full border border-slate-500/50 bg-slate-800/50 px-4 py-2 text-xs uppercase tracking-widest text-slate-200 transition hover:border-slate-300/60 hover:bg-slate-700/60"
        >
          {t("confirmLatestCancel")}
        </button>
        <button
          onClick={onConfirm}
          className="rounded-full border border-indigo-300/60 bg-indigo-500/40 px-4 py-2 text-xs uppercase tracking-widest text-indigo-100 transition hover:border-indigo-200/80 hover:bg-indigo-500/60"
        >
          {t("confirmLatestConfirm")}
        </button>
      </div>
    </ModalShell>
  );
}
