import React, { useRef, useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { GameEngine } from '../game/GameEngine';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { gameState, currentPalace, currentRoom } = useGame();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize game engine
    if (!gameEngineRef.current) {
      gameEngineRef.current = new GameEngine(canvas);
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
