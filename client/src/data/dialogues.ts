export const dialogues = {
  welcome_pride: {
    id: 'welcome_pride',
    speaker: 'Echoing Voice',
    text: 'Welcome to the Palace of Shattered Pride, dreamer. Here, golden truths crack under the weight of their own magnificence.',
    choices: [
      {
        text: 'What is this place?',
        nextDialogue: {
          id: 'explain_pride_palace',
          speaker: 'Echoing Voice',
          text: 'This palace once stood as a monument to achievement and self-worth. But pride unchecked becomes vanity, and vanity breeds shadows. The mirrors here no longer reflect truth, but distorted desires.',
          choices: [
            {
              text: 'How do I navigate this place?',
              nextDialogue: {
                id: 'navigation_help',
                speaker: 'Echoing Voice',
                text: 'Trust not what the mirrors show you, for they speak in riddles of want and need. Collect the dream shards to see clearly, and face the shadows that pride has cast.',
              }
            },
            {
              text: 'I understand.',
            }
          ]
        }
      },
      {
        text: 'I\'m not afraid of shadows.',
        nextDialogue: {
          id: 'brave_response',
          speaker: 'Echoing Voice',
          text: 'Courage serves you well, but beware - the shadows here are born from the ego itself. They know your strengths... and your weaknesses.',
        }
      },
      {
        text: 'I should leave this place.',
        nextDialogue: {
          id: 'coward_response',
          speaker: 'Echoing Voice',
          text: 'The dreamer cannot wake by running from dreams. Face what lies within, or carry these shadows back to the waking world.',
        }
      }
    ]
  },

  throne_encounter: {
    id: 'throne_encounter',
    speaker: 'The Empty Throne',
    text: 'A throne of gold sits empty, yet heavy with the weight of past ambitions. Whispers echo from its ornate surface: "Who dares claim dominion over pride itself?"',
    choices: [
      {
        text: 'I claim no throne.',
        nextDialogue: {
          id: 'humble_choice',
          speaker: 'The Empty Throne',
          text: 'Wisdom in humility. The throne acknowledges your restraint. A dream shard materializes before you, shimmering with honest light.',
          action: () => console.log('Player gains dream shard for humility')
        }
      },
      {
        text: 'I am worthy of this throne.',
        nextDialogue: {
          id: 'prideful_choice',
          speaker: 'The Empty Throne',
          text: 'Pride answers pride. The throne\'s golden surface cracks, and shadows pour forth. Your arrogance has awakened the palace\'s guardians!',
          action: () => console.log('Combat encounter triggered')
        }
      },
      {
        text: 'What happened to the one who sat here before?',
        nextDialogue: {
          id: 'throne_history',
          speaker: 'The Empty Throne',
          text: 'They reached too high and grasped too much. When pride becomes the master rather than the servant, it consumes all. Learn from their folly.',
        }
      }
    ]
  },

  mirror_self: {
    id: 'mirror_self',
    speaker: 'Your Reflection',
    text: 'You see yourself in the fractured mirror, but the reflection speaks with its own voice: "Do you like what you see? Do you see what you like?"',
    choices: [
      {
        text: 'I see someone trying their best.',
        nextDialogue: {
          id: 'self_acceptance',
          speaker: 'Your Reflection',
          text: 'Acceptance of the flawed self is the first step to growth. The mirror\'s cracks begin to heal, showing you more clearly than before.',
          action: () => console.log('Player gains insight bonus')
        }
      },
      {
        text: 'I see someone who could be better.',
        nextDialogue: {
          id: 'self_improvement',
          speaker: 'Your Reflection',
          text: 'Ambition to improve is noble, but beware the trap of never being satisfied. The mirror shows you both your potential and your peace.',
        }
      },
      {
        text: 'I don\'t like what I see.',
        nextDialogue: {
          id: 'self_rejection',
          speaker: 'Your Reflection',
          text: 'Self-hatred feeds the shadows. The mirror darkens, and you hear the sound of approaching footsteps. Your negative reflection has given form to your doubts.',
          action: () => console.log('Shadow self encounter triggered')
        }
      }
    ]
  },

  pride_avatar_encounter: {
    id: 'pride_avatar_encounter',
    speaker: 'Avatar of Pride',
    text: 'BEHOLD! I am the culmination of all ambition, all achievement, all glory! You dare enter my sanctum, insignificant dreamer? I, who have conquered nations of the mind?',
    choices: [
      {
        text: 'Your glory is built on others\' suffering.',
        nextDialogue: {
          id: 'challenge_pride',
          speaker: 'Avatar of Pride',
          text: 'INSOLENCE! You know nothing of greatness! I shall crush you beneath the weight of my magnificence! Prepare for battle!',
          action: () => console.log('Boss battle begins - Avatar weakened by truth')
        }
      },
      {
        text: 'I seek to understand, not to conquer.',
        nextDialogue: {
          id: 'peaceful_approach',
          speaker: 'Avatar of Pride',
          text: 'Understanding? UNDERSTANDING?! There is nothing to understand but power and dominion! Yet... your words carry a strange resonance. Very well, prove your worth in combat!',
          action: () => console.log('Boss battle begins - Normal difficulty')
        }
      },
      {
        text: 'I bow before your greatness.',
        nextDialogue: {
          id: 'submit_to_pride',
          speaker: 'Avatar of Pride',
          text: 'Good! Kneel before true greatness! But... no, this feels hollow. Empty praise feeds nothing. If you will not challenge me honestly, then face me as the coward you are!',
          action: () => console.log('Boss battle begins - Avatar strengthened by false praise')
        }
      }
    ]
  },

  lister_beach: {
    id: 'lister_beach',
    speaker: 'Lister',
    text: 'Ah, dreamer, you return to the shore of consciousness. I am Lister, keeper of the threshold between sleeping and waking. What fragments have you gathered from the palace of pride?',
    choices: [
      {
        text: 'I found shards that shimmer with golden light.',
        action: () => console.log('Show dream shards'),
        nextDialogue: {
          id: 'lister_shards_response',
          speaker: 'Lister',
          text: 'Yes, these are fragments of understanding - pride acknowledged but not surrendered to. Each shard contains a lesson about the balance between confidence and humility.',
        }
      },
      {
        text: 'The mirrors showed me disturbing truths.',
        nextDialogue: {
          id: 'lister_mirror_response',
          speaker: 'Lister',
          text: 'The fractured mirrors reflect our fractured selves. To see oneself clearly - both light and shadow - is the beginning of wholeness. What truths disturbed you most?',
        }
      },
      {
        text: 'I\'m not ready to talk about it yet.',
        nextDialogue: {
          id: 'lister_understanding',
          speaker: 'Lister',
          text: 'The dream realm works at its own pace. When you are ready, the beach of dreams will be here, and so shall I. Rest now, and let the experiences settle like sand.',
        }
      }
    ]
  }
};
