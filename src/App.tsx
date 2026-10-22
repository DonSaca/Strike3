import { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeProvider, useTheme } from './themeContext';
import { GameState, createInitialState, makeMove, isDraw, Player } from './gameLogic';
import { BoardSVG } from './BoardSVG';
import { NODE_POSITIONS } from './boardGeometry';
import { getBestMove, Difficulty } from './ai';
import { ThemeName } from './themes';

function AppContent() {
  const { theme, setTheme } = useTheme();
  const [screen, setScreen] = useState<'menu' | 'setup' | 'game' | 'settings'>('menu');
  const [mode, setMode] = useState<'overboard' | 'computer'>('overboard');
  const [aiPlayer, setAiPlayer] = useState<Player>('White');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [firstChoice, setFirstChoice] = useState<'coin' | 'black' | 'white'>('coin');
  const [startPlayer, setStartPlayer] = useState<Player>('Black');
  const [gameState, setGameState] = useState<GameState>(createInitialState('Black'));
  const [reducedMotion, setReducedMotion] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: number; to: number } | null>(null);
  const [sessionId, setSessionId] = useState(0);
  const aiTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(m.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, []);

  // Cancel pending AI on cleanup / screen change / restart
  const cancelAi = useCallback(() => {
    if (aiTimeoutRef.current !== null) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cancelAi();
  }, [cancelAi]);

  const startNewGame = useCallback((start: Player) => {
    cancelAi();
    const newSession = sessionId + 1;
    setSessionId(newSession);
    const s = createInitialState(start);
    setGameState(s);
    setLastMove(null);
    setScreen('game');
  }, [cancelAi, sessionId]);

  // First-player selection result
  const resolveFirstPlayer = useCallback(() => {
    if (firstChoice === 'black') setStartPlayer('Black');
    else if (firstChoice === 'white') setStartPlayer('White');
    else {
      const r = Math.random() < 0.5 ? 'Black' : 'White';
      setStartPlayer(r);
    }
  }, [firstChoice]);

  // Launch setup for mode
  const goSetup = useCallback((m: 'overboard' | 'computer') => {
    setMode(m);
    setFirstChoice('coin');
    resolveFirstPlayer();
    setScreen('setup');
  }, [resolveFirstPlayer]);

  // Start from setup after confirming
  const confirmStart = useCallback(() => {
    let s = startPlayer;
    if (firstChoice === 'black') s = 'Black';
    else if (firstChoice === 'white') s = 'White';
    else if (firstChoice === 'coin') {
      s = Math.random() < 0.5 ? 'Black' : 'White';
    }
    // If coin already clicked and startPlayer set, we may want to preserve it; but simpler to re-lock
    // Actually preserve only if user explicitly clicked coin button (startPlayer already set)
    if (firstChoice === 'coin' && (startPlayer === 'Black' || startPlayer === 'White')) {
      s = startPlayer;
    }
    startNewGame(s);
  }, [firstChoice, startPlayer, startNewGame]);

  // Restart keeps same start player unless explicitly new setup
  const handleRestart = useCallback(() => {
    cancelAi();
    const s = createInitialState(startPlayer);
    setGameState(s);
    setLastMove(null);
    setScreen('game');
    setSessionId(prev => prev + 1);
  }, [cancelAi, startPlayer]);

  const returnToMenu = useCallback(() => {
    cancelAi();
    setScreen('menu');
    setGameState(createInitialState('Black'));
    setLastMove(null);
    setSessionId(prev => prev + 1);
  }, [cancelAi]);

  // Handle click during gameplay
  const handleNodeClick = useCallback((index: number) => {
    if (screen !== 'game') return;
    const { currentPlayer, winner } = gameState;
    if (winner) return;
    if (mode === 'computer' && currentPlayer === aiPlayer) return; // prevent human during AI turn
    setGameState(prev => {
      if (prev.winner) return prev;
      if (prev.currentPlayer === aiPlayer && mode === 'computer') return prev;
      const { board: b, currentPlayer: cp, selectedNode: sn } = prev;
      if (sn === null) {
        if (b[index] === cp) return { ...prev, selectedNode: index };
        return prev;
      }
      if (sn === index) return { ...prev, selectedNode: null };
      const newState = makeMove(prev, sn, index);
      if (newState) {
        setLastMove({ from: sn, to: index });
        return newState;
      }
      if (b[index] === cp) return { ...prev, selectedNode: index };
      return { ...prev, selectedNode: null };
    });
  }, [screen, mode, aiPlayer, gameState]);

  // AI turn scheduling
  useEffect(() => {
    if (screen !== 'game') return;
    const { currentPlayer, winner, board } = gameState;
    if (winner) return;
    if (mode !== 'computer') return;
    if (currentPlayer !== aiPlayer) return;
    if (isDraw(board)) return;

    // Prevent multiple scheduled
    if (aiTimeoutRef.current !== null) return;

    const currentSession = sessionId;
    aiTimeoutRef.current = window.setTimeout(() => {
      aiTimeoutRef.current = null;
      // Stale check
      setGameState(prev => {
        if (prev.currentPlayer !== aiPlayer || prev.winner || isDraw(prev.board)) return prev;
        if (sessionId !== currentSession) return prev;
        const best = getBestMove(prev, difficulty, aiPlayer);
        if (!best) return prev;
        const moved = makeMove(prev, best.from, best.to);
        if (!moved) return prev;
        setLastMove({ from: best.from, to: best.to });
        return moved;
      });
    }, 600);
  }, [gameState, screen, mode, aiPlayer, difficulty, sessionId]);

  const { currentPlayer, winner } = gameState;
  const draw = !winner && isDraw(gameState.board);
  const playerName = currentPlayer === 'Black' ? 'Green' : 'Red';
  const playerColor = currentPlayer === 'Black' ? '#60a5fa' : '#f87171';

  const isAiTurn = mode === 'computer' && currentPlayer === aiPlayer;

  return (
    <div className="app-container" style={{ color: 'var(--theme-text-main)' }}>
      <header className="app-header">
        <h1 className="app-title" style={{ background: 'linear-gradient(135deg, var(--theme-accent-blue) 0%, var(--theme-accent-red) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Strike 3</h1>
        {screen === 'menu' && (
          <p style={{ color: 'var(--theme-text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>Choose your game mode</p>
        )}
        {screen === 'game' && (
          <div className="turn-indicator" style={{ color: isAiTurn ? 'var(--theme-text-secondary)' : playerColor, fontWeight: 600 }} aria-live="polite" aria-atomic="true">
            {winner ? `Player ${winner === 'Black' ? 'Green' : 'Red'} Wins!` : draw ? 'Draw' : isAiTurn ? 'AI Thinking...' : `Player ${playerName}'s Turn`}
          </div>
        )}
        {(screen === 'setup' || screen === 'settings') && (
          <div className="turn-indicator" style={{ color: 'var(--theme-text-secondary)' }} aria-live="polite">Setup</div>
        )}
      </header>

      <main className="app-main">
        {screen === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: 360 }}>
            <button onClick={() => goSetup('computer')} className="restart-button" style={{ width: '100%', justifyContent: 'center', fontSize: '1.05rem' }}>
              Play vs Computer
            </button>
            <button onClick={() => goSetup('overboard')} className="restart-button" style={{ width: '100%', justifyContent: 'center', fontSize: '1.05rem' }}>
              Play Over the Board
            </button>
            <button onClick={() => setScreen('settings')} className="restart-button" style={{ width: '100%', justifyContent: 'center', fontSize: '1.05rem', background: 'var(--theme-ui-bg)', borderColor: 'var(--theme-ui-border)' }}>
              Settings
            </button>
          </div>
        )}

        {screen === 'setup' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: 360, padding: '0 0.5rem' }}>
            <div style={{ background: 'var(--theme-ui-bg)', border: '1px solid var(--theme-ui-border)', borderRadius: 16, padding: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--theme-text-main)' }}>Game Mode</h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--theme-text-secondary)' }}>{mode === 'computer' ? 'Play vs Computer' : 'Over the Board'}</p>
              {mode === 'computer' && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setAiPlayer('Black')} style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: aiPlayer === 'Black' ? '2px solid var(--theme-accent-green)' : '1px solid var(--theme-ui-border)', background: aiPlayer === 'Black' ? 'rgba(34,197,94,0.15)' : 'transparent', color: 'var(--theme-text-main)', cursor: 'pointer', fontWeight: 600 }}>{aiPlayer === 'Black' ? 'AI Black' : 'AI Black'}</button>
                  <button onClick={() => setAiPlayer('White')} style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: aiPlayer === 'White' ? '2px solid var(--theme-accent-red)' : '1px solid var(--theme-ui-border)', background: aiPlayer === 'White' ? 'rgba(239,68,68,0.15)' : 'transparent', color: 'var(--theme-text-main)', cursor: 'pointer', fontWeight: 600 }}>{aiPlayer === 'White' ? 'AI White' : 'AI White'}</button>
                </div>
              )}
            </div>

            <div style={{ background: 'var(--theme-ui-bg)', border: '1px solid var(--theme-ui-border)', borderRadius: 16, padding: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--theme-text-main)' }}>First Player</h2>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={() => { setFirstChoice('coin'); resolveFirstPlayer(); }} style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: firstChoice === 'coin' ? '2px solid var(--theme-accent-gold)' : '1px solid var(--theme-ui-border)', background: firstChoice === 'coin' ? 'rgba(250,204,21,0.15)' : 'transparent', color: 'var(--theme-text-main)', cursor: 'pointer', fontWeight: 600 }}>Coin Toss</button>
                <button onClick={() => { setFirstChoice('black'); setStartPlayer('Black'); }} style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: firstChoice === 'black' ? '2px solid var(--theme-accent-green)' : '1px solid var(--theme-ui-border)', background: firstChoice === 'black' ? 'rgba(34,197,94,0.15)' : 'transparent', color: 'var(--theme-text-main)', cursor: 'pointer', fontWeight: 600 }}>Green Starts</button>
                <button onClick={() => { setFirstChoice('white'); setStartPlayer('White'); }} style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: firstChoice === 'white' ? '2px solid var(--theme-accent-red)' : '1px solid var(--theme-ui-border)', background: firstChoice === 'white' ? 'rgba(239,68,68,0.15)' : 'transparent', color: 'var(--theme-text-main)', cursor: 'pointer', fontWeight: 600 }}>Red Starts</button>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--theme-text-main)' }}>
                {firstChoice === 'coin' ? `Coin Toss: ${startPlayer === 'Black' ? 'Green' : 'Red'} starts` : `Selected: ${startPlayer === 'Black' ? 'Green' : 'Red'} starts`}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button onClick={() => { setScreen('menu'); }} className="restart-button" style={{ flex: 1, justifyContent: 'center', background: 'transparent', borderColor: 'var(--theme-ui-border)' }}>Back</button>
              <button onClick={confirmStart} className="restart-button" style={{ flex: 2, justifyContent: 'center', fontWeight: 700 }}>Start Game</button>
            </div>
          </div>
        )}

        {screen === 'game' && (
          <>
            <BoardSVG
              gameState={gameState}
              onNodeClick={handleNodeClick}
              reducedMotion={reducedMotion}
              lastMove={lastMove}
              nodePositions={NODE_POSITIONS}
            />
          </>
        )}

        {screen === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: 360 }}>
            <div style={{ background: 'var(--theme-ui-bg)', border: '1px solid var(--theme-ui-border)', borderRadius: 16, padding: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: 'var(--theme-text-main)' }}>Theme</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(['classic', 'dark', 'high-contrast'] as ThemeName[]).map(t => (
                  <button key={t} onClick={() => setTheme(t)} style={{ padding: '0.45rem 0.75rem', borderRadius: 8, border: theme === t ? '2px solid var(--theme-accent-blue)' : '1px solid var(--theme-ui-border)', background: theme === t ? 'rgba(59,130,246,0.15)' : 'var(--theme-ui-bg)', color: 'var(--theme-text-main)', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>{t.replace('-', ' ')}</button>
                ))}
              </div>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--theme-text-secondary)' }}>{theme === 'classic' ? 'The original look.' : theme === 'dark' ? 'Dark interface with clear pieces.' : 'Strong contrast for visibility.'}</p>
            </div>
            <button onClick={() => setScreen('menu')} className="restart-button" style={{ width: '100%', justifyContent: 'center' }}>Back to Menu</button>
          </div>
        )}
      </main>

      {screen === 'game' && (
        <footer className="app-footer" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={handleRestart} className="restart-button" aria-label="Restart game">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
            <span>Restart</span>
          </button>
          <button onClick={returnToMenu} className="restart-button" aria-label="Back to menu" style={{ background: 'transparent', borderColor: 'var(--theme-ui-border)' }}>
            <span>Menu</span>
          </button>
          {mode === 'computer' && (
            <div style={{ width: '100%', textAlign: 'center', fontSize: '0.85rem', color: 'var(--theme-text-secondary)', marginTop: '0.25rem' }}>
              Difficulty: <strong style={{ color: 'var(--theme-text-main)' }}>{difficulty}</strong> &nbsp;|&nbsp; AI plays <strong style={{ color: aiPlayer === 'Black' ? '#60a5fa' : '#f87171' }}>{aiPlayer === 'Black' ? 'Green' : 'Red'}</strong>
              <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                  <button key={d} onClick={() => setDifficulty(d)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: 6, border: difficulty === d ? '1px solid var(--theme-accent-gold)' : '1px solid var(--theme-ui-border)', background: difficulty === d ? 'rgba(250,204,21,0.15)' : 'transparent', color: 'var(--theme-text-secondary)', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>{d}</button>
                ))}
              </div>
            </div>
          )}
        </footer>
      )}

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {winner ? `Player ${winner === 'Black' ? 'Green' : 'Red'} wins the game.` : draw ? 'Game ended in a draw.' : isAiTurn ? 'AI is thinking.' : `Player ${playerName}'s turn. Select a piece to move.`}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
