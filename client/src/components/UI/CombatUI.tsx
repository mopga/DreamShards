import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';

export default function CombatUI() {
  const { player, combatData, setCombatData, setGameState } = useGame();
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<number>(-1);

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
    // This would typically interact with the combat system
    console.log(`Executing ${action} on target ${target}`);
    
    // For now, just advance turn
    const newCombatData = { ...combatData };
    newCombatData.currentTurn = (currentTurn + 1) % (enemies.length + allies.length + 1);
    setCombatData(newCombatData);
    
    setSelectedAction('');
    setSelectedTarget(-1);
  };

  const endCombat = (victory: boolean) => {
    if (victory) {
      // Award experience and items
      console.log('Victory!');
    } else {
      console.log('Defeat...');
    }
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
