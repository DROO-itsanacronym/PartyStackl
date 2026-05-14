export type SpiceLevel = 'family' | 'friends' | 'savage';

export type GameId = 'truth-dare' | 'charades' | 'impostor' | 'who-said-this' | 'most-likely' | 'mafia';

export interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
}

export interface Session {
  id: string;
  players: Player[];
  activeGameId: GameId | null;
  spiceLevel: SpiceLevel;
  status: 'setup' | 'playing' | 'recap';
  currentPlayerIndex: number;
}

export interface TruthDareCard {
  id: string;
  text: string;
  level: number;
  type: 'truth' | 'dare';
}
