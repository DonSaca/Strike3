import { getAllValidMoves } from './boardGeometry';

export type Player = 'Black' | 'White';
export type CellValue = Player | null;

export interface GameState {
  board: CellValue[];
  currentPlayer: Player;
  selectedNode: number | null;
  winner: Player | null;
  winningNodes: number[];
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

export function checkWinner(board: CellValue[]): { winner: Player | null; winningNodes: number[] } {
  for (const pattern of WINNING_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return { winner: board[a], winningNodes: pattern };
    }
  }
  return { winner: null, winningNodes: [] };
}

export function getValidMoves(board: CellValue[], nodeIndex: number, player: Player): number[] {
  const piece = board[nodeIndex];
  if (piece !== player) return [];
  
  return getAllValidMoves(board, nodeIndex);
}

export function createInitialState(): GameState {
  return {
    board: [...INITIAL_BOARD],
    currentPlayer: 'Black',
    selectedNode: null,
    winner: null,
    winningNodes: [],
  };
}

export function makeMove(state: GameState, fromNode: number, toNode: number): GameState | null {
  const { board, currentPlayer } = state;
  
  if (board[fromNode] !== currentPlayer) return null;
  if (board[toNode] !== null) return null;
  
  const validMoves = getAllValidMoves(board, fromNode);
  if (!validMoves.includes(toNode)) return null;
  
  const newBoard = [...board];
  newBoard[toNode] = currentPlayer;
  newBoard[fromNode] = null;
  
  const { winner, winningNodes } = checkWinner(newBoard);
  
  return {
    board: newBoard,
    currentPlayer: currentPlayer === 'Black' ? 'White' : 'Black',
    selectedNode: null,
    winner,
    winningNodes,
  };
}

export function isDraw(board: CellValue[]): boolean {
  return !board.includes(null) && checkWinner(board).winner === null;
}