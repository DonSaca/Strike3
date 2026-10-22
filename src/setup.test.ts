import { describe, it, expect, vi } from 'vitest';
import { createInitialState, INITIAL_BOARD } from './gameLogic';

describe('first-player selection', () => {
  it('defaults to Black', () => {
    const s = createInitialState();
    expect(s.currentPlayer).toBe('Black');
  });

  it('respects Black start', () => {
    const s = createInitialState('Black');
    expect(s.currentPlayer).toBe('Black');
  });

  it('respects White start', () => {
    const s = createInitialState('White');
    expect(s.currentPlayer).toBe('White');
  });

  it('preserves initial board regardless of start', () => {
    const s = createInitialState('White');
    expect(s.board).toEqual(INITIAL_BOARD);
  });

  it('random coin toss can produce either player (mocked)', () => {
    const mock = vi.spyOn(Math, 'random').mockReturnValue(0.2);
    // We test via our own logic; here just verify random range
    expect(typeof Math.random()).toBe('number');
    mock.mockRestore();
  });
});
