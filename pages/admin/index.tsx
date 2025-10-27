import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Geist } from 'next/font/google';
import { useTheme } from '@/lib/theme';
import { AdminHeader } from '@/components/Header';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

type Document = { 
  slug: string; 
  title: string; 
  excerpt?: string;
  lastModified?: string;
};

type User = { id: number; username: string };

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          await loadDocuments();
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

  const loadDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newDocuments = [...documents];
    const draggedDoc = newDocuments[draggedIndex];
    
    // Remove dragged item
    newDocuments.splice(draggedIndex, 1);
    
    // Insert at new position
    newDocuments.splice(dropIndex, 0, draggedDoc);
    
    setDocuments(newDocuments);
    setDraggedIndex(null);

    // Save new order
    setSaving(true);
    try {
      await fetch('/api/admin/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: newDocuments.map(d => d.slug) })
      });
    } catch (err) {
      console.error('Failed to save order:', err);
      // Reload documents to revert
      await loadDocuments();
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDocument = () => {
    if (newPageTitle && newPageSlug) {
      router.push(`/admin/editor/${newPageSlug}?title=${encodeURIComponent(newPageTitle)}&create=1`);
    }
  };

  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setNewPageTitle(title);
    if (!newPageSlug) {
      setNewPageSlug(generateSlugFromTitle(title));
    }
  };

  const handleDeleteDocument = async (slug: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/documents/${slug}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await loadDocuments(); // Reload the documents list
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete document');
      }
    } catch (err) {
      alert('Failed to delete document');
    } finally {
      setSaving(false);
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
        title="Admin"
        subtitle="Manage your documentation"
        user={user}
        onLogout={handleLogout}
        actions={
          <a
            href="/admin/users"
            style={{
              padding: '6px 12px',
              background: styles.buttonSecondary,
              color: styles.buttonSecondaryText,
              textDecoration: 'none',
              borderRadius: 4,
              fontSize: 12
            }}
          >
            Manage Users
          </a>
        }
      />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24 
        }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: 18, color: styles.accent }}>
              Document Management
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: styles.muted }}>
              Drag and drop to reorder documents
              {saving && <span style={{ color: styles.accent }}> • Saving...</span>}
            </p>
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
            + New Document
          </button>
        </div>

        {showCreateForm && (
          <div style={{
            background: styles.cardBackground,
            border: `1px solid ${styles.cardBorder}`,
            borderRadius: 8,
            padding: 20,
            marginBottom: 24
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Create New Document</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>
                Title
              </label>
              <input
                type="text"
                value={newPageTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Document title"
                style={{
                  width: '100%',
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
                Slug (URL path)
              </label>
              <input
                type="text"
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                placeholder="document-slug"
                style={{
                  width: '100%',
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
                onClick={handleCreateDocument}
                disabled={!newPageTitle || !newPageSlug}
                style={{
                  padding: '8px 16px',
                  background: (newPageTitle && newPageSlug) ? styles.buttonPrimary : styles.buttonSecondary,
                  color: (newPageTitle && newPageSlug) ? styles.buttonPrimaryText : styles.buttonSecondaryText,
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 14,
                  cursor: (newPageTitle && newPageSlug) ? 'pointer' : 'not-allowed'
                }}
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewPageTitle('');
                  setNewPageSlug('');
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
          {documents.length === 0 ? (
            <div style={{ textAlign: 'center', color: styles.muted, padding: 40 }}>
              No documents found. Create your first document to get started.
            </div>
          ) : (
            <div>
              {documents.map((doc, index) => (
                <div
                  key={doc.slug}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: draggedIndex === index ? styles.accent + '20' : 'transparent',
                    border: `1px solid ${draggedIndex === index ? styles.accent : 'transparent'}`,
                    borderRadius: 6,
                    marginBottom: 8,
                    cursor: 'grab',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ 
                    marginRight: 12, 
                    color: styles.muted,
                    fontSize: 18
                  }}>
                    ⋮⋮
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{doc.title}</div>
                    {doc.excerpt && (
                      <div style={{ fontSize: 12, color: styles.muted, marginBottom: 4 }}>
                        {doc.excerpt}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: styles.muted }}>
                      {doc.slug} • Last modified: {doc.lastModified ? new Date(doc.lastModified).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => router.push(`/admin/editor/${doc.slug}`)}
                      style={{
                        padding: '6px 12px',
                        background: styles.buttonPrimary,
                        color: styles.buttonPrimaryText,
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <a
                      href={`/docs/${doc.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '6px 12px',
                        background: styles.buttonSecondary,
                        color: styles.buttonSecondaryText,
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 12,
                        textDecoration: 'none',
                        display: 'inline-block'
                      }}
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc.slug, doc.title)}
                      disabled={saving}
                      style={{
                        padding: '6px 12px',
                        background: '#8b2635',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.6 : 1
                      }}
                    >
                      Delete
                    </button>
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
