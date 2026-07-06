import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Redirect to admin if already authenticated
  useAuth({ redirectIfAuthenticated: true });

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
      void err;
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflowY: 'auto' 
      }}>
        <main className="max-w-[400px] mx-auto px-6 py-[60px]">
          <div className="rounded-[10px] p-8" style={{ background: '#18181b', border: '1px solid #27272a' }}>
            <h2 className="m-0 mb-6 text-xl text-center" style={{ color: '#dc2626' }}>Admin Login</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1.5 text-sm" style={{ color: '#a1a1aa' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-3 py-3 rounded-md text-sm focus:outline-none"
                  style={{ background: '#18181b', border: '1px solid #27272a', color: '#f4f4f5' }}
                />
              </div>
              
              <div className="mb-6">
                <label className="block mb-1.5 text-sm" style={{ color: '#a1a1aa' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-3 rounded-md text-sm focus:outline-none"
                  style={{ background: '#18181b', border: '1px solid #27272a', color: '#f4f4f5' }}
                />
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-md text-sm" style={{ background: '#3a1414', border: '1px solid #8b2635', color: '#ff8b94' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 border-none rounded-md text-sm font-semibold transition-colors"
                style={{
                  background: loading ? '#27272a' : '#dc2626',
                  color: loading ? '#a1a1aa' : '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
