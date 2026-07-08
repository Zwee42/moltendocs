import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  getThemeStyles: () => ThemeStyles;
}

interface ThemeStyles {
  background: string;
  color: string;
  h1Color: string;
  h2Color: string;
  h3Color: string;
  headerBorder: string;
  cardBackground: string;
  cardBorder: string;
  accent: string;
  muted: string;
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  inputBackground: string;
  inputBorder: string;
  errorBackground: string;
  errorBorder: string;
  errorText: string;
  successBackground: string;
  successBorder: string;
  successText: string;
}

const lightTheme: ThemeStyles = {
  background: '#fafafa',
  color: '#52525b',
  h1Color: '#0b0b0b',
  h2Color: '#18181b',
  h3Color: '#27272a',
  headerBorder: '#e4e4e7',
  cardBackground: '#ffffff',
  cardBorder: '#e4e4e7',
  accent: '#dc2626',
  muted: '#71717a',
  buttonPrimary: '#dc2626',
  buttonPrimaryText: '#ffffff',
  buttonSecondary: '#f4f4f5',
  buttonSecondaryText: '#18181b',
  inputBackground: '#ffffff',
  inputBorder: '#e4e4e7',
  errorBackground: '#fef2f2',
  errorBorder: '#fecaca',
  errorText: '#dc2626',
  successBackground: '#f0fdf4',
  successBorder: '#bbf7d0',
  successText: '#16a34a'
};

const darkTheme: ThemeStyles = {
  background: '#09090b',
  color: '#d4d4d8',
  h1Color: '#fafafa',
  h2Color: '#f4f4f5',
  h3Color: '#e4e4e7',
  headerBorder: '#27272a',
  cardBackground: '#18181b',
  cardBorder: '#27272a',
  accent: '#dc2626',
  muted: '#a1a1aa',
  buttonPrimary: '#dc2626',
  buttonPrimaryText: '#ffffff',
  buttonSecondary: '#27272a',
  buttonSecondaryText: '#f4f4f5',
  inputBackground: '#18181b',
  inputBorder: '#27272a',
  errorBackground: '#450a0a',
  errorBorder: '#7f1d1d',
  errorText: '#fca5a5',
  successBackground: '#052e16',
  successBorder: '#166534',
  successText: '#86efac'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme;
    if (stored && (stored === 'light' || stored === 'dark')) {
      setTheme(stored);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    const styles = theme === 'light' ? lightTheme : darkTheme;
    root.style.setProperty('--accent', styles.accent);
    root.style.setProperty('--accent-hover', '#ef4444');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const getThemeStyles = () => {
    return theme === 'light' ? lightTheme : darkTheme;
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, getThemeStyles }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
