import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, breadcrumbs, actions }: HeaderProps) {
  const { theme, toggleTheme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  return (
    <header style={{ 
      padding: '20px 24px', 
      borderBottom: `1px solid ${styles.headerBorder}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: subtitle ? 4 : 0 }}>
          {breadcrumbs && breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {crumb.href ? (
                <Link href={crumb.href} style={{ color: styles.accent, textDecoration: 'none', fontSize: 18 }}>
                  {crumb.label}
                </Link>
              ) : (
                <span style={{ fontSize: 18, fontWeight: 600 }}>{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <span style={{ color: styles.muted, fontSize: 18 }}>→</span>
              )}
            </React.Fragment>
          ))}
          {!breadcrumbs && <h1 style={{ margin: 0, fontSize: 22 }}>{title}</h1>}
        </div>
        {subtitle && (
          <p style={{ margin: 0, fontSize: 14, color: styles.muted }}>
            {subtitle}
          </p>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={toggleTheme}
          style={{
            padding: '6px 12px',
            background: styles.buttonSecondary,
            color: styles.buttonSecondaryText,
            border: 'none',
            borderRadius: 4,
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {actions}
      </div>
    </header>
  );
}

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  user?: { username: string } | null;
  onLogout?: () => void;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, user, onLogout, actions }: AdminHeaderProps) {
  const { getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  return (
    <Header
      title=""
      subtitle={subtitle}
      breadcrumbs={[
        { label: 'MoltenDocs', href: '/' },
        { label: 'Admin', href: '/admin' },
        ...(title !== 'Admin' ? [{ label: title }] : [])
      ]}
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {actions}
          {user && (
            <span style={{ fontSize: 14, color: styles.accent }}>
              {user.username}
            </span>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                padding: '6px 12px',
                background: '#8b2635',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          )}
        </div>
      }
    />
  );
}
