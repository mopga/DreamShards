export interface EnemyAction {
  name: string;
  damage?: number;
  healing?: number;
  effect?: string;
  targetType: 'single' | 'all' | 'self';
}

export class Enemy {
  public id: string;
  public name: string;
  public level: number;
  public maxHp: number;
  public currentHp: number;
  public attack: number;
  public defense: number;
  public magic: number;
  public resistance: number;
  public speed: number;
  public expReward: number;
  public weaknesses: string[];
  public resistances: string[];
  public actions: EnemyAction[];

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.level = data.level || 1;
    this.maxHp = data.hp || 20;
    this.currentHp = this.maxHp;
    this.attack = data.attack || 8;
    this.defense = data.defense || 5;
    this.magic = data.magic || 6;
    this.resistance = data.resistance || 4;
    this.speed = data.speed || 8;
    this.expReward = data.expReward || 10;
    this.weaknesses = data.weaknesses || [];
    this.resistances = data.resistances || [];
    this.actions = data.actions || [
      {
        name: 'Shadow Strike',
        damage: 12,
        targetType: 'single'
      }
    ];
  }

  takeDamage(amount: number, damageType?: string): boolean {
    let actualDamage = amount - this.defense;
    
    // Apply weaknesses and resistances
    if (damageType) {
      if (this.weaknesses.includes(damageType)) {
        actualDamage *= 1.5;
      } else if (this.resistances.includes(damageType)) {
        actualDamage *= 0.5;
      }
    }
    
    actualDamage = Math.max(1, Math.floor(actualDamage));
    this.currentHp = Math.max(0, this.currentHp - actualDamage);
    
    return this.currentHp <= 0;
  }

  selectAction(): EnemyAction {
    // Simple AI: randomly select an action
    const randomIndex = Math.floor(Math.random() * this.actions.length);
    return this.actions[randomIndex];
  }

  heal(amount: number) {
    this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
  }
}
