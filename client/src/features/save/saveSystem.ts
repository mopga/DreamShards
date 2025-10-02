import type { AppState } from "@/state/GameContext";

const STORAGE_KEY = "dream_shards_save_v1";
const VERSION = "1.0.0";
const SNAPSHOT_EVENT = "dreamshards:snapshot-updated";

export interface SaveFile {
  version: string;
  timestamp: number;
  state: AppState;
}

declare global {
  interface WindowEventMap {
    "dreamshards:snapshot-updated": CustomEvent<SaveFile | null>;
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

function dispatchSnapshotEvent(snapshot: SaveFile | null) {
  if (typeof window === "undefined") {
    return;
  }
  const event = new CustomEvent(SNAPSHOT_EVENT, { detail: snapshot });
  window.dispatchEvent(event);
}

export function saveSnapshot(state: AppState) {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  const payload: SaveFile = {
    version: VERSION,
    timestamp: Date.now(),
    state,
  };
  storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  dispatchSnapshotEvent(payload);
  return payload;
}

export function loadSnapshot(): SaveFile | null {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SaveFile;
    return parsed;
  } catch (error) {
    console.warn("Failed to parse save file", error);
    return null;
  }
}

export function clearSnapshot() {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.removeItem(STORAGE_KEY);
  dispatchSnapshotEvent(null);
}

export function subscribeToSnapshotChange(
  listener: (snapshot: SaveFile | null) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = (event: Event) => {
    const custom = event as CustomEvent<SaveFile | null>;
    listener(custom.detail ?? null);
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
