import { PalaceData } from '../game/Palace';

export const palaces: { [key: string]: PalaceData } = {
  pride: {
    id: 'pride',
    name: 'Palace of Shattered Pride',
    theme: 'pride',
    description: 'A magnificent palace now cracked and twisted, where golden mirrors reflect distorted truths',
    rooms: {
      entrance: {
        id: 'entrance',
        name: 'Grand Entrance Hall',
        description: 'A vast hall with a shattered chandelier hanging overhead. Golden light filters through broken stained glass.',
        width: 800,
        height: 600,
        entrancePosition: { x: 400, y: 550 },
        exits: [
          {
            direction: 'north',
            targetRoom: 'throne_room',
            position: { x: 400, y: 50 }
          },
          {
            direction: 'east',
            targetRoom: 'mirror_gallery',
            position: { x: 750, y: 300 }
          }
        ],
        obstacles: [
          { x: 200, y: 200, width: 100, height: 50, type: 'debris' },
          { x: 500, y: 350, width: 80, height: 80, type: 'fallen_pillar' },
          { x: 100, y: 400, width: 60, height: 100, type: 'broken_statue' }
        ],
        interactables: [
          {
            x: 300, y: 300, type: 'dream_shard', data: {
              message: 'A fragment of golden light pulses with pride...',
              reward: { dreamShards: 1 }
            }
          },
          {
            x: 600, y: 450, type: 'npc', data: {
              name: 'Echoing Voice',
              dialogue: 'welcome_pride'
            }
          }
        ],
        backgroundElements: [
          { x: 150, y: 150, type: 'broken_statue' },
          { x: 650, y: 200, type: 'mirror_fragment' },
          { x: 400, y: 100, type: 'floating_stairs' },
          { x: 300, y: 500, type: 'dream_crystal' }
        ]
      },
      
      throne_room: {
        id: 'throne_room',
        name: 'Throne of Golden Shadows',
        description: 'The throne room where a massive golden throne sits empty, surrounded by whispering shadows.',
        width: 700,
        height: 500,
        entrancePosition: { x: 350, y: 450 },
        exits: [
          {
            direction: 'south',
            targetRoom: 'entrance',
            position: { x: 350, y: 450 }
          },
          {
            direction: 'west',
            targetRoom: 'mirror_gallery',
            position: { x: 50, y: 250 }
          }
        ],
        obstacles: [
          { x: 250, y: 150, width: 200, height: 120, type: 'throne' },
          { x: 100, y: 100, width: 30, height: 200, type: 'pillar' },
          { x: 570, y: 100, width: 30, height: 200, type: 'pillar' }
        ],
        interactables: [
          {
            x: 350, y: 200, type: 'shrine', data: {
              name: 'Throne of Pride',
              dialogue: 'throne_encounter'
            }
          },
          {
            x: 500, y: 350, type: 'chest', data: {
              items: [{ id: 'pride_crystal', name: 'Crystal of Arrogance', type: 'key' }]
            }
          }
        ],
        enemies: [
          { id: 'shadow_guard', x: 200, y: 300, level: 2 },
          { id: 'pride_wraith', x: 500, y: 200, level: 3 }
        ],
        backgroundElements: [
          { x: 100, y: 50, type: 'floating_stairs' },
          { x: 600, y: 50, type: 'floating_stairs' },
          { x: 50, y: 400, type: 'mirror_fragment' },
          { x: 650, y: 400, type: 'mirror_fragment' }
        ]
      },
      
      mirror_gallery: {
        id: 'mirror_gallery',
        name: 'Gallery of Fractured Reflections',
        description: 'A long gallery lined with broken mirrors, each reflecting a different distorted truth.',
        width: 900,
        height: 400,
        entrancePosition: { x: 50, y: 200 },
        exits: [
          {
            direction: 'west',
            targetRoom: 'entrance',
            position: { x: 50, y: 200 }
          },
          {
            direction: 'east',
            targetRoom: 'throne_room',
            position: { x: 850, y: 200 }
          },
          {
            direction: 'north',
            targetRoom: 'sanctum',
            position: { x: 450, y: 50 }
          }
        ],
        obstacles: [
          { x: 150, y: 50, width: 20, height: 300, type: 'mirror_wall' },
          { x: 300, y: 50, width: 20, height: 300, type: 'mirror_wall' },
          { x: 450, y: 50, width: 20, height: 300, type: 'mirror_wall' },
          { x: 600, y: 50, width: 20, height: 300, type: 'mirror_wall' },
          { x: 750, y: 50, width: 20, height: 300, type: 'mirror_wall' }
        ],
        interactables: [
          {
            x: 200, y: 200, type: 'npc', data: {
              name: 'Mirror Reflection',
              dialogue: 'mirror_self'
            }
          },
          {
            x: 700, y: 200, type: 'dream_shard', data: {
              message: 'Truth fractures in the broken glass...',
              reward: { dreamShards: 2 }
            }
          }
        ],
        enemies: [
          { id: 'mirror_shade', x: 350, y: 200, level: 2 },
          { id: 'reflection_wraith', x: 550, y: 200, level: 2 }
        ],
        backgroundElements: [
          { x: 125, y: 100, type: 'mirror_fragment' },
          { x: 225, y: 150, type: 'mirror_fragment' },
          { x: 375, y: 120, type: 'mirror_fragment' },
          { x: 525, y: 180, type: 'mirror_fragment' },
          { x: 675, y: 130, type: 'mirror_fragment' },
          { x: 825, y: 160, type: 'mirror_fragment' }
        ]
      },
      
      sanctum: {
        id: 'sanctum',
        name: 'Inner Sanctum of Pride',
        description: 'The deepest chamber where the Avatar of Pride waits, a massive golden figure wreathed in shadow.',
        width: 600,
        height: 600,
        entrancePosition: { x: 300, y: 550 },
        exits: [
          {
            direction: 'south',
            targetRoom: 'mirror_gallery',
            position: { x: 300, y: 550 }
          }
        ],
        obstacles: [
          { x: 100, y: 100, width: 400, height: 50, type: 'altar_platform' }
        ],
        interactables: [
          {
            x: 300, y: 125, type: 'shrine', data: {
              name: 'Avatar of Pride',
              dialogue: 'pride_avatar_encounter'
            }
          }
        ],
        enemies: [
          { id: 'pride_avatar', x: 300, y: 125, level: 5, boss: true }
        ],
        backgroundElements: [
          { x: 150, y: 300, type: 'dream_crystal' },
          { x: 450, y: 300, type: 'dream_crystal' },
          { x: 300, y: 400, type: 'floating_stairs' },
          { x: 100, y: 500, type: 'mirror_fragment' },
          { x: 500, y: 500, type: 'mirror_fragment' }
        ]
      }
    }
  }
};
