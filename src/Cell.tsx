import { CellValue } from './gameLogic';

interface CellProps {
  index: number;
  value: CellValue;
  isSelected: boolean;
  isValidMove: boolean;
  isWinningCell: boolean;
  onClick: () => void;
}

export function Cell({ index, value, isSelected, isValidMove, isWinningCell, onClick }: CellProps) {
  const getPieceSymbol = (player: CellValue) => {
    if (player === 'Black') return '⚫';
    if (player === 'White') return '⚪';
    return '';
  };

  const baseClasses = 'w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex items-center justify-center text-4xl md:text-5xl lg:text-6xl font-bold cursor-pointer transition-all duration-200 border-2 rounded-lg select-none';
  
  let cellClasses = baseClasses;
  let pieceClasses = 'transition-all duration-200';

  if (isWinningCell) {
    cellClasses += ' bg-green-300 border-green-500';
    pieceClasses += ' line-through text-green-700';
  } else if (isSelected) {
    cellClasses += ' bg-yellow-300 border-yellow-500 scale-105 shadow-lg';
  } else if (isValidMove) {
    cellClasses += ' bg-green-200 border-green-400 animate-pulse';
  } else {
    cellClasses += ' bg-gray-100 border-gray-300 hover:bg-gray-200';
  }

  if (value === 'Black') {
    pieceClasses += ' text-black';
  } else if (value === 'White') {
    pieceClasses += ' text-gray-600';
  }

  return (
    <button
      onClick={onClick}
      className={cellClasses}
      disabled={isWinningCell}
      aria-label={`Cell ${index + 1}${value ? `, ${value} piece` : ', empty'}`}
    >
      <span className={pieceClasses}>{getPieceSymbol(value)}</span>
    </button>
  );
}