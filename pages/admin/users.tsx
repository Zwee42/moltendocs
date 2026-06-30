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
      <div className={`${geistSans.className} min-h-screen bg-[#0b0b10] text-[#e9e0ee]`}>
        <div className="p-6">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`${geistSans.className} min-h-screen bg-[#0b0b10] text-[#e9e0ee]`}>
      <AdminHeader 
        title="User Management"
        subtitle="Manage admin users and their permissions"
        user={currentUser}
        onLogout={logout}
      />

      <main className="max-w-[1000px] mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            {/* Title is now in header */}
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-[#cfa6db] text-black border-none rounded-md text-sm font-semibold cursor-pointer hover:bg-[#d9b5e8] transition-colors"
          >
            + New User
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#4a1a1a] border border-[#8b2635] rounded-md text-[#ff8b94]">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-[#1a4a2e] border border-[#28a745] rounded-md text-[#90ee90]">
            {success}
          </div>
        )}

        {showCreateForm && (
          <div className="bg-[#101018] border border-[#441534ff] rounded-lg p-5 mb-6">
            <h3 className="m-0 mb-4 text-base">Create New User</h3>
            <div className="mb-3">
              <label className="block mb-1.5 text-sm">
                Username
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full max-w-[300px] px-3 py-2 bg-[#101018] border border-[#441534ff] rounded text-[#e9e0ee] text-sm focus:outline-none focus:border-[#cfa6db]"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1.5 text-sm">
                Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                className="w-full max-w-[300px] px-3 py-2 bg-[#101018] border border-[#441534ff] rounded text-[#e9e0ee] text-sm focus:outline-none focus:border-[#cfa6db]"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateUser}
                disabled={working || !newUsername || !newPassword || newPassword.length < 6}
                className={`px-4 py-2 border-none rounded text-sm transition-colors ${
                  working || !newUsername || !newPassword || newPassword.length < 6
                    ? 'bg-[#555] text-white cursor-not-allowed'
                    : 'bg-[#cfa6db] text-black cursor-pointer hover:bg-[#d9b5e8]'
                }`}
              >
                {working ? 'Creating...' : 'Create User'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewUsername('');
                  setNewPassword('');
                }}
                className="px-4 py-2 bg-[#555] text-white border-none rounded text-sm cursor-pointer hover:bg-[#666] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {editingUser && (
          <div className="bg-[#101018] border border-[#441534ff] rounded-lg p-5 mb-6">
            <h3 className="m-0 mb-4 text-base">Change Password for {editingUser.username}</h3>
            <div className="mb-4">
              <label className="block mb-1.5 text-sm">
                New Password
              </label>
              <input
                type="password"
                value={newPasswordForUser}
                onChange={(e) => setNewPasswordForUser(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="w-full max-w-[300px] px-3 py-2 bg-[#101018] border border-[#441534ff] rounded text-[#e9e0ee] text-sm focus:outline-none focus:border-[#cfa6db]"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUpdatePassword}
                disabled={working || !newPasswordForUser || newPasswordForUser.length < 6}
                className={`px-4 py-2 border-none rounded text-sm transition-colors ${
                  working || !newPasswordForUser || newPasswordForUser.length < 6
                    ? 'bg-[#555] text-white cursor-not-allowed'
                    : 'bg-[#cfa6db] text-black cursor-pointer hover:bg-[#d9b5e8]'
                }`}
              >
                {working ? 'Updating...' : 'Update Password'}
              </button>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setNewPasswordForUser('');
                }}
                className="px-4 py-2 bg-[#555] text-white border-none rounded text-sm cursor-pointer hover:bg-[#666] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#101018] border border-[#441534ff] rounded-lg p-5">
          {users.length === 0 ? (
            <div className="text-center text-[#aaa] py-10">
              No users found.
            </div>
          ) : (
            <div>
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center px-5 py-4 rounded-md mb-2 ${
                    user.username === 'admin'
                      ? 'bg-[#cfa6db1a] border border-[#cfa6db4d]'
                      : 'bg-transparent border border-transparent'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="font-semibold mr-2">{user.username}</span>
                      {user.username === 'admin' && (
                        <span className="px-1.5 py-0.5 bg-[#cfa6db] text-black rounded-sm text-[10px] font-semibold">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#aaa]">
                      Created: {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="px-3 py-1.5 bg-[#555] text-white border-none rounded text-xs cursor-pointer hover:bg-[#666] transition-colors"
                    >
                      Change Password
                    </button>
                    {user.username !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={working}
                        className="px-3 py-1.5 bg-[#8b2635] text-white border-none rounded text-xs cursor-pointer hover:bg-[#a02d42] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
