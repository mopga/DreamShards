export const enemies = {
  shadow_guard: {
    id: 'shadow_guard',
    name: 'Shadow Guard',
    level: 2,
    hp: 35,
    attack: 12,
    defense: 8,
    magic: 5,
    resistance: 6,
    speed: 9,
    expReward: 15,
    weaknesses: ['light', 'psychic'],
    resistances: ['dark', 'physical'],
    actions: [
      {
        name: 'Shadow Strike',
        damage: 14,
        targetType: 'single'
      },
      {
        name: 'Dark Mist',
        effect: 'blind',
        targetType: 'single'
      }
    ]
  },

  pride_wraith: {
    id: 'pride_wraith',
    name: 'Pride Wraith',
    level: 3,
    hp: 45,
    attack: 15,
    defense: 6,
    magic: 18,
    resistance: 12,
    speed: 12,
    expReward: 25,
    weaknesses: ['humility', 'truth'],
    resistances: ['pride', 'illusion'],
    actions: [
      {
        name: 'Ego Blast',
        damage: 18,
        targetType: 'single'
      },
      {
        name: 'Arrogant Heal',
        healing: 20,
        targetType: 'self'
      },
      {
        name: 'Superiority Complex',
        effect: 'attack_down',
        targetType: 'all'
      }
    ]
  },

  mirror_shade: {
    id: 'mirror_shade',
    name: 'Mirror Shade',
    level: 2,
    hp: 30,
    attack: 10,
    defense: 10,
    magic: 14,
    resistance: 8,
    speed: 15,
    expReward: 18,
    weaknesses: ['truth', 'self_acceptance'],
    resistances: ['reflection', 'illusion'],
    actions: [
      {
        name: 'Reflection Attack',
        damage: 12,
        targetType: 'single'
      },
      {
        name: 'Mirror Image',
        effect: 'confusion',
        targetType: 'single'
      }
    ]
  },

  reflection_wraith: {
    id: 'reflection_wraith',
    name: 'Reflection Wraith',
    level: 2,
    hp: 28,
    attack: 13,
    defense: 7,
    magic: 16,
    resistance: 9,
    speed: 11,
    expReward: 20,
    weaknesses: ['self_knowledge', 'acceptance'],
    resistances: ['mirror', 'distortion'],
    actions: [
      {
        name: 'Distorted Strike',
        damage: 15,
        targetType: 'single'
      },
      {
        name: 'False Truth',
        effect: 'charm',
        targetType: 'single'
      }
    ]
  },

  pride_avatar: {
    id: 'pride_avatar',
    name: 'Avatar of Shattered Pride',
    level: 5,
    hp: 120,
    attack: 25,
    defense: 15,
    magic: 30,
    resistance: 20,
    speed: 8,
    expReward: 100,
    weaknesses: ['humility', 'compassion', 'truth'],
    resistances: ['pride', 'vanity', 'arrogance'],
    actions: [
      {
        name: 'Golden Wrath',
        damage: 35,
        targetType: 'single'
      },
      {
        name: 'Overwhelming Pride',
        damage: 25,
        targetType: 'all'
      },
      {
        name: 'Narcissistic Heal',
        healing: 40,
        targetType: 'self'
      },
      {
        name: 'Ego Storm',
        effect: 'all_stats_down',
        targetType: 'all'
      },
      {
        name: 'Ultimate Arrogance',
        damage: 50,
        targetType: 'single',
        condition: 'hp_below_30_percent'
      }
    ]
  }
};
