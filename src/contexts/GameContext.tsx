import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player, Session, GameId, SpiceLevel } from '../types';
import { PLAYER_COLORS } from '../data/gameData';
import { v4 as uuidv4 } from 'uuid';

interface GameContextType {
  session: Session;
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  updateSpiceLevel: (level: SpiceLevel) => void;
  startSession: () => void;
  setGame: (gameId: GameId) => void;
  nextPlayer: () => void;
  resetSession: () => void;
}

const DEFAULT_SESSION: Session = {
  id: uuidv4(),
  players: [],
  activeGameId: null,
  spiceLevel: 'friends',
  status: 'setup',
  currentPlayerIndex: 0,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session>(() => {
    const saved = localStorage.getItem('partystack_session');
    return saved ? JSON.parse(saved) : DEFAULT_SESSION;
  });

  useEffect(() => {
    localStorage.setItem('partystack_session', JSON.stringify(session));
  }, [session]);

  const addPlayer = (name: string) => {
    if (session.players.length >= 8) return;
    const newPlayer: Player = {
      id: uuidv4(),
      name,
      color: PLAYER_COLORS[session.players.length],
      score: 0,
    };
    setSession(prev => ({
      ...prev,
      players: [...prev.players, newPlayer],
    }));
  };

  const removePlayer = (id: string) => {
    setSession(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== id),
    }));
  };

  const updateSpiceLevel = (spiceLevel: SpiceLevel) => {
    setSession(prev => ({ ...prev, spiceLevel }));
  };

  const startSession = () => {
    if (session.players.length < 2) return;
    setSession(prev => ({ ...prev, status: 'playing' }));
  };

  const setGame = (activeGameId: GameId) => {
    setSession(prev => ({ ...prev, activeGameId }));
  };

  const nextPlayer = () => {
    setSession(prev => ({
      ...prev,
      currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length,
    }));
  };

  const resetSession = () => {
    setSession({ ...DEFAULT_SESSION, id: uuidv4() });
  };

  return (
    <GameContext.Provider value={{ 
      session, 
      addPlayer, 
      removePlayer, 
      updateSpiceLevel, 
      startSession, 
      setGame, 
      nextPlayer,
      resetSession
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
