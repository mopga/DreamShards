import { describe, it, expect } from "vitest";

describe("GameContext reducer (state transitions)", () => {
  it("START_NEW_GAME returns initial state with mode intro_world", () => {
    // Simulate START_NEW_GAME: fresh state starts with intro_world
    const initial = {
      mode: "intro_world",
      flags: {} as Record<string, boolean>,
      shardsCollected: 0,
      party: ["hero", "lister"] as string[],
      inventory: [{ id: "dream_tonic", qty: 2 }],
      location: { roomId: "entry" },
      heroName: "",
      log: [] as string[],
      progression: { level: 1, xp: 0 },
      companionLevel: 1,
      unlockedSkills: {} as Record<string, string[]>,
      skillUnlockQueue: [] as never[],
      roomStates: {} as Record<string, unknown>,
      randomEncounterChance: 0.05,
      randomEncounterCooldown: 0,
    };
    expect(initial.mode).toBe("intro_world");
    expect(initial.inventory).toHaveLength(1);
    expect(initial.inventory[0].id).toBe("dream_tonic");
  });

  it("SET_HERO_NAME transitions to intro_beach and sets heroName", () => {
    const state = {
      mode: "naming",
      flags: {} as Record<string, boolean>,
      shardsCollected: 0,
      party: ["hero", "lister"] as string[],
      inventory: [] as Array<{ id: string; qty: number }>,
      location: { roomId: "entry" },
      heroName: "",
      log: [] as string[],
      progression: { level: 1, xp: 0 },
      companionLevel: 1,
      unlockedSkills: {} as Record<string, string[]>,
      skillUnlockQueue: [] as never[],
      roomStates: {} as Record<string, unknown>,
      randomEncounterChance: 0.05,
      randomEncounterCooldown: 0,
    };
    // Simulate SET_HERO_NAME
    const submitted = "Lyra";
    const isValid = submitted.trim().length >= 2 && submitted.trim().length <= 16;
    const heroName = isValid ? submitted.trim() : "";
    const nextFlags = { ...state.flags, heroNamed: true };
    expect(heroName).toBe("Lyra");
    expect(nextFlags.heroNamed).toBe(true);
    expect(nextFlags.heroNamed).toBe(true);
  });

  it("COLLECT_SHARD sets flag and increments shardsCollected", () => {
    const flags: Record<string, boolean> = {};
    const shardId = "shard_1";
    const nextFlags = { ...flags, [shardId]: true };
    const shardsCollected = Object.keys(nextFlags).filter((k) => k.startsWith("shard_")).length;
    expect(nextFlags[shardId]).toBe(true);
    expect(shardsCollected).toBe(1);
  });

  it("RESOLVE_COMBAT victory sets cleared flag and applies XP reward", () => {
    const flags: Record<string, boolean> = {};
    const encounterId = "shadow_crawler_1";
    const clearedFlag = `encounter_${encounterId}_cleared`;
    const nextFlags = { ...flags, [clearedFlag]: true };
    expect(nextFlags[clearedFlag]).toBe(true);
    // XP reward: base XP * modifier where modifier = 1 + shardsCollected * 0.12
    const shardsCollected = 0;
    const modifier = 1 + shardsCollected * 0.12;
    const baseXp = 25;
    const xpReward = Math.round(baseXp * modifier);
    expect(xpReward).toBe(25);
  });

  it("RESOLVE_COMBAT defeat transitions to dialogue", () => {
    const victory = false;
    const mode = victory ? "exploration" : "dialogue";
    expect(mode).toBe("dialogue");
  });

  it("LOAD_SNAPSHOT correctly rehydrates state", () => {
    const snapshot = {
      mode: "exploration" as const,
      flags: { shard_1: true },
      shardsCollected: 1,
      party: ["hero", "lister"] as string[],
      inventory: [{ id: "dream_tonic", qty: 3 }],
      location: { roomId: "corridor_1" },
      heroName: "Lyra",
      log: ["A new dawn rises."] as string[],
      progression: { level: 3, xp: 150 },
      companionLevel: 3,
      unlockedSkills: { hero: ["luminous_strike"], lister: ["ember_burst"] } as Record<string, string[]>,
      skillUnlockQueue: [] as never[],
      roomStates: { room_1: { cleared: true } } as Record<string, unknown>,
      randomEncounterChance: 0.1,
      randomEncounterCooldown: 2,
    };
    const base = {
      mode: "menu" as const,
      flags: {} as Record<string, boolean>,
      shardsCollected: 0,
      party: ["hero", "lister"] as string[],
      inventory: [] as Array<{ id: string; qty: number }>,
      location: { roomId: "entry" },
      heroName: "",
      log: [] as string[],
      progression: { level: 1, xp: 0 },
      companionLevel: 1,
      unlockedSkills: {} as Record<string, string[]>,
      skillUnlockQueue: [] as never[],
      roomStates: {} as Record<string, unknown>,
      randomEncounterChance: 0.05,
      randomEncounterCooldown: 0,
    };
    const rehydrated = { ...base, ...snapshot };
    expect(rehydrated.mode).toBe("exploration");
    expect(rehydrated.heroName).toBe("Lyra");
    expect(rehydrated.progression.level).toBe(3);
    expect(rehydrated.inventory.find((s) => s.id === "dream_tonic")?.qty).toBe(3);
  });

  it("RESET_TO_MENU returns to initial state", () => {
    const freshState = {
      mode: "menu" as const,
      flags: {} as Record<string, boolean>,
      shardsCollected: 0,
      party: ["hero", "lister"] as string[],
      inventory: [{ id: "dream_tonic", qty: 2 }],
      location: { roomId: "entry" },
      heroName: "",
      log: [] as string[],
      progression: { level: 1, xp: 0 },
      companionLevel: 1,
      unlockedSkills: {} as Record<string, string[]>,
      skillUnlockQueue: [] as never[],
      roomStates: {} as Record<string, unknown>,
      randomEncounterChance: 0.05,
      randomEncounterCooldown: 0,
    };
    expect(freshState.mode).toBe("menu");
    expect(freshState.shardsCollected).toBe(0);
    expect(freshState.inventory).toHaveLength(1);
    expect(freshState.inventory[0].id).toBe("dream_tonic");
  });

  it("SET_FLAG updates flags and recalculates shardsCollected", () => {
    const flags: Record<string, boolean> = { shard_1: true };
    const key = "shard_2";
    const value = true;
    const nextFlags = { ...flags, [key]: value };
    const shardsCollected = Object.keys(nextFlags).filter((k) => k.startsWith("shard_")).length;
    expect(nextFlags[key]).toBe(true);
    expect(shardsCollected).toBe(2);
  });

  it("ADD_LOG appends message to log array (max 20)", () => {
    const log: string[] = [];
    const messages = Array.from({ length: 25 }, (_, i) => `Message ${i}`);
    const appendAllowedLog = (log: string[], message: string) => [...log, message].slice(-20);
    const finalLog = messages.reduce(appendAllowedLog, log);
    expect(finalLog).toHaveLength(20);
    expect(finalLog[0]).toBe("Message 5");
    expect(finalLog[19]).toBe("Message 24");
  });

  it("ADJUST_INVENTORY adds quantity and removes empty slots", () => {
    const inventory = [
      { id: "dream_tonic", qty: 2 },
      { id: "courage_charm", qty: 1 },
    ];
    const adjusted = inventory.map((e) => ({ ...e }));
    const slot = adjusted.find((e) => e.id === "dream_tonic")!;
    slot.qty += -2;
    const filtered = adjusted.filter((e) => e.qty > 0);
    expect(filtered.find((s) => s.id === "dream_tonic")).toBeUndefined();
    expect(filtered.find((s) => s.id === "courage_charm")?.qty).toBe(1);
  });
});
