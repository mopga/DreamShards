import { z } from "zod";

const booleanRecord = z.record(z.boolean());

const inventoryItemSchema = z
  .object({
    id: z.string().min(1),
    qty: z.number().int().min(0),
  })
  .passthrough();

const progressionSchema = z.object({
  level: z.number().int().min(0),
  xp: z.number().int().min(0),
});

const locationSchema = z.object({
  roomId: z.string().min(1),
});

const skillUnlockNotificationSchema = z.object({
  actorId: z.string().min(1),
  skillId: z.string().min(1),
});

const dialogueChoiceSchema = z
  .object({
    label: z.string(),
    next: z.string(),
    setFlags: booleanRecord.optional(),
    requiresFlags: booleanRecord.optional(),
  })
  .passthrough();

const dialogueNodeSchema = z
  .object({
    id: z.string(),
    text: z.string(),
    choices: z.array(dialogueChoiceSchema).optional(),
    end: z.boolean().optional(),
  })
  .passthrough();

const dialogueSessionSchema = z
  .object({
    scriptId: z.string().min(1),
    title: z.string().min(1),
    nodes: z.array(dialogueNodeSchema),
    currentId: z.string().min(1),
  })
  .passthrough();

const roomStateSchema = z
  .object({
    shardCollected: z.boolean().optional(),
    lootClaimed: z.boolean().optional(),
    cleared: z.boolean().optional(),
  })
  .passthrough();

const gameStateSchema = z.object({
  flags: booleanRecord,
  shardsCollected: z.number().int().min(0),
  party: z.array(z.string()),
  inventory: z.array(inventoryItemSchema),
  location: locationSchema,
  heroName: z.string(),
  progression: progressionSchema,
  companionLevel: z.number().int().min(0),
  unlockedSkills: z.record(z.array(z.string())),
});

const gameModes = [
  "menu",
  "intro_world",
  "intro_birth",
  "naming",
  "intro_beach",
  "dialogue",
  "exploration",
  "combat",
  "ending",
] as const;

export const appStateSchema = gameStateSchema
  .extend({
    mode: z.enum(gameModes),
    dialogue: dialogueSessionSchema.optional().nullable(),
    activeEncounterId: z.string().optional(),
    log: z.array(z.string()),
    skillUnlockQueue: z.array(skillUnlockNotificationSchema),
    roomStates: z.record(roomStateSchema),
    randomEncounterChance: z.number().min(0),
    randomEncounterCooldown: z.number().min(0),
  })
  .passthrough();

export const savePayloadSchema = z.object({
  state: appStateSchema,
});

export type AppStatePayload = z.infer<typeof appStateSchema>;
