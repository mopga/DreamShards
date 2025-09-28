import React, { createContext, useContext, useMemo, useReducer } from "react";
import type { DialogueNode, GameState } from "@shared/types";
import { dialogueBeach, palaceLayout } from "./content";
import { encounters, type EncounterDefinition } from "./encounters";
import { partyActors, type PartyMemberId } from "./party";
import { itemCatalog } from "./items";

export type GameMode = "menu" | "dialogue" | "exploration" | "combat" | "ending";

interface DialogueSession {
  scriptId: "beach";
  nodes: DialogueNode[];
  currentId: string;
}

export interface AppState extends GameState {
  mode: GameMode;
  dialogue?: DialogueSession;
  activeEncounterId?: string;
  log: string[];
}

export interface CombatResolution {
  encounterId: string;
  victory: boolean;
  messages: string[];
  rewards?: EncounterDefinition["reward"];
}

interface GameContextValue {
  state: AppState;
  startNewGame(): void;
  setMode(mode: GameMode): void;
  openDialogue(session?: DialogueSession): void;
  advanceDialogue(nextId: string, setFlags?: Record<string, boolean>): void;
  moveToRoom(roomId: string): void;
  collectShard(shardId: string): void;
  startEncounter(encounterId: string): void;
  resolveCombat(result: CombatResolution): void;
  setFlag(key: string, value: boolean): void;
  addLogEntry(message: string): void;
  adjustInventory(itemId: string, delta: number): void;
  hydrate(snapshot: AppState): void;
  resetToMenu(): void;
}

const initialState: AppState = {
  mode: "menu",
  flags: {},
  shardsCollected: 0,
  party: ["dreamer", "senna", "io"],
  inventory: [{ id: "dream_tonic", qty: 2 }],
  location: { roomId: palaceLayout.rooms[0]?.id ?? "entry" },
  log: [],
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

function countShards(flags: Record<string, boolean>) {
  return ["shard1", "shard2", "shard3"].reduce((acc, key) => (flags[key] ? acc + 1 : acc), 0);
}

function findNextShardSlot(flags: Record<string, boolean>) {
  for (const key of ["shard1", "shard2", "shard3"]) {
    if (!flags[key]) return key;
  }
  return undefined;
}

function applyItemRewards(
  inventory: AppState["inventory"],
  rewards: Array<{ id: string; qty: number }> | undefined,
) {
  if (!rewards?.length) return inventory;
  const slots = inventory.map((entry) => ({ ...entry }));
  for (const reward of rewards) {
    const existing = slots.find((entry) => entry.id === reward.id);
    if (existing) {
      existing.qty += reward.qty;
    } else {
      slots.push({ id: reward.id, qty: reward.qty });
    }
  }
  return slots;
}

function reducer(state: AppState, action: any): AppState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.payload };
    case "START_NEW_GAME":
      return {
        ...initialState,
        mode: "dialogue",
        dialogue: { scriptId: "beach", nodes: dialogueBeach, currentId: "start" },
      };
    case "OPEN_DIALOGUE":
      return { ...state, mode: "dialogue", dialogue: action.payload };
    case "ADVANCE_DIALOGUE": {
      const { nextId, setFlags } = action.payload as {
        nextId: string;
        setFlags?: Record<string, boolean>;
      };

      let flags = state.flags;
      if (setFlags) {
        flags = { ...flags };
        for (const [key, value] of Object.entries(setFlags)) {
          flags[key] = value;
        }
      }

      const dialogue = state.dialogue;
      if (!dialogue) return state;
      const nextNode = dialogue.nodes.find((node) => node.id === nextId);
      if (!nextNode) return state;

      if (nextNode.end) {
        return {
          ...state,
          flags,
          shardsCollected: countShards(flags),
          dialogue: undefined,
          mode: "exploration",
          log: [...state.log, "Lister's words linger like foam."].slice(-20),
        };
      }

      return {
        ...state,
        flags,
        shardsCollected: countShards(flags),
        dialogue: { ...dialogue, currentId: nextId },
      };
    }
    case "MOVE_ROOM":
      return { ...state, location: { roomId: action.payload } };
    case "COLLECT_SHARD": {
      const shardId: string = action.payload;
      if (state.flags[shardId]) return state;
      const flags = { ...state.flags, [shardId]: true };
      return {
        ...state,
        flags,
        shardsCollected: countShards(flags),
        log: [...state.log, `Collected ${shardId}.`].slice(-20),
      };
    }
    case "START_ENCOUNTER":
      return { ...state, mode: "combat", activeEncounterId: action.payload };
    case "RESOLVE_COMBAT": {
      const { encounterId, victory, messages, rewards } = action.payload as CombatResolution;
      let flags = state.flags;
      let inventory = state.inventory;
      let mode: GameMode = "exploration";
      let log = [...state.log, ...messages].slice(-20);

      if (victory) {
        const clearedFlag = `encounter_${encounterId}_cleared`;
        flags = { ...flags, [clearedFlag]: true };
        inventory = applyItemRewards(inventory, rewards?.items);
        if (rewards?.shards) {
          for (let i = 0; i < rewards.shards; i++) {
            const slot = findNextShardSlot(flags);
            if (slot) flags = { ...flags, [slot]: true };
          }
        }
        if (encounterId === palaceLayout.bossEncounterId) {
          flags = { ...flags, bossDefeated: true };
          mode = "ending";
          log = [...log, "The Avatar dissolves into quiet surf."].slice(-20);
        }
      } else {
        mode = "dialogue";
        log = [...log, "Fear presses down. Lister pulls you back to the shore."].slice(-20);
      }

      return {
        ...state,
        flags,
        shardsCollected: countShards(flags),
        mode,
        activeEncounterId: undefined,
        inventory,
        log,
        dialogue:
          mode === "dialogue"
            ? { scriptId: "beach", nodes: dialogueBeach, currentId: "start" }
            : state.dialogue,
      };
    }
    case "SET_FLAG": {
      const flags = { ...state.flags, [action.payload.key]: action.payload.value };
      return { ...state, flags, shardsCollected: countShards(flags) };
    }
    case "ADD_LOG":
      return { ...state, log: [...state.log, action.payload].slice(-20) };
    case "ADJUST_INVENTORY": {
      const { itemId, delta } = action.payload as { itemId: string; delta: number };
      const inventory = state.inventory.map((entry) => ({ ...entry }));
      const slot = inventory.find((entry) => entry.id === itemId);
      if (slot) {
        slot.qty += delta;
      } else if (delta > 0) {
        inventory.push({ id: itemId, qty: delta });
      }
      const filtered = inventory.filter((entry) => entry.qty > 0);
      return { ...state, inventory: filtered };
    }
    case "LOAD_SNAPSHOT": {
      const snapshot = action.payload as AppState;
      return {
        ...snapshot,
        dialogue:
          snapshot.mode === "dialogue"
            ? { scriptId: "beach", nodes: dialogueBeach, currentId: snapshot.dialogue?.currentId ?? "start" }
            : snapshot.dialogue,
      };
    }
    case "RESET_TO_MENU":
      return { ...initialState };
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      startNewGame: () => dispatch({ type: "START_NEW_GAME" }),
      setMode: (mode) => dispatch({ type: "SET_MODE", payload: mode }),
      openDialogue: (
        session = { scriptId: "beach" as const, nodes: dialogueBeach, currentId: "start" },
      ) => dispatch({ type: "OPEN_DIALOGUE", payload: session }),
      advanceDialogue: (nextId, setFlags) =>
        dispatch({ type: "ADVANCE_DIALOGUE", payload: { nextId, setFlags } }),
      moveToRoom: (roomId) => dispatch({ type: "MOVE_ROOM", payload: roomId }),
      collectShard: (shardId) => dispatch({ type: "COLLECT_SHARD", payload: shardId }),
      startEncounter: (encounterId) => dispatch({ type: "START_ENCOUNTER", payload: encounterId }),
      resolveCombat: (result) => dispatch({ type: "RESOLVE_COMBAT", payload: result }),
      setFlag: (key, value) => dispatch({ type: "SET_FLAG", payload: { key, value } }),
      addLogEntry: (message) => dispatch({ type: "ADD_LOG", payload: message }),
      adjustInventory: (itemId, delta) =>
        dispatch({ type: "ADJUST_INVENTORY", payload: { itemId, delta } }),
      hydrate: (snapshot) => dispatch({ type: "LOAD_SNAPSHOT", payload: snapshot }),
      resetToMenu: () => dispatch({ type: "RESET_TO_MENU" }),
    }),
    [state],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return ctx;
}

export function getPartyLineup(party: GameState["party"]) {
  return party.map((id) => partyActors[id as PartyMemberId]).filter(Boolean);
}

export function getEncounter(encounterId?: string) {
  if (!encounterId) return undefined;
  return encounters[encounterId];
}

export function getDialogueNode(nodes: DialogueNode[], id: string) {
  return nodes.find((node) => node.id === id);
}

export function getItemName(id: string) {
  return itemCatalog[id]?.name ?? id;
}
