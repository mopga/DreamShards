import React, { createContext, useContext, useMemo, useReducer } from "react";
import type { DialogueNode, GameState, ProgressionState } from "@shared/types";
import { selectHeroName, isHeroNameValid } from "@shared/selectors";
import { dialogueBeach, palaceLayout, progressionLevels, skillUnlocks } from "./content";
import { encounters, type EncounterDefinition } from "./encounters";
import { partyActors, type PartyMemberId } from "./party";
import { itemCatalog } from "./items";

export type GameMode =
  | "menu"
  | "intro_world"
  | "intro_birth"
  | "naming"
  | "intro_beach"
  | "dialogue"
  | "exploration"
  | "combat"
  | "ending";

interface SkillUnlockNotification {
  actorId: string;
  skillId: string;
}

interface DialogueSession {
  scriptId: "beach";
  nodes: DialogueNode[];
  currentId: string;
}

type RoomState = {
  shardCollected?: boolean;
};

export interface AppState extends GameState {
  mode: GameMode;
  dialogue?: DialogueSession;
  activeEncounterId?: string;
  log: string[];
  skillUnlockQueue: SkillUnlockNotification[];
  roomStates: Record<string, RoomState>;
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
  completeWorldIntro(): void;
  completeBirthIntro(): void;
  completeBeachIntro(): void;
  confirmHeroName(name: string): void;
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
  acknowledgeSkillUnlock(): void;
  resetToMenu(): void;
}

function isAllowedLogEntry(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return false;
  if (/reached level/i.test(trimmed) || (/достиг/i.test(trimmed) && /уровн/i.test(trimmed))) {
    return true;
  }
  if (/mastered/i.test(trimmed) || /осво(ил|ила)/i.test(trimmed)) {
    return true;
  }
  if (/^Collected\b/i.test(trimmed) || /^Собран/i.test(trimmed)) {
    return true;
  }
  if (/^Cleared\b/i.test(trimmed)) {
    return true;
  }
  if (/комната/i.test(trimmed) && (/(зачищена|очищена)/i.test(trimmed))) {
    return true;
  }
  return false;
}

function appendAllowedLog(log: string[], message: string): string[] {
  if (!isAllowedLogEntry(message)) {
    return log;
  }
  return [...log, message].slice(-20);
}

function appendAllowedLogs(log: string[], messages: readonly string[]): string[] {
  if (!messages.length) {
    return log;
  }
  return messages.reduce((current, message) => appendAllowedLog(current, message), log);
}

function createInitialState(): AppState {
  const progression: ProgressionState = { level: 1, xp: 0 };
  const flags: Record<string, boolean> = {};
  const { unlockedSkills } = evaluateSkillUnlocks({
    unlockedSkills: {},
    progression,
    shardsCollected: 0,
    flags,
    suppressNotifications: true,
  });

  return {
    mode: "menu",
    flags,
    shardsCollected: 0,
    party: ["hero", "lister"],
    inventory: [{ id: "dream_tonic", qty: 2 }],
    location: { roomId: palaceLayout.rooms[0]?.id ?? "entry" },
    heroName: "",
    log: [],
    progression,
    companionLevel: progression.level,
    unlockedSkills,
    skillUnlockQueue: [],
    roomStates: createInitialRoomStates(flags),
  };
}

const initialState = createInitialState();

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

function createInitialRoomStates(flags: Record<string, boolean>) {
  return palaceLayout.rooms.reduce<Record<string, RoomState>>((acc, room) => {
    const shardCollected = room.shardId ? Boolean(flags[room.shardId]) : false;
    acc[room.id] = shardCollected ? { shardCollected: true } : {};
    return acc;
  }, {});
}

const MAX_LEVEL = Math.max(1, progressionLevels.length - 1);
const DIFFICULTY_PER_SHARD = 0.12;

interface EvaluateSkillUnlocksOptions {
  unlockedSkills: Record<string, string[]>;
  progression: ProgressionState;
  shardsCollected: number;
  flags: Record<string, boolean>;
  suppressNotifications?: boolean;
}

function calculateLevelFromXp(xp: number): number {
  let level = 1;
  for (let index = 0; index < progressionLevels.length; index += 1) {
    const threshold = progressionLevels[index];
    if (xp >= threshold) {
      level = index + 1;
    } else {
      break;
    }
  }
  return Math.min(level, MAX_LEVEL);
}

function getDifficultyModifier(shardsCollected: number) {
  return 1 + shardsCollected * DIFFICULTY_PER_SHARD;
}

function evaluateSkillUnlocks({
  unlockedSkills,
  progression,
  shardsCollected,
  flags,
  suppressNotifications = false,
}: EvaluateSkillUnlocksOptions) {
  const result: Record<string, string[]> = {};
  const queue: SkillUnlockNotification[] = [];
  const actorIds = new Set<string>([
    ...Object.keys(skillUnlocks),
    ...Object.keys(unlockedSkills ?? {}),
  ]);

  actorIds.forEach((actorId) => {
    const definitions = skillUnlocks[actorId] ?? [];
    const existingList = unlockedSkills[actorId] ? [...unlockedSkills[actorId]] : [];
    const existingSet = new Set(existingList);

    definitions.forEach((definition) => {
      const meetsLevel = definition.requires.level
        ? progression.level >= definition.requires.level
        : true;
      const meetsShards = definition.requires.shards
        ? shardsCollected >= definition.requires.shards
        : true;
      if (meetsLevel && meetsShards && !existingSet.has(definition.skillId)) {
        existingSet.add(definition.skillId);
        existingList.push(definition.skillId);
        if (!suppressNotifications) {
          queue.push({ actorId, skillId: definition.skillId });
        }
      }
    });

    if (
      actorId === "lister" &&
      flags.unlockCompanionSkill &&
      !existingSet.has("twin_resonance")
    ) {
      existingSet.add("twin_resonance");
      existingList.push("twin_resonance");
      if (!suppressNotifications) {
        queue.push({ actorId, skillId: "twin_resonance" });
      }
    }

    const orderedIds = (skillUnlocks[actorId] ?? []).map((definition) => definition.skillId);
    const ordered = orderedIds.filter((skillId) => existingSet.has(skillId));
    const extras = existingList.filter((skillId) => !ordered.includes(skillId));
    result[actorId] = [...ordered, ...extras.filter((skillId, index) => extras.indexOf(skillId) === index)];
  });

  return { unlockedSkills: result, newlyUnlocked: queue };
}

function recalculateSkillUnlockState(
  state: AppState,
  options: {
    unlockedSkills?: Record<string, string[]>;
    progression?: ProgressionState;
    shardsCollected?: number;
    flags?: Record<string, boolean>;
    suppressNotifications?: boolean;
    queueOverride?: SkillUnlockNotification[];
  } = {},
) {
  const evaluation = evaluateSkillUnlocks({
    unlockedSkills: options.unlockedSkills ?? state.unlockedSkills,
    progression: options.progression ?? state.progression,
    shardsCollected: options.shardsCollected ?? state.shardsCollected,
    flags: options.flags ?? state.flags,
    suppressNotifications: options.suppressNotifications,
  });

  const baseQueue = options.queueOverride ?? state.skillUnlockQueue ?? [];
  if (options.suppressNotifications) {
    return { unlockedSkills: evaluation.unlockedSkills, skillUnlockQueue: baseQueue };
  }

  const additions = evaluation.newlyUnlocked.filter(
    (notification) =>
      !baseQueue.some(
        (queued) => queued.actorId === notification.actorId && queued.skillId === notification.skillId,
      ),
  );

  if (!additions.length) {
    return { unlockedSkills: evaluation.unlockedSkills, skillUnlockQueue: baseQueue };
  }

  return {
    unlockedSkills: evaluation.unlockedSkills,
    skillUnlockQueue: [...baseQueue, ...additions],
  };
}

function calculateXpReward(encounter: EncounterDefinition | undefined, shardsCollected: number) {
  if (!encounter) return 0;
  const baseXp = encounter.enemies.reduce((acc, actor) => acc + (actor.xp ?? 0), 0);
  if (baseXp <= 0) return 0;
  return Math.round(baseXp * getDifficultyModifier(shardsCollected));
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
      return { ...createInitialState(), mode: "intro_world" };
    case "COMPLETE_WORLD_INTRO":
      return { ...state, mode: "intro_birth" };
    case "COMPLETE_BIRTH_INTRO":
      return { ...state, mode: "naming" };
    case "SET_HERO_NAME": {
      const submitted = typeof action.payload === "string" ? action.payload.trim() : "";
      const heroName = submitted && isHeroNameValid(submitted) ? submitted : "";
      const nextFlags = { ...state.flags, heroNamed: true };
      return {
        ...state,
        heroName,
        flags: nextFlags,
        shardsCollected: countShards(nextFlags),
        mode: "intro_beach",
      };
    }
    case "COMPLETE_BEACH_INTRO": {
      const nextFlags = { ...state.flags, introSeen: true };
      return {
        ...state,
        flags: nextFlags,
        shardsCollected: countShards(nextFlags),
        mode: "dialogue",
        dialogue: { scriptId: "beach", nodes: dialogueBeach, currentId: "start" },
        log: appendAllowedLog(state.log, "The moonlit shore fades behind you."),
      };
    }
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
          log: appendAllowedLog(state.log, "Lister's words linger like foam."),
        };
      }

      return {
        ...state,
        flags,
        shardsCollected: countShards(flags),
        dialogue: { ...dialogue, currentId: nextId },
      };
    }
    case "MOVE_ROOM": {
      const roomId: string = action.payload;
      const targetRoom = palaceLayout.rooms.find((entry) => entry.id === roomId);
      let mode: GameMode = "exploration";
      let activeEncounterId: string | undefined;

      if (targetRoom?.type === "shard" && targetRoom.guardEncounter) {
        const guardCleared = state.flags[`encounter_${targetRoom.guardEncounter}_cleared`];
        const shardCollected =
          state.roomStates[targetRoom.id]?.shardCollected ||
          (targetRoom.shardId ? state.flags[targetRoom.shardId] : false);

        if (!guardCleared && !shardCollected) {
          mode = "combat";
          activeEncounterId = targetRoom.guardEncounter;
        }
      }

      return {
        ...state,
        location: { roomId },
        mode,
        activeEncounterId,
      };
    }
    case "COLLECT_SHARD": {
      const shardId: string = action.payload;
      if (state.flags[shardId]) return state;
      const flags = { ...state.flags, [shardId]: true };
      const shardsCollected = countShards(flags);
      const unlockUpdate = recalculateSkillUnlockState(state, { flags, shardsCollected });
      const roomId = state.location.roomId;
      const currentRoom = palaceLayout.rooms.find((entry) => entry.id === roomId);
      const shardCollectedInRoom = currentRoom?.shardId === shardId;
      const roomStates = shardCollectedInRoom
        ? {
            ...state.roomStates,
            [roomId]: { ...(state.roomStates[roomId] ?? {}), shardCollected: true },
          }
        : state.roomStates;
      return {
        ...state,
        flags,
        shardsCollected,
        unlockedSkills: unlockUpdate.unlockedSkills,
        skillUnlockQueue: unlockUpdate.skillUnlockQueue,
        roomStates,
        log: appendAllowedLog(state.log, `Collected ${shardId}.`),
      };
    }
    case "START_ENCOUNTER":
      return { ...state, mode: "combat", activeEncounterId: action.payload };
    case "RESOLVE_COMBAT": {
      const { encounterId, victory, rewards, messages } = action.payload as CombatResolution;
      let flags = state.flags;
      let inventory = state.inventory;
      let mode: GameMode = "exploration";
      let log = appendAllowedLogs(state.log, messages ?? []);
      let progression = state.progression ?? { level: 1, xp: 0 };
      let companionLevel = state.companionLevel ?? progression.level;
      let unlockedSkills = state.unlockedSkills ?? {};
      let skillUnlockQueue = state.skillUnlockQueue ?? [];
      let roomStates = state.roomStates;

      if (victory) {
        const clearedFlag = `encounter_${encounterId}_cleared`;
        flags = { ...flags, [clearedFlag]: true };
        inventory = applyItemRewards(inventory, rewards?.items);
        const guardRoom = palaceLayout.rooms.find((room) => room.guardEncounter === encounterId);
        let shardAwarded = false;

        if (guardRoom) {
          log = appendAllowedLog(log, `Cleared ${guardRoom.id}.`);
          roomStates = {
            ...roomStates,
            [guardRoom.id]: {
              ...(roomStates[guardRoom.id] ?? {}),
              shardCollected: true,
            },
          };

          if (guardRoom.shardId && !flags[guardRoom.shardId]) {
            flags = { ...flags, [guardRoom.shardId]: true };
            log = appendAllowedLog(log, `Collected ${guardRoom.shardId}.`);
          }

          shardAwarded = true;
        }

        if (rewards?.shards && !shardAwarded) {
          for (let i = 0; i < rewards.shards; i += 1) {
            const slot = findNextShardSlot(flags);
            if (slot) {
              flags = { ...flags, [slot]: true };
            }
          }
        }

        const encounter = encounters[encounterId];
        const xpReward = calculateXpReward(encounter, state.shardsCollected);
        if (xpReward > 0) {
          const totalXp = progression.xp + xpReward;
          const nextLevel = calculateLevelFromXp(totalXp);
          const leveledUp = nextLevel > progression.level;
          progression = { level: nextLevel, xp: totalXp };
          if (leveledUp) {
            companionLevel = nextLevel;
            const heroLabel = selectHeroName(state) || state.heroName || "Hero";
            log = appendAllowedLog(log, `${heroLabel} reached level ${nextLevel}!`);
          }
        }

        if (encounterId === palaceLayout.bossEncounterId) {
          flags = { ...flags, bossDefeated: true };
          mode = "ending";
        }
      } else {
        mode = "dialogue";
      }

      const shardsCollected = countShards(flags);
      const unlockUpdate = recalculateSkillUnlockState(state, {
        unlockedSkills,
        progression,
        shardsCollected,
        flags,
        queueOverride: skillUnlockQueue,
      });
      unlockedSkills = unlockUpdate.unlockedSkills;
      skillUnlockQueue = unlockUpdate.skillUnlockQueue;

      return {
        ...state,
        flags,
        shardsCollected,
        progression,
        companionLevel,
        unlockedSkills,
        skillUnlockQueue,
        mode,
        activeEncounterId: undefined,
        inventory,
        log,
        roomStates,
        dialogue:
          mode === "dialogue"
            ? { scriptId: "beach" as const, nodes: dialogueBeach, currentId: "start" }
            : state.dialogue,
      };
    }
    case "SET_FLAG": {
      const { key, value } = action.payload as { key: string; value: boolean };
      const flags = { ...state.flags, [key]: value };
      const shardsCollected = countShards(flags);
      const unlockUpdate = recalculateSkillUnlockState(state, { flags, shardsCollected });
      let roomStates = state.roomStates;

      if (value) {
        const shardRoom = palaceLayout.rooms.find((room) => room.shardId === key);
        if (shardRoom) {
          roomStates = {
            ...roomStates,
            [shardRoom.id]: {
              ...(roomStates[shardRoom.id] ?? {}),
              shardCollected: true,
            },
          };
        }
      }
      return {
        ...state,
        flags,
        shardsCollected,
        unlockedSkills: unlockUpdate.unlockedSkills,
        skillUnlockQueue: unlockUpdate.skillUnlockQueue,
        roomStates,
      };
    }
    case "ADD_LOG":
      return { ...state, log: appendAllowedLog(state.log, action.payload) };
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
      const base = createInitialState();
      const flags = snapshot.flags ?? base.flags;
      const progression = snapshot.progression ?? base.progression;
      const shardsCollected = snapshot.shardsCollected ?? countShards(flags);
      const roomStates = snapshot.roomStates ?? createInitialRoomStates(flags);
      const evaluation = evaluateSkillUnlocks({
        unlockedSkills: snapshot.unlockedSkills ?? base.unlockedSkills,
        progression,
        shardsCollected,
        flags,
        suppressNotifications: true,
      });
      return {
        ...base,
        ...snapshot,
        flags,
        shardsCollected,
        progression,
        companionLevel: snapshot.companionLevel ?? progression.level,
        unlockedSkills: evaluation.unlockedSkills,
        skillUnlockQueue: snapshot.skillUnlockQueue ?? [],
        roomStates,
        heroName: snapshot.heroName || "",
        dialogue:
          snapshot.mode === "dialogue"
            ? { scriptId: "beach", nodes: dialogueBeach, currentId: snapshot.dialogue?.currentId ?? "start" }
            : snapshot.dialogue,
      };
    }
    case "CONSUME_SKILL_UNLOCK": {
      const [, ...rest] = state.skillUnlockQueue ?? [];
      return { ...state, skillUnlockQueue: rest };
    }
    case "RESET_TO_MENU":
      return createInitialState();
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
      completeWorldIntro: () => dispatch({ type: "COMPLETE_WORLD_INTRO" }),
      completeBirthIntro: () => dispatch({ type: "COMPLETE_BIRTH_INTRO" }),
      completeBeachIntro: () => dispatch({ type: "COMPLETE_BEACH_INTRO" }),
      confirmHeroName: (name) => dispatch({ type: "SET_HERO_NAME", payload: name }),
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
      acknowledgeSkillUnlock: () => dispatch({ type: "CONSUME_SKILL_UNLOCK" }),
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
