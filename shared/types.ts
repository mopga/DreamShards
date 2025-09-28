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

export interface PalaceLayout {
  rooms: Array<{
    id: string;
    type: 'entry' | 'combat' | 'shard' | 'boss';
    neighbors: string[];
    encounterId?: string;
    shardId?: string;
  }>;
  bossEncounterId: string;
}

export interface GameState {
  flags: Record<string, boolean>;
  shardsCollected: number;
  party: string[];
  inventory: Array<{ id: string; qty: number }>;
  location: { roomId: string };
}
