import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Geist } from 'next/font/google';
import { useTheme } from '@/lib/theme';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          router.push('/admin');
        }
      } catch (err) {
        // Not authenticated, stay on login page
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${geistSans.className} min-h-screen`} style={{ background: styles.background, color: styles.color }}>
      <header style={{ 
        padding: '20px 24px', 
        borderBottom: `1px solid ${styles.headerBorder}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>
          <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>MoltenDocs</a>
          {' '}<span style={{ color: styles.accent }}>Admin</span>
        </h1>
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
      </header>
      
      <main style={{ maxWidth: 400, margin: '0 auto', padding: 60 }}>
        <div style={{ 
          background: styles.cardBackground, 
          border: `1px solid ${styles.cardBorder}`, 
          borderRadius: 10, 
          padding: 32 
        }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: 20, textAlign: 'center' }}>Admin Login</h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: styles.inputBackground,
                  border: `1px solid ${styles.inputBorder}`,
                  borderRadius: 6,
                  color: styles.color,
                  fontSize: 14
                }}
              />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: styles.inputBackground,
                  border: `1px solid ${styles.inputBorder}`,
                  borderRadius: 6,
                  color: styles.color,
                  fontSize: 14
                }}
              />
            </div>

            {error && (
              <div style={{ 
                marginBottom: 16, 
                padding: 12, 
                background: styles.errorBackground, 
                border: `1px solid ${styles.errorBorder}`,
                borderRadius: 6,
                color: styles.errorText,
                fontSize: 14 
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? styles.buttonSecondary : styles.buttonPrimary,
                color: loading ? styles.buttonSecondaryText : styles.buttonPrimaryText,
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ 
            marginTop: 24, 
            padding: 16, 
            background: styles.accent + '10', 
            borderRadius: 6, 
            fontSize: 12, 
            color: styles.muted 
          }}>
            <strong>Default credentials:</strong><br />
            Username: admin<br />
            Password: admin123
          </div>
        </div>
      </main>
    </div>
  );
}
