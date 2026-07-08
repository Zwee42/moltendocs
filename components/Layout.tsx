import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from '@/lib/theme';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'auto',
        background: styles.background,
        color: styles.color,
      }}
    >
      <Navbar />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
