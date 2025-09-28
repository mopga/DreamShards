import type { AppState } from "@/state/GameContext";

const STORAGE_KEY = "dream_shards_save_v1";
const VERSION = "1.0.0";

interface SaveFile {
  version: string;
  timestamp: number;
  state: AppState;
}

export function saveSnapshot(state: AppState) {
  const payload: SaveFile = {
    version: VERSION,
    timestamp: Date.now(),
    state,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function loadSnapshot(): SaveFile | null {
  const raw = localStorage.getItem(STORAGE_KEY);
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
  localStorage.removeItem(STORAGE_KEY);
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
