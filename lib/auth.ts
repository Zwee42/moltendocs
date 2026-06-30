import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export type User = { id: number; username: string };

type UseAuthOptions = {
  /** If true, redirects to admin if already authenticated (for login page) */
  redirectIfAuthenticated?: boolean;
  /** Callback to run after successful authentication */
  onAuthenticated?: (user: User) => void | Promise<void>;
};

type UseAuthResult = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

/**
 * Hook for handling authentication in admin pages
 * @param options Configuration options
 * @returns User state, loading state, and logout function
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthResult {
  const { redirectIfAuthenticated = false, onAuthenticated } = options;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          
          if (redirectIfAuthenticated) {
            // For login page: redirect away if already authenticated
            router.push('/admin');
            return;
          }
          
          setUser(data.user);
          
          // Run callback after authentication
          if (onAuthenticated) {
            await onAuthenticated(data.user);
          }
        } else if (!redirectIfAuthenticated) {
          // For protected pages: redirect to login if not authenticated
          router.push('/admin/login');
          return;
        }
      } catch (err) {
        void err;
        if (!redirectIfAuthenticated) {
          router.push('/admin/login');
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, redirectIfAuthenticated]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return { user, loading, logout };
}
