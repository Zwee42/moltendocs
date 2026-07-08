import React, { useState } from 'react';
import { Geist } from 'next/font/google';
import { AdminHeader } from '@/components/Header';
import { useAuth } from '@/lib/auth';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

type User = { 
  id: number; 
  username: string; 
  created_at: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPasswordForUser, setNewPasswordForUser] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [working, setWorking] = useState(false);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const { user: currentUser, loading, logout } = useAuth({
    onAuthenticated: loadUsers
  });

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
      void err;
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
      void err;
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
      void err;
      setError('Network error while updating password');
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className={`${geistSans.className}`}>
        <div style={{ padding: 24 }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <AdminHeader 
        title="User Management"
        subtitle="Manage admin users and their permissions"
        user={currentUser}
        onLogout={logout}
      />

      <main className="max-w-[1000px] mx-auto p-6 overflow-y-auto flex-1">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            {/* Title is now in header */}
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 border-none rounded-md text-sm font-semibold cursor-pointer transition-colors"
            style={{ background: '#dc2626', color: '#fff' }}
          >
            + New User
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md" style={{ background: '#3a1414', border: '1px solid #8b2635', color: '#ff8b94' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-md" style={{ background: '#143a1a', border: '1px solid #28a745', color: '#90ee90' }}>
            {success}
          </div>
        )}

        {showCreateForm && (
          <div className="rounded-lg p-5 mb-6" style={{ background: '#18181b', border: '1px solid #27272a' }}>
            <h3 className="m-0 mb-4 text-base" style={{ color: '#f4f4f5' }}>Create New User</h3>
            <div className="mb-3">
              <label className="block mb-1.5 text-sm" style={{ color: '#a1a1aa' }}>
                Username
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full max-w-[300px] px-3 py-2 rounded text-sm focus:outline-none"
                style={{ background: '#18181b', border: '1px solid #27272a', color: '#f4f4f5' }}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1.5 text-sm" style={{ color: '#a1a1aa' }}>
                Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                className="w-full max-w-[300px] px-3 py-2 rounded text-sm focus:outline-none"
                style={{ background: '#18181b', border: '1px solid #27272a', color: '#f4f4f5' }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateUser}
                disabled={working || !newUsername || !newPassword || newPassword.length < 6}
                className="px-4 py-2 border-none rounded text-sm transition-colors"
                style={{
                  background: working || !newUsername || !newPassword || newPassword.length < 6 ? '#27272a' : '#dc2626',
                  color: working || !newUsername || !newPassword || newPassword.length < 6 ? '#a1a1aa' : '#fff',
                  cursor: working || !newUsername || !newPassword || newPassword.length < 6 ? 'not-allowed' : 'pointer',
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
                className="px-4 py-2 border-none rounded text-sm cursor-pointer transition-colors"
                style={{ background: '#27272a', color: '#f4f4f5' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {editingUser && (
          <div className="rounded-lg p-5 mb-6" style={{ background: '#18181b', border: '1px solid #27272a' }}>
            <h3 className="m-0 mb-4 text-base" style={{ color: '#f4f4f5' }}>Change Password for {editingUser.username}</h3>
            <div className="mb-4">
              <label className="block mb-1.5 text-sm" style={{ color: '#a1a1aa' }}>
                New Password
              </label>
              <input
                type="password"
                value={newPasswordForUser}
                onChange={(e) => setNewPasswordForUser(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="w-full max-w-[300px] px-3 py-2 rounded text-sm focus:outline-none"
                style={{ background: '#18181b', border: '1px solid #27272a', color: '#f4f4f5' }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUpdatePassword}
                disabled={working || !newPasswordForUser || newPasswordForUser.length < 6}
                className="px-4 py-2 border-none rounded text-sm transition-colors"
                style={{
                  background: working || !newPasswordForUser || newPasswordForUser.length < 6 ? '#27272a' : '#dc2626',
                  color: working || !newPasswordForUser || newPasswordForUser.length < 6 ? '#a1a1aa' : '#fff',
                  cursor: working || !newPasswordForUser || newPasswordForUser.length < 6 ? 'not-allowed' : 'pointer',
                }}
              >
                {working ? 'Updating...' : 'Update Password'}
              </button>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setNewPasswordForUser('');
                }}
                className="px-4 py-2 border-none rounded text-sm cursor-pointer transition-colors"
                style={{ background: '#27272a', color: '#f4f4f5' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="rounded-lg p-5" style={{ background: '#18181b', border: '1px solid #27272a' }}>
          {users.length === 0 ? (
            <div className="text-center py-10" style={{ color: '#a1a1aa' }}>
              No users found.
            </div>
          ) : (
            <div>
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center px-5 py-4 rounded-md mb-2"
                  style={{
                    background: user.username === 'admin' ? '#dc26261a' : 'transparent',
                    border: user.username === 'admin' ? '1px solid #dc26264d' : '1px solid transparent',
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="font-semibold mr-2" style={{ color: '#f4f4f5' }}>{user.username}</span>
                      {user.username === 'admin' && (
                        <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-semibold" style={{ background: '#dc2626', color: '#fff' }}>
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-xs" style={{ color: '#a1a1aa' }}>
                      Created: {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="px-3 py-1.5 border-none rounded text-xs cursor-pointer transition-colors"
                      style={{ background: '#27272a', color: '#f4f4f5' }}
                    >
                      Change Password
                    </button>
                    {user.username !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={working}
                        className="px-3 py-1.5 border-none rounded text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ background: '#8b2635', color: '#fff' }}
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
    </>
  );
}
