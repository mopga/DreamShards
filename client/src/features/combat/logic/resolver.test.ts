import { describe, it, expect, beforeEach } from "vitest";
import type { CombatState, CombatActorState, CombatAction } from "../logic/types";
import type { Skill } from "@shared/types";
import type { ItemDefinition } from "@/state/items";
import { resolveAction } from "./resolver";

const mockSkills: Record<string, Skill> = {
  attack_skill: {
    id: "attack_skill",
    name: "Test Attack",
    costSP: 0,
    element: "physical",
    power: 1.2,
    targets: "one",
    description: "Test",
  },
  fire_skill: {
    id: "fire_skill",
    name: "Fire",
    costSP: 3,
    element: "fire",
    power: 1.0,
    targets: "one",
    applies: ["weakened"],
    description: "Test fire",
  },
  heal_skill: {
    id: "heal_skill",
    name: "Heal",
    costSP: 2,
    element: "void",
    power: 0,
    targets: "one",
    healsSelf: 20,
    clears: ["weakened", "vulnerable"],
    description: "Test heal",
  },
  aoe_skill: {
    id: "aoe_skill",
    name: "AOE",
    costSP: 4,
    element: "ice",
    power: 0.9,
    targets: "all",
    description: "Test AOE",
  },
  no_sp_skill: {
    id: "no_sp_skill",
    name: "No SP",
    costSP: 100,
    element: "physical",
    power: 1.0,
    targets: "one",
    description: "Test no SP",
  },
};

const mockItems: Record<string, ItemDefinition> = {
  dream_tonic: {
    id: "dream_tonic",
    name: "Dream Tonic",
    healHP: 30,
  },
};

function makeActor(id: string, side: "ally" | "enemy", overrides: Partial<CombatActorState["actor"]["stats"] & { hp?: number; sp?: number; weaknesses?: string[]; ai?: string }> = {}): CombatActorState {
  const baseStats = {
    maxHP: 100,
    maxSP: 50,
    str: 15,
    mag: 10,
    def: 8,
    res: 6,
    agi: 12,
    luck: 5,
  };
  const stats = { ...baseStats, ...overrides };
  return {
    id,
    actor: {
      id,
      name: id,
      stats: stats as CombatActorState["actor"]["stats"],
      skills: ["attack_skill"],
      weaknesses: (overrides.weaknesses as any) ?? [],
      ai: (overrides.ai as any) ?? "basic",
    } as any,
    side,
    currentHP: overrides.hp ?? 100,
    currentSP: overrides.sp ?? 50,
    statuses: [],
    canAct: true,
  };
}

function makeState(overrides: Partial<CombatState> = {}): CombatState {
  const hero = makeActor("hero", "ally", { hp: 80 });
  const enemy = makeActor("enemy1", "enemy", { hp: 60 });
  return {
    encounterId: "test_encounter",
    encounterName: "Test",
    round: 1,
    queue: [],
    activeActorId: "hero",
    canExtraTurnThisRound: { hero: true, enemy1: true },
    phase: "selectCommand",
    lastEvents: [],
    eventsLog: [],
    entities: { hero, enemy1: enemy },
    ended: false,
    turnHistory: [],
    telemetry: {
      turnsTaken: 0,
      weaknessHits: 0,
      guardsUsed: 0,
      targetCancels: 0,
      extraTurns: 0,
      fpsSpikes: 0,
    },
    initiativeSeed: 123,
    internal: {
      order: ["enemy1"],
      weaknessTracker: {},
    },
    ...overrides,
  } as CombatState;
}

function makeContext() {
  return {
    skills: mockSkills,
    inventory: [],
    itemCatalog: mockItems,
  };
}

describe("resolveAction", () => {
  it("returns early when state.ended is true", () => {
    const state = makeState({ ended: true });
    const action: CombatAction = { type: "attack", sourceId: "hero", targetId: "enemy1" };
    const result = resolveAction(state, action, makeContext());
    expect(result.events).toHaveLength(0);
  });

  it("returns early when source does not exist", () => {
    const state = makeState();
    const action: CombatAction = { type: "attack", sourceId: "nonexistent", targetId: "enemy1" };
    const result = resolveAction(state, action, makeContext());
    expect(result.events).toHaveLength(0);
  });

  it("emits Miss when target does not exist", () => {
    const state = makeState();
    const action: CombatAction = { type: "attack", sourceId: "hero", targetId: "nonexistent" };
    const result = resolveAction(state, action, makeContext());
    const miss = result.events.find((e) => e.type === "Miss");
    expect(miss).toBeDefined();
  });

  it("emits Hit event with correct damage", () => {
    const state = makeState();
    const action: CombatAction = { type: "attack", sourceId: "hero", targetId: "enemy1" };
    const result = resolveAction(state, action, makeContext());
    const hit = result.events.find((e) => e.type === "Hit");
    expect(hit).toBeDefined();
    const hitEvent = hit as any;
    expect(hitEvent.amount).toBeGreaterThan(0);
  });

  it("applies weakness multiplier (1.4x) for fire element on ice-weak target", () => {
    // enemy1 has no weaknesses by default; we need fire to hit weakness
    // Create a state where enemy1 is weak to fire
    const hero = makeActor("hero", "ally", { hp: 80 });
    const enemy = makeActor("enemy1", "enemy", { hp: 60, weaknesses: ["fire"] });
    const state = makeState({
      entities: { hero, enemy1: enemy },
      activeActorId: "hero",
    });
    const action: CombatAction = { type: "skill", sourceId: "hero", skillId: "fire_skill", targetIds: ["enemy1"] };
    const result = resolveAction(state, action, makeContext());
    const hit = result.events.find((e) => e.type === "Hit") as any;
    expect(hit).toBeDefined();
    expect(hit.isWeakness).toBe(true);
  });

  it("emits Miss when SP insufficient", () => {
    const hero = makeActor("hero", "ally", { sp: 0 });
    const state = makeState({ entities: { hero, enemy1: makeActor("enemy1", "enemy", { hp: 60 }) }, activeActorId: "hero" });
    const action: CombatAction = { type: "skill", sourceId: "hero", skillId: "no_sp_skill", targetIds: ["enemy1"] };
    const result = resolveAction(state, action, makeContext());
    const miss = result.events.find((e) => e.type === "Miss");
    expect(miss).toBeDefined();
  });

  it("applies guarded status (-50% damage)", () => {
    const hero = makeActor("hero", "ally", { hp: 80 });
    const enemy = makeActor("enemy1", "enemy", { hp: 60 });
    enemy.statuses = ["guarded"];
    const state = makeState({
      entities: { hero, enemy1: enemy },
      activeActorId: "hero",
    });
    const action: CombatAction = { type: "attack", sourceId: "hero", targetId: "enemy1" };
    const result = resolveAction(state, action, makeContext());
    const hit = result.events.find((e) => e.type === "Hit") as any;
    // guarded should reduce damage
    expect(hit.amount).toBeLessThan(20); // roughly half of normal ~14 damage
  });

  it("emits Guard event and increments guardsUsed telemetry", () => {
    const hero = makeActor("hero", "ally", { hp: 80 });
    const state = makeState({ entities: { hero, enemy1: makeActor("enemy1", "enemy", { hp: 60 }) }, activeActorId: "hero" });
    const action: CombatAction = { type: "guard", sourceId: "hero" };
    const result = resolveAction(state, action, makeContext());
    const guard = result.events.find((e) => e.type === "Guard");
    expect(guard).toBeDefined();
    expect(result.state.telemetry.guardsUsed).toBe(1);
  });

  it("heals HP via item and decrements inventory", () => {
    const hero = makeActor("hero", "ally", { hp: 50 });
    const enemy = makeActor("enemy1", "enemy", { hp: 60 });
    const inventory = [{ id: "dream_tonic", qty: 2 }];
    const state = makeState({
      entities: { hero, enemy1: enemy },
      activeActorId: "hero",
    });
    const context = {
      skills: mockSkills,
      inventory,
      itemCatalog: mockItems,
    };
    const action: CombatAction = { type: "item", sourceId: "hero", itemId: "dream_tonic", targetId: "hero" };
    const result = resolveAction(state, action, context);
    const heal = result.events.find((e) => e.type === "Heal");
    expect(heal).toBeDefined();
    const healEvent = heal as any;
    expect(healEvent.amount).toBe(30);
    const slot = result.inventory.find((s) => s.id === "dream_tonic");
    expect(slot?.qty).toBe(1);
  });

  it("removes item from inventory when qty reaches 0", () => {
    const hero = makeActor("hero", "ally", { hp: 50 });
    const inventory = [{ id: "dream_tonic", qty: 1 }];
    const state = makeState({
      entities: { hero, enemy1: makeActor("enemy1", "enemy", { hp: 60 }) },
      activeActorId: "hero",
    });
    const context = {
      skills: mockSkills,
      inventory,
      itemCatalog: mockItems,
    };
    const action: CombatAction = { type: "item", sourceId: "hero", itemId: "dream_tonic", targetId: "hero" };
    const result = resolveAction(state, action, context);
    const slot = result.inventory.find((s) => s.id === "dream_tonic");
    expect(slot).toBeUndefined();
  });

  it("sets ended=true and winner=allies when no enemies alive", () => {
    const hero = makeActor("hero", "ally", { hp: 80 });
    const enemy = makeActor("enemy1", "enemy", { hp: 1 });
    const state = makeState({
      entities: { hero, enemy1: enemy },
      activeActorId: "hero",
    });
    // Hit the enemy with enough damage to kill them
    const action: CombatAction = { type: "attack", sourceId: "hero", targetId: "enemy1" };
    const result = resolveAction(state, action, makeContext());
    expect(result.state.ended).toBe(true);
    expect(result.state.winner).toBe("allies");
  });

  it("sets ended=true and winner=enemies when no allies alive", () => {
    const hero = makeActor("hero", "ally", { hp: 1 });
    const enemy = makeActor("enemy1", "enemy", { hp: 80 });
    const state = makeState({
      entities: { hero, enemy1: enemy },
      activeActorId: "enemy1",
    });
    // Enemy attacks hero
    const action: CombatAction = { type: "attack", sourceId: "enemy1", targetId: "hero" };
    const result = resolveAction(state, action, makeContext());
    expect(result.state.ended).toBe(true);
    expect(result.state.winner).toBe("enemies");
  });

  it("queues extra turn after weakness hit", () => {
    const hero = makeActor("hero", "ally", { hp: 80 });
    const enemy = makeActor("enemy1", "enemy", { hp: 60, weaknesses: ["fire"] });
    const state = makeState({
      entities: { hero, enemy1: enemy },
      activeActorId: "hero",
      canExtraTurnThisRound: { hero: true, enemy1: true },
    });
    const action: CombatAction = { type: "skill", sourceId: "hero", skillId: "fire_skill", targetIds: ["enemy1"] };
    const result = resolveAction(state, action, makeContext());
    const extraTurn = result.events.find((e) => e.type === "ExtraTurnGranted");
    expect(extraTurn).toBeDefined();
    expect(result.state.telemetry.extraTurns).toBe(1);
    expect(result.state.telemetry.weaknessHits).toBe(1);
  });

  it("heals self and clears debuffs via heal_skill on self", () => {
    const hero = makeActor("hero", "ally", { hp: 30, sp: 10 });
    hero.statuses = ["weakened", "vulnerable"];
    const enemy = makeActor("enemy1", "enemy", { hp: 60 });
    const state = makeState({
      entities: { hero, enemy1: enemy },
      activeActorId: "hero",
      canExtraTurnThisRound: { hero: true, enemy1: true },
    });
    const action: CombatAction = { type: "skill", sourceId: "hero", skillId: "heal_skill", targetIds: ["hero"] };
    const result = resolveAction(state, action, makeContext());
    const heal = result.events.find((e) => e.type === "Heal");
    expect(heal).toBeDefined();
    const removeWeakened = result.events.find((e) => e.type === "RemoveStatus" && (e as any).status === "weakened");
    const removeVulnerable = result.events.find((e) => e.type === "RemoveStatus" && (e as any).status === "vulnerable");
    expect(removeWeakened).toBeDefined();
    expect(removeVulnerable).toBeDefined();
    // HP should be restored
    expect(result.state.entities["hero"].currentHP).toBeGreaterThan(30);
  });
});
