import { renderHook, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

// Get the mocked useRouter
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ user: { id: 1, username: 'testuser' } }),
      });
    });

    it('sets user state after successful auth check', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual({ id: 1, username: 'testuser' });
    });

    it('calls onAuthenticated callback when provided', async () => {
      const onAuthenticated = jest.fn();
      
      renderHook(() => useAuth({ onAuthenticated }));

      await waitFor(() => {
        expect(onAuthenticated).toHaveBeenCalledWith({ id: 1, username: 'testuser' });
      });
    });

    it('redirects to admin when redirectIfAuthenticated is true', async () => {
      renderHook(() => useAuth({ redirectIfAuthenticated: true }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin');
      });
    });

    it('does not set user when redirectIfAuthenticated is true', async () => {
      const { result } = renderHook(() => useAuth({ redirectIfAuthenticated: true }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin');
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
      });
    });

    it('redirects to login for protected pages', async () => {
      renderHook(() => useAuth());

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/login');
      });
    });

    it('does not redirect when redirectIfAuthenticated is true', async () => {
      const { result } = renderHook(() => useAuth({ redirectIfAuthenticated: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('sets user to null', async () => {
      const { result } = renderHook(() => useAuth({ redirectIfAuthenticated: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('when fetch throws an error', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    });

    it('redirects to login for protected pages', async () => {
      renderHook(() => useAuth());

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/login');
      });
    });

    it('does not redirect when redirectIfAuthenticated is true', async () => {
      const { result } = renderHook(() => useAuth({ redirectIfAuthenticated: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('logout function', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ user: { id: 1, username: 'testuser' } }),
      });
    });

    it('calls logout API and redirects to login', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Reset mock to track logout call
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      await act(async () => {
        await result.current.logout();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
      expect(mockPush).toHaveBeenCalledWith('/admin/login');
    });
  });

  describe('loading state', () => {
    it('starts with loading true', () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);
    });

    it('sets loading to false after auth check completes', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ user: { id: 1, username: 'testuser' } }),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});
