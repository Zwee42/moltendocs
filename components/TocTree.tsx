import React, { useState, useRef, useCallback } from 'react';
import { useTheme } from '@/lib/theme';

type TocNode = { id: string; text: string; level: number; children: TocNode[] };

export function TocTree({ nodes, depth = 0 }: { nodes: TocNode[]; depth?: number }) {
  const { getThemeStyles } = useTheme();
  const styles = getThemeStyles();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [animating, setAnimating] = useState<Record<string, boolean>>({});
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const heights = useRef<Record<string, number>>({});
  const toggledId = useRef<string | null>(null);

  const toggle = useCallback((id: string, hasChildren: boolean) => {
    if (!hasChildren) return;
    toggledId.current = id;
    const isOpen = expanded[id];
    if (isOpen) {
      setAnimating(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setExpanded(prev => ({ ...prev, [id]: false }));
        setAnimating(prev => ({ ...prev, [id]: false }));
      }, 300);
    } else {
      setExpanded(prev => ({ ...prev, [id]: true }));
      setAnimating(prev => ({ ...prev, [id]: true }));
      requestAnimationFrame(() => {
        const el = contentRefs.current[id];
        if (el) {
          heights.current[id] = el.scrollHeight;
          requestAnimationFrame(() => {
            setAnimating(prev => ({ ...prev, [id]: false }));
          });
        }
      });
    }
  }, [expanded]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {nodes.map((node) => {
        const isOpen = expanded[node.id] || false;
        const hasChildren = node.children.length > 0;
        const isAnimating = animating[node.id] || false;

        return (
          <div key={node.id}>
            <a
              href={`#${node.id}`}
              onClick={(e) => {
                if (toggledId.current === node.id) {
                  e.preventDefault();
                  toggledId.current = null;
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                borderRadius: 4,
                color: styles.muted,
                textDecoration: 'none',
                fontSize: 12,
                paddingLeft: `${8 + depth * 12}px`,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = styles.accent}
              onMouseLeave={(e) => e.currentTarget.style.color = styles.muted}
            >
              <span>{node.text}</span>
              {hasChildren && (
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggle(node.id, hasChildren);
                  }}
                  style={{
                    width: 10,
                    flexShrink: 0,
                    display: 'inline-flex',
                    justifyContent: 'center',
                    fontSize: 10,
                    color: styles.muted,
                    transition: 'transform 0.3s ease',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    cursor: 'pointer',
                  }}
                >
                  ▶
                </span>
              )}
            </a>
            {hasChildren && (
              <div
                ref={(el) => { contentRefs.current[node.id] = el; }}
                style={{
                  overflow: 'hidden',
                  maxHeight: isAnimating
                    ? (heights.current[node.id] ? `${heights.current[node.id]}px` : (isOpen ? '500px' : '0px'))
                    : (isOpen ? 'none' : '0px'),
                  opacity: isAnimating ? (isOpen ? 0.7 : 0.3) : 1,
                  transition: 'max-height 0.3s ease, opacity 0.3s ease'
                }}
              >
                <TocTree nodes={node.children} depth={depth + 1} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
