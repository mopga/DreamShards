import skillsData from "@shared/content/skills.json" assert { type: "json" };
import enemiesData from "@shared/content/enemies.json" assert { type: "json" };
import progressionData from "@shared/content/progression.json" assert { type: "json" };
import skillUnlocksData from "@shared/content/skillUnlocks.json" assert { type: "json" };
import palaceLayoutData from "@shared/content/palaceFear.json" assert { type: "json" };
import dialogueBeachData from "@shared/content/dialogueBeach.json" assert { type: "json" };
import dialogueLister2Data from "@shared/content/dialogues/lister_2.json" assert { type: "json" };
import dialogueLister4Data from "@shared/content/dialogues/lister_4.json" assert { type: "json" };
import type {
  Skill,
  Actor,
  PalaceLayout,
  DialogueNode,
  SkillUnlockDefinition,
  PalaceEncounterTablesConfig,
} from "@shared/types";
import encounterTablesData from "@shared/content/encounters.json" assert { type: "json" };

export const skills = Object.fromEntries(
  (skillsData as Skill[]).map((skill) => [skill.id, skill])
) as Record<string, Skill>;

export const enemies = Object.fromEntries(
  (enemiesData as Actor[]).map((actor) => [actor.id, actor])
) as Record<string, Actor>;

export const progressionLevels = (progressionData as { levels: number[] }).levels;

export const skillUnlocks = skillUnlocksData as Record<string, SkillUnlockDefinition[]>;

export const palaceLayout = palaceLayoutData as PalaceLayout;
export const encounterTablesConfig = encounterTablesData as PalaceEncounterTablesConfig;

export type DialogueScriptId = "beach" | "lister_2" | "lister_4";

export interface DialogueScript {
  id: DialogueScriptId;
  title: string;
  nodes: DialogueNode[];
}

const beachNodes = dialogueBeachData as DialogueNode[];
const lister2Nodes = dialogueLister2Data as DialogueNode[];
const lister4Nodes = dialogueLister4Data as DialogueNode[];

export const dialogueScripts: Record<DialogueScriptId, DialogueScript> = {
  beach: { id: "beach", title: "Пляж Снов", nodes: beachNodes },
  lister_2: { id: "lister_2", title: "Голос Листера", nodes: lister2Nodes },
  lister_4: { id: "lister_4", title: "Голос Листера", nodes: lister4Nodes },
};

export function getDialogueScript(id: DialogueScriptId): DialogueScript {
  return dialogueScripts[id] ?? dialogueScripts.beach;
}

export const dialogueBeach = dialogueScripts.beach.nodes;
