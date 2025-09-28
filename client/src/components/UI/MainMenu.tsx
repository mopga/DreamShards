import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { SaveSystem } from '../../game/SaveSystem';

export default function MainMenu() {
  const { setGameState, setCurrentPalace, setCurrentRoom, loadGame } = useGame();

  const handleNewGame = () => {
    setCurrentPalace('pride');
    setCurrentRoom('entrance');
    setGameState('exploration');
  };

  const handleLoadGame = () => {
    const saveExists = SaveSystem.hasSaveData();
    if (saveExists) {
      loadGame();
      setGameState('exploration');
    }
  };

  const hasSaveData = SaveSystem.hasSaveData();

  return (
    <div className="main-menu">
      <div className="menu-background"></div>
      <div className="menu-content">
        <h1 className="game-title">Shards of Dreams</h1>
        <p className="game-subtitle">A journey through the fragments of consciousness</p>
        
        <div className="menu-buttons">
          <button className="menu-button primary" onClick={handleNewGame}>
            <span className="button-icon">⚔️</span>
            New Journey
          </button>
          
          <button 
            className={`menu-button ${hasSaveData ? 'secondary' : 'disabled'}`}
            onClick={handleLoadGame}
            disabled={!hasSaveData}
          >
            <span className="button-icon">📖</span>
            Continue Dream
          </button>
          
          <div className="menu-info">
            <p>Navigate the surreal palaces of the mind</p>
            <p>Battle the shadows of your inner fears</p>
            <p>Collect dream shards to unlock new paths</p>
          </div>
        </div>
      </div>
    </div>
  );
}
