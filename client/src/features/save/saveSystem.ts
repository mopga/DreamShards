import type { AppState } from "@/state/GameContext";

const STORAGE_KEY = "dream_shards_save_v1";
const VERSION = "1.1.0";
const SNAPSHOT_EVENT = "dreamshards:snapshot-updated";
const AUTO_SAVE_ID = "autosave";

export type SaveKind = "auto" | "manual";

export interface SaveFile {
  id: string;
  name: string;
  version: string;
  timestamp: number;
  state: AppState;
  kind: SaveKind;
}

declare global {
  interface WindowEventMap {
    "dreamshards:snapshot-updated": CustomEvent<SaveFile[]>;
  }
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage;
  } catch (error) {
    console.warn("Local storage unavailable", error);
    return null;
  }
}

function dispatchSnapshotEvent(snapshot: SaveFile[]) {
  if (typeof window === "undefined") {
    return;
  }
  const event = new CustomEvent(SNAPSHOT_EVENT, { detail: snapshot });
  window.dispatchEvent(event);
}

function isSaveFile(value: unknown): value is SaveFile {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<SaveFile>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.version === "string" &&
    typeof candidate.timestamp === "number" &&
    typeof candidate.state === "object" &&
    typeof candidate.kind === "string"
  );
}

function sortSaves(saves: SaveFile[]): SaveFile[] {
  return [...saves].sort((a, b) => b.timestamp - a.timestamp);
}

function normalizeParsedSave(parsed: unknown): SaveFile[] {
  if (!parsed) {
    return [];
  }

  if (Array.isArray(parsed)) {
    const valid = parsed.filter(isSaveFile) as SaveFile[];
    return sortSaves(valid);
  }

  const maybeSave = parsed as Partial<SaveFile> & { state?: AppState };
  if (maybeSave && typeof maybeSave === "object" && maybeSave.state) {
    return [
      {
        id: AUTO_SAVE_ID,
        name: typeof maybeSave.name === "string" ? maybeSave.name : "",
        version: maybeSave.version ?? VERSION,
        timestamp: maybeSave.timestamp ?? Date.now(),
        state: maybeSave.state,
        kind: "auto",
      },
    ];
  }

  return [];
}

function readAllSnapshots(): SaveFile[] {
  const storage = getStorage();
  if (!storage) return [];
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return normalizeParsedSave(parsed);
  } catch (error) {
    console.warn("Failed to parse save file", error);
    return [];
  }
}

function writeAllSnapshots(storage: Storage, saves: SaveFile[]) {
  const sorted = sortSaves(saves);
  storage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  dispatchSnapshotEvent(sorted);
}

export function getAllSnapshots(): SaveFile[] {
  return readAllSnapshots();
}

function upsertAutosave(storage: Storage, saves: SaveFile[], state: AppState) {
  const timestamp = Date.now();
  const autosave: SaveFile = {
    id: AUTO_SAVE_ID,
    name: "",
    version: VERSION,
    timestamp,
    state,
    kind: "auto",
  };
  const withoutAuto = saves.filter((save) => save.id !== AUTO_SAVE_ID);
  writeAllSnapshots(storage, [autosave, ...withoutAuto]);
  return autosave;
}

export function saveSnapshot(state: AppState, name?: string) {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const saves = readAllSnapshots();

  if (!name) {
    return upsertAutosave(storage, saves, state);
  }

  const cleanName = name.trim();

  const fallbackName = (() => {
    try {
      return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date());
    } catch {
      return new Date().toISOString();
    }
  })();

  const payload: SaveFile = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: cleanName || fallbackName,
    version: VERSION,
    timestamp: Date.now(),
    state,
    kind: "manual",
  };

  writeAllSnapshots(storage, [payload, ...saves]);
  return payload;
}

export function loadSnapshot(id?: string): SaveFile | null {
  const saves = readAllSnapshots();
  if (!saves.length) return null;

  if (!id) {
    return saves[0];
  }

  return saves.find((save) => save.id === id) ?? null;
}

export function clearSnapshot() {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.removeItem(STORAGE_KEY);
  dispatchSnapshotEvent([]);
}

export function subscribeToSnapshotChange(
  listener: (snapshot: SaveFile[]) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = (event: Event) => {
    const custom = event as CustomEvent<SaveFile[]>;
    listener(custom.detail ?? []);
  };
  window.addEventListener(SNAPSHOT_EVENT, handler);
  return () => {
    window.removeEventListener(SNAPSHOT_EVENT, handler);
  };
}

export async function pushSnapshotToServer(state: AppState) {
  try {
    const response = await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.warn("Remote save failed", error);
    return { ok: false };
  }
}
