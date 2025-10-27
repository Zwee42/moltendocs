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
  background: '#ffffff',
  color: '#1a1a1a',
  headerBorder: '#e5e5e5',
  cardBackground: '#f8f9fa',
  cardBorder: '#e5e5e5',
  accent: '#6366f1',
  muted: '#6b7280',
  buttonPrimary: '#6366f1',
  buttonPrimaryText: '#ffffff',
  buttonSecondary: '#e5e7eb',
  buttonSecondaryText: '#374151',
  inputBackground: '#ffffff',
  inputBorder: '#d1d5db',
  errorBackground: '#fef2f2',
  errorBorder: '#fecaca',
  errorText: '#dc2626',
  successBackground: '#f0fdf4',
  successBorder: '#bbf7d0',
  successText: '#16a34a'
};

const darkTheme: ThemeStyles = {
  background: '#0b0b10',
  color: '#e9e0ee',
  headerBorder: '#441534ff',
  cardBackground: '#101018',
  cardBorder: '#441534ff',
  accent: '#cfa6db',
  muted: '#aaa',
  buttonPrimary: '#cfa6db',
  buttonPrimaryText: '#000',
  buttonSecondary: '#555',
  buttonSecondaryText: '#fff',
  inputBackground: '#101018',
  inputBorder: '#441534ff',
  errorBackground: '#4a1a1a',
  errorBorder: '#8b2635',
  errorText: '#ff8b94',
  successBackground: '#1a4a2e',
  successBorder: '#28a745',
  successText: '#90ee90'
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
