import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { useTheme } from '@/lib/theme';

function headingId(children: React.ReactNode): string {
  const text = typeof children === 'string' ? children : React.Children.toArray(children).join('');
  return text.toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function MarkdownContent({ content }: { content: string }) {
  const { getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      rehypePlugins={[rehypeRaw, rehypeHighlight]}
      components={{
        h1: ({ children }) => (
          <h1 id={headingId(children)} style={{ color: styles.accent, fontSize: '32px', margin: '32px 0 16px 0', fontWeight: 700, lineHeight: 1.2 }}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 id={headingId(children)} style={{ color: styles.accent, fontSize: '28px', margin: '28px 0 14px 0', fontWeight: 600, lineHeight: 1.3 }}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 id={headingId(children)} style={{ color: styles.accent, fontSize: '24px', margin: '24px 0 12px 0', fontWeight: 600, lineHeight: 1.4 }}>
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 id={headingId(children)} style={{ color: styles.accent, fontSize: '20px', margin: '20px 0 10px 0', fontWeight: 600, lineHeight: 1.4 }}>
            {children}
          </h4>
        ),
        h5: ({ children }) => (
          <h5 id={headingId(children)} style={{ color: styles.accent, fontSize: '18px', margin: '18px 0 8px 0', fontWeight: 600, lineHeight: 1.5 }}>
            {children}
          </h5>
        ),
        h6: ({ children }) => (
          <h6 id={headingId(children)} style={{ color: styles.accent, fontSize: '16px', margin: '16px 0 6px 0', fontWeight: 600, lineHeight: 1.5 }}>
            {children}
          </h6>
        ),
        p: ({ children }) => (
          <p style={{ margin: '16px 0', lineHeight: 1.7, color: styles.color }}>
            {children}
          </p>
        ),
        a: ({ children, href }) => (
          <a href={href} style={{ color: styles.accent, textDecoration: 'underline', cursor: 'pointer' }} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        img: ({ src, alt }) => (
          <img src={src} alt={alt} style={{ maxWidth: '100%', height: 'auto', margin: '16px 0', borderRadius: 6, boxShadow: `0 2px 8px ${styles.accent}20` }} />
        ),
        code: ({ children, className }) => {
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
        pre: ({ children }) => (
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
        ul: ({ children }) => (
          <ul style={{ margin: '16px 0', paddingLeft: '24px', listStyleType: 'disc', color: styles.color }}>
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol style={{ margin: '16px 0', paddingLeft: '24px', listStyleType: 'decimal', color: styles.color }}>
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li style={{ margin: '6px 0', color: styles.color }}>
            {children}
          </li>
        ),
        blockquote: ({ children }) => (
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
        hr: () => (
          <hr style={{ border: 'none', borderTop: `2px solid ${styles.cardBorder}`, margin: '32px 0', opacity: 0.5 }} />
        ),
        table: ({ children }) => (
          <div style={{ overflowX: 'auto', margin: '20px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${styles.cardBorder}`, borderRadius: 6, overflow: 'hidden' }}>
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead style={{ background: styles.cardBackground }}>
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody>
            {children}
          </tbody>
        ),
        tr: ({ children }) => (
          <tr style={{ borderBottom: `1px solid ${styles.cardBorder}` }}>
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: styles.accent, borderRight: `1px solid ${styles.cardBorder}` }}>
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td style={{ padding: '12px', color: styles.color, borderRight: `1px solid ${styles.cardBorder}` }}>
            {children}
          </td>
        ),
        del: ({ children }) => (
          <del style={{ textDecoration: 'line-through', opacity: 0.7 }}>
            {children}
          </del>
        ),
        strong: ({ children }) => (
          <strong style={{ fontWeight: 600 }}>
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em style={{ fontStyle: 'italic' }}>
            {children}
          </em>
        )
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
