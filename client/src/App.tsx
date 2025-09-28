import React from 'react';
import { GameProvider } from './contexts/GameContext';
import Game from './components/Game';
import './styles/game.css';

function App() {
  return (
    <GameProvider>
      <div className="app">
        <Game />
      </div>
    </GameProvider>
  );
}

export default App;
