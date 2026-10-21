import { describe, it, expect } from 'vitest';
import {
  ADJACENCY,
  NODE_POSITIONS,
  CONNECTIONS,
  getConnectedNodes,
  areConnected,
} from './boardGeometry';
import {
  INITIAL_BOARD,
  WINNING_PATTERNS,
  checkWinner,
  getValidMoves,
  createInitialState,
  makeMove,
  isDraw,
  GameState,
  Player,
} from './gameLogic';

describe('boardGeometry', () => {
  describe('NODE_POSITIONS', () => {
    it('has exactly 9 positions', () => {
      expect(NODE_POSITIONS).toHaveLength(9);
    });

    it('positions are within board bounds', () => {
      NODE_POSITIONS.forEach(pos => {
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThanOrEqual(320);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThanOrEqual(360);
      });
    });

    it('top row positions (0,1,2) have same Y coordinate', () => {
      expect(NODE_POSITIONS[0].y).toBe(NODE_POSITIONS[1].y);
      expect(NODE_POSITIONS[1].y).toBe(NODE_POSITIONS[2].y);
    });

    it('middle row positions (3,4,5) have same Y coordinate', () => {
      expect(NODE_POSITIONS[3].y).toBe(NODE_POSITIONS[4].y);
      expect(NODE_POSITIONS[4].y).toBe(NODE_POSITIONS[5].y);
    });

    it('bottom row positions (6,7,8) have same Y coordinate', () => {
      expect(NODE_POSITIONS[6].y).toBe(NODE_POSITIONS[7].y);
      expect(NODE_POSITIONS[7].y).toBe(NODE_POSITIONS[8].y);
    });
  });

  describe('ADJACENCY', () => {
    it('has entries for all 9 nodes', () => {
      expect(Object.keys(ADJACENCY).map(Number).sort()).toEqual([0,1,2,3,4,5,6,7,8]);
    });

    it('is symmetric (undirected graph)', () => {
      Object.entries(ADJACENCY).forEach(([from, neighbors]) => {
        neighbors.forEach(to => {
          expect(ADJACENCY[to]).toContain(Number(from));
        });
      });
    });

    it('matches expected connections from game rules', () => {
      expect(ADJACENCY[0]).toEqual(expect.arrayContaining([1, 3, 4]));
      expect(ADJACENCY[1]).toEqual(expect.arrayContaining([0, 2, 3, 4, 5]));
      expect(ADJACENCY[2]).toEqual(expect.arrayContaining([1, 4, 5]));
      expect(ADJACENCY[3]).toEqual(expect.arrayContaining([0, 1, 4, 6, 7]));
      expect(ADJACENCY[4]).toEqual(expect.arrayContaining([0, 1, 2, 3, 5, 6, 7, 8]));
      expect(ADJACENCY[5]).toEqual(expect.arrayContaining([1, 2, 4, 7, 8]));
      expect(ADJACENCY[6]).toEqual(expect.arrayContaining([3, 4, 7]));
      expect(ADJACENCY[7]).toEqual(expect.arrayContaining([3, 4, 5, 6, 8]));
      expect(ADJACENCY[8]).toEqual(expect.arrayContaining([4, 5, 7]));
    });

    it('center node (4) connects to all other nodes', () => {
      expect(ADJACENCY[4].sort()).toEqual([0,1,2,3,5,6,7,8]);
    });
  });

  describe('CONNECTIONS', () => {
    it('includes all perimeter edges', () => {
      const perimeterEdges = [
        [0,1], [1,2], // top
        [6,7], [7,8], // bottom
        [0,3], [3,6], // left
        [2,5], [5,8], // right
      ];
      perimeterEdges.forEach(([a,b]) => {
        expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: a, to: b }));
      });
    });

    it('includes horizontal center line', () => {
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 3, to: 4 }));
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 4, to: 5 }));
    });

    it('includes vertical center line', () => {
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 1, to: 4 }));
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 4, to: 7 }));
    });

    it('includes corner-to-center diagonals', () => {
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 0, to: 4 }));
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 4, to: 8 }));
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 2, to: 4 }));
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 4, to: 6 }));
    });

    it('has no duplicate connections', () => {
      const unique = new Set(CONNECTIONS.map(c => `${Math.min(c.from,c.to)}-${Math.max(c.from,c.to)}`));
      expect(unique.size).toBe(CONNECTIONS.length);
    });
  });

  describe('getConnectedNodes', () => {
    it('returns adjacent nodes for each node', () => {
      expect(getConnectedNodes(0)).toEqual(ADJACENCY[0]);
      expect(getConnectedNodes(4)).toEqual(ADJACENCY[4]);
    });

    it('returns empty array for invalid index', () => {
      expect(getConnectedNodes(-1)).toEqual([]);
      expect(getConnectedNodes(9)).toEqual([]);
    });
  });

  describe('areConnected', () => {
    it('returns true for directly connected nodes', () => {
      expect(areConnected(0, 1)).toBe(true);
      expect(areConnected(0, 4)).toBe(true);
      expect(areConnected(4, 8)).toBe(true);
    });

    it('returns false for non-connected nodes', () => {
      expect(areConnected(0, 2)).toBe(false);
      expect(areConnected(0, 5)).toBe(false);
      expect(areConnected(3, 8)).toBe(false);
    });
  });
});

describe('gameLogic', () => {
  describe('INITIAL_BOARD', () => {
    it('has 3 Black pieces at top (0,1,2)', () => {
      expect(INITIAL_BOARD[0]).toBe('Black');
      expect(INITIAL_BOARD[1]).toBe('Black');
      expect(INITIAL_BOARD[2]).toBe('Black');
    });

    it('has 3 White pieces at bottom (6,7,8)', () => {
      expect(INITIAL_BOARD[6]).toBe('White');
      expect(INITIAL_BOARD[7]).toBe('White');
      expect(INITIAL_BOARD[8]).toBe('White');
    });

    it('has empty middle row (3,4,5)', () => {
      expect(INITIAL_BOARD[3]).toBeNull();
      expect(INITIAL_BOARD[4]).toBeNull();
      expect(INITIAL_BOARD[5]).toBeNull();
    });
  });

  describe('WINNING_PATTERNS', () => {
    it('includes both diagonals', () => {
      expect(WINNING_PATTERNS).toContainEqual([0, 4, 8]);
      expect(WINNING_PATTERNS).toContainEqual([2, 4, 6]);
    });

    it('includes middle row', () => {
      expect(WINNING_PATTERNS).toContainEqual([3, 4, 5]);
    });

    it('includes middle column', () => {
      expect(WINNING_PATTERNS).toContainEqual([1, 4, 7]);
    });

    it('has exactly 4 winning patterns', () => {
      expect(WINNING_PATTERNS).toHaveLength(4);
    });
  });

  describe('checkWinner', () => {
    it('returns null for initial board', () => {
      const result = checkWinner(INITIAL_BOARD);
      expect(result.winner).toBeNull();
      expect(result.winningNodes).toEqual([]);
    });

    it('detects Black diagonal win (0,4,8)', () => {
      const board = [...INITIAL_BOARD];
      board[4] = 'Black';
      board[8] = 'Black';
      board[6] = null;
      const result = checkWinner(board);
      expect(result.winner).toBe('Black');
      expect(result.winningNodes).toEqual([0, 4, 8]);
    });

    it('detects White diagonal win (2,4,6)', () => {
      const board = [...INITIAL_BOARD];
      board[4] = 'White';
      board[2] = 'White';
      board[0] = null;
      const result = checkWinner(board);
      expect(result.winner).toBe('White');
      expect(result.winningNodes).toEqual([2, 4, 6]);
    });

    it('detects middle row win', () => {
      const board = [...INITIAL_BOARD];
      board[3] = 'Black';
      board[4] = 'Black';
      board[5] = 'Black';
      const result = checkWinner(board);
      expect(result.winner).toBe('Black');
      expect(result.winningNodes).toEqual([3, 4, 5]);
    });

    it('detects middle column win', () => {
      const board = [...INITIAL_BOARD];
      board[1] = 'White';
      board[4] = 'White';
      board[7] = 'White';
      const result = checkWinner(board);
      expect(result.winner).toBe('White');
      expect(result.winningNodes).toEqual([1, 4, 7]);
    });

    it('returns first matching pattern', () => {
      const board = Array(9).fill('Black');
      const result = checkWinner(board);
      expect(result.winner).toBe('Black');
      expect(WINNING_PATTERNS).toContainEqual(result.winningNodes);
    });
  });

  describe('getValidMoves', () => {
    it('returns empty for opponent piece', () => {
      const moves = getValidMoves(INITIAL_BOARD, 0, 'White');
      expect(moves).toEqual([]);
    });

    it('returns empty for empty cell', () => {
      const moves = getValidMoves(INITIAL_BOARD, 4, 'Black');
      expect(moves).toEqual([]);
    });

    it('returns adjacent empty cells for Black at position 0', () => {
      const moves = getValidMoves(INITIAL_BOARD, 0, 'Black');
      expect(moves.sort()).toEqual([3, 4].sort());
    });

    it('returns adjacent empty cells for White at position 6', () => {
      const moves = getValidMoves(INITIAL_BOARD, 6, 'White');
      expect(moves.sort()).toEqual([3, 4].sort());
    });

    it('returns all surrounding empty cells for center', () => {
      const board = [...INITIAL_BOARD];
      board[4] = 'Black';
      board[0] = null;
      board[1] = null;
      board[2] = null;
      board[6] = null;
      board[7] = null;
      board[8] = null;
      const moves = getValidMoves(board, 4, 'Black');
      expect(moves.sort()).toEqual([0, 1, 2, 3, 5, 6, 7, 8].sort());
    });

    it('excludes occupied cells', () => {
      const board = [...INITIAL_BOARD];
      board[3] = 'White';
      const moves = getValidMoves(board, 0, 'Black');
      expect(moves).not.toContain(3);
      expect(moves).toEqual([4]);
    });
  });

  describe('createInitialState', () => {
    it('returns correct initial state', () => {
      const state = createInitialState();
      expect(state.board).toEqual(INITIAL_BOARD);
      expect(state.currentPlayer).toBe('Black');
      expect(state.selectedNode).toBeNull();
      expect(state.winner).toBeNull();
      expect(state.winningNodes).toEqual([]);
    });
  });

  describe('makeMove', () => {
    it('moves piece to valid adjacent empty cell', () => {
      const state = createInitialState();
      const newState = makeMove(state, 0, 3);
      expect(newState).not.toBeNull();
      expect(newState!.board[3]).toBe('Black');
      expect(newState!.board[0]).toBeNull();
    });

    it('switches turn after valid move', () => {
      const state = createInitialState();
      const newState = makeMove(state, 0, 3);
      expect(newState!.currentPlayer).toBe('White');
    });

    it('clears selection after valid move', () => {
      const state = { ...createInitialState(), selectedNode: 0 };
      const newState = makeMove(state, 0, 3);
      expect(newState!.selectedNode).toBeNull();
    });

    it('returns null for invalid move (not adjacent)', () => {
      const state = createInitialState();
      const newState = makeMove(state, 0, 5);
      expect(newState).toBeNull();
    });

    it('returns null for move to occupied cell', () => {
      const state = createInitialState();
      const newState = makeMove(state, 0, 1);
      expect(newState).toBeNull();
    });

    it('returns null for moving opponent piece', () => {
      const state = createInitialState();
      const newState = makeMove(state, 6, 3);
      expect(newState).toBeNull();
    });

    it('detects win after move', () => {
      const board = [...INITIAL_BOARD];
      board[4] = 'Black';
      board[8] = 'Black';
      board[0] = null;
      board[1] = 'Black';
      board[2] = null;
      board[6] = null;
      const state: GameState = {
        board,
        currentPlayer: 'Black',
        selectedNode: 1,
        winner: null,
        winningNodes: [],
      };
      const newState = makeMove(state, 1, 0);
      expect(newState).not.toBeNull();
      expect(newState!.winner).toBe('Black');
      expect(newState!.winningNodes).toEqual([0, 4, 8]);
    });

    it('returns null for move from empty cell', () => {
      const state = createInitialState();
      const newState = makeMove(state, 4, 3);
      expect(newState).toBeNull();
    });
  });

  describe('isDraw', () => {
    it('returns false for initial board', () => {
      expect(isDraw(INITIAL_BOARD)).toBe(false);
    });

    it('returns false when winner exists', () => {
      const board = [...INITIAL_BOARD];
      board[4] = 'Black';
      board[8] = 'Black';
      expect(isDraw(board)).toBe(false);
    });

    it('returns true for full board with no winner', () => {
      const board: (Player | null)[] = [
        'Black', 'White', 'Black',
        'White', 'Black', 'White',
        'White', 'Black', 'White',
      ];
      expect(checkWinner(board).winner).toBeNull();
      expect(isDraw(board)).toBe(true);
    });

    it('returns false for non-full board with no winner', () => {
      const board = [...INITIAL_BOARD];
      board[4] = 'Black';
      expect(isDraw(board)).toBe(false);
    });
  });

  describe('turn order', () => {
    it('starts with Black', () => {
      const state = createInitialState();
      expect(state.currentPlayer).toBe('Black');
    });

    it('alternates turns after each move', () => {
      let state = createInitialState();
      expect(state.currentPlayer).toBe('Black');

      state = makeMove(state, 0, 3)!;
      expect(state.currentPlayer).toBe('White');

      state = makeMove(state, 6, 4)!;
      expect(state.currentPlayer).toBe('Black');

      state = makeMove(state, 3, 0)!;
      expect(state.currentPlayer).toBe('White');
    });
  });
});