import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Geist } from 'next/font/google';
import { AdminHeader } from '@/components/Header';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { generateSlugFromTitle, sanitizeSlug } from '@/lib/utils';

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
      <div className={`${geistSans.className} min-h-screen bg-[#0b0b10] text-[#e9e0ee]`}>
        <div className="p-6">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`${geistSans.className} min-h-screen bg-[#0b0b10] text-[#e9e0ee]`}>
      <AdminHeader 
        title="Admin"
        subtitle="Manage your documentation"
        user={user}
        onLogout={logout}
        actions={
          <Link
            href="/admin/users"
            className="px-3 py-1.5 bg-[#555] text-white no-underline rounded text-xs hover:bg-[#666] transition-colors inline-block"
          >
            Manage Users
          </Link>
        }
      />

      <main className="max-w-[1200px] mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="m-0 mb-1 text-lg text-[#cfa6db]">
              Document Management
            </h2>
            <p className="m-0 text-sm text-[#aaa]">
              Drag and drop to reorder documents
              {saving && <span className="text-[#cfa6db]"> • Saving...</span>}
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-[#cfa6db] text-black border-none rounded-md text-sm font-semibold cursor-pointer hover:bg-[#d9b5e8] transition-colors"
          >
            + New Document
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-[#101018] border border-[#441534ff] rounded-lg p-5 mb-6">
            <h3 className="m-0 mb-4 text-base">Create New Document</h3>
            <div className="mb-3">
              <label className="block mb-1.5 text-sm">
                Title
              </label>
              <input
                type="text"
                value={newPageTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Document title"
                className="w-full px-3 py-2 bg-[#101018] border border-[#441534ff] rounded text-[#e9e0ee] text-sm focus:outline-none focus:border-[#cfa6db]"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1.5 text-sm">
                Slug (URL path)
              </label>
              <input
                type="text"
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                placeholder="document-slug"
                className="w-full px-3 py-2 bg-[#101018] border border-[#441534ff] rounded text-[#e9e0ee] text-sm focus:outline-none focus:border-[#cfa6db]"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateDocument}
                disabled={!newPageTitle || !newPageSlug}
                className={`px-4 py-2 border-none rounded text-sm transition-colors ${
                  newPageTitle && newPageSlug
                    ? 'bg-[#cfa6db] text-black cursor-pointer hover:bg-[#d9b5e8]'
                    : 'bg-[#555] text-white cursor-not-allowed'
                }`}
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewPageTitle('');
                  setNewPageSlug('');
                }}
                className="px-4 py-2 bg-[#555] text-white border-none rounded text-sm cursor-pointer hover:bg-[#666] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#101018] border border-[#441534ff] rounded-lg p-5">
          {documents.length === 0 ? (
            <div className="text-center text-[#aaa] py-10">
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
                  className={`flex items-center px-4 py-3 rounded-md mb-2 cursor-grab transition-all duration-200 ${
                    draggedIndex === index
                      ? 'bg-[#cfa6db33] border border-[#cfa6db]'
                      : 'bg-transparent border border-transparent'
                  }`}
                >
                  <span className="mr-3 text-[#aaa] text-lg">
                    ⋮⋮
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{doc.title}</div>
                    {/* {doc.excerpt && (
                      <div className="text-xs text-[#aaa] mb-1">
                        {doc.excerpt}
                      </div>
                    )} */}
                    <div className="text-[11px] text-[#aaa]">
                      {doc.slug} • Last modified: {doc.lastModified ? new Date(doc.lastModified).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/editor/${doc.slug}`)}
                      className="px-3 py-1.5 bg-[#cfa6db] text-black border-none rounded text-xs cursor-pointer hover:bg-[#d9b5e8] transition-colors"
                    >
                      Edit
                    </button>
                    <a
                      href={`/docs/${doc.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#555] text-white border-none rounded text-xs no-underline inline-block hover:bg-[#666] transition-colors"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc.slug, doc.title)}
                      disabled={saving}
                      className="px-3 py-1.5 bg-[#8b2635] text-white border-none rounded text-xs hover:bg-[#a02d42] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
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
