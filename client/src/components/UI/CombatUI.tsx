import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../contexts/GameContext';
import { Combat } from '../../game/Combat';

export default function CombatUI() {
  const { player, combatData, setCombatData, setGameState, inventory } = useGame();
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<number>(-1);
  const combatSystemRef = useRef<Combat | null>(null);

  // Initialize combat system when combat starts
  useEffect(() => {
    if (combatData && !combatSystemRef.current) {
      combatSystemRef.current = new Combat(player, combatData.enemies);
    }
  }, [combatData, player]);

  // Update combat data when combat system state changes
  useEffect(() => {
    if (combatSystemRef.current) {
      const newState = combatSystemRef.current.getState();
      setCombatData(newState);
      
      // Check for combat end
      if (!combatSystemRef.current.isActive()) {
        setTimeout(() => {
          endCombat(newState.phase === 'victory');
        }, 2000);
      }
    }
  }, [combatData]);

  if (!combatData) return null;

  const { enemies, allies, currentTurn, phase } = combatData;

  const handleAction = (action: string) => {
    setSelectedAction(action);
    if (action === 'attack' || action === 'skill') {
      // Need to select target
      setSelectedTarget(-1);
    } else {
      // Execute action immediately
      executeAction(action, -1);
    }
  };

  const handleTargetSelect = (targetIndex: number) => {
    setSelectedTarget(targetIndex);
    executeAction(selectedAction, targetIndex);
  };

  const executeAction = (action: string, target: number) => {
    if (!combatSystemRef.current) return;
    
    console.log(`Executing ${action} on target ${target}`);
    
    let actionExecuted = false;
    
    switch (action) {
      case 'attack':
        actionExecuted = combatSystemRef.current.playerAttack(target);
        break;
      case 'skill':
        // For now, use the first available skill
        if (player.skills.length > 0) {
          actionExecuted = combatSystemRef.current.playerUseSkill(player.skills[0].id, target);
        }
        break;
      case 'guard':
        actionExecuted = combatSystemRef.current.playerGuard();
        break;
      case 'item':
        // Use a healing item if available
        const healingItem = inventory.items.find(item => item.effect?.hp);
        if (healingItem) {
          inventory.useItem(healingItem.id, player);
          actionExecuted = true;
        }
        break;
    }
    
    if (actionExecuted) {
      // Update the combat state
      const newState = combatSystemRef.current.getState();
      setCombatData(newState);
    }
    
    setSelectedAction('');
    setSelectedTarget(-1);
  };

  const endCombat = (victory: boolean) => {
    if (victory) {
      // Award experience from defeated enemies
      let totalExp = 0;
      enemies.forEach((enemy: any) => {
        if (enemy.currentHp <= 0) {
          totalExp += enemy.expReward || 10;
        }
      });
      
      player.gainExp(totalExp);
      
      // Award dream shards
      inventory.addDreamShards(enemies.length);
      
      console.log(`Victory! Gained ${totalExp} experience and ${enemies.length} dream shards!`);
    } else {
      console.log('Defeat...');
      // Could add penalties or different handling for defeat
    }
    
    // Clean up combat
    combatSystemRef.current = null;
    setCombatData(null);
    setGameState('exploration');
  };

  return (
    <div className="combat-ui">
      <div className="combat-field">
        {/* Enemy Display */}
        <div className="enemies-section">
          <h3>Shadows</h3>
          <div className="combatants-list">
            {enemies.map((enemy: any, index: number) => (
              <div 
                key={index} 
                className={`combatant enemy ${selectedAction && selectedTarget === index ? 'selected' : ''}`}
                onClick={() => selectedAction && handleTargetSelect(index)}
              >
                <div className="combatant-name">{enemy.name}</div>
                <div className="combatant-hp">
                  <div className="hp-bar">
                    <div 
                      className="hp-fill" 
                      style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}
                    />
                  </div>
                  <span>{enemy.currentHp}/{enemy.maxHp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ally Display */}
        <div className="allies-section">
          <h3>Dream Companions</h3>
          <div className="combatants-list">
            <div className="combatant ally player">
              <div className="combatant-name">{player.name}</div>
              <div className="combatant-hp">
                <div className="hp-bar">
                  <div 
                    className="hp-fill" 
                    style={{ width: `${(player.currentHp / player.maxHp) * 100}%` }}
                  />
                </div>
                <span>{player.currentHp}/{player.maxHp}</span>
              </div>
              <div className="combatant-mp">
                <div className="mp-bar">
                  <div 
                    className="mp-fill" 
                    style={{ width: `${(player.currentMp / player.maxMp) * 100}%` }}
                  />
                </div>
                <span>{player.currentMp}/{player.maxMp}</span>
              </div>
            </div>
            
            {allies.map((ally: any, index: number) => (
              <div key={index} className="combatant ally">
                <div className="combatant-name">{ally.name}</div>
                <div className="combatant-hp">
                  <div className="hp-bar">
                    <div 
                      className="hp-fill" 
                      style={{ width: `${(ally.currentHp / ally.maxHp) * 100}%` }}
                    />
                  </div>
                  <span>{ally.currentHp}/{ally.maxHp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Menu */}
      {phase === 'player_turn' && (
        <div className="action-menu">
          <h3>Choose Action</h3>
          <div className="action-buttons">
            <button 
              className="action-button"
              onClick={() => handleAction('attack')}
            >
              <span className="action-icon">⚔️</span>
              Attack
            </button>
            <button 
              className="action-button"
              onClick={() => handleAction('skill')}
            >
              <span className="action-icon">✨</span>
              Psychic
            </button>
            <button 
              className="action-button"
              onClick={() => handleAction('guard')}
            >
              <span className="action-icon">🛡️</span>
              Guard
            </button>
            <button 
              className="action-button"
              onClick={() => handleAction('item')}
            >
              <span className="action-icon">💊</span>
              Item
            </button>
          </div>
          
          {selectedAction && (selectedAction === 'attack' || selectedAction === 'skill') && (
            <div className="target-selection">
              <h4>Select Target</h4>
              <p>Click on an enemy to target</p>
            </div>
          )}
        </div>
      )}

      {/* Turn Indicator */}
      <div className="turn-indicator">
        {phase === 'player_turn' && <span>Your Turn</span>}
        {phase === 'enemy_turn' && <span>Enemy Turn</span>}
        {phase === 'ally_turn' && <span>Ally Turn</span>}
      </div>
    </div>
  );
}
