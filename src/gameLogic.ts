export type Player = 'Black' | 'White';
export type CellValue = Player | null;

export interface GameState {
  board: CellValue[];
  currentPlayer: Player;
  selectedCell: number | null;
  winner: Player | null;
  winningCells: number[];
}

export const INITIAL_BOARD: CellValue[] = [
  'Black', 'Black', 'Black',
  null, null, null,
  'White', 'White', 'White'
];

export const WINNING_PATTERNS: number[][] = [
  [0, 4, 8],
  [2, 4, 6],
  [3, 4, 5],
  [1, 4, 7],
];

export const ADJACENT_CELLS: Record<number, number[]> = {
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

export function checkWinner(board: CellValue[]): { winner: Player | null; winningCells: number[] } {
  for (const pattern of WINNING_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return { winner: board[a], winningCells: pattern };
    }
  }
  return { winner: null, winningCells: [] };
}

export function getValidMoves(board: CellValue[], cellIndex: number, player: Player): number[] {
  const piece = board[cellIndex];
  if (piece !== player) return [];
  
  return ADJACENT_CELLS[cellIndex]?.filter(idx => board[idx] === null) || [];
}

export function createInitialState(): GameState {
  return {
    board: [...INITIAL_BOARD],
    currentPlayer: 'Black',
    selectedCell: null,
    winner: null,
    winningCells: [],
  };
}