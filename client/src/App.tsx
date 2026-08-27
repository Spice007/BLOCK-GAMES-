import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from './store/useGameStore';
import { Board } from './components/Board';
import { BlockDock } from './components/BlockDock';
import { BlockPiece } from './components/BlockPiece';
import type { BlockInstance } from './types/game';
import {
  Trophy,
  Coins,
  Gem,
  RotateCcw,
  Sparkles,
  Settings as SettingsIcon,
  ShoppingBag,
  BarChart3,
  Award,
  Volume2,
  VolumeX,
  Play,
  X,
  User,
  LogOut,
  LogIn,
  Loader2,
  Flame,
  Music,
  SkipBack,
  SkipForward,
  Pause,
  Home,
  Calendar,
  Gift,
  Crown,
  Lightbulb,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const {
    board,
    blocks,
    score,
    highScore,
    combo,
    coins,
    diamonds,
    status,
    theme,
    activePowerUp,
    profile,
    stats,
    isAuthenticated,
    authLoading,
    authError,
    leaderboardList,
    showSettings,
    showShop,
    showLeaderboard,
    showStats,
    startGame,
    placeBlockOnBoard,
    setTheme,
    setActivePowerUp,
    triggerPowerUp,
    triggerShuffle,
    toggleUI,
    loginUser,
    registerUser,
    logout,
    initializeSession,
  } = useGameStore();

  // Dragging states
  const [draggedBlock, setDraggedBlock] = useState<BlockInstance | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Music Player States
  const [musicPlaying, setMusicPlaying] = useState(true);

  // Auth form states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [localAuthError, setLocalAuthError] = useState<string | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const boardRef = useRef<HTMLDivElement | null>(null);

  // Initialize session on startup
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Pointer move handler for dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!draggedBlock) return;

      const cellSize = 45; // Match board cell size
      const blockWidth = draggedBlock.width * cellSize;
      const blockHeight = draggedBlock.height * cellSize;

      const offsetY = e.pointerType === 'touch' ? -65 : -35;
      const blockLeft = e.clientX - blockWidth / 2;
      const blockTop = e.clientY - blockHeight / 2 + offsetY;

      setDragPosition({ x: blockLeft, y: blockTop });

      if (!boardRef.current) return;

      const rect = boardRef.current.getBoundingClientRect();
      const cellWidth = rect.width / 10;
      const cellHeight = rect.height / 10;

      const col = Math.round((blockLeft - rect.left) / cellWidth);
      const row = Math.round((blockTop - rect.top) / cellHeight);

      if (row >= 0 && row < 10 && col >= 0 && col < 10) {
        setHoveredCell({ row, col });
      } else {
        setHoveredCell(null);
      }
    };

    const handlePointerUp = () => {
      if (draggedBlock) {
        if (hoveredCell) {
          const placed = placeBlockOnBoard(draggedBlock.id, hoveredCell.row, hoveredCell.col);
          if (placed && soundEnabled) {
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.type = 'sine';
              osc.frequency.setValueAtTime(440, audioCtx.currentTime);
              gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
              osc.start();
              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
              osc.stop(audioCtx.currentTime + 0.15);
            } catch (e) {
              console.log('Audio error:', e);
            }
          }
        }
        setDraggedBlock(null);
        setHoveredCell(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggedBlock, hoveredCell, placeBlockOnBoard, soundEnabled]);

  const handleStartDrag = (e: React.PointerEvent<HTMLDivElement>, block: BlockInstance) => {
    e.preventDefault();
    setDraggedBlock(block);
    const cellSize = 45;
    const blockWidth = block.width * cellSize;
    const blockHeight = block.height * cellSize;
    const offsetY = e.pointerType === 'touch' ? -65 : -35;
    setDragPosition({
      x: e.clientX - blockWidth / 2,
      y: e.clientY - blockHeight / 2 + offsetY,
    });
  };

  const handleCellClick = (row: number, col: number) => {
    if (activePowerUp) {
      triggerPowerUp(row, col);
      if (soundEnabled) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
          osc.stop(audioCtx.currentTime + 0.3);
        } catch (e) {}
      }
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalAuthError(null);
    if (!usernameInput || !passwordInput) {
      setLocalAuthError('All fields are required');
      return;
    }

    let success = false;
    if (authMode === 'login') {
      success = await loginUser(usernameInput, passwordInput);
    } else {
      success = await registerUser(usernameInput, passwordInput);
    }

    if (success) {
      setShowAuthModal(false);
      setUsernameInput('');
      setPasswordInput('');
    }
  };

  return (
    <div className={`min-h-screen bg-[#3b5295] text-slate-100 font-sans flex items-center justify-center p-4 select-none theme-${theme} relative overflow-hidden`}>
      
      {/* Background ambient glows */}
      <div className="absolute top-[-15%] left-[-15%] w-[60%] aspect-square rounded-full glow-accent blur-[140px] pointer-events-none animate-pulse-gentle opacity-40" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] aspect-square rounded-full glow-accent blur-[140px] pointer-events-none animate-pulse-gentle opacity-40" />
      
      {/* Centered vertical mobile layout */}
      <div className="w-full max-w-[440px] flex flex-col items-center gap-4 z-10 relative">
        
        {status === 'splash' ? (
          <div className="w-full flex flex-col items-center gap-6 py-4">
            {/* Logo / Title Area */}
            <div className="text-center flex flex-col items-center gap-2">
              <div className="flex gap-1.5 justify-center mb-1 animate-float-gentle mt-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 block-tile-3d flex items-center justify-center font-extrabold text-white text-xs shadow-md">B</div>
                <div className="w-8 h-8 rounded-lg bg-purple-500 block-tile-3d flex items-center justify-center font-extrabold text-white text-xs shadow-md">L</div>
                <div className="w-8 h-8 rounded-lg bg-pink-500 block-tile-3d flex items-center justify-center font-extrabold text-white text-xs shadow-md">O</div>
                <div className="w-8 h-8 rounded-lg bg-amber-500 block-tile-3d flex items-center justify-center font-extrabold text-white text-xs shadow-md">C</div>
                <div className="w-8 h-8 rounded-lg bg-cyan-500 block-tile-3d flex items-center justify-center font-extrabold text-white text-xs shadow-md">K</div>
              </div>
              <h1 className="text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 drop-shadow-lg uppercase select-none">
                Block Crush
              </h1>
              <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase">Classic Puzzle Adventure</p>
            </div>

            {/* Profile Card / Login Request */}
            <div className="w-full card-panel rounded-3xl p-5 border border-white/5 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/20 flex items-center justify-center font-black text-sm shadow-md text-white">
                    {profile.avatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-200 flex items-center gap-1.5">
                      {profile.username}
                      <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/10 px-1.5 py-0.5 rounded font-sans uppercase">
                        LV {profile.level}
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-1">
                      <Trophy size={11} className="text-amber-400" /> Best Score: {highScore}
                    </p>
                  </div>
                </div>

                {isAuthenticated ? (
                  <button
                    onClick={logout}
                    title="Log Out"
                    className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                  >
                    <LogOut size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="py-1.5 px-3 rounded-xl bg-indigo-500 hover:bg-indigo-650 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1 cursor-pointer btn-premium"
                  >
                    <LogIn size={12} /> Sign In
                  </button>
                )}
              </div>

              {/* Mini Stats Summary */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                <div className="bg-slate-950/30 rounded-xl p-2.5 border border-white/[0.02] flex flex-col justify-between">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">💎 Diamonds</span>
                  <span className="text-xs font-black text-slate-200 mt-1 flex items-center gap-1">
                    {diamonds} <span className="text-indigo-400">♦</span>
                  </span>
                </div>
                <div className="bg-slate-950/30 rounded-xl p-2.5 border border-white/[0.02] flex flex-col justify-between">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">🪙 Coins</span>
                  <span className="text-xs font-black text-amber-500 mt-1 flex items-center gap-1">
                    {coins} <Coins size={10} />
                  </span>
                </div>
              </div>
            </div>

            {/* Play Button Container */}
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={startGame}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-[1.02] active:scale-95 font-extrabold text-base text-white tracking-wider uppercase transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 border border-white/10 group cursor-pointer btn-premium"
              >
                <Play size={18} fill="currentColor" className="group-hover:translate-x-0.5 transition-transform" />
                PLAY NOW
              </button>

              {/* Grid of Menus */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => toggleUI('leaderboard')}
                  className="py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-500/30 flex items-center justify-center gap-2 transition-all font-bold text-xs text-slate-200 cursor-pointer"
                >
                  <Award size={14} className="text-cyan-400" /> LEADERBOARD
                </button>
                <button
                  onClick={() => toggleUI('shop')}
                  className="py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-amber-500/30 flex items-center justify-center gap-2 transition-all font-bold text-xs text-slate-200 cursor-pointer"
                >
                  <ShoppingBag size={14} className="text-amber-400" /> SHOP / SKIN
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => toggleUI('stats')}
                  className="py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/30 flex items-center justify-center gap-2 transition-all font-bold text-xs text-slate-200 cursor-pointer"
                >
                  <BarChart3 size={14} className="text-indigo-400" /> STATS
                </button>
                <button
                  onClick={() => setShowHowToPlay(true)}
                  className="py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-purple-500/30 flex items-center justify-center gap-2 transition-all font-bold text-xs text-slate-200 cursor-pointer"
                >
                  <HelpCircle size={14} className="text-purple-400" /> HOW TO PLAY
                </button>
              </div>
            </div>

            {/* Version and settings shortcut */}
            <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <span>v1.0.0</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <button onClick={() => toggleUI('settings')} className="hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer">
                <SettingsIcon size={10} /> SETTINGS
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Top Header */}
            <div className="w-full flex items-center justify-between px-1 text-white">
              {/* User Profile */}
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/20 flex items-center justify-center font-black text-xs shadow-md">
                  {profile.avatar}
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Level {profile.level}</p>
                  <p className="text-xs font-extrabold truncate max-w-[80px]">{profile.username}</p>
                </div>
              </button>

              {/* Stats Summary */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-white/70 font-bold tracking-widest uppercase">SCORE</span>
                <span className="text-2xl font-black tracking-tight text-white">{score}</span>
                <span className="text-[9px] text-amber-300 font-bold">BEST {highScore}</span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5">
                <button onClick={() => toggleUI('leaderboard')} title="Leaderboard" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white"><BarChart3 size={15} /></button>
                <button onClick={() => toggleUI('shop')} title="Shop" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white"><ShoppingBag size={15} /></button>
                <button onClick={() => toggleUI('settings')} title="Settings" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white"><SettingsIcon size={15} /></button>
              </div>
            </div>

            {/* Top Block Shape Preview */}
            <div className="flex justify-center h-8 items-center">
              <div className="transform scale-[0.8] opacity-90">
                <BlockPiece shape={[[1, 1, 1], [0, 1, 0]]} color="#fbc531" size={13} />
              </div>
            </div>

            {/* Combo Indicator */}
            <div className="h-4 flex items-center justify-center">
              {combo > 0 ? (
                <div className="bg-purple-500/20 border border-purple-500/40 px-3.5 py-0.5 rounded-full text-[10px] font-bold text-purple-200 flex items-center gap-1.5 animate-bounce shadow-md">
                  <Sparkles size={11} /> COMBO X{combo}
                </div>
              ) : null}
            </div>

            {/* Game Over Screen */}
            {status === 'gameover' && (
              <div className="absolute inset-0 bg-[#0c122c]/90 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-md rounded-3xl">
                <div className="card-panel rounded-3xl p-8 max-w-sm w-full border border-rose-500/20 text-center shadow-2xl relative overflow-hidden">
                  <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400 mb-2">
                    GAME OVER
                  </h2>
                  <p className="text-slate-400 text-xs mb-6">No legal moves remaining on the board!</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-950/40 rounded-xl p-3 border border-white/[0.03]">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Final Score</p>
                      <p className="text-xl font-black text-slate-200 mt-0.5">{score}</p>
                    </div>
                    <div className="bg-slate-950/40 rounded-xl p-3 border border-white/[0.03]">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Best Score</p>
                      <p className="text-xl font-black text-amber-400 mt-0.5">{highScore}</p>
                    </div>
                  </div>
                  <button
                    onClick={startGame}
                    className="w-full py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-bold text-sm transition-all btn-premium shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                  >
                    <Play size={16} fill="currentColor" /> Play Again
                  </button>
                </div>
              </div>
            )}

            {/* Game Board */}
            <div ref={boardRef} className="relative select-none touch-none w-full flex justify-center">
              <Board
                board={board}
                draggedBlock={draggedBlock}
                hoveredCell={hoveredCell}
                activePowerUp={activePowerUp}
                onCellClick={handleCellClick}
              />
            </div>

            {/* Active Powerup Notification */}
            {activePowerUp && (
              <div className="px-4 py-1 bg-rose-500/20 border border-rose-500/40 rounded-xl text-center text-[10px] text-rose-200 font-bold animate-pulse">
                Click a cell to trigger {activePowerUp.toUpperCase()}
              </div>
            )}

            {/* CLASSIC Banner */}
            <div className="w-full max-w-[420px] bg-gradient-to-r from-[#9b5de5] to-[#7209b7] py-2.5 rounded-2xl shadow-lg border border-purple-500/30 text-center flex items-center justify-center mt-1">
              <span className="text-lg font-black tracking-widest text-white uppercase font-sans">CLASSIC</span>
            </div>

            {/* Block Dock */}
            <div className="w-full flex justify-center">
              <BlockDock blocks={blocks} onStartDrag={handleStartDrag} />
            </div>

            {/* Powerups & Tools Row */}
            <div className="w-full grid grid-cols-3 gap-3 mt-2 max-w-[420px]">
              <button
                onClick={triggerShuffle}
                disabled={coins < 150}
                className="py-2 rounded-xl bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-0.5 border border-white/5 transition-all text-white"
              >
                <div className="flex items-center gap-1">
                  <Sparkles size={13} className="text-cyan-300" />
                  <span className="text-[10px] font-bold">Swap</span>
                </div>
                <span className="text-[8px] text-white/50 font-bold">💎 10</span>
              </button>

              <button
                onClick={startGame}
                className="py-2 rounded-xl bg-gradient-to-tr from-purple-650 to-indigo-650 hover:from-purple-600 hover:to-indigo-600 flex flex-col items-center justify-center border border-purple-400/20 transition-all text-white shadow-md"
              >
                <RotateCcw size={13} />
                <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Restart</span>
              </button>

              <button
                onClick={() => setActivePowerUp(activePowerUp === 'hammer' ? null : 'hammer')}
                disabled={coins < 100}
                className={`py-2 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all ${activePowerUp === 'hammer' ? 'border-amber-500 bg-amber-500/20 text-white' : 'bg-white/5 hover:bg-white/10 border-white/5 text-white'}`}
              >
                <div className="flex items-center gap-1">
                  <Lightbulb size={13} className="text-amber-300" />
                  <span className="text-[10px] font-bold">Hint</span>
                </div>
                <span className="text-[8px] text-white/50 font-bold">💎 10</span>
              </button>
            </div>
          </>
        )}

      </div>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-[#03050c]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="card-panel rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black flex items-center gap-2 text-[#3b82f6]">
                <User size={18} /> {authMode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </h3>
              <button onClick={() => setShowAuthModal(false)} className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white transition-all btn-premium">
                <X size={14} />
              </button>
            </div>

            {(localAuthError || authError) && (
              <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-400 font-semibold shadow-inner">
                {localAuthError || authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Username</label>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Enter username"
                  className="bg-slate-950/40 border border-white/5 rounded-xl py-2 px-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Password</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  className="bg-slate-950/40 border border-white/5 rounded-xl py-2 px-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 mt-2 rounded-xl bg-indigo-500 hover:bg-indigo-650 text-sm font-bold shadow-lg transition-all btn-premium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {authLoading ? <Loader2 size={16} className="animate-spin" /> : authMode === 'login' ? 'Login' : 'Sign Up'}
              </button>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  {authMode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHOP PANEL */}
      {showShop && (
        <div className="fixed inset-0 bg-[#03050c]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="card-panel rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black flex items-center gap-2 text-amber-400">
                <ShoppingBag size={18} /> STORE
              </h3>
              <button onClick={() => toggleUI('shop')} className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white transition-all btn-premium">
                <X size={14} />
              </button>
            </div>

            <div className="flex justify-between items-center bg-slate-950/40 border border-white/5 rounded-xl p-3.5 mb-6 shadow-inner">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Your Balance</span>
              <span className="text-sm font-black text-amber-400 flex items-center gap-1">{coins} <Coins size={14} /></span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/5 flex items-center justify-between transition-all">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-200">Theme: Neon glow</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Bright cybernetic style</p>
                </div>
                <button
                  onClick={() => setTheme('neon')}
                  className="py-1.5 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-650 text-white font-bold text-xs transition-all btn-premium"
                >
                  Equip
                </button>
              </div>

              <div className="p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/5 flex items-center justify-between transition-all">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-200">Theme: Galaxy cosmos</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Cosmic visual backdrops</p>
                </div>
                <button
                  onClick={() => setTheme('galaxy')}
                  className="py-1.5 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-650 text-white font-bold text-xs transition-all btn-premium"
                >
                  Equip
                </button>
              </div>

              <div className="p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/5 flex items-center justify-between transition-all">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-200">Theme: Classic Dark</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Sleek slate colors</p>
                </div>
                <button
                  onClick={() => setTheme('default')}
                  className="py-1.5 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-650 text-white font-bold text-xs transition-all btn-premium"
                >
                  Equip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATS PANEL */}
      {showStats && (
        <div className="fixed inset-0 bg-[#03050c]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="card-panel rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black flex items-center gap-2 text-indigo-400">
                <BarChart3 size={18} /> STATISTICS
              </h3>
              <button onClick={() => toggleUI('stats')} className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white transition-all btn-premium">
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/40 rounded-2xl p-3 border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Games Played</p>
                <p className="text-lg font-black text-slate-200 mt-0.5">{stats.gamesPlayed}</p>
              </div>
              <div className="bg-slate-950/40 rounded-2xl p-3 border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Lines Cleared</p>
                <p className="text-lg font-black text-indigo-400 mt-0.5">{stats.linesCleared}</p>
              </div>
              <div className="bg-slate-950/40 rounded-2xl p-3 border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Best Combo</p>
                <p className="text-lg font-black text-purple-400 mt-0.5">{stats.bestCombo}x</p>
              </div>
              <div className="bg-slate-950/40 rounded-2xl p-3 border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Coins Earned</p>
                <p className="text-lg font-black text-amber-500 mt-0.5">{stats.coinsEarned}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEADERBOARD PANEL */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-[#03050c]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="card-panel rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black flex items-center gap-2 text-cyan-400">
                <Award size={18} /> LEADERBOARD
              </h3>
              <button onClick={() => toggleUI('leaderboard')} className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white transition-all btn-premium">
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto">
              {leaderboardList.length > 0 ? (
                leaderboardList.map((user, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-2xl border ${
                      user.username === profile.username
                        ? 'bg-indigo-500/10 border-indigo-500/25 shadow-sm'
                        : idx === 0
                        ? 'bg-amber-500/5 border-amber-500/15'
                        : 'bg-white/[0.01] border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-black text-sm ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-350' : 'text-slate-500'}`}>
                        {idx + 1}
                      </span>
                      <span className="font-extrabold text-sm text-slate-200">
                        {user.username} <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/10 px-1 py-0.5 rounded ml-1 font-sans">LV {user.level}</span>
                      </span>
                    </div>
                    <span className="font-black text-sm text-slate-200">{user.highScore}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center font-bold my-6">Fetching global rankings...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS PANEL */}
      {showSettings && (
        <div className="fixed inset-0 bg-[#03050c]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="card-panel rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black flex items-center gap-2 text-slate-300">
                <SettingsIcon size={18} /> SETTINGS
              </h3>
              <button onClick={() => toggleUI('settings')} className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white transition-all btn-premium">
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-1">
                <span className="text-sm font-bold text-slate-300">Theme Visuals</span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="bg-slate-900 border border-white/5 py-1.5 px-3 rounded-xl text-xs font-bold text-indigo-400 outline-none"
                >
                  <option value="default">Default Dark</option>
                  <option value="neon">Neon Glow</option>
                  <option value="galaxy">Cosmic Galaxy</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-1">
                <span className="text-sm font-bold text-slate-300">Sound FX Beeps</span>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-11 h-6 rounded-full p-1 transition-all flex items-center ${soundEnabled ? 'bg-indigo-500' : 'bg-slate-800'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all ${soundEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="border-t border-white/5 my-2" />

              <button
                onClick={() => {
                  startGame();
                  toggleUI('settings');
                }}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 font-bold text-xs transition-all text-rose-400 btn-premium"
              >
                Restart Current Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOW TO PLAY MODAL */}
      {showHowToPlay && (
        <div className="fixed inset-0 bg-[#03050c]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="card-panel rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black flex items-center gap-2 text-purple-400">
                <HelpCircle size={18} /> HOW TO PLAY
              </h3>
              <button onClick={() => setShowHowToPlay(false)} className="p-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white transition-all btn-premium">
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
                <h4 className="font-extrabold text-sm text-indigo-400 mb-1">1. Drag & Place Blocks</h4>
                <p>Pick up block pieces from the dock at the bottom of the screen and drag them onto the 10x10 board grid.</p>
              </div>

              <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
                <h4 className="font-extrabold text-sm text-purple-400 mb-1">2. Clear Lines to Score</h4>
                <p>Fill entire rows or columns with block cells. When a row/column is complete, it will be crushed and cleared from the board, awarding points!</p>
              </div>

              <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
                <h4 className="font-extrabold text-sm text-pink-400 mb-1">3. Combos & Powerups</h4>
                <p>Clear multiple lines in a single move or consecutively to earn massive score multiplier **combos**. Use power-ups like **Swap** and **Hammer** to help you keep playing when you run out of moves.</p>
              </div>

              <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
                <h4 className="font-extrabold text-sm text-amber-400 mb-1">4. Shop & Cosmetics</h4>
                <p>Earn coins while playing to unlock gorgeous visual styles and themes like **Neon Glow** or **Cosmic Galaxy** from the Shop.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAG PREVIEW */}
      {draggedBlock && (
        <div
          className="fixed pointer-events-none z-50 transition-transform duration-75 origin-top-left opacity-90"
          style={{
            left: `${dragPosition.x}px`,
            top: `${dragPosition.y}px`,
          }}
        >
          <BlockPiece shape={draggedBlock.shape} color={draggedBlock.color} size={45} />
        </div>
      )}
    </div>
  );
}
