import { describe, it, expect } from 'vitest';
import {
  ADJACENCY,
  NODE_POSITIONS,
  CONNECTIONS,
  BOARD_LINES,
  WINNING_LINES,
  getConnectedNodes,
  areConnected,
  getTwoStepMoves,
} from './boardGeometry';
import {
  INITIAL_BOARD,
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

    it('positions match the specified 600x400 viewBox coordinates', () => {
      expect(NODE_POSITIONS[0]).toEqual({ x: 40, y: 40 });    // node 1: top-left
      expect(NODE_POSITIONS[1]).toEqual({ x: 300, y: 40 });   // node 2: top-center
      expect(NODE_POSITIONS[2]).toEqual({ x: 560, y: 40 });   // node 3: top-right
      expect(NODE_POSITIONS[3]).toEqual({ x: 40, y: 200 });   // node 4: middle-left
      expect(NODE_POSITIONS[4]).toEqual({ x: 300, y: 200 });  // node 5: center
      expect(NODE_POSITIONS[5]).toEqual({ x: 560, y: 200 });  // node 6: middle-right
      expect(NODE_POSITIONS[6]).toEqual({ x: 40, y: 360 });   // node 7: bottom-left
      expect(NODE_POSITIONS[7]).toEqual({ x: 300, y: 360 });  // node 8: bottom-center
      expect(NODE_POSITIONS[8]).toEqual({ x: 560, y: 360 });  // node 9: bottom-right
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

    it('left column positions (0,3,6) have same X coordinate', () => {
      expect(NODE_POSITIONS[0].x).toBe(NODE_POSITIONS[3].x);
      expect(NODE_POSITIONS[3].x).toBe(NODE_POSITIONS[6].x);
    });

    it('middle column positions (1,4,7) have same X coordinate', () => {
      expect(NODE_POSITIONS[1].x).toBe(NODE_POSITIONS[4].x);
      expect(NODE_POSITIONS[4].x).toBe(NODE_POSITIONS[7].x);
    });

    it('right column positions (2,5,8) have same X coordinate', () => {
      expect(NODE_POSITIONS[2].x).toBe(NODE_POSITIONS[5].x);
      expect(NODE_POSITIONS[5].x).toBe(NODE_POSITIONS[8].x);
    });
  });

  describe('BOARD_LINES', () => {
    it('has exactly 8 straight lines', () => {
      expect(BOARD_LINES).toHaveLength(8);
    });

    it('includes 3 horizontal lines', () => {
      expect(BOARD_LINES).toContainEqual([0, 1, 2]);  // top
      expect(BOARD_LINES).toContainEqual([3, 4, 5]);  // middle
      expect(BOARD_LINES).toContainEqual([6, 7, 8]);  // bottom
    });

    it('includes 3 vertical lines', () => {
      expect(BOARD_LINES).toContainEqual([0, 3, 6]);  // left
      expect(BOARD_LINES).toContainEqual([1, 4, 7]);  // middle
      expect(BOARD_LINES).toContainEqual([2, 5, 8]);  // right
    });

    it('includes 2 diagonal lines', () => {
      expect(BOARD_LINES).toContainEqual([0, 4, 8]);  // TL-BR
      expect(BOARD_LINES).toContainEqual([2, 4, 6]);  // TR-BL
    });
  });

  describe('CONNECTIONS', () => {
    it('has exactly 16 connections (consecutive pairs from 8 lines)', () => {
      expect(CONNECTIONS).toHaveLength(16);
    });

    it('includes all horizontal consecutive pairs', () => {
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 0, to: 1 }));
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 1, to: 2 }));
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 3, to: 4 }));
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 4, to: 5 }));
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 6, to: 7 }));
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 7, to: 8 }));
    });

    it('includes all vertical consecutive pairs', () => {
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 0, to: 3 }));
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 3, to: 6 }));
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 1, to: 4 }));
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 4, to: 7 }));
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 2, to: 5 }));
      expect(CONNECTIONS).toContainEqual(expect.objectContaining({ from: 5, to: 8 }));
    });

    it('includes all diagonal consecutive pairs', () => {
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

    it('matches the specified board topology', () => {
      expect(ADJACENCY[0]).toEqual(expect.arrayContaining([1, 3, 4]));    // node 1
      expect(ADJACENCY[1]).toEqual(expect.arrayContaining([0, 2, 4]));    // node 2
      expect(ADJACENCY[2]).toEqual(expect.arrayContaining([1, 4, 5]));    // node 3
      expect(ADJACENCY[3]).toEqual(expect.arrayContaining([0, 4, 6]));    // node 4
      expect(ADJACENCY[4]).toEqual(expect.arrayContaining([0, 1, 2, 3, 5, 6, 7, 8])); // node 5 (center)
      expect(ADJACENCY[5]).toEqual(expect.arrayContaining([2, 4, 8]));    // node 6
      expect(ADJACENCY[6]).toEqual(expect.arrayContaining([3, 4, 7]));    // node 7
      expect(ADJACENCY[7]).toEqual(expect.arrayContaining([1, 4, 6, 8])); // node 8
      expect(ADJACENCY[8]).toEqual(expect.arrayContaining([4, 5, 7]));    // node 9
    });

    it('center node (4) connects to all other nodes', () => {
      expect(ADJACENCY[4].sort()).toEqual([0,1,2,3,5,6,7,8]);
    });

    it('does not connect nodes that are not on the same line', () => {
      expect(ADJACENCY[0]).not.toContain(2);  // 1 not connected to 3 (need to go through 2)
      expect(ADJACENCY[0]).not.toContain(5);  // 1 not connected to 6
      expect(ADJACENCY[0]).not.toContain(7);  // 1 not connected to 8
      expect(ADJACENCY[3]).not.toContain(1);  // 4 not connected to 2
      expect(ADJACENCY[3]).not.toContain(2);  // 4 not connected to 3
      expect(ADJACENCY[3]).not.toContain(5);  // 4 not connected to 6
    });
  });

  describe('WINNING_LINES', () => {
    it('has exactly 4 winning lines', () => {
      expect(WINNING_LINES).toHaveLength(4);
    });

    it('includes middle horizontal (4-5-6)', () => {
      expect(WINNING_LINES).toContainEqual([3, 4, 5]);
    });

    it('includes middle vertical (2-5-8)', () => {
      expect(WINNING_LINES).toContainEqual([1, 4, 7]);
    });

    it('includes diagonal TL-BR (1-5-9)', () => {
      expect(WINNING_LINES).toContainEqual([0, 4, 8]);
    });

    it('includes diagonal TR-BL (3-5-7)', () => {
      expect(WINNING_LINES).toContainEqual([2, 4, 6]);
    });

    it('all winning lines pass through center node (4)', () => {
      WINNING_LINES.forEach(line => {
        expect(line).toContain(4);
      });
    });

    it('does NOT include top row (1-2-3)', () => {
      expect(WINNING_LINES).not.toContainEqual([0, 1, 2]);
    });

    it('does NOT include bottom row (7-8-9)', () => {
      expect(WINNING_LINES).not.toContainEqual([6, 7, 8]);
    });

    it('does NOT include left column (1-4-7)', () => {
      expect(WINNING_LINES).not.toContainEqual([0, 3, 6]);
    });

    it('does NOT include right column (3-6-9)', () => {
      expect(WINNING_LINES).not.toContainEqual([2, 5, 8]);
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
      expect(areConnected(0, 3)).toBe(true);
      expect(areConnected(0, 4)).toBe(true);
      expect(areConnected(4, 8)).toBe(true);
    });

    it('returns false for non-connected nodes', () => {
      expect(areConnected(0, 2)).toBe(false);
      expect(areConnected(0, 5)).toBe(false);
      expect(areConnected(3, 1)).toBe(false);
      expect(areConnected(3, 8)).toBe(false);
    });
  });

  describe('getTwoStepMoves', () => {
    it('returns correct two-step moves for node 0 (1)', () => {
      const moves = getTwoStepMoves(0);
      expect(moves).toContainEqual({ to: 2, via: 1 });  // horizontal
      expect(moves).toContainEqual({ to: 6, via: 3 });  // vertical
      expect(moves).toContainEqual({ to: 8, via: 4 });  // diagonal
    });

    it('returns correct two-step moves for node 2 (3)', () => {
      const moves = getTwoStepMoves(2);
      expect(moves).toContainEqual({ to: 0, via: 1 });  // horizontal
      expect(moves).toContainEqual({ to: 8, via: 5 });  // vertical
      expect(moves).toContainEqual({ to: 6, via: 4 });  // diagonal
    });

    it('returns correct two-step moves for node 6 (7)', () => {
      const moves = getTwoStepMoves(6);
      expect(moves).toContainEqual({ to: 0, via: 3 });  // vertical
      expect(moves).toContainEqual({ to: 8, via: 7 });  // horizontal
      expect(moves).toContainEqual({ to: 2, via: 4 });  // diagonal
    });

    it('returns correct two-step moves for node 8 (9)', () => {
      const moves = getTwoStepMoves(8);
      expect(moves).toContainEqual({ to: 6, via: 7 });  // horizontal
      expect(moves).toContainEqual({ to: 2, via: 5 });  // vertical
      expect(moves).toContainEqual({ to: 0, via: 4 });  // diagonal
    });

    it('returns correct two-step moves for node 1 (2)', () => {
      const moves = getTwoStepMoves(1);
      expect(moves).toContainEqual({ to: 7, via: 4 });  // vertical
    });

    it('returns correct two-step moves for node 3 (4)', () => {
      const moves = getTwoStepMoves(3);
      expect(moves).toContainEqual({ to: 5, via: 4 });  // horizontal
    });

    it('returns correct two-step moves for node 5 (6)', () => {
      const moves = getTwoStepMoves(5);
      expect(moves).toContainEqual({ to: 3, via: 4 });  // horizontal
    });

    it('returns correct two-step moves for node 7 (8)', () => {
      const moves = getTwoStepMoves(7);
      expect(moves).toContainEqual({ to: 1, via: 4 });  // vertical
    });

    it('returns empty for center node (4)', () => {
      const moves = getTwoStepMoves(4);
      expect(moves).toEqual([]);
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

  describe('checkWinner', () => {
    it('returns null for initial board', () => {
      const result = checkWinner(INITIAL_BOARD);
      expect(result.winner).toBeNull();
      expect(result.winningNodes).toEqual([]);
    });

    it('detects Black win on middle horizontal (4-5-6)', () => {
      const board = [...INITIAL_BOARD];
      board[3] = 'Black';
      board[4] = 'Black';
      board[5] = 'Black';
      const result = checkWinner(board);
      expect(result.winner).toBe('Black');
      expect(result.winningNodes).toEqual([3, 4, 5]);
    });

    it('detects White win on middle horizontal (4-5-6)', () => {
      const board = [...INITIAL_BOARD];
      board[3] = 'White';
      board[4] = 'White';
      board[5] = 'White';
      const result = checkWinner(board);
      expect(result.winner).toBe('White');
      expect(result.winningNodes).toEqual([3, 4, 5]);
    });

    it('detects Black win on middle vertical (2-5-8)', () => {
      const board = [...INITIAL_BOARD];
      board[1] = 'Black';
      board[4] = 'Black';
      board[7] = 'Black';
      const result = checkWinner(board);
      expect(result.winner).toBe('Black');
      expect(result.winningNodes).toEqual([1, 4, 7]);
    });

    it('detects White win on middle vertical (2-5-8)', () => {
      const board = [...INITIAL_BOARD];
      board[1] = 'White';
      board[4] = 'White';
      board[7] = 'White';
      const result = checkWinner(board);
      expect(result.winner).toBe('White');
      expect(result.winningNodes).toEqual([1, 4, 7]);
    });

    it('detects Black win on diagonal TL-BR (1-5-9)', () => {
      const board = [...INITIAL_BOARD];
      board[0] = 'Black';
      board[4] = 'Black';
      board[8] = 'Black';
      const result = checkWinner(board);
      expect(result.winner).toBe('Black');
      expect(result.winningNodes).toEqual([0, 4, 8]);
    });

    it('detects White win on diagonal TL-BR (1-5-9)', () => {
      const board = [...INITIAL_BOARD];
      board[0] = 'White';
      board[4] = 'White';
      board[8] = 'White';
      const result = checkWinner(board);
      expect(result.winner).toBe('White');
      expect(result.winningNodes).toEqual([0, 4, 8]);
    });

    it('detects Black win on diagonal TR-BL (3-5-7)', () => {
      const board = [...INITIAL_BOARD];
      board[2] = 'Black';
      board[4] = 'Black';
      board[6] = 'Black';
      const result = checkWinner(board);
      expect(result.winner).toBe('Black');
      expect(result.winningNodes).toEqual([2, 4, 6]);
    });

    it('detects White win on diagonal TR-BL (3-5-7)', () => {
      const board = [...INITIAL_BOARD];
      board[2] = 'White';
      board[4] = 'White';
      board[6] = 'White';
      const result = checkWinner(board);
      expect(result.winner).toBe('White');
      expect(result.winningNodes).toEqual([2, 4, 6]);
    });

    it('does NOT win on top row (1-2-3)', () => {
      const board = [...INITIAL_BOARD];
      board[0] = 'Black';
      board[1] = 'Black';
      board[2] = 'Black';
      const result = checkWinner(board);
      expect(result.winner).toBeNull();
    });

    it('does NOT win on bottom row (7-8-9)', () => {
      const board = [...INITIAL_BOARD];
      board[6] = 'Black';
      board[7] = 'Black';
      board[8] = 'Black';
      const result = checkWinner(board);
      expect(result.winner).toBeNull();
    });

    it('does NOT win on left column (1-4-7)', () => {
      const board = [...INITIAL_BOARD];
      board[0] = 'Black';
      board[3] = 'Black';
      board[6] = 'Black';
      const result = checkWinner(board);
      expect(result.winner).toBeNull();
    });

    it('does NOT win on right column (3-6-9)', () => {
      const board = [...INITIAL_BOARD];
      board[2] = 'Black';
      board[5] = 'Black';
      board[8] = 'Black';
      const result = checkWinner(board);
      expect(result.winner).toBeNull();
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

    it('returns one-step moves for Black at position 0 (node 1)', () => {
      const moves = getValidMoves(INITIAL_BOARD, 0, 'Black');
      // From node 1: connected to 2 (idx 1), 4 (idx 3), 5 (idx 4)
      // idx 1 is occupied by Black, idx 3 and 4 are empty
      expect(moves.sort()).toEqual([3, 4].sort());
    });

    it('returns one-step moves for White at position 8 (node 9)', () => {
      const moves = getValidMoves(INITIAL_BOARD, 8, 'White');
      // From node 9: connected to 5 (idx 4), 6 (idx 5), 8 (idx 7)
      // idx 7 is occupied by White, idx 4 and 5 are empty
      expect(moves.sort()).toEqual([4, 5].sort());
    });

    it('returns all surrounding empty cells for center (node 5)', () => {
      const board = [...INITIAL_BOARD];
      board[4] = 'Black';
      board[0] = null;
      board[1] = null;
      board[2] = null;
      board[6] = null;
      board[7] = null;
      board[8] = null;
      const moves = getValidMoves(board, 4, 'Black');
      // Center connects to all 8 outer nodes
      expect(moves.sort()).toEqual([0, 1, 2, 3, 5, 6, 7, 8].sort());
    });

    it('excludes occupied cells from one-step moves', () => {
      const board = [...INITIAL_BOARD];
      board[3] = 'White'; // node 4 occupied
      const moves = getValidMoves(board, 0, 'Black');
      expect(moves).not.toContain(3);
      expect(moves).toEqual([4]);
    });

    describe('two-step moves', () => {
      it('allows Black to move two steps horizontally from 0 to 2 via empty 1 (1->3 via 2)', () => {
        const board = [...INITIAL_BOARD];
        board[1] = null;
        board[2] = null;
        const moves = getValidMoves(board, 0, 'Black');
        expect(moves).toContain(2);
      });

      it('allows Black to move two steps vertically from 0 to 6 via empty 3 (1->7 via 4)', () => {
        const board = [...INITIAL_BOARD];
        board[3] = null;
        board[6] = null;
        const moves = getValidMoves(board, 0, 'Black');
        expect(moves).toContain(6);
      });

      it('allows Black to move two steps diagonally from 0 to 8 via empty 4 (1->9 via 5)', () => {
        const board = [...INITIAL_BOARD];
        board[4] = null;
        board[8] = null;
        const moves = getValidMoves(board, 0, 'Black');
        expect(moves).toContain(8);
      });

      it('allows White to move two steps horizontally from 8 to 6 via empty 7 (9->7 via 8)', () => {
        const board = [...INITIAL_BOARD];
        board[7] = null;
        board[6] = null;
        const moves = getValidMoves(board, 8, 'White');
        expect(moves).toContain(6);
      });

      it('allows White to move two steps vertically from 8 to 2 via empty 5 (9->3 via 6)', () => {
        const board = [...INITIAL_BOARD];
        board[5] = null;
        board[2] = null;
        const moves = getValidMoves(board, 8, 'White');
        expect(moves).toContain(2);
      });

      it('allows White to move two steps diagonally from 8 to 0 via empty 4 (9->1 via 5)', () => {
        const board = [...INITIAL_BOARD];
        board[4] = null;
        board[0] = null;
        const moves = getValidMoves(board, 8, 'White');
        expect(moves).toContain(0);
      });

      it('allows two-step move from middle-left (3) to middle-right (5) via center (4)', () => {
        const board = [...INITIAL_BOARD];
        board[3] = 'Black';
        board[0] = null;
        board[4] = null;
        board[5] = null;
        const moves = getValidMoves(board, 3, 'Black');
        expect(moves).toContain(5);
      });

      it('allows two-step move from middle-right (5) to middle-left (3) via center (4)', () => {
        const board = [...INITIAL_BOARD];
        board[5] = 'White';
        board[8] = null;
        board[4] = null;
        board[3] = null;
        const moves = getValidMoves(board, 5, 'White');
        expect(moves).toContain(3);
      });

      it('allows two-step move from top-center (1) to bottom-center (7) via center (4)', () => {
        const board = [...INITIAL_BOARD];
        board[1] = 'Black';
        board[0] = null;
        board[4] = null;
        board[7] = null;
        const moves = getValidMoves(board, 1, 'Black');
        expect(moves).toContain(7);
      });

      it('allows two-step move from bottom-center (7) to top-center (1) via center (4)', () => {
        const board = [...INITIAL_BOARD];
        board[7] = 'White';
        board[6] = null;
        board[4] = null;
        board[1] = null;
        const moves = getValidMoves(board, 7, 'White');
        expect(moves).toContain(1);
      });

      it('allows two-step move from top-right (2) to bottom-left (6) via center (4)', () => {
        const board = [...INITIAL_BOARD];
        board[2] = 'Black';
        board[4] = null;
        board[6] = null;
        const moves = getValidMoves(board, 2, 'Black');
        expect(moves).toContain(6);
      });

      it('allows two-step move from bottom-left (6) to top-right (2) via center (4)', () => {
        const board = [...INITIAL_BOARD];
        board[6] = 'White';
        board[4] = null;
        board[2] = null;
        const moves = getValidMoves(board, 6, 'White');
        expect(moves).toContain(2);
      });

      it('blocks two-step move when intermediate node is occupied by own piece', () => {
        const board = [...INITIAL_BOARD];
        board[1] = 'Black'; // intermediate occupied by own piece
        board[2] = null;    // destination empty
        const moves = getValidMoves(board, 0, 'Black');
        expect(moves).not.toContain(2);
      });

      it('blocks two-step move when intermediate node is occupied by opponent piece', () => {
        const board = [...INITIAL_BOARD];
        board[1] = 'White'; // intermediate occupied by opponent
        board[2] = null;    // destination empty
        const moves = getValidMoves(board, 0, 'Black');
        expect(moves).not.toContain(2);
      });

      it('blocks two-step move when destination is occupied by own piece', () => {
        const board = [...INITIAL_BOARD];
        board[1] = null;    // intermediate empty
        board[2] = 'Black'; // destination occupied by own piece
        const moves = getValidMoves(board, 0, 'Black');
        expect(moves).not.toContain(2);
      });

      it('blocks two-step move when destination is occupied by opponent piece', () => {
        const board = [...INITIAL_BOARD];
        board[1] = null;    // intermediate empty
        board[2] = 'White'; // destination occupied by opponent
        const moves = getValidMoves(board, 0, 'Black');
        expect(moves).not.toContain(2);
      });

      it('does not allow two-step move through non-straight-line path (4->2)', () => {
        const board = [...INITIAL_BOARD];
        board[3] = 'Black';
        board[4] = null;
        board[1] = null;  // node 2
        const moves = getValidMoves(board, 3, 'Black');
        // 4->2 is not a valid two-step move (would turn corner)
        expect(moves).not.toContain(1);
      });

      it('does not allow two-step move 1->6 (non-straight)', () => {
        const board = [...INITIAL_BOARD];
        board[4] = null;
        board[5] = null;
        const moves = getValidMoves(board, 0, 'Black');
        expect(moves).not.toContain(5);
      });

      it('includes both one-step and two-step moves when both available', () => {
        const board = [...INITIAL_BOARD];
        board[3] = null;
        board[6] = null;
        const moves = getValidMoves(board, 0, 'Black');
        // one-step: 3, 4; two-step: 6
        expect(moves.sort()).toEqual([3, 4, 6].sort());
      });
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
      const newState = makeMove(state, 0, 4); // node 1 -> node 5 (center)
      expect(newState).not.toBeNull();
      expect(newState!.board[4]).toBe('Black');
      expect(newState!.board[0]).toBeNull();
    });

    it('switches turn after valid move', () => {
      const state = createInitialState();
      const newState = makeMove(state, 0, 4);
      expect(newState!.currentPlayer).toBe('White');
    });

    it('clears selection after valid move', () => {
      const state = { ...createInitialState(), selectedNode: 0 };
      const newState = makeMove(state, 0, 4);
      expect(newState!.selectedNode).toBeNull();
    });

    it('returns null for invalid move (not connected)', () => {
      const state = createInitialState();
      // 0 (node 1) is not connected to 5 (node 6)
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
      const newState = makeMove(state, 6, 4);
      expect(newState).toBeNull();
    });

    describe('two-step moves', () => {
      it('allows Black to make two-step horizontal move from 0 to 2 (1->3)', () => {
        const board = [...INITIAL_BOARD];
        board[1] = null;
        board[2] = null;
        const state: GameState = {
          board,
          currentPlayer: 'Black',
          selectedNode: 0,
          winner: null,
          winningNodes: [],
        };
        const newState = makeMove(state, 0, 2);
        expect(newState).not.toBeNull();
        expect(newState!.board[2]).toBe('Black');
        expect(newState!.board[0]).toBeNull();
        expect(newState!.currentPlayer).toBe('White');
      });

      it('allows White to make two-step horizontal move from 8 to 6 (9->7)', () => {
        const board = [...INITIAL_BOARD];
        board[7] = null;
        board[6] = null;
        const state: GameState = {
          board,
          currentPlayer: 'White',
          selectedNode: 8,
          winner: null,
          winningNodes: [],
        };
        const newState = makeMove(state, 8, 6);
        expect(newState).not.toBeNull();
        expect(newState!.board[6]).toBe('White');
        expect(newState!.board[8]).toBeNull();
        expect(newState!.currentPlayer).toBe('Black');
      });

      it('allows Black to make two-step vertical move from 0 to 6 (1->7)', () => {
        const board = [...INITIAL_BOARD];
        board[3] = null;
        board[6] = null;
        const state: GameState = {
          board,
          currentPlayer: 'Black',
          selectedNode: 0,
          winner: null,
          winningNodes: [],
        };
        const newState = makeMove(state, 0, 6);
        expect(newState).not.toBeNull();
        expect(newState!.board[6]).toBe('Black');
        expect(newState!.board[0]).toBeNull();
      });

      it('allows White to make two-step vertical move from 8 to 2 (9->3)', () => {
        const board = [...INITIAL_BOARD];
        board[5] = null;
        board[2] = null;
        const state: GameState = {
          board,
          currentPlayer: 'White',
          selectedNode: 8,
          winner: null,
          winningNodes: [],
        };
        const newState = makeMove(state, 8, 2);
        expect(newState).not.toBeNull();
        expect(newState!.board[2]).toBe('White');
        expect(newState!.board[8]).toBeNull();
      });

      it('allows Black to make two-step diagonal move from 0 to 8 (1->9)', () => {
        const board = [...INITIAL_BOARD];
        board[4] = null;
        board[8] = null;
        const state: GameState = {
          board,
          currentPlayer: 'Black',
          selectedNode: 0,
          winner: null,
          winningNodes: [],
        };
        const newState = makeMove(state, 0, 8);
        expect(newState).not.toBeNull();
        expect(newState!.board[8]).toBe('Black');
        expect(newState!.board[0]).toBeNull();
      });

      it('allows White to make two-step diagonal move from 8 to 0 (9->1)', () => {
        const board = [...INITIAL_BOARD];
        board[4] = null;
        board[0] = null;
        const state: GameState = {
          board,
          currentPlayer: 'White',
          selectedNode: 8,
          winner: null,
          winningNodes: [],
        };
        const newState = makeMove(state, 8, 0);
        expect(newState).not.toBeNull();
        expect(newState!.board[0]).toBe('White');
        expect(newState!.board[8]).toBeNull();
      });

      it('allows two-step move from middle-left (3) to middle-right (5) via center', () => {
        const board = [...INITIAL_BOARD];
        board[3] = 'Black';
        board[0] = null;
        board[4] = null;
        board[5] = null;
        const state: GameState = {
          board,
          currentPlayer: 'Black',
          selectedNode: 3,
          winner: null,
          winningNodes: [],
        };
        const newState = makeMove(state, 3, 5);
        expect(newState).not.toBeNull();
        expect(newState!.board[5]).toBe('Black');
        expect(newState!.board[3]).toBeNull();
      });

      it('allows two-step move from top-center (1) to bottom-center (7) via center', () => {
        const board = [...INITIAL_BOARD];
        board[1] = 'Black';
        board[0] = null;
        board[4] = null;
        board[7] = null;
        const state: GameState = {
          board,
          currentPlayer: 'Black',
          selectedNode: 1,
          winner: null,
          winningNodes: [],
        };
        const newState = makeMove(state, 1, 7);
        expect(newState).not.toBeNull();
        expect(newState!.board[7]).toBe('Black');
        expect(newState!.board[1]).toBeNull();
      });

      it('allows two-step move from top-right (2) to bottom-left (6) via center', () => {
        const board = [...INITIAL_BOARD];
        board[2] = 'Black';
        board[4] = null;
        board[6] = null;
        const state: GameState = {
          board,
          currentPlayer: 'Black',
          selectedNode: 2,
          winner: null,
          winningNodes: [],
        };
        const newState = makeMove(state, 2, 6);
        expect(newState).not.toBeNull();
        expect(newState!.board[6]).toBe('Black');
        expect(newState!.board[2]).toBeNull();
      });

      it('blocks two-step move when intermediate node is occupied', () => {
        const board = [...INITIAL_BOARD];
        board[1] = 'White'; // intermediate occupied
        board[2] = null;
        const state: GameState = {
          board,
          currentPlayer: 'Black',
          selectedNode: 0,
          winner: null,
          winningNodes: [],
        };
        const newState = makeMove(state, 0, 2);
        expect(newState).toBeNull();
      });

      it('blocks two-step move when destination is occupied', () => {
        const board = [...INITIAL_BOARD];
        board[1] = null;
        board[2] = 'White'; // destination occupied
        const state: GameState = {
          board,
          currentPlayer: 'Black',
          selectedNode: 0,
          winner: null,
          winningNodes: [],
        };
        const newState = makeMove(state, 0, 2);
        expect(newState).toBeNull();
      });

      it('does not allow non-straight-line two-step move (4->2)', () => {
        const board = [...INITIAL_BOARD];
        board[3] = 'Black';
        board[4] = null;
        board[1] = null;
        const state: GameState = {
          board,
          currentPlayer: 'Black',
          selectedNode: 3,
          winner: null,
          winningNodes: [],
        };
        const newState = makeMove(state, 3, 1); // 4->2 is not a straight line
        expect(newState).toBeNull();
      });
    });
  });

  describe('isDraw', () => {
    it('returns false for initial board', () => {
      expect(isDraw(INITIAL_BOARD)).toBe(false);
    });

    it('returns false when winner exists', () => {
      const board = [...INITIAL_BOARD];
      board[3] = 'Black';
      board[4] = 'Black';
      board[5] = 'Black';
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

      state = makeMove(state, 0, 4)!;  // Black: 1 -> 5 (center)
      expect(state.currentPlayer).toBe('White');

      state = makeMove(state, 8, 5)!;  // White: 9 -> 6 (middle-right)
      expect(state.currentPlayer).toBe('Black');

      state = makeMove(state, 4, 3)!;  // Black: 5 -> 4 (middle-left)
      expect(state.currentPlayer).toBe('White');
    });
  });
});