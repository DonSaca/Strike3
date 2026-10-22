export type ThemeName = 'classic' | 'dark' | 'high-contrast';

export interface Theme {
  name: ThemeName;
  boardBg: string;
  boardLines: string;
  boardNodesFill: string;
  boardNodesStroke: string;
  blackPieceGradientStart: string;
  blackPieceGradientEnd: string;
  blackPieceHighlightStart: string;
  blackPieceHighlightEnd: string;
  whitePieceGradientStart: string;
  whitePieceGradientEnd: string;
  whitePieceHighlightStart: string;
  whitePieceHighlightEnd: string;
  textMain: string;
  textSecondary: string;
  uiBg: string;
  uiBorder: string;
  accentBlue: string;
  accentRed: string;
  accentGreen: string;
  accentGold: string;
}

export const THEMES: Record<ThemeName, Theme> = {
  classic: {
    name: 'classic',
    boardBg: 'linear-gradient(135deg, #1a1f2e 0%, #15203a 50%, #3a1018 50%, #2a0a12 100%)',
    boardLines: 'rgba(255,255,255,0.08)',
    boardNodesFill: 'rgba(255,255,255,0.04)',
    boardNodesStroke: 'rgba(255,255,255,0.1)',
    blackPieceGradientStart: '#60a5fa',
    blackPieceGradientEnd: '#1e3a8a',
    blackPieceHighlightStart: '#93c5fd',
    blackPieceHighlightEnd: '#1e40af',
    whitePieceGradientStart: '#fca5a5',
    whitePieceGradientEnd: '#7f1d1d',
    whitePieceHighlightStart: '#fecaca',
    whitePieceHighlightEnd: '#7f1d1d',
    textMain: '#e8eaed',
    textSecondary: '#9aa0a6',
    uiBg: 'linear-gradient(135deg, #1e2430 0%, #151922 100%)',
    uiBorder: '#1f242d',
    accentBlue: '#3b82f6',
    accentRed: '#ef4444',
    accentGreen: '#22c55e',
    accentGold: '#facc15',
  },
  dark: {
    name: 'dark',
    boardBg: '#0d1117',
    boardLines: '#30363d',
    boardNodesFill: '#161b22',
    boardNodesStroke: '#30363d',
    blackPieceGradientStart: '#58a6ff',
    blackPieceGradientEnd: '#0d2b6e',
    blackPieceHighlightStart: '#79c0ff',
    blackPieceHighlightEnd: '#0d2b6e',
    whitePieceGradientStart: '#ff7b72',
    whitePieceGradientEnd: '#5a1d1d',
    whitePieceHighlightStart: '#ffa198',
    whitePieceHighlightEnd: '#5a1d1d',
    textMain: '#c9d1d9',
    textSecondary: '#8b949e',
    uiBg: '#161b22',
    uiBorder: '#30363d',
    accentBlue: '#58a6ff',
    accentRed: '#ff7b72',
    accentGreen: '#3fb950',
    accentGold: '#d29922',
  },
  'high-contrast': {
    name: 'high-contrast',
    boardBg: '#f8fafc',
    boardLines: '#0f172a',
    boardNodesFill: '#e2e8f0',
    boardNodesStroke: '#0f172a',
    blackPieceGradientStart: '#1e40af',
    blackPieceGradientEnd: '#1e3a8a',
    blackPieceHighlightStart: '#93c5fd',
    blackPieceHighlightEnd: '#1e3a8a',
    whitePieceGradientStart: '#dc2626',
    whitePieceGradientEnd: '#7f1d1d',
    whitePieceHighlightStart: '#fecaca',
    whitePieceHighlightEnd: '#7f1d1d',
    textMain: '#0f172a',
    textSecondary: '#334155',
    uiBg: '#ffffff',
    uiBorder: '#0f172a',
    accentBlue: '#1d4ed8',
    accentRed: '#dc2626',
    accentGreen: '#16a34a',
    accentGold: '#ca8a04',
  },
};

export const DEFAULT_THEME: ThemeName = 'classic';

export function getTheme(name?: string): Theme {
  if (name && name in THEMES) return THEMES[name as ThemeName];
  return THEMES[DEFAULT_THEME];
}

export function applyTheme(name: ThemeName) {
  const t = THEMES[name];
  const root = document.documentElement as HTMLElement & { style: CSSStyleDeclaration };
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const s = (root.style as any);
  s.setProperty('--theme-board-bg', t.boardBg);
  s.setProperty('--theme-board-lines', t.boardLines);
  s.setProperty('--theme-nodes-fill', t.boardNodesFill);
  s.setProperty('--theme-nodes-stroke', t.boardNodesStroke);
  s.setProperty('--theme-black-start', t.blackPieceGradientStart);
  s.setProperty('--theme-black-end', t.blackPieceGradientEnd);
  s.setProperty('--theme-black-hl-start', t.blackPieceHighlightStart);
  s.setProperty('--theme-black-hl-end', t.blackPieceHighlightEnd);
  s.setProperty('--theme-white-start', t.whitePieceGradientStart);
  s.setProperty('--theme-white-end', t.whitePieceGradientEnd);
  s.setProperty('--theme-white-hl-start', t.whitePieceHighlightStart);
  s.setProperty('--theme-white-hl-end', t.whitePieceHighlightEnd);
  s.setProperty('--theme-text-main', t.textMain);
  s.setProperty('--theme-text-secondary', t.textSecondary);
  s.setProperty('--theme-ui-bg', t.uiBg);
  s.setProperty('--theme-ui-border', t.uiBorder);
  s.setProperty('--theme-accent-blue', t.accentBlue);
  s.setProperty('--theme-accent-red', t.accentRed);
  s.setProperty('--theme-accent-green', t.accentGreen);
  s.setProperty('--theme-accent-gold', t.accentGold);
  s.setProperty('--theme-active', name);
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
