import { GameState, Player, makeMove, checkWinner, isDraw } from './gameLogic';
import { getAllValidMoves, WINNING_LINES } from './boardGeometry';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Move {
  from: number;
  to: number;
}

function getAllMoves(state: GameState): Move[] {
  const moves: Move[] = [];
  const { board, currentPlayer } = state;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === currentPlayer) {
      const valid = getAllValidMoves(board, i);
      for (const to of valid) {
        moves.push({ from: i, to });
      }
    }
  }
  return moves;
}

function evaluateBoard(board: (Player | null)[], aiPlayer: Player): number {
  const result = checkWinner(board);
  if (result.winner === aiPlayer) return 10000;
  if (result.winner && result.winner !== aiPlayer) return -10000;
  if (isDraw(board)) return 0;

  const opponent = aiPlayer === 'Black' ? 'White' : 'Black';
  let score = 0;

  // Center control bonus
  if (board[4] === aiPlayer) score += 15;
  else if (board[4] === opponent) score -= 15;

  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const aiCount = (board[a] === aiPlayer ? 1 : 0) + (board[b] === aiPlayer ? 1 : 0) + (board[c] === aiPlayer ? 1 : 0);
    const oppCount = (board[a] === opponent ? 1 : 0) + (board[b] === opponent ? 1 : 0) + (board[c] === opponent ? 1 : 0);
    const emptyCount = 3 - aiCount - oppCount;

    if (aiCount === 2 && oppCount === 0 && emptyCount === 1) score += 500;
    else if (oppCount === 2 && aiCount === 0 && emptyCount === 1) score -= 500;
    else if (aiCount === 1 && oppCount === 0) score += 20;
    else if (oppCount === 1 && aiCount === 0) score -= 10;
  }

  return score;
}

function minimax(state: GameState, depth: number, alpha: number, beta: number, aiPlayer: Player, maximizing: boolean): number {
  const result = checkWinner(state.board);
  if (result.winner || isDraw(state.board) || depth === 0) {
    return evaluateBoard(state.board, aiPlayer);
  }

  const moves = getAllMoves(state);
  if (moves.length === 0) {
    return evaluateBoard(state.board, aiPlayer);
  }

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = makeMove(state, move.from, move.to);
      if (!newState) continue;
      const evalScore = minimax(newState, depth - 1, alpha, beta, aiPlayer, false);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newState = makeMove(state, move.from, move.to);
      if (!newState) continue;
      const evalScore = minimax(newState, depth - 1, alpha, beta, aiPlayer, true);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getBestMove(state: GameState, difficulty: Difficulty, aiPlayer: Player): Move | null {
  const moves = getAllMoves(state);
  if (moves.length === 0) return null;

  if (difficulty === 'easy') {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // For medium and hard, always evaluate from ai perspective
  // If it's ai's turn -> maximizing; else -> minimizing, but best move should be selected for ai
  // Actually getBestMove is called only when it's ai's turn
  const depth = difficulty === 'medium' ? 3 : 5;
  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const newState = makeMove(state, move.from, move.to);
    if (!newState) continue;
    const score = minimax(newState, depth - 1, -Infinity, Infinity, aiPlayer, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}
