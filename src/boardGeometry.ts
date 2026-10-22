export interface Position {
  x: number;
  y: number;
}

export interface Connection {
  from: number;
  to: number;
}

export const BOARD_WIDTH = 600;
export const BOARD_HEIGHT = 400;
export const TOKEN_RADIUS = 24;

export const NODE_POSITIONS: Position[] = [
  { x: 40, y: 40 },    // 0: node 1 - top-left
  { x: 300, y: 40 },   // 1: node 2 - top-center
  { x: 560, y: 40 },   // 2: node 3 - top-right
  { x: 40, y: 200 },   // 3: node 4 - middle-left
  { x: 300, y: 200 },  // 4: node 5 - center
  { x: 560, y: 200 },  // 5: node 6 - middle-right
  { x: 40, y: 360 },   // 6: node 7 - bottom-left
  { x: 300, y: 360 },  // 7: node 8 - bottom-center
  { x: 560, y: 360 },  // 8: node 9 - bottom-right
];

export const BOARD_LINES: number[][] = [
  [0, 1, 2],  // top horizontal
  [3, 4, 5],  // middle horizontal
  [6, 7, 8],  // bottom horizontal
  [0, 3, 6],  // left vertical
  [1, 4, 7],  // middle vertical
  [2, 5, 8],  // right vertical
  [0, 4, 8],  // diagonal TL-BR
  [2, 4, 6],  // diagonal TR-BL
];

export const CONNECTIONS: Connection[] = [
  { from: 0, to: 1 },  // top horizontal
  { from: 1, to: 2 },  // top horizontal
  { from: 3, to: 4 },  // middle horizontal
  { from: 4, to: 5 },  // middle horizontal
  { from: 6, to: 7 },  // bottom horizontal
  { from: 7, to: 8 },  // bottom horizontal
  { from: 0, to: 3 },  // left vertical
  { from: 3, to: 6 },  // left vertical
  { from: 1, to: 4 },  // middle vertical
  { from: 4, to: 7 },  // middle vertical
  { from: 2, to: 5 },  // right vertical
  { from: 5, to: 8 },  // right vertical
  { from: 0, to: 4 },  // diagonal TL-center
  { from: 4, to: 8 },  // diagonal center-BR
  { from: 2, to: 4 },  // diagonal TR-center
  { from: 4, to: 6 },  // diagonal center-BL
];

export const ADJACENCY: Record<number, number[]> = {
  0: [1, 3, 4],    // node 1: connects to 2, 4, 5
  1: [0, 2, 4],    // node 2: connects to 1, 3, 5
  2: [1, 4, 5],    // node 3: connects to 2, 5, 6
  3: [0, 4, 6],    // node 4: connects to 1, 5, 7
  4: [0, 1, 2, 3, 5, 6, 7, 8],  // node 5 (center): connects to all
  5: [2, 4, 8],    // node 6: connects to 3, 5, 9
  6: [3, 4, 7],    // node 7: connects to 4, 5, 8
  7: [4, 6, 8], // node 8: connects to 5, 7, 9
  8: [4, 5, 7],    // node 9: connects to 5, 6, 8
};

export const WINNING_LINES: number[][] = [
  [3, 4, 5],  // middle horizontal
  [1, 4, 7],  // middle vertical
  [0, 4, 8],  // diagonal TL-BR
  [2, 4, 6],  // diagonal TR-BL
];

export const TWO_STEP_MOVES: Record<number, { to: number; via: number }[]> = {
  0: [
    { to: 2, via: 1 },  // horizontal top: 1 -> 3 via 2
    { to: 6, via: 3 },  // vertical left: 1 -> 7 via 4
    { to: 8, via: 4 },  // diagonal TL-BR: 1 -> 9 via 5
  ],
  1: [
    { to: 7, via: 4 },  // vertical center: 2 -> 8 via 5
  ],
  2: [
    { to: 0, via: 1 },  // horizontal top: 3 -> 1 via 2
    { to: 8, via: 5 },  // vertical right: 3 -> 9 via 6
    { to: 6, via: 4 },  // diagonal TR-BL: 3 -> 7 via 5
  ],
  3: [
    { to: 5, via: 4 },  // horizontal middle: 4 -> 6 via 5
  ],
  4: [],  // center has no two-step moves (all lines end at outer nodes)
  5: [
    { to: 3, via: 4 },  // horizontal middle: 6 -> 4 via 5
  ],
  6: [
    { to: 0, via: 3 },  // vertical left: 7 -> 1 via 4
    { to: 8, via: 7 },  // horizontal bottom: 7 -> 9 via 8
    { to: 2, via: 4 },  // diagonal TR-BL: 7 -> 3 via 5
  ],
  7: [
    { to: 1, via: 4 },  // vertical center: 8 -> 2 via 5
  ],
  8: [
    { to: 6, via: 7 },  // horizontal bottom: 9 -> 7 via 8
    { to: 2, via: 5 },  // vertical right: 9 -> 3 via 6
    { to: 0, via: 4 },  // diagonal TL-BR: 9 -> 1 via 5
  ],
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

export function getTwoStepMoves(from: number): { to: number; via: number }[] {
  return TWO_STEP_MOVES[from] || [];
}

export function getAllValidMoves(board: (string | null)[], from: number): number[] {
  const oneStep = ADJACENCY[from]?.filter(idx => board[idx] === null) || [];
  const twoStep = TWO_STEP_MOVES[from]?.filter(({ to, via }) => 
    board[via] === null && board[to] === null
  ).map(({ to }) => to) || [];
  return [...oneStep, ...twoStep];
}