import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { useTheme } from '@/lib/theme';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;
type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;
type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
type ImageProps = React.ImgHTMLAttributes<HTMLImageElement>;
type CodeProps = React.HTMLAttributes<HTMLElement>;
type PreProps = React.HTMLAttributes<HTMLPreElement>;
type ListProps = React.HTMLAttributes<HTMLUListElement | HTMLOListElement>;
type ListItemProps = React.HTMLAttributes<HTMLLIElement>;
type BlockquoteProps = React.HTMLAttributes<HTMLQuoteElement>;
type TableProps = React.TableHTMLAttributes<HTMLTableElement>;
type TableSectionProps = React.HTMLAttributes<HTMLTableSectionElement>;
type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;
type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;
type InlineProps = React.HTMLAttributes<HTMLElement>;

export function MarkdownPreview({ content, className, style }: MarkdownPreviewProps) {
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const customComponents = {
    // Headers
    h1: ({ children }: HeadingProps) => (
      <h1 style={{ 
        color: styles.accent, 
        fontSize: '32px', 
        margin: '32px 0 16px 0', 
        fontWeight: 700, 
        lineHeight: 1.2 
      }}>
        {children}
      </h1>
    ),
    h2: ({ children }: HeadingProps) => (
      <h2 style={{ 
        color: styles.accent, 
        fontSize: '28px', 
        margin: '28px 0 14px 0', 
        fontWeight: 600, 
        lineHeight: 1.3 
      }}>
        {children}
      </h2>
    ),
    h3: ({ children }: HeadingProps) => (
      <h3 style={{ 
        color: styles.accent, 
        fontSize: '24px', 
        margin: '24px 0 12px 0', 
        fontWeight: 600, 
        lineHeight: 1.4 
      }}>
        {children}
      </h3>
    ),
    h4: ({ children }: HeadingProps) => (
      <h4 style={{ 
        color: styles.accent, 
        fontSize: '20px', 
        margin: '20px 0 10px 0', 
        fontWeight: 600, 
        lineHeight: 1.4 
      }}>
        {children}
      </h4>
    ),
    h5: ({ children }: HeadingProps) => (
      <h5 style={{ 
        color: styles.accent, 
        fontSize: '18px', 
        margin: '18px 0 8px 0', 
        fontWeight: 600, 
        lineHeight: 1.5 
      }}>
        {children}
      </h5>
    ),
    h6: ({ children }: HeadingProps) => (
      <h6 style={{ 
        color: styles.accent, 
        fontSize: '16px', 
        margin: '16px 0 6px 0', 
        fontWeight: 600, 
        lineHeight: 1.5 
      }}>
        {children}
      </h6>
    ),

    // Paragraphs
    p: ({ children }: ParagraphProps) => (
      <p style={{ 
        margin: '16px 0', 
        lineHeight: 1.7, 
        color: styles.color 
      }}>
        {children}
      </p>
    ),

    // Links
    a: ({ children, href }: AnchorProps) => (
      <a 
        href={href} 
        style={{ 
          color: styles.accent, 
          textDecoration: 'underline',
          cursor: 'pointer'
        }}
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),

    // Images
    img: ({ src, alt }: ImageProps) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img 
        src={src} 
        alt={alt} 
        style={{ 
          maxWidth: '100%', 
          height: 'auto', 
          margin: '16px 0', 
          borderRadius: 6, 
          boxShadow: `0 2px 8px ${styles.accent}20` 
        }} 
      />
    ),

    // Code
    code: ({ children, className }: CodeProps) => {
      const isInline = !className;
      return (
        <code style={{
          background: styles.cardBackground,
          border: `1px solid ${styles.cardBorder}`,
          borderRadius: isInline ? 3 : 6,
          padding: isInline ? '2px 6px' : '16px',
          fontFamily: 'var(--font-geist-mono)',
          fontSize: isInline ? '0.9em' : '14px',
          color: styles.color,
          display: isInline ? 'inline' : 'block',
          overflowX: isInline ? 'visible' : 'auto',
          lineHeight: isInline ? 'inherit' : 1.5,
          margin: isInline ? 0 : '16px 0'
        }}>
          {children}
        </code>
      );
    },

    // Pre (code blocks)
    pre: ({ children }: PreProps) => (
      <pre style={{
        background: styles.cardBackground,
        border: `1px solid ${styles.cardBorder}`,
        borderRadius: 6,
        padding: 0,
        margin: '20px 0',
        overflow: 'hidden'
      }}>
        {children}
      </pre>
    ),

    // Lists
    ul: ({ children }: ListProps) => (
      <ul style={{ 
        margin: '16px 0', 
        paddingLeft: '24px', 
        listStyleType: 'disc',
        color: styles.color 
      }}>
        {children}
      </ul>
    ),
    ol: ({ children }: ListProps) => (
      <ol style={{ 
        margin: '16px 0', 
        paddingLeft: '24px', 
        listStyleType: 'decimal',
        color: styles.color 
      }}>
        {children}
      </ol>
    ),
    li: ({ children }: ListItemProps) => (
      <li style={{ 
        margin: '6px 0', 
        color: styles.color 
      }}>
        {children}
      </li>
    ),

    // Blockquotes
    blockquote: ({ children }: BlockquoteProps) => (
      <blockquote style={{
        borderLeft: `4px solid ${styles.accent}`,
        padding: '16px',
        margin: '20px 0',
        background: styles.cardBackground,
        borderRadius: '0 6px 6px 0',
        fontStyle: 'italic',
        color: styles.muted
      }}>
        {children}
      </blockquote>
    ),

    // Horizontal rules
    hr: () => (
      <hr style={{
        border: 'none',
        borderTop: `2px solid ${styles.cardBorder}`,
        margin: '32px 0',
        opacity: 0.5
      }} />
    ),

    // Tables
    table: ({ children }: TableProps) => (
      <div style={{ overflowX: 'auto', margin: '20px 0' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1px solid ${styles.cardBorder}`,
          borderRadius: 6,
          overflow: 'hidden'
        }}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: TableSectionProps) => (
      <thead style={{ background: styles.cardBackground }}>
        {children}
      </thead>
    ),
    tbody: ({ children }: TableSectionProps) => (
      <tbody>
        {children}
      </tbody>
    ),
    tr: ({ children }: TableRowProps) => (
      <tr style={{ borderBottom: `1px solid ${styles.cardBorder}` }}>
        {children}
      </tr>
    ),
    th: ({ children }: TableCellProps) => (
      <th style={{
        padding: '12px',
        textAlign: 'left',
        fontWeight: 600,
        color: styles.accent,
        borderRight: `1px solid ${styles.cardBorder}`
      }}>
        {children}
      </th>
    ),
    td: ({ children }: TableCellProps) => (
      <td style={{
        padding: '12px',
        color: styles.color,
        borderRight: `1px solid ${styles.cardBorder}`
      }}>
        {children}
      </td>
    ),

    // Strikethrough
    del: ({ children }: InlineProps) => (
      <del style={{ 
        textDecoration: 'line-through', 
        opacity: 0.7 
      }}>
        {children}
      </del>
    ),

    // Strong/Bold
    strong: ({ children }: InlineProps) => (
      <strong style={{ fontWeight: 600 }}>
        {children}
      </strong>
    ),

    // Emphasis/Italic
    em: ({ children }: InlineProps) => (
      <em style={{ fontStyle: 'italic' }}>
        {children}
      </em>
    )
  };

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
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={customComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
