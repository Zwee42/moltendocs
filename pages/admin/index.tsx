import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Geist } from 'next/font/google';
import { AdminHeader } from '@/components/Header';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { generateSlugFromTitle, sanitizeSlug } from '@/lib/utils';
import { IconGrip } from '@/lib/icons';

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

export default function AdminDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const loadDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      void err;
      console.error('Failed to load documents:', err);
    }
  };

  const { user, loading, logout } = useAuth({
    onAuthenticated: loadDocuments
  });

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
      router.push(`/admin/editor/${sanitizeSlug(newPageSlug)}?title=${encodeURIComponent(newPageTitle)}&create=1`);
    }
  };

  const handleTitleChange = (title: string) => {
    setNewPageTitle(title);
    // Always update slug based on title (user can still manually edit it after)
    setNewPageSlug(generateSlugFromTitle(title));
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
      void err;
      alert('Failed to delete document');
    } finally {
      setSaving(false);
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
        title="Admin"
        subtitle="Manage your documentation"
        user={user}
        onLogout={logout}
        actions={
          <Link
            href="/admin/users"
            className="px-3 py-1.5 bg-[#27272a] text-[#f4f4f5] no-underline rounded text-xs hover:bg-[#27272a] transition-colors inline-block"
          >
            Manage Users
          </Link>
        }
      />

      <main className="max-w-[1200px] mx-auto p-6 overflow-y-auto flex-1">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="m-0 mb-1 text-lg" style={{ color: '#dc2626' }}>
              Document Management
            </h2>
            <p className="m-0 text-sm" style={{ color: '#a1a1aa' }}>
              Drag and drop to reorder documents
              {saving && <span style={{ color: '#dc2626' }}> • Saving...</span>}
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 border-none rounded-md text-sm font-semibold cursor-pointer transition-colors"
            style={{ background: '#dc2626', color: '#fff' }}
          >
            + New Document
          </button>
        </div>

        {showCreateForm && (
          <div className="rounded-lg p-5 mb-6" style={{ background: '#18181b', border: '1px solid #27272a' }}>
            <h3 className="m-0 mb-4 text-base" style={{ color: '#f4f4f5' }}>Create New Document</h3>
            <div className="mb-3">
              <label className="block mb-1.5 text-sm" style={{ color: '#a1a1aa' }}>
                Title
              </label>
              <input
                type="text"
                value={newPageTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Document title"
                className="w-full px-3 py-2 rounded text-sm focus:outline-none"
                style={{ background: '#18181b', border: '1px solid #27272a', color: '#f4f4f5' }}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1.5 text-sm" style={{ color: '#a1a1aa' }}>
                Slug (URL path)
              </label>
              <input
                type="text"
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                placeholder="document-slug"
                className="w-full px-3 py-2 rounded text-sm focus:outline-none"
                style={{ background: '#18181b', border: '1px solid #27272a', color: '#f4f4f5' }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateDocument}
                disabled={!newPageTitle || !newPageSlug}
                className="px-4 py-2 border-none rounded text-sm transition-colors"
                style={{
                  background: newPageTitle && newPageSlug ? '#dc2626' : '#27272a',
                  color: newPageTitle && newPageSlug ? '#fff' : '#a1a1aa',
                  cursor: newPageTitle && newPageSlug ? 'pointer' : 'not-allowed',
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
                className="px-4 py-2 border-none rounded text-sm cursor-pointer transition-colors"
                style={{ background: '#27272a', color: '#f4f4f5' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="rounded-lg p-5" style={{ background: '#18181b', border: '1px solid #27272a' }}>
          {documents.length === 0 ? (
            <div className="text-center py-10" style={{ color: '#a1a1aa' }}>
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
                  className="flex items-center px-4 py-3 rounded-md mb-2 cursor-grab transition-all duration-200"
                  style={{
                    background: draggedIndex === index ? '#dc262633' : 'transparent',
                    border: draggedIndex === index ? '1px solid #dc2626' : '1px solid transparent',
                  }}
                >
                  <span className="mr-3 text-lg" style={{ color: '#a1a1aa' }}>
                    <IconGrip />
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold mb-1" style={{ color: '#f4f4f5' }}>{doc.title}</div>
                    <div className="text-[11px]" style={{ color: '#a1a1aa' }}>
                      {doc.slug} • Last modified: {doc.lastModified ? new Date(doc.lastModified).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/editor/${doc.slug}`)}
                      className="px-3 py-1.5 border-none rounded text-xs cursor-pointer transition-colors"
                      style={{ background: '#dc2626', color: '#fff' }}
                    >
                      Edit
                    </button>
                    <a
                      href={`/docs/${doc.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 border-none rounded text-xs no-underline inline-block transition-colors"
                      style={{ background: '#27272a', color: '#f4f4f5' }}
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc.slug, doc.title)}
                      disabled={saving}
                      className="px-3 py-1.5 border-none rounded text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ background: '#8b2635', color: '#fff' }}
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
    </>
  );
}
