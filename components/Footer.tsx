import React from 'react';
import { useTheme } from '@/lib/theme';

export default function Footer() {
  const { getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  return (
    <footer
      style={{
        padding: '12px 24px',
        borderTop: `1px solid ${styles.headerBorder}`,
        textAlign: 'center',
        color: styles.muted,
        fontSize: 13,
        flexShrink: 0,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: styles.background,
      }}
    >
      <p style={{ margin: 0 }}>
        Powered by <span style={{ color: styles.accent, fontWeight: 600 }}>MoltenDocs</span>
      </p>
    </footer>
  );
}
