import type { CombatActorState, CombatState } from "./types";
import type { Skill } from "@shared/types";
import { isAlive, hasStatus } from "./status";

export interface ChooseEnemyActionOptions {
  state: CombatState;
  skills: Record<string, Skill>;
}

export function chooseEnemyAction({ state, skills }: ChooseEnemyActionOptions): {
  action: import("./types").CombatAction | null;
  reasoning: string;
} {
  const activeId = state.activeActorId;
  if (!activeId) return { action: null, reasoning: "no active actor" };
  const attacker = state.entities[activeId];
  if (!attacker || attacker.side !== "enemy" || !isAlive(attacker)) {
    return { action: null, reasoning: "attacker not valid" };
  }

  const opponents = Object.values(state.entities).filter(
    (entity) => entity.side === "ally" && isAlive(entity),
  );
  const allies = Object.values(state.entities).filter(
    (entity) => entity.side === "enemy" && isAlive(entity),
  );
  if (!opponents.length) return { action: null, reasoning: "no opponents" };

  const usableSkills = attacker.actor.skills
    .map((id) => skills[id])
    .filter((skill): skill is NonNullable<typeof skill> => Boolean(skill))
    .filter((skill) => attacker.currentSP >= skill.costSP);

  // 1. Remove negative statuses from self (debuff cleanse)
  const selfDebuffs: Array<'weakened' | 'vulnerable' | 'guarded'> = ['weakened', 'vulnerable', 'guarded'];
  const canRemoveSelfDebuff = usableSkills.find((skill) => {
    if (!skill.clears) return false;
    return skill.clears.some((clearsStatus) => {
      if (!selfDebuffs.includes(clearsStatus)) return false;
      return hasStatus(attacker, clearsStatus as any);
    });
  });
  if (canRemoveSelfDebuff) {
    return {
      action: {
        type: "skill",
        sourceId: attacker.id,
        skillId: canRemoveSelfDebuff.id,
        targetIds: [attacker.id],
      },
      reasoning: `clearing self debuff with ${canRemoveSelfDebuff.id}`,
    };
  }

  // 2. Heal or buff self if HP low
  const selfHealSkill = usableSkills.find((skill) => skill.healsSelf && attacker.currentHP < attacker.actor.stats.maxHP);
  if (selfHealSkill && attacker.currentHP < attacker.actor.stats.maxHP * 0.35) {
    return {
      action: {
        type: "skill",
        sourceId: attacker.id,
        skillId: selfHealSkill.id,
        targetIds: [attacker.id],
      },
      reasoning: `self-healing with ${selfHealSkill.id}`,
    };
  }

  // 3. Clear negative status from an ally who is debuffed
  const allyNeedsClearing = allies.find((ally) =>
    selfDebuffs.some((s) => hasStatus(ally, s as any)),
  );
  if (allyNeedsClearing) {
    const clearSkill = usableSkills.find(
      (skill) => skill.clears?.some((s) => selfDebuffs.includes(s)),
    );
    if (clearSkill) {
      return {
        action: {
          type: "skill",
          sourceId: attacker.id,
          skillId: clearSkill.id,
          targetIds: [allyNeedsClearing.id],
        },
        reasoning: `clearing ally ${allyNeedsClearing.id} debuff with ${clearSkill.id}`,
      };
    }
  }

  // 4. Boss AI: if a support-type ally is alive and HP is low, buff them
  const lowHpAlly = allies.find(
    (ally) => ally.id !== attacker.id && ally.currentHP < ally.actor.stats.maxHP * 0.4,
  );
  if (lowHpAlly && attacker.actor.ai === "boss") {
    const singleTarget = usableSkills.find((skill) => skill.targets === "one" && skill.power >= 1.2);
    if (singleTarget) {
      return {
        action: {
          type: "skill",
          sourceId: attacker.id,
          skillId: singleTarget.id,
          targetIds: [lowHpAlly.id],
        },
        reasoning: `boss protecting low-HP ally ${lowHpAlly.id} with ${singleTarget.id}`,
      };
    }
  }

  // 5. Normal damage: single-target > AOE > basic attack
  const singleTarget = usableSkills.find((skill) => skill.targets === "one");
  if (singleTarget) {
    const target = chooseTargetBasedOnAI(attacker, opponents);
    return {
      action: {
        type: "skill",
        sourceId: attacker.id,
        skillId: singleTarget.id,
        targetIds: [target.id],
      },
      reasoning: `single-target skill ${singleTarget.id} on ${target.id}`,
    };
  }

  const aoe = usableSkills.find((skill) => skill.targets === "all");
  if (aoe) {
    return {
      action: {
        type: "skill",
        sourceId: attacker.id,
        skillId: aoe.id,
        targetIds: opponents.map((entity) => entity.id),
      },
      reasoning: `AOE skill ${aoe.id}`,
    };
  }

  const target = chooseTargetBasedOnAI(attacker, opponents);
  return {
    action: {
      type: "attack",
      sourceId: attacker.id,
      targetId: target.id,
    },
    reasoning: `basic attack on ${target.id}`,
  };
}

function chooseTargetBasedOnAI(
  attacker: CombatActorState,
  opponents: CombatActorState[],
): CombatActorState {
  if (attacker.actor.ai === "boss") {
    // Boss prefers targeting "support" actors — the first ally (hero or lister)
    const supportTarget = opponents.find((o) => o.actor.ai === "boss");
    if (supportTarget) return supportTarget;
  }
  // Default: lowest HP percentage
  return opponents.reduce((lowest, entity) => {
    if (!lowest) return entity;
    const lowestPct = lowest.currentHP / lowest.actor.stats.maxHP;
    const currentPct = entity.currentHP / entity.actor.stats.maxHP;
    return currentPct < lowestPct ? entity : lowest;
  });
}
