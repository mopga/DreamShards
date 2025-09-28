export const items = {
  // Consumable Items
  dream_essence: {
    id: 'dream_essence',
    name: 'Dream Essence',
    description: 'A swirling vial of liquid starlight that restores psychic energy',
    icon: '🌟',
    type: 'consumable',
    effect: {
      mp: 15
    },
    rarity: 'common'
  },

  healing_crystal: {
    id: 'healing_crystal',
    name: 'Healing Crystal',
    description: 'A warm crystal that pulses with life energy',
    icon: '💚',
    type: 'consumable',
    effect: {
      hp: 25
    },
    rarity: 'common'
  },

  phoenix_tear: {
    id: 'phoenix_tear',
    name: 'Phoenix Tear',
    description: 'A rare crystallized tear that fully restores health and psyche',
    icon: '💧',
    type: 'consumable',
    effect: {
      hp: 999,
      mp: 999
    },
    rarity: 'legendary'
  },

  clarity_potion: {
    id: 'clarity_potion',
    name: 'Potion of Mental Clarity',
    description: 'Clears confusion and enhances focus for a short time',
    icon: '🧪',
    type: 'consumable',
    effect: {
      buff: 'clarity',
      duration: 3
    },
    rarity: 'uncommon'
  },

  shadow_ward: {
    id: 'shadow_ward',
    name: 'Shadow Ward',
    description: 'Provides temporary protection against dark magic',
    icon: '🛡️',
    type: 'consumable',
    effect: {
      buff: 'shadow_resistance',
      duration: 5
    },
    rarity: 'uncommon'
  },

  // Key Items - Story Important
  pride_crystal: {
    id: 'pride_crystal',
    name: 'Crystal of Arrogance',
    description: 'A golden crystal that hums with the power of conquered pride. It feels warm to the touch, yet somehow hollow.',
    icon: '🔶',
    type: 'key'
  },

  mirror_fragment: {
    id: 'mirror_fragment',
    name: 'Fragment of Truth',
    description: 'A shard of mirror that shows not what is, but what could be. Handle with care.',
    icon: '🪞',
    type: 'key'
  },

  shadow_essence: {
    id: 'shadow_essence',
    name: 'Essence of Inner Shadow',
    description: 'A dark, swirling essence captured from your own shadow. It whispers secrets you\'d rather not hear.',
    icon: '🌑',
    type: 'key'
  },

  throne_key: {
    id: 'throne_key',
    name: 'Key of Abdication',
    description: 'A key forged from surrendered ambition. Opens doors that power cannot.',
    icon: '🗝️',
    type: 'key'
  },

  // Equipment - Weapons
  dream_blade: {
    id: 'dream_blade',
    name: 'Blade of Lucid Dreams',
    description: 'A weapon forged from concentrated willpower. Cuts through illusion as easily as flesh.',
    icon: '⚔️',
    type: 'equipment',
    slot: 'weapon',
    stats: {
      attack: 5,
      magic: 3
    },
    rarity: 'rare'
  },

  mind_staff: {
    id: 'mind_staff',
    name: 'Staff of Mental Focus',
    description: 'A crystalline staff that amplifies psychic abilities and enhances clarity of thought.',
    icon: '🔮',
    type: 'equipment',
    slot: 'weapon',
    stats: {
      magic: 8,
      resistance: 2
    },
    rarity: 'rare'
  },

  // Equipment - Armor
  dream_cloak: {
    id: 'dream_cloak',
    name: 'Cloak of Waking Dreams',
    description: 'A shimmering cloak that blurs the line between dream and reality, providing protection from both physical and psychic attacks.',
    icon: '🧥',
    type: 'equipment',
    slot: 'armor',
    stats: {
      defense: 4,
      resistance: 6,
      speed: 1
    },
    rarity: 'rare'
  },

  reflection_armor: {
    id: 'reflection_armor',
    name: 'Armor of Self-Reflection',
    description: 'Mirror-like armor that sometimes reflects attacks back at enemies. Looking at it too long can be unsettling.',
    icon: '🛡️',
    type: 'equipment',
    slot: 'armor',
    stats: {
      defense: 7,
      resistance: 3
    },
    special: 'reflect_chance',
    rarity: 'epic'
  },

  // Equipment - Accessories
  wisdom_amulet: {
    id: 'wisdom_amulet',
    name: 'Amulet of Hard-Won Wisdom',
    description: 'An ancient amulet that grows stronger as you learn from your mistakes.',
    icon: '📿',
    type: 'equipment',
    slot: 'accessory',
    stats: {
      resistance: 4,
      magic: 2
    },
    special: 'experience_boost',
    rarity: 'epic'
  },

  pride_ring: {
    id: 'pride_ring',
    name: 'Ring of Tempered Pride',
    description: 'A golden ring that enhances confidence without breeding arrogance. A rare balance indeed.',
    icon: '💍',
    type: 'equipment',
    slot: 'accessory',
    stats: {
      attack: 3,
      defense: 2,
      magic: 2
    },
    rarity: 'rare'
  },

  // Special Items
  lister_compass: {
    id: 'lister_compass',
    name: 'Lister\'s Dream Compass',
    description: 'A mysterious compass given by Lister that always points toward unresolved dreams.',
    icon: '🧭',
    type: 'key',
    special: 'navigation_aid'
  },

  memory_bottle: {
    id: 'memory_bottle',
    name: 'Bottle of Forgotten Memories',
    description: 'Contains memories that someone desperately wanted to forget. Opening it might reveal important truths... or painful ones.',
    icon: '🍼',
    type: 'key',
    special: 'story_trigger'
  }
};
