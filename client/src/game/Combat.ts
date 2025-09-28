import { Player } from './Player';
import { Enemy } from './Enemy';

export interface CombatState {
  enemies: Enemy[];
  allies: any[];
  currentTurn: number;
  phase: 'player_turn' | 'ally_turn' | 'enemy_turn' | 'action_animation' | 'victory' | 'defeat';
  turnOrder: any[];
}

export class Combat {
  private state: CombatState;
  private player: Player;

  constructor(player: Player, enemies: Enemy[]) {
    this.player = player;
    this.state = {
      enemies: enemies,
      allies: [], // Could add companions here
      currentTurn: 0,
      phase: 'player_turn',
      turnOrder: []
    };
    
    this.calculateTurnOrder();
  }

  calculateTurnOrder() {
    // Simple turn order based on speed
    const allCombatants = [
      { type: 'player', entity: this.player, speed: this.player.speed },
      ...this.state.enemies.map(enemy => ({ type: 'enemy', entity: enemy, speed: enemy.speed })),
      ...this.state.allies.map(ally => ({ type: 'ally', entity: ally, speed: ally.speed }))
    ];

    this.state.turnOrder = allCombatants.sort((a, b) => b.speed - a.speed);
  }

  getCurrentTurnEntity() {
    if (this.state.turnOrder.length === 0) return null;
    return this.state.turnOrder[this.state.currentTurn % this.state.turnOrder.length];
  }

  playerAttack(targetIndex: number) {
    if (this.state.phase !== 'player_turn') return false;
    
    const target = this.state.enemies[targetIndex];
    if (!target) return false;

    const damage = this.player.attack + Math.floor(Math.random() * 5) - 2;
    const defeated = target.takeDamage(damage);
    
    if (defeated) {
      this.player.gainExp(target.expReward);
      this.state.enemies.splice(targetIndex, 1);
    }

    this.nextTurn();
    return true;
  }

  playerUseSkill(skillId: string, targetIndex: number) {
    if (this.state.phase !== 'player_turn') return false;
    
    const skill = this.player.skills.find(s => s.id === skillId);
    if (!skill || !this.player.useMp(skill.mpCost)) return false;

    if (skill.damage) {
      const target = this.state.enemies[targetIndex];
      if (target) {
        const damage = skill.damage + this.player.magic;
        const defeated = target.takeDamage(damage, 'psychic');
        
        if (defeated) {
          this.player.gainExp(target.expReward);
          this.state.enemies.splice(targetIndex, 1);
        }
      }
    } else if (skill.healing) {
      this.player.heal(skill.healing + this.player.magic);
    }

    this.nextTurn();
    return true;
  }

  playerGuard() {
    if (this.state.phase !== 'player_turn') return false;
    
    // Guarding reduces incoming damage for the rest of the turn
    // This would be implemented in the damage calculation
    console.log('Player is guarding...');
    
    this.nextTurn();
    return true;
  }

  nextTurn() {
    this.state.currentTurn++;
    
    // Check for victory/defeat conditions
    if (this.state.enemies.length === 0) {
      this.state.phase = 'victory';
      return;
    }
    
    if (this.player.currentHp <= 0) {
      this.state.phase = 'defeat';
      return;
    }

    // Determine next phase
    const currentEntity = this.getCurrentTurnEntity();
    if (currentEntity) {
      switch (currentEntity.type) {
        case 'player':
          this.state.phase = 'player_turn';
          break;
        case 'ally':
          this.state.phase = 'ally_turn';
          this.executeAllyTurn(currentEntity.entity);
          break;
        case 'enemy':
          this.state.phase = 'enemy_turn';
          this.executeEnemyTurn(currentEntity.entity);
          break;
      }
    }
  }

  executeEnemyTurn(enemy: Enemy) {
    const action = enemy.selectAction();
    
    setTimeout(() => {
      if (action.targetType === 'single') {
        // Target player or random ally
        const damage = action.damage ? action.damage + enemy.attack : 0;
        if (damage > 0) {
          this.player.takeDamage(damage);
        }
      }
      
      this.nextTurn();
    }, 1000); // Simulate enemy action delay
  }

  executeAllyTurn(ally: any) {
    // Simple ally AI
    setTimeout(() => {
      // Ally attacks random enemy
      if (this.state.enemies.length > 0) {
        const targetIndex = Math.floor(Math.random() * this.state.enemies.length);
        const target = this.state.enemies[targetIndex];
        const damage = ally.attack;
        
        const defeated = target.takeDamage(damage);
        if (defeated) {
          this.state.enemies.splice(targetIndex, 1);
        }
      }
      
      this.nextTurn();
    }, 1000);
  }

  getState(): CombatState {
    return { ...this.state };
  }

  isActive(): boolean {
    return this.state.phase !== 'victory' && this.state.phase !== 'defeat';
  }
}
