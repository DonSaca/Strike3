import { useState } from 'react';
import { GameState, createInitialState, checkWinner } from './gameLogic';
import { Board } from './Board';

function App() {
  const [gameState, setGameState] = useState<GameState>(createInitialState);

  const handleCellClick = (index: number) => {
    setGameState(prev => {
      if (prev.winner) return prev;

      const { board, currentPlayer, selectedCell } = prev;

      if (selectedCell === null) {
        if (board[index] === currentPlayer) {
          return { ...prev, selectedCell: index };
        }
        return prev;
      }

      if (selectedCell === index) {
        return { ...prev, selectedCell: null };
      }

      const validMoves = getValidMovesForPlayer(board, currentPlayer, selectedCell);
      if (validMoves.includes(index)) {
        const newBoard = [...board];
        newBoard[index] = currentPlayer;
        newBoard[selectedCell] = null;

        const { winner, winningCells } = checkWinner(newBoard);
        
        return {
          board: newBoard,
          currentPlayer: currentPlayer === 'Black' ? 'White' : 'Black',
          selectedCell: null,
          winner,
          winningCells,
        };
      }

      if (board[index] === currentPlayer) {
        return { ...prev, selectedCell: index };
      }

      return { ...prev, selectedCell: null };
    });
  };

  const handleRestart = () => {
    setGameState(createInitialState());
  };

  const getValidMovesForPlayer = (board: GameState['board'], player: GameState['currentPlayer'], fromCell: number) => {
    const piece = board[fromCell];
    if (piece !== player) return [];
    
    const adjacent: Record<number, number[]> = {
      0: [1, 3, 4],
      1: [0, 2, 3, 4, 5],
      2: [1, 4, 5],
      3: [0, 1, 4, 6, 7],
      4: [0, 1, 2, 3, 5, 6, 7, 8],
      5: [1, 2, 4, 7, 8],
      6: [3, 4, 7],
      7: [3, 4, 5, 6, 8],
      8: [4, 5, 7],
    };
    
    return adjacent[fromCell]?.filter(idx => board[idx] === null) || [];
  };

  const { currentPlayer, winner } = gameState;

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">Strike 3</h1>
          <p className="text-gray-600 text-lg">Tactical 3×3 Movement Game</p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="mb-6">
            {winner ? (
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
                  Player {winner} Wins!
                </p>
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Restart Game
                </button>
              </div>
            ) : (
              <p className="text-center text-xl md:text-2xl font-semibold text-gray-700">
                Player <span className={currentPlayer === 'Black' ? 'text-black' : 'text-gray-600'}>{currentPlayer}</span>'s Turn
              </p>
            )}
          </div>

          <Board gameState={gameState} onCellClick={handleCellClick} />

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Click your piece to select (turns yellow)</p>
            <p>Valid moves highlight in green</p>
            <p className="mt-2">Win: Diagonal, Middle Row, or Middle Column</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;