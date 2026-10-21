export interface Position {
  x: number;
  y: number;
}

export interface Connection {
  from: number;
  to: number;
}

export const BOARD_WIDTH = 320;
export const BOARD_HEIGHT = 360;
export const TOKEN_RADIUS = 24;

export const NODE_POSITIONS: Position[] = [
  { x: 80, y: 40 },    // 0: top-left
  { x: 160, y: 40 },   // 1: top-center
  { x: 240, y: 40 },   // 2: top-right
  { x: 40, y: 180 },   // 3: middle-left
  { x: 160, y: 180 },  // 4: center
  { x: 280, y: 180 },  // 5: middle-right
  { x: 80, y: 320 },   // 6: bottom-left
  { x: 160, y: 320 },  // 7: bottom-center
  { x: 240, y: 320 },  // 8: bottom-right
];

export const CONNECTIONS: Connection[] = [
  { from: 0, to: 1 },  // top edge
  { from: 1, to: 2 },  // top edge
  { from: 3, to: 4 },  // middle horizontal
  { from: 4, to: 5 },  // middle horizontal
  { from: 6, to: 7 },  // bottom edge
  { from: 7, to: 8 },  // bottom edge
  { from: 0, to: 3 },  // left edge
  { from: 3, to: 6 },  // left edge
  { from: 1, to: 4 },  // vertical center
  { from: 4, to: 7 },  // vertical center
  { from: 2, to: 5 },  // right edge
  { from: 5, to: 8 },  // right edge
  { from: 0, to: 4 },  // diagonal TL to center
  { from: 4, to: 8 },  // diagonal center to BR
  { from: 2, to: 4 },  // diagonal TR to center
  { from: 4, to: 6 },  // diagonal center to BL
];

export const ADJACENCY: Record<number, number[]> = {
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

export function getPosition(index: number): Position {
  return NODE_POSITIONS[index];
}

export function getConnectedNodes(index: number): number[] {
  return ADJACENCY[index] || [];
}

export function areConnected(from: number, to: number): boolean {
  return ADJACENCY[from]?.includes(to) ?? false;
}

export function getConnectionPath(from: number, to: number): string {
  const start = NODE_POSITIONS[from];
  const end = NODE_POSITIONS[to];
  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
}

export function getTokenStartPosition(player: 'Black' | 'White', tokenIndex: number): Position {
  if (player === 'Black') {
    const topPositions = [0, 1, 2];
    return NODE_POSITIONS[topPositions[tokenIndex]];
  } else {
    const bottomPositions = [6, 7, 8];
    return NODE_POSITIONS[bottomPositions[tokenIndex]];
  }
}