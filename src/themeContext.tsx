import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeName, applyTheme, DEFAULT_THEME } from './themes';

interface ThemeCtx {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: DEFAULT_THEME, setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    try {
      const stored = localStorage.getItem('strike3-theme');
      if (stored && stored in { classic: 1, dark: 1, 'high-contrast': 1 }) return stored as ThemeName;
    } catch { /* ignore */ }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem('strike3-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const setTheme = (t: ThemeName) => setThemeState(t);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
