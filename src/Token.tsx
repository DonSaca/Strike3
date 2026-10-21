import { useEffect, useState } from 'react';
import { Position } from './boardGeometry';

interface TokenProps {
  player: 'Black' | 'White';
  position: Position;
  radius?: number;
  isSelected?: boolean;
  isValidMove?: boolean;
  isWinning?: boolean;
  onClick?: () => void;
  animateFrom?: Position | null;
  reducedMotion?: boolean;
}

const TOKEN_RADIUS = 24;
const ANIMATION_DURATION = 220;

export function Token({
  player,
  position,
  radius = TOKEN_RADIUS,
  isSelected = false,
  isValidMove = false,
  isWinning = false,
  onClick,
  animateFrom = null,
  reducedMotion = false,
}: TokenProps) {
  const [animatedPosition, setAnimatedPosition] = useState<Position>(position);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (animateFrom && !hasAnimated && !reducedMotion) {
      setAnimatedPosition(animateFrom);
      setHasAnimated(true);
      requestAnimationFrame(() => {
        setAnimatedPosition(position);
      });
    } else if (!animateFrom || reducedMotion) {
      setAnimatedPosition(position);
      setHasAnimated(false);
    }
  }, [position, animateFrom, hasAnimated, reducedMotion]);

  const gradients = {
    Black: `url(#tokenGradientBlue)`,
    White: `url(#tokenGradientRed)`,
  };

  const highlightGradients = {
    Black: `url(#tokenHighlightBlue)`,
    White: `url(#tokenHighlightRed)`,
  };

  let filter = '';
  if (isSelected) {
    filter = 'drop-shadow(0 0 8px currentColor) drop-shadow(0 4px 12px rgba(0,0,0,0.4))';
  } else if (isValidMove) {
    filter = 'drop-shadow(0 0 6px currentColor) drop-shadow(0 2px 8px rgba(0,0,0,0.3))';
  } else {
    filter = 'drop-shadow(0 4px 12px rgba(0,0,0,0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
  }

  const strokeColor = isWinning ? '#22c55e' : (isSelected ? '#facc15' : (isValidMove ? '#4ade80' : 'rgba(255,255,255,0.3)'));
  const strokeWidth = isWinning || isSelected || isValidMove ? 3 : 1.5;

  const style: React.CSSProperties = {
    transform: `translate(${animatedPosition.x - radius}px, ${animatedPosition.y - radius}px)`,
    transition: reducedMotion ? 'none' : `transform ${ANIMATION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
    filter,
    cursor: onClick ? 'pointer' : 'default',
  };

  return (
    <g style={style} onClick={onClick}>
      <defs>
        <radialGradient id={`tokenGradientBlue`} cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="40%" stopColor="#3b82f6" />
          <stop offset="70%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>
        <radialGradient id={`tokenGradientRed`} cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="40%" stopColor="#ef4444" />
          <stop offset="70%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
        <radialGradient id={`tokenHighlightBlue`} cx="30%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`tokenHighlightRed`} cx="30%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#fecaca" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#ef4444" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      <circle
        cx={radius}
        cy={radius}
        r={radius - 2}
        fill={gradients[player]}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      <ellipse
        cx={radius * 0.65}
        cy={radius * 0.5}
        rx={radius * 0.45}
        ry={radius * 0.25}
        fill={highlightGradients[player]}
        opacity={isWinning ? 0 : 0.7}
      />
      
      <circle
        cx={radius * 0.75}
        cy={radius * 0.35}
        r={radius * 0.12}
        fill="rgba(255,255,255,0.6)"
        opacity={isWinning ? 0 : 1}
      />
      
      {isWinning && (
        <g>
          <line
            x1={radius * 0.25}
            y1={radius * 0.25}
            x2={radius * 1.75}
            y2={radius * 1.75}
            stroke="#22c55e"
            strokeWidth={4}
            strokeLinecap="round"
            opacity="0.9"
          />
          <line
            x1={radius * 1.75}
            y1={radius * 0.25}
            x2={radius * 0.25}
            y2={radius * 1.75}
            stroke="#22c55e"
            strokeWidth={4}
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>
      )}
    </g>
  );
}