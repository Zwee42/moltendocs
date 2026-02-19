import { useState } from 'react';
import { useRouter } from 'next/router';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

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
    <div className={`${geistSans.className} min-h-screen bg-[#0b0b10] text-[#e9e0ee]`}>
      <header className="px-6 py-5 border-b border-[#441534ff] flex justify-between items-center">
        <h1 className="m-0 text-[22px]">
          <Link href="/" className="text-inherit no-underline">MoltenDocs</Link>
          {' '}<span className="text-[#cfa6db]">Admin</span>
        </h1>
      </header>
      
      <main className="max-w-[400px] mx-auto px-6 py-[60px]">
        <div className="bg-[#101018] border border-[#441534ff] rounded-[10px] p-8">
          <h2 className="m-0 mb-6 text-xl text-center">Admin Login</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1.5 text-sm">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-3 bg-[#101018] border border-[#441534ff] rounded-md text-[#e9e0ee] text-sm focus:outline-none focus:border-[#cfa6db]"
              />
            </div>
            
            <div className="mb-6">
              <label className="block mb-1.5 text-sm">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-3 bg-[#101018] border border-[#441534ff] rounded-md text-[#e9e0ee] text-sm focus:outline-none focus:border-[#cfa6db]"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#4a1a1a] border border-[#8b2635] rounded-md text-[#ff8b94] text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 border-none rounded-md text-sm font-semibold transition-colors ${
                loading
                  ? 'bg-[#555] text-white cursor-not-allowed'
                  : 'bg-[#cfa6db] text-black cursor-pointer hover:bg-[#d9b5e8]'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
