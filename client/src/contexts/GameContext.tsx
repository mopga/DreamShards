import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Player } from '../game/Player';
import { SaveSystem } from '../game/SaveSystem';
import { Inventory } from '../game/Inventory';

export type GameState = 'menu' | 'exploration' | 'combat' | 'dialogue' | 'inventory' | 'character';

export interface GameContextType {
  gameState: GameState;
  player: Player;
  inventory: Inventory;
  currentPalace: string;
  currentRoom: string;
  dialogueData: any;
  combatData: any;
  setGameState: (state: GameState) => void;
  setCurrentPalace: (palace: string) => void;
  setCurrentRoom: (room: string) => void;
  setDialogueData: (data: any) => void;
  setCombatData: (data: any) => void;
  saveGame: () => void;
  loadGame: () => void;
}

interface GameContextState {
  gameState: GameState;
  player: Player;
  inventory: Inventory;
  currentPalace: string;
  currentRoom: string;
  dialogueData: any;
  combatData: any;
}

type GameAction =
  | { type: 'SET_GAME_STATE'; payload: GameState }
  | { type: 'SET_CURRENT_PALACE'; payload: string }
  | { type: 'SET_CURRENT_ROOM'; payload: string }
  | { type: 'SET_DIALOGUE_DATA'; payload: any }
  | { type: 'SET_COMBAT_DATA'; payload: any }
  | { type: 'UPDATE_PLAYER'; payload: Partial<Player> }
  | { type: 'LOAD_SAVE_DATA'; payload: any };

const initialState: GameContextState = {
  gameState: 'menu',
  player: new Player(),
  inventory: new Inventory(),
  currentPalace: '',
  currentRoom: '',
  dialogueData: null,
  combatData: null,
};

function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload };
    case 'SET_CURRENT_PALACE':
      return { ...state, currentPalace: action.payload };
    case 'SET_CURRENT_ROOM':
      return { ...state, currentRoom: action.payload };
    case 'SET_DIALOGUE_DATA':
      return { ...state, dialogueData: action.payload };
    case 'SET_COMBAT_DATA':
      return { ...state, combatData: action.payload };
    case 'UPDATE_PLAYER':
      return { ...state, player: { ...state.player, ...action.payload } };
    case 'LOAD_SAVE_DATA':
      return {
        ...state,
        player: action.payload.player || state.player,
        inventory: action.payload.inventory || state.inventory,
        currentPalace: action.payload.currentPalace || '',
        currentRoom: action.payload.currentRoom || '',
      };
    default:
      return state;
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const setGameState = (gameState: GameState) => {
    dispatch({ type: 'SET_GAME_STATE', payload: gameState });
  };

  const setCurrentPalace = (palace: string) => {
    dispatch({ type: 'SET_CURRENT_PALACE', payload: palace });
  };

  const setCurrentRoom = (room: string) => {
    dispatch({ type: 'SET_CURRENT_ROOM', payload: room });
  };

  const setDialogueData = (data: any) => {
    dispatch({ type: 'SET_DIALOGUE_DATA', payload: data });
  };

  const setCombatData = (data: any) => {
    dispatch({ type: 'SET_COMBAT_DATA', payload: data });
  };

  const saveGame = () => {
    SaveSystem.saveGame({
      player: state.player,
      inventory: state.inventory,
      currentPalace: state.currentPalace,
      currentRoom: state.currentRoom,
    });
  };

  const loadGame = () => {
    const saveData = SaveSystem.loadGame();
    if (saveData) {
      dispatch({ type: 'LOAD_SAVE_DATA', payload: saveData });
    }
  };

  useEffect(() => {
    // Auto-save every 30 seconds during gameplay
    if (state.gameState !== 'menu') {
      const interval = setInterval(saveGame, 30000);
      return () => clearInterval(interval);
    }
  }, [state.gameState]);

  const value: GameContextType = {
    ...state,
    setGameState,
    setCurrentPalace,
    setCurrentRoom,
    setDialogueData,
    setCombatData,
    saveGame,
    loadGame,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
