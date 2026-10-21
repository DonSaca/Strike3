import { GameState, getValidMoves } from './gameLogic';
import { CONNECTIONS, BOARD_WIDTH, BOARD_HEIGHT, TOKEN_RADIUS, getConnectedNodes, Position } from './boardGeometry';
import { Token } from './Token';

interface BoardSVGProps {
  gameState: GameState;
  onNodeClick: (index: number) => void;
  reducedMotion: boolean;
  lastMove: { from: number; to: number } | null;
  nodePositions: Position[];
}

export function BoardSVG({ gameState, onNodeClick, reducedMotion, lastMove, nodePositions }: BoardSVGProps) {
  const { board, selectedNode, winningNodes, currentPlayer } = gameState;

  const validMoves = selectedNode !== null
    ? getValidMoves(board, selectedNode, currentPlayer)
    : [];
  
  const oneStepMoves = selectedNode !== null
    ? getConnectedNodes(selectedNode).filter(idx => board[idx] === null)
    : [];
  
  const twoStepMoves = validMoves.filter(m => !oneStepMoves.includes(m));

  return (
    <div className="flex justify-center" role="region" aria-label="Game board">
      <svg
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
        className="board-svg"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        <defs>
          <linearGradient id="boardBgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1f2e" />
            <stop offset="50%" stopColor="#15203a" />
            <stop offset="50%" stopColor="#3a1018" />
            <stop offset="100%" stopColor="#2a0a12" />
          </linearGradient>
          
          <filter id="boardGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id="connectionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <radialGradient id="centerGlowGreen" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.15)" />
            <stop offset="100%" stopColor="rgba(22, 101, 52, 0)" />
          </radialGradient>
          
          <radialGradient id="centerGlowRed" cx="50%" cy="70%" r="60%">
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.15)" />
            <stop offset="100%" stopColor="rgba(127, 29, 29, 0)" />
          </radialGradient>
        </defs>

        <rect
          x={2}
          y={2}
          width={BOARD_WIDTH - 4}
          height={BOARD_HEIGHT - 4}
          rx={0}
          ry={0}
          fill="url(#boardBgGradient)"
          stroke="#2a2f3a"
          strokeWidth={1.5}
          filter="url(#boardGlow)"
        />

        <rect
          x={16}
          y={16}
          width={BOARD_WIDTH - 32}
          height={BOARD_HEIGHT - 32}
          rx={0}
          ry={0}
          fill="url(#centerGlowGreen)"
          pointerEvents="none"
        />
        
        <rect
          x={16}
          y={16}
          width={BOARD_WIDTH - 32}
          height={BOARD_HEIGHT - 32}
          rx={0}
          ry={0}
          fill="url(#centerGlowRed)"
          pointerEvents="none"
        />

        <g className="connections" filter="url(#connectionGlow)">
          {CONNECTIONS.map((conn, idx) => {
            const start = nodePositions[conn.from];
            const end = nodePositions[conn.to];
            const isWinningConnection = winningNodes.includes(conn.from) && winningNodes.includes(conn.to);
            const isValidMoveConnection = selectedNode !== null && 
              ((conn.from === selectedNode && validMoves.includes(conn.to)) ||
               (conn.to === selectedNode && validMoves.includes(conn.from)));
            
            let strokeColor = 'rgba(255,255,255,0.08)';
            let strokeWidth = 1.5;
            let strokeDasharray = '4 6';
            
            if (isWinningConnection) {
              strokeColor = '#22c55e';
              strokeWidth = 3;
              strokeDasharray = 'none';
            } else if (isValidMoveConnection) {
              strokeColor = '#4ade80';
              strokeWidth = 2.5;
              strokeDasharray = 'none';
            } else if (selectedNode !== null && (conn.from === selectedNode || conn.to === selectedNode)) {
              strokeColor = 'rgba(255,255,255,0.2)';
              strokeWidth = 2;
              strokeDasharray = 'none';
            }

            return (
              <line
                key={idx}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
                style={{
                  transition: reducedMotion ? 'none' : 'stroke 150ms ease-out, stroke-width 150ms ease-out',
                }}
              />
            );
          })}
        </g>

        <g className="nodes">
          {nodePositions.map((pos, idx) => {
            const isOccupied = board[idx] !== null;
            const isSelected = selectedNode === idx;
            const isValidMove = validMoves.includes(idx);
            const isTwoStepMove = twoStepMoves.includes(idx);
            const isWinning = winningNodes.includes(idx);
            const nodeValue = board[idx];
            
            // Check if this token was just moved (animate from lastMove.from to lastMove.to)
            const animateFrom = lastMove && lastMove.to === idx ? nodePositions[lastMove.from] : null;
            
            let nodeFill = 'rgba(255,255,255,0.04)';
            let nodeStroke = 'rgba(255,255,255,0.1)';
            let nodeStrokeWidth = 1;
            
            if (isWinning) {
              nodeFill = 'rgba(34, 197, 94, 0.15)';
              nodeStroke = '#22c55e';
              nodeStrokeWidth = 2;
            } else if (isSelected) {
              nodeFill = 'rgba(250, 204, 21, 0.15)';
              nodeStroke = '#facc15';
              nodeStrokeWidth = 2;
            } else if (isValidMove) {
              if (isTwoStepMove) {
                nodeFill = 'rgba(59, 130, 246, 0.15)';
                nodeStroke = '#3b82f6';
                nodeStrokeWidth = 2;
              } else {
                nodeFill = 'rgba(74, 222, 128, 0.15)';
                nodeStroke = '#4ade80';
                nodeStrokeWidth = 2;
              }
            } else if (selectedNode !== null && getConnectedNodes(selectedNode).includes(idx)) {
              nodeFill = 'rgba(255,255,255,0.08)';
              nodeStroke = 'rgba(255,255,255,0.2)';
              nodeStrokeWidth = 1.5;
            }

            return (
              <g key={idx}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={TOKEN_RADIUS + 4}
                  fill={nodeFill}
                  stroke={nodeStroke}
                  strokeWidth={nodeStrokeWidth}
                  style={{
                    transition: reducedMotion ? 'none' : 'fill 150ms ease-out, stroke 150ms ease-out',
                  }}
                  pointerEvents="none"
                />
                
                {isOccupied && nodeValue && (
                  <Token
                    player={nodeValue}
                    position={pos}
                    radius={TOKEN_RADIUS}
                    isSelected={isSelected}
                    isValidMove={false}
                    isWinning={isWinning}
                    onClick={() => onNodeClick(idx)}
                    animateFrom={animateFrom}
                    reducedMotion={reducedMotion}
                  />
                )}
                
                {!isOccupied && isValidMove && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={TOKEN_RADIUS + 4}
                    fill="transparent"
                    stroke="none"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onNodeClick(idx)}
                  />
                )}
                
                {!isOccupied && (isValidMove || (isSelected && getConnectedNodes(idx).some(n => board[n] === currentPlayer))) && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={TOKEN_RADIUS * 0.55}
                    fill="none"
                    stroke={isTwoStepMove ? '#3b82f6' : (isValidMove ? '#4ade80' : 'rgba(250, 204, 21, 0.6)')}
                    strokeWidth={2.5}
                    strokeDasharray={isTwoStepMove ? '4 4' : '6 4'}
                    style={{
                      animation: reducedMotion ? 'none' : 'dashSpin 1.5s linear infinite',
                    }}
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })}
        </g>

        <style>{`
          @keyframes dashSpin {
            to { stroke-dashoffset: -20; }
          }
        `}</style>
      </svg>
    </div>
  );
}