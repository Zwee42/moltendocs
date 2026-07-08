import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme';
import { IconFileLines, IconFolder } from '@/lib/icons';
import { TocTree } from '@/components/TocTree';

type PageNode = { slug: string; title: string; filename?: string; children?: PageNode[]; kind: 'dir' | 'file'; hasIndex?: boolean };
type TocNode = { id: string; text: string; level: number; children: TocNode[] };

interface SidebarProps {
  pages: PageNode[];
  currentSlug: string;
  toc: TocNode[];
  expandedPages: Record<string, boolean>;
  onTogglePage: (slug: string) => void;
}

export default function Sidebar({ pages, currentSlug, toc, expandedPages, onTogglePage }: SidebarProps) {
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const headSlug = currentSlug.split('/')[0];

  return (
    <aside
      style={{
        width: 256, // w-64
        borderRight: `1px solid ${styles.headerBorder}`,
        padding: '12px 0',
        background: styles.background,
        height: '100%',
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 12, color: styles.h3Color, padding: '0 12px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px' }}>
        Navigation
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {pages.map((node) => {
          const isActive = node.slug === headSlug && (currentSlug === headSlug || currentSlug === `${headSlug}/index`);
          const isExpanded = expandedPages[node.slug] || (node.slug === headSlug && isActive);
          const showDropdown = node.slug === headSlug && toc.length > 0;

          const buttonStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px', // p-1 + px-3
            background: isActive ? (theme === 'dark' ? styles.cardBackground : styles.headerBorder) : 'transparent',
            color: isActive ? styles.accent : styles.color,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
            border: 'none',
            cursor: showDropdown ? 'pointer' : 'pointer',
            width: '100%',
            textAlign: 'left' as const,
            transition: 'background 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box',
          };

          const content = (
            <>
              {node.kind === 'dir' ? <IconFolder /> : <IconFileLines />}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.title}</span>
            </>
          );

          return (
            <div key={node.slug}>
              {showDropdown ? (
                <button
                  onClick={() => onTogglePage(node.slug)}
                  style={buttonStyle}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = styles.buttonSecondary;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {content}
                </button>
              ) : (
                <Link
                  href={`/docs/${node.slug}`}
                  style={buttonStyle}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = styles.buttonSecondary;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {content}
                </Link>
              )}
              {showDropdown && isExpanded && (
                <div style={{ marginLeft: 12, marginTop: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TocTree nodes={toc} />
                </div>
              )}
              {!showDropdown && node.slug === headSlug && node.children && node.children.length > 0 && (
                <div style={{ marginLeft: 12, marginTop: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {node.children.map((child) => (
                    <Link
                      key={child.slug}
                      href={`/docs/${child.slug}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '4px 12px',
                        borderRadius: 6,
                        background: child.slug === currentSlug ? styles.accent : 'transparent',
                        color: child.slug === currentSlug ? '#fff' : styles.muted,
                        textDecoration: 'none',
                        fontSize: 13,
                        transition: 'background 0.2s',
                        borderBottom: `1px solid ${styles.cardBorder}`,
                      }}
                      onMouseEnter={(e) => {
                        if (child.slug !== currentSlug) e.currentTarget.style.background = styles.buttonSecondary;
                      }}
                      onMouseLeave={(e) => {
                        if (child.slug !== currentSlug) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <IconFileLines />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{child.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
