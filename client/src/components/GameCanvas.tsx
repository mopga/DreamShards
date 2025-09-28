import React, { useRef, useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { GameEngine } from '../game/GameEngine';
import { dialogues } from '../data/dialogues';
import { enemies } from '../data/enemies';
import { Enemy } from '../game/Enemy';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { 
    gameState, 
    currentPalace, 
    currentRoom, 
    setGameState, 
    setDialogueData, 
    setCombatData,
    inventory,
    setCurrentPalace,
    setCurrentRoom
  } = useGame();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize game engine
    if (!gameEngineRef.current) {
      const callbacks = {
        onDialogueStart: (dialogueId: string) => {
          const dialogue = dialogues[dialogueId as keyof typeof dialogues];
          if (dialogue) {
            setDialogueData(dialogue);
            setGameState('dialogue');
          }
        },
        onCombatStart: (enemyData: any[]) => {
          const combatEnemies = enemyData.map(enemyInfo => {
            const enemyTemplate = enemies[enemyInfo.id as keyof typeof enemies];
            if (enemyTemplate) {
              return new Enemy({ ...enemyTemplate, level: enemyInfo.level });
            }
            return null;
          }).filter(Boolean);
          
          if (combatEnemies.length > 0) {
            setCombatData({
              enemies: combatEnemies,
              allies: [], // Could add companions here
              currentTurn: 0,
              phase: 'player_turn'
            });
            setGameState('combat');
          }
        },
        onItemCollected: (itemData: any) => {
          if (itemData.reward?.dreamShards) {
            inventory.addDreamShards(itemData.reward.dreamShards);
          }
          console.log('Item collected:', itemData);
        },
        onInteraction: (interaction: any) => {
          console.log('Game interaction:', interaction);
        }
      };
      
      gameEngineRef.current = new GameEngine(canvas, callbacks);
      gameEngineRef.current.initialize().then(() => {
        setIsLoading(false);
      });
    }

    // Start game loop
    let animationId: number;
    const gameLoop = () => {
      if (gameEngineRef.current && !isLoading) {
        gameEngineRef.current.update();
        gameEngineRef.current.render();
      }
      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isLoading]);

  useEffect(() => {
    // Handle palace/room changes
    if (gameEngineRef.current && currentPalace && currentRoom) {
      gameEngineRef.current.loadRoom(currentPalace, currentRoom);
    }
  }, [currentPalace, currentRoom]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading the Dream Realm...</p>
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={1024}
      height={768}
      className="game-canvas"
    />
  );
}
