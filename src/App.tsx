import { useState, useEffect, useCallback } from 'react';
import { GameState, createInitialState, makeMove, isDraw } from './gameLogic';
import { BoardSVG } from './BoardSVG';
import { NODE_POSITIONS } from './boardGeometry';

function App() {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: number; to: number } | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleNodeClick = useCallback((index: number) => {
    setGameState(prev => {
      if (prev.winner) return prev;

      const { board, currentPlayer, selectedNode } = prev;

      if (selectedNode === null) {
        if (board[index] === currentPlayer) {
          return { ...prev, selectedNode: index };
        }
        return prev;
      }

      if (selectedNode === index) {
        return { ...prev, selectedNode: null };
      }

      const newState = makeMove(prev, selectedNode, index);
      if (newState) {
        setLastMove({ from: selectedNode, to: index });
        return newState;
      }

      if (board[index] === currentPlayer) {
        return { ...prev, selectedNode: index };
      }

      return { ...prev, selectedNode: null };
    });
  }, []);

  const handleRestart = useCallback(() => {
    setGameState(createInitialState());
    setLastMove(null);
  }, []);

  const { currentPlayer, winner } = gameState;
  const draw = !winner && isDraw(gameState.board);

  const playerColor = currentPlayer === 'Black' ? '#22c55e' : '#f87171';
  const playerName = currentPlayer === 'Black' ? 'Green' : 'Red';

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Strike 3</h1>
        <div 
          className="turn-indicator"
          style={{ color: playerColor }}
          aria-live="polite"
          aria-atomic="true"
        >
          {winner 
            ? `Player ${winner === 'Black' ? 'Green' : 'Red'} Wins!` 
            : draw 
              ? "Draw" 
              : `Player ${playerName}'s Turn`}
        </div>
      </header>

      <main className="app-main">
        <BoardSVG 
          gameState={gameState} 
          onNodeClick={handleNodeClick} 
          reducedMotion={reducedMotion}
          lastMove={lastMove}
          nodePositions={NODE_POSITIONS}
        />
      </main>

      <footer className="app-footer">
        <button
          onClick={handleRestart}
          className="restart-button"
          aria-label="Restart game"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span>Restart</span>
        </button>
      </footer>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {winner 
          ? `Player ${winner === 'Black' ? 'Green' : 'Red'} wins the game.`
          : draw 
            ? "Game ended in a draw."
            : `Player ${playerName}'s turn. Select a piece to move.`}
      </div>
    </div>
  );
}

export default App;