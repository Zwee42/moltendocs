import React from 'react';
import { useTheme } from '@/lib/theme';

interface ToolbarProps {
  onInsertText: (text: string) => void;
}

export function EditorToolbar({ 
  onInsertText, 
}: ToolbarProps) {
  const { getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const buttons = [
    { label: 'B', text: '**bold text**', title: 'Bold', style: { fontWeight: 'bold' } },
    { label: 'I', text: '*italic text*', title: 'Italic', style: { fontStyle: 'italic' } },
    { label: '</>', text: '`code`', title: 'Inline Code', style: { fontFamily: 'var(--font-geist-mono)' } },
    { label: 'H2', text: '\n## Heading\n', title: 'Heading 2' },
    { label: 'H3', text: '\n### Heading\n', title: 'Heading 3' },
    { label: '•', text: '\n- List item\n', title: 'Bullet List' },
    { label: '1.', text: '\n1. List item\n', title: 'Numbered List' },
    { label: 'Link', text: '[link text](url)', title: 'Link' },
    { label: 'Img', text: '![alt text](image-url)', title: 'Image' },
    { label: '>', text: '\n> Quote\n', title: 'Blockquote' },
    { label: '---', text: '\n---\n', title: 'Horizontal Rule' },
  ];

  return (
    <div style={{ 
      marginBottom: 16, 
      padding: '12px 16px',
      background: styles.cardBackground,
      border: `1px solid ${styles.cardBorder}`,
      borderRadius: 6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12
    }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={() => onInsertText(button.text)}
            title={button.title}
            style={{
              padding: '6px 10px',
              background: styles.buttonSecondary,
              color: styles.buttonSecondaryText,
              border: 'none',
              borderRadius: 4,
              fontSize: 12,
              cursor: 'pointer',
              minWidth: 32,
              ...button.style
            }}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
}
