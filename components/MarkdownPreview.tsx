import React from 'react';
import { useTheme } from '@/lib/theme';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export function MarkdownPreview({ content, className, style }: MarkdownPreviewProps) {
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  if (!content.trim()) {
    return (
      <div 
        className={`${theme} ${className || ''}`}
        style={{ 
          height: '100%',
          padding: '16px',
          background: styles.inputBackground,
          border: `1px solid ${styles.inputBorder}`,
          borderRadius: 6,
          overflow: 'auto',
          lineHeight: 1.6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style 
        }}
      >
        <p style={{ color: styles.muted, fontStyle: 'italic' }}>
          Start writing to see a preview...
        </p>
      </div>
    );
  }

  return (
    <div 
      className={`${theme} ${className || ''}`}
      style={{ 
        height: '100vh',
        padding: '16px',
        background: styles.inputBackground,
        border: `1px solid ${styles.inputBorder}`,
        borderRadius: 6,
        overflow: 'auto',
        lineHeight: 1.6,
        ...style 
      }}
    >
      <MarkdownRenderer content={content} />
    </div>
  );
}
