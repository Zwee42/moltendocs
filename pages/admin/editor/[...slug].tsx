import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import { useTheme } from '@/lib/theme';
import { EditorToolbar } from '@/components/EditorToolbar';
import { MarkdownPreview } from '@/components/MarkdownPreview';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type User = { id: number; username: string };

type DocumentData = {
  frontmatter: Record<string, unknown>;
  content: string;
  rawContent: string;
};

export default function DocumentEditor() {
  const router = useRouter();
  const { slug, title: titleParam, create } = router.query;
  const { theme, toggleTheme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();
  
  // State
  const [user, setUser] = useState<User | null>(null);
  const [, setDocument] = useState<DocumentData | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isNewDocument, setIsNewDocument] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('editor');
  const [wordCount, setWordCount] = useState(0);
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!slug || !Array.isArray(slug) || saving) return;
    
    setSaving(true);
    try {
      let res;
      
      if (isNewDocument) {
        res = await fetch('/api/admin/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: slug.join('/'),
            title,
            content,
            frontmatter: { title }
          })
        });
      } else {
        res = await fetch(`/api/admin/documents/${slug.join('/')}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            frontmatter: { title },
            content
          })
        });
      }

      if (res.ok && isNewDocument) {
        setIsNewDocument(false);
      }
    } catch (err) {
      void err;
      console.error('Auto-save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [slug, saving, isNewDocument, title, content]);

  // Count words
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
  }, [content]);

  // Auto-save with debounce
  useEffect(() => {
    if (title || content) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(autoSave, 2000);
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, content, autoSave]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          handleSave();
        } else if (e.key === 'p') {
          e.preventDefault();
          setViewMode(viewMode === 'preview' ? 'editor' : 'preview');
        }
      }
    };

    window.document.addEventListener('keydown', handleKeyDown);
    return () => window.document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // Insert text at cursor position
  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + text + content.substring(end);
    
    setContent(newContent);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push('/admin/login');
          return;
        }
      } catch (err) {
          void err;
        router.push('/admin/login');
        return;
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // Load document
  useEffect(() => {
    if (!user || !slug || !Array.isArray(slug)) return;

    const loadDocument = async () => {
      if (create === 'true') {
        setIsNewDocument(true);
        setTitle(titleParam as string || '');
        setContent('');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/documents/${slug.join('/')}`);
        
        if (res.ok) {
          const data = await res.json();
          setDocument(data);
          setTitle(data.frontmatter.title || '');
          setContent(data.content || '');
        } else if (res.status === 404) {
          setIsNewDocument(true);
          setTitle(titleParam as string || '');
          setContent('');
        } else {
          setError('Failed to load document');
        }
      } catch (err) {
        void err;
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [user, slug, create, titleParam]);

  // Save document
  const handleSave = async () => {
    if (!slug || !Array.isArray(slug) || saving) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let res;
      
      if (isNewDocument) {
        res = await fetch('/api/admin/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: slug.join('/'),
            title,
            content,
            frontmatter: { title }
          })
        });
      } else {
        res = await fetch(`/api/admin/documents/${slug.join('/')}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            frontmatter: { title },
            content
          })
        });
      }

      if (res.ok) {
        setSuccess('Document saved successfully!');
        if (isNewDocument) {
          setIsNewDocument(false);
          router.replace(`/admin/editor/${slug.join('/')}`);
        }
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save document');
      }
    } catch (err) {
      void err;
      setError('Failed to save document');
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
    <div className={`${geistSans.className} ${geistMono.className}`} style={{ background: styles.background, color: styles.color, minHeight: '100vh' }}>
      <header style={{ 
        padding: '16px 24px', 
        borderBottom: `1px solid ${styles.headerBorder}`,
        background: styles.background,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 18 }}>
            <Link href="/admin" style={{ color: styles.accent, textDecoration: 'none' }}>
              ← Admin
            </Link>
          </h1>
          <span style={{ color: styles.muted }}>|</span>
          <span style={{ fontSize: 16 }}>
            {isNewDocument ? 'New Document' : 'Edit Document'}
          </span>
          <div style={{ fontSize: 12, color: styles.muted }}>
            {wordCount} words
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={toggleTheme}
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
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main style={{ 
        maxWidth: 1600, 
        margin: '0 auto', 
        padding: 24,
        // height: 'calc(100vh - 80px)', // Adjust for header height
        display: 'flex',
        flexDirection: 'column'
      }}>
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

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
            Document Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            style={{
              width: '100%',
              maxWidth: 500,
              padding: '12px',
              background: styles.inputBackground,
              border: `1px solid ${styles.inputBorder}`,
              borderRadius: 6,
              color: styles.color,
              fontSize: 16
            }}
          />
        </div>

        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <EditorToolbar 
            onInsertText={insertText}
          />
          
          <div style={{ 
            display: 'flex',
            background: styles.cardBackground,
            border: `1px solid ${styles.cardBorder}`,
            borderRadius: 6,
            padding: 4
          }}>
            <button
              onClick={() => setViewMode('editor')}
              style={{
                padding: '6px 12px',
                background: viewMode === 'editor' ? styles.buttonPrimary : 'transparent',
                color: viewMode === 'editor' ? styles.buttonPrimaryText : styles.color,
                border: 'none',
                borderRadius: 3,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Editor
            </button>
            <button
              onClick={() => setViewMode('split')}
              style={{
                padding: '6px 12px',
                background: viewMode === 'split' ? styles.buttonPrimary : 'transparent',
                color: viewMode === 'split' ? styles.buttonPrimaryText : styles.color,
                border: 'none',
                borderRadius: 3,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('preview')}
              style={{
                padding: '6px 12px',
                background: viewMode === 'preview' ? styles.buttonPrimary : 'transparent',
                color: viewMode === 'preview' ? styles.buttonPrimaryText : styles.color,
                border: 'none',
                borderRadius: 3,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Preview
            </button>
          </div>
        </div>

        <div style={{ height: 'calc(100% - 120px)', flex: 1 }}>
          {viewMode === 'split' && (
            <div style={{ display: 'flex', gap: 24, height: '100%' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                  Markdown Content
                </label>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your markdown content here..."
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: styles.inputBackground,
                    border: `1px solid ${styles.inputBorder}`,
                    borderRadius: 6,
                    color: styles.color,
                    fontSize: 14,
                    fontFamily: 'var(--font-geist-mono)',
                    resize: 'none',
                    outline: 'none',
                    lineHeight: 1.5,
                    height: '60vh'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                  Preview
                </label>
                <MarkdownPreview content={content} />
              </div>
            </div>
          )}

          {viewMode === 'editor' && (
            <div style={{ height: '100%' }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                Markdown Content
              </label>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your markdown content here..."
                style={{
                  width: '100%',
                  padding: '16px',
                  background: styles.inputBackground,
                  border: `1px solid ${styles.inputBorder}`,
                  borderRadius: 6,
                  color: styles.color,
                  fontSize: 14,
                  fontFamily: 'var(--font-geist-mono)',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: 1.5,
                  height: '60vh'
                }}
              />
            </div>
          )}

          {viewMode === 'preview' && (
            <div style={{ height: '100%' }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                Preview
              </label>
              <MarkdownPreview content={content} />
            </div>
          )}
        </div>

        <div style={{ 
          marginTop: 16, 
          padding: 12, 
          background: styles.cardBackground,
          border: `1px solid ${styles.cardBorder}`,
          borderRadius: 6,
          fontSize: 12,
          color: styles.muted 
        }}>
          <strong>Shortcuts:</strong> Ctrl+S to save • Ctrl+P to toggle preview
        </div>
      </main>
    </div>
  );
}
