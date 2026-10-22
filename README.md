# Strike3

A tactical board game built with React, TypeScript, and Vite. Similar to the classic "Three Men's Morris" / "Nine Holes" game with a distinctive Strike3 victory condition.

## Game Overview

Strike3 is played on a rectangular 3×3 board with nine positions connected by eight straight lines (three horizontal, three vertical, two diagonal). Each player has three pieces. Players take turns moving one piece along the lines to an adjacent empty position, or jumping two steps in a straight line over an empty intermediate position.

**The unique Strike3 victory condition**: A player wins only when all three of their pieces occupy a straight line that passes through the **center position (5)**. There are exactly four winning lines:
- Middle horizontal row (positions 4–5–6)
- Middle vertical column (positions 2–5–8)
- Main diagonal (positions 1–5–9)
- Anti-diagonal (positions 3–5–7)

The top row, bottom row, left column, and right column are **not** winning lines.

## Board Geometry

```
1 ───── 2 ───── 3
│ \     │     / │
│   \   │   /   │
4 ───── 5 ───── 6
│   /   │   \   │
│ /     │     \ │
7 ───── 8 ───── 9
```

### Node Positions (in 600×400 viewBox coordinates)
| Node | Position | Coordinates |
|------|----------|-------------|
| 1    | Top-left     | (40, 40)    |
| 2    | Top-center   | (300, 40)   |
| 3    | Top-right    | (560, 40)   |
| 4    | Middle-left  | (40, 200)   |
| 5    | **Center**   | (300, 200)  |
| 6    | Middle-right | (560, 200)  |
| 7    | Bottom-left  | (40, 360)   |
| 8    | Bottom-center| (300, 360)  |
| 9    | Bottom-right | (560, 360)  |

### Board Lines (8 straight lines)
- **Horizontal**: 1–2–3, 4–5–6, 7–8–9
- **Vertical**: 1–4–7, 2–5–8, 3–6–9
- **Diagonal**: 1–5–9, 3–5–7

## Movement Rules

### One-Step Movement
A piece may move to any **directly connected** node if the destination is unoccupied.

### Two-Step Movement
A piece may move exactly **two steps along a single straight line** if:
1. The starting node, intermediate node, and destination node lie on the same defined straight line
2. The path follows two consecutive connections from one of the eight board lines
3. The **intermediate node is unoccupied** (no jumping over pieces)
4. The **destination node is unoccupied**
5. Movement proceeds in one direction (no turning corners)

### No Jumping
Pieces cannot jump over other pieces. For any two-step move, the intermediate node must be empty.

### Occupied Destinations
No piece may move onto an occupied node, regardless of ownership.

## Victory Condition

A player wins **only** when their three pieces occupy one of these four lines through the center (position 5):

| Winning Line | Positions | Description |
|--------------|-----------|-------------|
| Middle horizontal | 4–5–6 | Row through center |
| Middle vertical | 2–5–8 | Column through center |
| Main diagonal | 1–5–9 | Top-left to bottom-right |
| Anti-diagonal | 3–5–7 | Top-right to bottom-left |

**Not winning lines** (even with three pieces):
- Top row (1–2–3)
- Bottom row (7–8–9)
- Left column (1–4–7)
- Right column (3–6–9)

## Game Modes

- **Over the Board:** Two-player local game with selectable first player.
- **Play vs Computer:** Single-player against the AI with selectable difficulty (Easy / Medium / Hard) and AI color.

## First-Player Selection

Before starting a game, choose:
- **Coin Toss:** Random equal-probability selection.
- **Green Starts:** Black starts.
- **Red Starts:** White starts.

The selection is preserved when restarting the same session.

## AI Difficulty

- **Easy:** Random legal move.
- **Medium:** Minimax depth ~3.
- **Hard:** Alpha-beta pruning, depth ~5.

## Themes

Select from **Classic**, **Dark**, or **High Contrast** in Settings. Theme is saved to `localStorage` and applied immediately.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint
```

## Project Structure

```
src/
├── App.tsx              # Main app with menu, setup, game, settings
├── BoardSVG.tsx         # SVG board rendering
├── Token.tsx            # Animated piece component
├── gameLogic.ts         # Game logic & victory detection
├── boardGeometry.ts     # Board topology & geometry
├── gameLogic.test.ts    # Unit tests
├── ai.ts                # Computer opponent
├── themes.ts            # Theme definitions
├── themeContext.tsx     # Theme provider
├── ai.test.ts           # AI tests
├── setup.test.ts        # Setup tests
├── main.tsx             # Entry point
└── index.css            # Global styles (Tailwind)
```

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Vitest (testing)

## Key Implementation Details

- **Board rendering**: SVG with 600×400 viewBox, sharp rectangular corners
- **Piece animation**: Smooth 220ms ease-out sliding along connections
- **Movement validation**: Derived from authoritative board topology in `boardGeometry.ts`
- **Victory detection**: Explicit list of four winning lines through center
- **Accessibility**: ARIA labels, keyboard focus, reduced-motion support
- **Responsive**: Scales to mobile (360px) and desktop viewports
