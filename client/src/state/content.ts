import skillsData from "@shared/content/skills.json" assert { type: "json" };
import enemiesData from "@shared/content/enemies.json" assert { type: "json" };
import palaceLayoutData from "@shared/content/palaceFear.json" assert { type: "json" };
import dialogueBeachData from "@shared/content/dialogueBeach.json" assert { type: "json" };
import type { Skill, Actor, PalaceLayout, DialogueNode } from "@shared/types";

export const skills = Object.fromEntries(
  (skillsData as Skill[]).map((skill) => [skill.id, skill])
) as Record<string, Skill>;

export const enemies = Object.fromEntries(
  (enemiesData as Actor[]).map((actor) => [actor.id, actor])
) as Record<string, Actor>;

export const palaceLayout = palaceLayoutData as PalaceLayout;
export const dialogueBeach = dialogueBeachData as DialogueNode[];