import React from 'react';
import { useGame } from '../../contexts/GameContext';

export default function CharacterSheet() {
  const { player, setGameState } = useGame();

  const handleClose = () => {
    setGameState('exploration');
  };

  return (
    <div className="character-overlay">
      <div className="character-panel">
        <div className="character-header">
          <h2>Dreamer's Profile</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <div className="character-content">
          <div className="character-main">
            <div className="character-portrait">
              <div className="portrait-placeholder">👤</div>
              <div className="character-name">{player.name}</div>
              <div className="character-level">Level {player.level}</div>
            </div>

            <div className="character-stats">
              <h3>Vital Statistics</h3>
              <div className="stats-grid">
                <div className="stat">
                  <span className="stat-label">Health</span>
                  <span className="stat-value">{player.currentHp} / {player.maxHp}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Psyche</span>
                  <span className="stat-value">{player.currentMp} / {player.maxMp}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Attack</span>
                  <span className="stat-value">{player.attack}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Defense</span>
                  <span className="stat-value">{player.defense}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Psychic Power</span>
                  <span className="stat-value">{player.magic}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Mental Fortitude</span>
                  <span className="stat-value">{player.resistance}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Agility</span>
                  <span className="stat-value">{player.speed}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="character-progression">
            <h3>Experience</h3>
            <div className="exp-section">
              <div className="exp-bar">
                <div 
                  className="exp-fill" 
                  style={{ width: `${(player.exp / player.expToNext) * 100}%` }}
                />
              </div>
              <div className="exp-text">
                {player.exp} / {player.expToNext} EXP to next level
              </div>
            </div>

            <h3>Dream Abilities</h3>
            <div className="abilities-list">
              {player.skills.length === 0 ? (
                <div className="no-abilities">
                  <p>No psychic abilities learned yet...</p>
                  <p>Level up to unlock new powers</p>
                </div>
              ) : (
                player.skills.map((skill, index) => (
                  <div key={index} className="ability">
                    <div className="ability-icon">{skill.icon}</div>
                    <div className="ability-info">
                      <div className="ability-name">{skill.name}</div>
                      <div className="ability-description">{skill.description}</div>
                      <div className="ability-cost">Cost: {skill.mpCost} Psyche</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <h3>Dream Journal</h3>
            <div className="achievements">
              <div className="achievement">
                <span className="achievement-icon">🏰</span>
                <span>Entered the Palace of Pride</span>
              </div>
              <div className="achievement incomplete">
                <span className="achievement-icon">⚔️</span>
                <span>Defeated a Shadow Avatar</span>
              </div>
              <div className="achievement incomplete">
                <span className="achievement-icon">💎</span>
                <span>Collected 10 Dream Shards</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
