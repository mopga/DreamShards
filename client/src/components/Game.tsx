import React, { useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import MainMenu from './UI/MainMenu';
import GameCanvas from './GameCanvas';
import GameUI from './UI/GameUI';
import DialogueBox from './UI/DialogueBox';
import CombatUI from './UI/CombatUI';
import InventoryUI from './UI/InventoryUI';
import CharacterSheet from './UI/CharacterSheet';

export default function Game() {
  const { gameState, loadGame } = useGame();

  useEffect(() => {
    // Try to load a saved game on startup
    loadGame();
  }, []);

  return (
    <div className="game-container">
      {gameState === 'menu' && <MainMenu />}
      
      {(gameState === 'exploration' || gameState === 'combat' || gameState === 'dialogue') && (
        <>
          <GameCanvas />
          <GameUI />
        </>
      )}
      
      {gameState === 'dialogue' && <DialogueBox />}
      {gameState === 'combat' && <CombatUI />}
      {gameState === 'inventory' && <InventoryUI />}
      {gameState === 'character' && <CharacterSheet />}
    </div>
  );
}
