import { useEffect, useState } from 'react';
import { Position } from './boardGeometry';
import { useTheme } from './themeContext';

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
  useTheme();
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

  const strokeColor = isWinning ? 'var(--theme-accent-green)' : (isSelected ? 'var(--theme-accent-gold)' : (isValidMove ? 'var(--theme-accent-green)' : 'rgba(255,255,255,0.3)'));
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
          <stop offset="0%" style={{ stopColor: 'var(--theme-black-start)' }} />
          <stop offset="40%" style={{ stopColor: 'var(--theme-black-start)' }} stopOpacity="0.85" />
          <stop offset="70%" style={{ stopColor: 'var(--theme-black-end)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--theme-black-end)' }} />
        </radialGradient>
        <radialGradient id={`tokenGradientRed`} cx="35%" cy="35%" r="70%">
          <stop offset="0%" style={{ stopColor: 'var(--theme-white-start)' }} />
          <stop offset="40%" style={{ stopColor: 'var(--theme-white-start)' }} stopOpacity="0.85" />
          <stop offset="70%" style={{ stopColor: 'var(--theme-white-end)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--theme-white-end)' }} />
        </radialGradient>
        <radialGradient id={`tokenHighlightBlue`} cx="30%" cy="30%" r="80%">
          <stop offset="0%" style={{ stopColor: 'var(--theme-black-hl-start)' }} stopOpacity="0.9" />
          <stop offset="50%" style={{ stopColor: 'var(--theme-black-hl-start)' }} stopOpacity="0.4" />
          <stop offset="100%" style={{ stopColor: 'var(--theme-black-hl-end)' }} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`tokenHighlightRed`} cx="30%" cy="30%" r="80%">
          <stop offset="0%" style={{ stopColor: 'var(--theme-white-hl-start)' }} stopOpacity="0.9" />
          <stop offset="50%" style={{ stopColor: 'var(--theme-white-hl-start)' }} stopOpacity="0.4" />
          <stop offset="100%" style={{ stopColor: 'var(--theme-white-hl-end)' }} stopOpacity="0" />
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