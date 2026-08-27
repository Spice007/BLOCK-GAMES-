import { create } from 'zustand';
import type {
  BoardGrid,
  BlockInstance,
  GameStatus,
  GameTheme,
  ActivePowerUp,
  UserProfile,
  GameStats,
} from '../types/game';
import {
  createEmptyBoard,
  generateRandomBlocks,
  placeBlock,
  checkLineClears,
  hasAnyLegalMoves,
  canPlaceBlock,
} from '../utils/gameHelpers';

const API_BASE = 'http://localhost:5000/api';

interface GameState {
  // States
  board: BoardGrid;
  blocks: BlockInstance[];
  score: number;
  highScore: number;
  combo: number;
  coins: number;
  diamonds: number;
  status: GameStatus;
  theme: GameTheme;
  activePowerUp: ActivePowerUp;
  boardHistory: BoardGrid[];
  scoreHistory: number[];
  profile: UserProfile;
  stats: GameStats;

  // Auth States
  token: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  leaderboardList: any[];

  // UI States
  showSettings: boolean;
  showShop: boolean;
  showLeaderboard: boolean;
  showAchievements: boolean;
  showStats: boolean;
  showDailyReward: boolean;

  // Actions
  startGame: () => void;
  placeBlockOnBoard: (blockId: string, row: number, col: number) => boolean;
  setTheme: (theme: GameTheme) => void;
  setActivePowerUp: (powerUp: ActivePowerUp) => void;
  triggerPowerUp: (row: number, col: number) => void;
  triggerShuffle: () => void;
  undoLastMove: () => void;
  addCoins: (amount: number) => void;
  addDiamonds: (amount: number) => void;
  deductCoins: (amount: number) => boolean;
  deductDiamonds: (amount: number) => boolean;
  setGameStatus: (status: GameStatus) => void;
  toggleUI: (panel: 'settings' | 'shop' | 'leaderboard' | 'achievements' | 'stats' | 'dailyReward') => void;

  // Network/Auth Actions
  loginUser: (username: string, password: string) => Promise<boolean>;
  registerUser: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  syncWithServer: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  initializeSession: () => void;
}

const defaultProfile: UserProfile = {
  username: 'BlockCrusher',
  avatar: 'BC',
  level: 1,
  xp: 0,
  coins: 500,
  diamonds: 50,
};

const defaultStats: GameStats = {
  highScore: 0,
  score: 0,
  gamesPlayed: 0,
  linesCleared: 0,
  bestCombo: 0,
  coinsEarned: 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  // Initial States
  board: createEmptyBoard(),
  blocks: [],
  score: 0,
  highScore: 0,
  combo: 0,
  coins: 500,
  diamonds: 50,
  status: 'splash',
  theme: 'default',
  activePowerUp: null,
  boardHistory: [],
  scoreHistory: [],
  profile: defaultProfile,
  stats: defaultStats,

  token: null,
  isAuthenticated: false,
  authLoading: false,
  authError: null,
  leaderboardList: [],

  showSettings: false,
  showShop: false,
  showLeaderboard: false,
  showAchievements: false,
  showStats: false,
  showDailyReward: false,

  initializeSession: () => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        set({
          token: savedToken,
          isAuthenticated: true,
          profile: {
            username: user.username,
            avatar: user.username ? user.username.substring(0, 2).toUpperCase() : 'BC',
            level: user.level || 1,
            xp: user.xp || 0,
            coins: user.coins || 500,
            diamonds: user.diamonds || 50,
          },
          highScore: user.highScore || 0,
          coins: user.coins || 500,
          diamonds: user.diamonds || 50,
          stats: {
            highScore: user.highScore || 0,
            score: 0,
            gamesPlayed: user.stats?.gamesPlayed || 0,
            linesCleared: user.stats?.linesCleared || 0,
            bestCombo: user.stats?.bestCombo || 0,
            coinsEarned: user.stats?.coinsEarned || 0,
          }
        });
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  startGame: () => {
    const initialBlocks = generateRandomBlocks();
    set((state) => ({
      board: createEmptyBoard(),
      blocks: initialBlocks,
      score: 0,
      combo: 0,
      status: 'playing',
      boardHistory: [],
      scoreHistory: [],
      activePowerUp: null,
      stats: {
        ...state.stats,
        gamesPlayed: state.stats.gamesPlayed + 1,
      },
    }));
    get().syncWithServer();
  },

  placeBlockOnBoard: (blockId, row, col) => {
    const { board, blocks, score, combo, highScore, boardHistory, scoreHistory } = get();
    const blockIndex = blocks.findIndex((b) => b.id === blockId && !b.used);

    if (blockIndex === -1) return false;
    const block = blocks[blockIndex];

    if (!canPlaceBlock(board, block.shape, row, col)) {
      return false;
    }

    const newBoardHistory = [...boardHistory, board.map(r => r.map(c => ({ ...c })))].slice(-5);
    const newScoreHistory = [...scoreHistory, score].slice(-5);

    const placedBoard = placeBlock(board, block.shape, row, col, block.color, block.id);

    const cellsCount = block.shape.flat().filter((x) => x === 1).length;
    let turnScore = cellsCount * 10;

    const { clearedBoard, clearedLines } = checkLineClears(placedBoard);
    const clearedLinesCount = clearedLines.rows.length + clearedLines.cols.length;

    let newCombo = combo;
    if (clearedLinesCount > 0) {
      newCombo += 1;
      const lineScore = clearedLinesCount * 100 * newCombo;
      turnScore += lineScore;
    } else {
      newCombo = 0;
    }

    const newScore = score + turnScore;
    const newHighScore = Math.max(highScore, newScore);

    const updatedBlocks = blocks.map((b) =>
      b.id === blockId ? { ...b, used: true } : b
    );

    const allUsed = updatedBlocks.every((b) => b.used);
    const finalBlocks = allUsed ? generateRandomBlocks() : updatedBlocks;

    let xpGained = turnScore;
    let currentXp = get().profile.xp + xpGained;
    let currentLevel = get().profile.level;
    const xpNeeded = currentLevel * 1000;
    if (currentXp >= xpNeeded) {
      currentLevel += 1;
      currentXp -= xpNeeded;
    }

    const coinsGained = clearedLinesCount * 5 + (newCombo > 1 ? newCombo * 2 : 0);

    set((state) => ({
      board: clearedBoard,
      blocks: finalBlocks,
      score: newScore,
      highScore: newHighScore,
      combo: newCombo,
      boardHistory: newBoardHistory,
      scoreHistory: newScoreHistory,
      coins: state.coins + coinsGained,
      profile: {
        ...state.profile,
        xp: currentXp,
        level: currentLevel,
        coins: state.coins + coinsGained,
      },
      stats: {
        ...state.stats,
        highScore: newHighScore,
        score: newScore,
        linesCleared: state.stats.linesCleared + clearedLinesCount,
        bestCombo: Math.max(state.stats.bestCombo, newCombo),
        coinsEarned: state.stats.coinsEarned + coinsGained,
      },
    }));

    if (!hasAnyLegalMoves(clearedBoard, finalBlocks)) {
      set({ status: 'gameover' });
    }

    get().syncWithServer();
    return true;
  },

  setTheme: (theme) => set({ theme }),

  setActivePowerUp: (powerUp) => set({ activePowerUp: powerUp }),

  triggerPowerUp: (row, col) => {
    const { activePowerUp, board, coins } = get();
    if (!activePowerUp) return;

    const newBoard = board.map((r) => r.map((c) => ({ ...c })));
    let cost = 0;

    if (activePowerUp === 'hammer') {
      cost = 100;
      if (coins < cost) return;
      newBoard[row][col] = { filled: false, color: '' };
    } else if (activePowerUp === 'bomb') {
      cost = 250;
      if (coins < cost) return;
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            newBoard[r][c] = { filled: false, color: '' };
          }
        }
      }
    }

    const { clearedBoard, clearedLines } = checkLineClears(newBoard);
    const clearedLinesCount = clearedLines.rows.length + clearedLines.cols.length;

    set((state) => ({
      board: clearedBoard,
      coins: state.coins - cost,
      activePowerUp: null,
      profile: {
        ...state.profile,
        coins: state.profile.coins - cost,
      },
      stats: {
        ...state.stats,
        linesCleared: state.stats.linesCleared + clearedLinesCount,
      },
    }));
    get().syncWithServer();
  },

  triggerShuffle: () => {
    const { coins } = get();
    const cost = 150;
    if (coins < cost) return;

    set((state) => ({
      blocks: generateRandomBlocks(),
      coins: state.coins - cost,
      profile: {
        ...state.profile,
        coins: state.profile.coins - cost,
      },
    }));
    get().syncWithServer();
  },

  undoLastMove: () => {
    const { boardHistory, scoreHistory, coins } = get();
    const cost = 200;
    if (coins < cost || boardHistory.length === 0) return;

    const previousBoard = boardHistory[boardHistory.length - 1];
    const previousScore = scoreHistory[scoreHistory.length - 1];

    set((state) => ({
      board: previousBoard,
      score: previousScore,
      combo: 0,
      boardHistory: boardHistory.slice(0, -1),
      scoreHistory: scoreHistory.slice(0, -1),
      coins: state.coins - cost,
      profile: {
        ...state.profile,
        coins: state.profile.coins - cost,
      },
    }));
    get().syncWithServer();
  },

  addCoins: (amount) => {
    set((state) => ({
      coins: state.coins + amount,
      profile: { ...state.profile, coins: state.profile.coins + amount },
    }));
    get().syncWithServer();
  },

  addDiamonds: (amount) => {
    set((state) => ({
      diamonds: state.diamonds + amount,
      profile: { ...state.profile, diamonds: state.profile.diamonds + amount },
    }));
    get().syncWithServer();
  },

  deductCoins: (amount) => {
    const { coins } = get();
    if (coins < amount) return false;
    set((state) => ({
      coins: state.coins - amount,
      profile: { ...state.profile, coins: state.profile.coins - amount },
    }));
    get().syncWithServer();
    return true;
  },

  deductDiamonds: (amount) => {
    const { diamonds } = get();
    if (diamonds < amount) return false;
    set((state) => ({
      diamonds: state.diamonds - amount,
      profile: { ...state.profile, diamonds: state.profile.diamonds - amount },
    }));
    get().syncWithServer();
    return true;
  },

  setGameStatus: (status) => set({ status }),

  toggleUI: (panel) => {
    set((state) => {
      switch (panel) {
        case 'settings':
          return { showSettings: !state.showSettings };
        case 'shop':
          return { showShop: !state.showShop };
        case 'leaderboard':
          return { showLeaderboard: !state.showLeaderboard };
        case 'achievements':
          return { showAchievements: !state.showAchievements };
        case 'stats':
          return { showStats: !state.showStats };
        case 'dailyReward':
          return { showDailyReward: !state.showDailyReward };
        default:
          return {};
      }
    });
    if (panel === 'leaderboard' && !get().showLeaderboard) {
      get().fetchLeaderboard();
    }
  },

  loginUser: async (username, password) => {
    set({ authLoading: true, authError: null });
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      set({
        token: data.token,
        isAuthenticated: true,
        authLoading: false,
        profile: {
          username: data.user.username,
          avatar: data.user.username ? data.user.username.substring(0, 2).toUpperCase() : 'BC',
          level: data.user.level || 1,
          xp: data.user.xp || 0,
          coins: data.user.coins || 500,
          diamonds: data.user.diamonds || 50,
        },
        highScore: data.user.highScore || 0,
        coins: data.user.coins || 500,
        diamonds: data.user.diamonds || 50,
        stats: {
          highScore: data.user.highScore || 0,
          score: 0,
          gamesPlayed: data.user.stats?.gamesPlayed || 0,
          linesCleared: data.user.stats?.linesCleared || 0,
          bestCombo: data.user.stats?.bestCombo || 0,
          coinsEarned: data.user.stats?.coinsEarned || 0,
        }
      });
      return true;
    } catch (e: any) {
      set({ authLoading: false, authError: e.message });
      return false;
    }
  },

  registerUser: async (username, password) => {
    set({ authLoading: true, authError: null });
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      set({
        token: data.token,
        isAuthenticated: true,
        authLoading: false,
        profile: {
          username: data.user.username,
          avatar: data.user.username ? data.user.username.substring(0, 2).toUpperCase() : 'BC',
          level: 1,
          xp: 0,
          coins: 500,
          diamonds: 50,
        },
        highScore: 0,
        coins: 500,
        diamonds: 50,
        stats: defaultStats,
      });
      return true;
    } catch (e: any) {
      set({ authLoading: false, authError: e.message });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      token: null,
      isAuthenticated: false,
      profile: defaultProfile,
      highScore: 0,
      coins: 500,
      diamonds: 50,
      stats: defaultStats,
    });
  },

  syncWithServer: async () => {
    const { token, isAuthenticated, profile, stats } = get();
    if (!token || !isAuthenticated) return;

    try {
      const res = await fetch(`${API_BASE}/game/sync`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profile, stats })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (e) {
      console.error('Failed to sync progress with database:', e);
    }
  },

  fetchLeaderboard: async () => {
    try {
      const res = await fetch(`${API_BASE}/game/leaderboard`);
      const data = await res.json();
      if (res.ok) {
        set({ leaderboardList: data });
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e);
    }
  },
}));
