export type CellState = {
  filled: boolean;
  color: string; // Tailwind color name or hex
  blockId?: string; // ID of the block it belonged to
};

export type BoardGrid = CellState[][]; // 8x8 grid

export type BlockShape = number[][]; // 2D array representing filled/empty cells (e.g. [[1, 1], [0, 1]])

export type BlockInstance = {
  id: string;
  shape: BlockShape;
  color: string;
  width: number;
  height: number;
  used: boolean;
};

export type GameTheme = 'default' | 'neon' | 'galaxy' | 'cyberpunk' | 'wood' | 'ice' | 'retro';

export type GameStatus = 'splash' | 'menu' | 'playing' | 'gameover' | 'paused';

export type ActivePowerUp = 'hammer' | 'bomb' | 'shuffle' | 'undo' | null;

export type UserProfile = {
  username: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  diamonds: number;
};

export type GameStats = {
  highScore: number;
  score: number;
  gamesPlayed: number;
  linesCleared: number;
  bestCombo: number;
  coinsEarned: number;
};
