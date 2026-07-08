import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/lib/theme';
import { IconSun, IconMoon } from '@/lib/icons';

export default function Navbar() {
  const { theme, toggleTheme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 24px',
        background: styles.background,
        borderBottom: `1px solid ${styles.headerBorder}`,
        boxShadow: `0 1px 8px ${styles.accent}15`,
        flexShrink: 0,
        height: 56,
      }}
    >
      {/* Left: Logo + Brand */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <Image
          src="/molten.png"
          alt="MoltenDocs"
          width={40}
          height={40}
          style={{ borderRadius: 4 }}
          priority
        />
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.5px' }}>
          MoltenDocs
        </span>
      </Link>

      {/* Right: Nav links + Theme toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link
          href="/"
          style={{
            color: styles.muted,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = styles.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = styles.muted; }}
        >
          Home
        </Link>
        <Link
          href="/docs"
          style={{
            color: styles.muted,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = styles.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = styles.muted; }}
        >
          Docs
        </Link>

        <button
          onClick={toggleTheme}
          style={{
            padding: '6px 10px',
            background: styles.buttonSecondary,
            color: styles.buttonSecondaryText,
            border: `1px solid ${styles.cardBorder}`,
            borderRadius: 6,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 0 8px ${styles.accent}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
          <span style={{ fontSize: 13 }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </header>
  );
}
