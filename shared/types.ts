export type Element = 'physical' | 'fire' | 'ice' | 'electric' | 'psychic' | 'void';

export interface Skill {
  id: string;
  name: string;
  costSP: number;
  element: Element;
  power: number;
  targets: 'one' | 'all';
  applies?: Array<'weakened' | 'vulnerable' | 'guarded'>;
  description: string;
}

export interface ActorStats {
  maxHP: number;
  maxSP: number;
  str: number;
  mag: number;
  def: number;
  res: number;
  agi: number;
  luck: number;
}

export interface Actor {
  id: string;
  name: string;
  stats: ActorStats;
  skills: string[];
  weaknesses?: Element[];
  resistances?: Element[];
  ai?: 'basic' | 'boss';
  xp?: number;
}

export interface ActorBlueprint {
  id: string;
  nameKey: string;
  baseStats: ActorStats;
}

export interface ProgressionState {
  level: number;
  xp: number;
}

export interface SkillUnlockRequirement {
  level?: number;
  shards?: number;
}

export interface SkillUnlockDefinition {
  skillId: string;
  requires: SkillUnlockRequirement;
}

export interface DialogueNode {
  id: string;
  text: string;
  choices?: Array<{
    label: string;
    next: string;
    setFlags?: Record<string, boolean>;
    requiresFlags?: Record<string, boolean>;
  }>;
  end?: boolean;
}

export type PalaceEncounterTable = 'weak' | 'mid' | 'hard';

export interface PalaceRoomLoot {
  items?: Array<{ id: string; qty: number }>;
  logMessage?: string;
  actionLabel?: string;
}

export interface PalaceRoom {
  id: string;
  type: 'entry' | 'combat' | 'shard' | 'boss' | 'lore';
  neighbors: string[];
  shardId?: string;
  encounterTable?: PalaceEncounterTable;
  guardEncounter?: string;
  shardCollected?: boolean;
  loot?: PalaceRoomLoot;
}

export interface PalaceLayout {
  rooms: PalaceRoom[];
  bossEncounterId: string;
}

export interface PalaceEncounterTableEntry {
  id: string;
  weight: number;
}

export interface PalaceEncounterTablesConfig {
  tables: Record<PalaceEncounterTable, PalaceEncounterTableEntry[]>;
  cooldownSteps: number;
  baseChance: number;
  chanceStep: number;
  maxChance: number;
}

export interface GameState {
  flags: Record<string, boolean>;
  shardsCollected: number;
  party: string[];
  inventory: Array<{ id: string; qty: number }>;
  location: { roomId: string };
  heroName: string;
  progression: ProgressionState;
  companionLevel: number;
  unlockedSkills: Record<string, string[]>;
}
