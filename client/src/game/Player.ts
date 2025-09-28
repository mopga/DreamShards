export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  mpCost: number;
  damage?: number;
  healing?: number;
  effect?: string;
}

export class Player {
  public name: string = 'Dreamer';
  public level: number = 1;
  public exp: number = 0;
  public expToNext: number = 100;
  
  public maxHp: number = 50;
  public currentHp: number = 50;
  public maxMp: number = 20;
  public currentMp: number = 20;
  
  public attack: number = 10;
  public defense: number = 8;
  public magic: number = 12;
  public resistance: number = 6;
  public speed: number = 10;
  
  public x: number = 0;
  public y: number = 0;
  
  public skills: Skill[] = [
    {
      id: 'mind_lance',
      name: 'Mind Lance',
      description: 'A focused psychic attack that pierces shadow defenses',
      icon: '🔮',
      mpCost: 5,
      damage: 15
    }
  ];

  gainExp(amount: number) {
    this.exp += amount;
    
    while (this.exp >= this.expToNext) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.exp -= this.expToNext;
    this.expToNext = Math.floor(this.expToNext * 1.2);
    
    // Increase stats
    this.maxHp += 8;
    this.maxMp += 4;
    this.attack += 2;
    this.defense += 2;
    this.magic += 3;
    this.resistance += 1;
    this.speed += 1;
    
    // Heal to full on level up
    this.currentHp = this.maxHp;
    this.currentMp = this.maxMp;
    
    // Learn new skills at certain levels
    this.checkForNewSkills();
  }

  checkForNewSkills() {
    const newSkills: { [level: number]: Skill } = {
      3: {
        id: 'dream_heal',
        name: 'Dream Healing',
        description: 'Channel dream energy to restore health',
        icon: '💚',
        mpCost: 8,
        healing: 25
      },
      5: {
        id: 'shadow_bind',
        name: 'Shadow Bind',
        description: 'Temporarily immobilize an enemy with psychic force',
        icon: '🕷️',
        mpCost: 12,
        effect: 'paralyze'
      },
      7: {
        id: 'dream_burst',
        name: 'Dream Burst',
        description: 'Unleash chaotic dream energy on all enemies',
        icon: '💫',
        mpCost: 18,
        damage: 20
      }
    };

    if (newSkills[this.level]) {
      this.skills.push(newSkills[this.level]);
    }
  }

  takeDamage(amount: number): boolean {
    const actualDamage = Math.max(1, amount - this.defense);
    this.currentHp = Math.max(0, this.currentHp - actualDamage);
    return this.currentHp <= 0;
  }

  heal(amount: number) {
    this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
  }

  useMp(amount: number): boolean {
    if (this.currentMp >= amount) {
      this.currentMp -= amount;
      return true;
    }
    return false;
  }

  restoreMp(amount: number) {
    this.currentMp = Math.min(this.maxMp, this.currentMp + amount);
  }
}
