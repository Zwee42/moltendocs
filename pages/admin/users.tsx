import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Geist } from 'next/font/google';
import { useTheme } from '@/lib/theme';
import { AdminHeader } from '@/components/Header';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

type User = { 
  id: number; 
  username: string; 
  created_at: string;
};

type CurrentUser = { id: number; username: string };

export default function AdminUsers() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPasswordForUser, setNewPasswordForUser] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [working, setWorking] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          await loadUsers();
        } else {
          router.push('/admin/login');
        }
      } catch (err) {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword) return;

    setWorking(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('User created successfully!');
        setNewUsername('');
        setNewPassword('');
        setShowCreateForm(false);
        await loadUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error while creating user');
    } finally {
      setWorking(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.username === 'admin') {
      setError('Cannot delete admin user');
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      return;
    }

    setWorking(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccess('User deleted successfully!');
        await loadUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Network error while deleting user');
    } finally {
      setWorking(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!editingUser || !newPasswordForUser) return;

    setWorking(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPasswordForUser })
      });

      if (res.ok) {
        setSuccess('Password updated successfully!');
        setEditingUser(null);
        setNewPasswordForUser('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update password');
      }
    } catch (err) {
      setError('Network error while updating password');
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className={`${geistSans.className} min-h-screen`} style={{ background: styles.background, color: styles.color }}>
        <div style={{ padding: 24 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`${geistSans.className} min-h-screen`} style={{ background: styles.background, color: styles.color }}>
      <AdminHeader 
        title="User Management"
        subtitle="Manage admin users and their permissions"
        user={currentUser}
        onLogout={handleLogout}
      />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24 
        }}>
          <div style={{ flex: 1 }}>
            {/* Title is now in header */}
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: '8px 16px',
              background: styles.buttonPrimary,
              color: styles.buttonPrimaryText,
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + New User
          </button>
        </div>

        {error && (
          <div style={{ 
            marginBottom: 16, 
            padding: 12, 
            background: styles.errorBackground, 
            border: `1px solid ${styles.errorBorder}`,
            borderRadius: 6,
            color: styles.errorText 
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            marginBottom: 16, 
            padding: 12, 
            background: styles.successBackground, 
            border: `1px solid ${styles.successBorder}`,
            borderRadius: 6,
            color: styles.successText 
          }}>
            {success}
          </div>
        )}

        {showCreateForm && (
          <div style={{
            background: styles.cardBackground,
            border: `1px solid ${styles.cardBorder}`,
            borderRadius: 8,
            padding: 20,
            marginBottom: 24
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Create New User</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>
                Username
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                style={{
                  width: '100%',
                  maxWidth: 300,
                  padding: '8px 12px',
                  background: styles.inputBackground,
                  border: `1px solid ${styles.inputBorder}`,
                  borderRadius: 4,
                  color: styles.color,
                  fontSize: 14
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>
                Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                style={{
                  width: '100%',
                  maxWidth: 300,
                  padding: '8px 12px',
                  background: styles.inputBackground,
                  border: `1px solid ${styles.inputBorder}`,
                  borderRadius: 4,
                  color: styles.color,
                  fontSize: 14
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleCreateUser}
                disabled={working || !newUsername || !newPassword || newPassword.length < 6}
                style={{
                  padding: '8px 16px',
                  background: (working || !newUsername || !newPassword || newPassword.length < 6) ? styles.buttonSecondary : styles.buttonPrimary,
                  color: (working || !newUsername || !newPassword || newPassword.length < 6) ? styles.buttonSecondaryText : styles.buttonPrimaryText,
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 14,
                  cursor: (working || !newUsername || !newPassword || newPassword.length < 6) ? 'not-allowed' : 'pointer'
                }}
              >
                {working ? 'Creating...' : 'Create User'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewUsername('');
                  setNewPassword('');
                }}
                style={{
                  padding: '8px 16px',
                  background: styles.buttonSecondary,
                  color: styles.buttonSecondaryText,
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {editingUser && (
          <div style={{
            background: styles.cardBackground,
            border: `1px solid ${styles.cardBorder}`,
            borderRadius: 8,
            padding: 20,
            marginBottom: 24
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Change Password for {editingUser.username}</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>
                New Password
              </label>
              <input
                type="password"
                value={newPasswordForUser}
                onChange={(e) => setNewPasswordForUser(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                style={{
                  width: '100%',
                  maxWidth: 300,
                  padding: '8px 12px',
                  background: styles.inputBackground,
                  border: `1px solid ${styles.inputBorder}`,
                  borderRadius: 4,
                  color: styles.color,
                  fontSize: 14
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleUpdatePassword}
                disabled={working || !newPasswordForUser || newPasswordForUser.length < 6}
                style={{
                  padding: '8px 16px',
                  background: (working || !newPasswordForUser || newPasswordForUser.length < 6) ? styles.buttonSecondary : styles.buttonPrimary,
                  color: (working || !newPasswordForUser || newPasswordForUser.length < 6) ? styles.buttonSecondaryText : styles.buttonPrimaryText,
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 14,
                  cursor: (working || !newPasswordForUser || newPasswordForUser.length < 6) ? 'not-allowed' : 'pointer'
                }}
              >
                {working ? 'Updating...' : 'Update Password'}
              </button>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setNewPasswordForUser('');
                }}
                style={{
                  padding: '8px 16px',
                  background: styles.buttonSecondary,
                  color: styles.buttonSecondaryText,
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ 
          background: styles.cardBackground,
          border: `1px solid ${styles.cardBorder}`,
          borderRadius: 8,
          padding: 20
        }}>
          {users.length === 0 ? (
            <div style={{ textAlign: 'center', color: styles.muted, padding: 40 }}>
              No users found.
            </div>
          ) : (
            <div>
              {users.map((user) => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    background: user.username === 'admin' ? styles.accent + '10' : 'transparent',
                    border: `1px solid ${user.username === 'admin' ? styles.accent + '30' : 'transparent'}`,
                    borderRadius: 6,
                    marginBottom: 8
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, marginRight: 8 }}>{user.username}</span>
                      {user.username === 'admin' && (
                        <span style={{
                          padding: '2px 6px',
                          background: styles.accent,
                          color: styles.buttonPrimaryText,
                          borderRadius: 3,
                          fontSize: 10,
                          fontWeight: 600
                        }}>
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: styles.muted }}>
                      Created: {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setEditingUser(user)}
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
                      Change Password
                    </button>
                    {user.username !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={working}
                        style={{
                          padding: '6px 12px',
                          background: '#8b2635',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 12,
                          cursor: working ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
