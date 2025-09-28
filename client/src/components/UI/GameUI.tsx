import React from 'react';
import { useGame } from '../../contexts/GameContext';

export default function GameUI() {
  const { gameState, player, inventory, setGameState, saveGame } = useGame();

  return (
    <div className="game-ui">
      {/* Top HUD */}
      <div className="hud-top">
        <div className="player-status">
          <div className="health-bar">
            <div className="bar-label">Health</div>
            <div className="bar-container">
              <div 
                className="bar-fill health-fill" 
                style={{ width: `${(player.currentHp / player.maxHp) * 100}%` }}
              />
              <span className="bar-text">{player.currentHp}/{player.maxHp}</span>
            </div>
          </div>
          
          <div className="mana-bar">
            <div className="bar-label">Psyche</div>
            <div className="bar-container">
              <div 
                className="bar-fill mana-fill" 
                style={{ width: `${(player.currentMp / player.maxMp) * 100}%` }}
              />
              <span className="bar-text">{player.currentMp}/{player.maxMp}</span>
            </div>
          </div>
          
          <div className="level-display">
            <span className="level-text">Level {player.level}</span>
            <div className="exp-bar">
              <div 
                className="bar-fill exp-fill" 
                style={{ width: `${(player.exp / player.expToNext) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="dream-shards">
          <span className="shard-icon">💎</span>
          <span className="shard-count">{inventory.dreamShards}</span>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="hud-bottom">
        <div className="control-hints">
          <div className="hint">WASD - Move</div>
          <div className="hint">E - Interact</div>
          <div className="hint">Space - Action</div>
        </div>
        
        <div className="quick-actions">
          <button 
            className="ui-button"
            onClick={() => setGameState('inventory')}
            title="Inventory"
          >
            <span className="button-icon">🎒</span>
          </button>
          
          <button 
            className="ui-button"
            onClick={() => setGameState('character')}
            title="Character"
          >
            <span className="button-icon">👤</span>
          </button>
          
          <button 
            className="ui-button"
            onClick={saveGame}
            title="Save Game"
          >
            <span className="button-icon">💾</span>
          </button>
          
          <button 
            className="ui-button"
            onClick={() => setGameState('menu')}
            title="Main Menu"
          >
            <span className="button-icon">🏠</span>
          </button>
        </div>
      </div>
    </div>
  );
}
