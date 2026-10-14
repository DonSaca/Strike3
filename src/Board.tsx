import { GameState, getValidMoves } from './gameLogic';
import { Cell } from './Cell';

interface BoardProps {
  gameState: GameState;
  onCellClick: (index: number) => void;
}

export function Board({ gameState, onCellClick }: BoardProps) {
  const { board, selectedCell, winningCells } = gameState;
  
  const validMoves = selectedCell !== null 
    ? getValidMoves(board, selectedCell, gameState.currentPlayer)
    : [];

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3 lg:gap-4 max-w-xs md:max-w-sm lg:max-w-md mx-auto">
      {board.map((value, index) => (
        <Cell
          key={index}
          index={index}
          value={value}
          isSelected={selectedCell === index}
          isValidMove={validMoves.includes(index)}
          isWinningCell={winningCells.includes(index)}
          onClick={() => onCellClick(index)}
        />
      ))}
    </div>
  );
}