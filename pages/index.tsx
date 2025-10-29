import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Document = { 
  slug: string; 
  title: string; 
  excerpt?: string;
  lastModified?: string;
};

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { theme, toggleTheme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/documents');
        const data = await res.json();
        setDocuments(data.documents || []);
      } catch (err) {
        console.error('Failed to load documents:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className={`${geistSans.className} ${geistMono.className} min-h-screen`} style={{ background: styles.background, color: styles.color }}>
      <header style={{ 
        padding: '24px', 
        borderBottom: `1px solid ${styles.headerBorder}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700 }}>MoltenDocs</h1>
          <p style={{ margin: 0, fontSize: 16, color: styles.muted }}>
            Your knowledge base and documentation hub
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={toggleTheme}
            style={{
              padding: '8px 12px',
              background: styles.buttonSecondary,
              color: styles.buttonSecondaryText,
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <Link
            href="/admin" 
            style={{ 
              padding: '8px 16px', 
              borderRadius: 6, 
              background: styles.buttonPrimary,
              color: styles.buttonPrimaryText,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            Admin Panel
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 48,
          padding: '48px 24px',
          background: styles.cardBackground,
          border: `1px solid ${styles.cardBorder}`,
          borderRadius: 12
        }}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontSize: 24, 
            color: styles.accent,
            fontWeight: 600 
          }}>
            Welcome to MoltenDocs
          </h2>
          <p style={{ 
            margin: '0 0 24px 0', 
            fontSize: 18, 
            color: styles.muted,
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6
          }}>
            Browse through our comprehensive documentation and guides. 
            Use the admin panel to manage and edit content.
          </p>
          {documents.length > 0 && (
            <div style={{ 
              padding: 16, 
              background: styles.accent + '10',
              border: `1px solid ${styles.accent}30`,
              borderRadius: 8,
              display: 'inline-block'
            }}>
              <span style={{ fontSize: 14, color: styles.accent, fontWeight: 600 }}>
                📚 {documents.length} documents available
              </span>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: 20, 
            color: styles.accent,
            fontWeight: 600 
          }}>
            All Documents
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: 14, 
            color: styles.muted 
          }}>
            Click on any document to start reading
          </p>
        </div>

        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: 48,
            color: styles.muted 
          }}>
            <div style={{ fontSize: 18, marginBottom: 8 }}>📖</div>
            Loading documents...
          </div>
        )}

        {!loading && documents.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: 48,
            background: styles.cardBackground,
            border: `1px solid ${styles.cardBorder}`,
            borderRadius: 8,
            color: styles.muted 
          }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>📝</div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 18 }}>No documents yet</h4>
            <p style={{ margin: '0 0 24px 0' }}>
              Get started by creating your first document in the admin panel.
            </p>
            <Link
              href="/admin" 
              style={{ 
                padding: '10px 20px', 
                background: styles.buttonPrimary,
                color: styles.buttonPrimaryText,
                textDecoration: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600
              }}
            >
              Create First Document
            </Link>
          </div>
        )}

        {!loading && documents.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: 20 
          }}>
            {documents.map((doc) => (
              <Link
                key={doc.slug} 
                href={`/docs/${doc.slug}`} 
                style={{ 
                  display: 'block', 
                  textDecoration: 'none', 
                  color: 'inherit',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 25px ${styles.accent}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ 
                  border: `1px solid ${styles.cardBorder}`, 
                  borderRadius: 10, 
                  padding: 20, 
                  background: styles.cardBackground,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: 12
                  }}>
                    <span style={{ 
                      marginRight: 12, 
                      fontSize: 20,
                      color: styles.accent
                    }}>
                      📄
                    </span>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: 16, 
                        fontWeight: 600,
                        lineHeight: 1.4
                      }}>
                        {doc.title}
                      </h4>
                      {doc.excerpt && (
                        <p style={{ 
                          margin: '0 0 12px 0', 
                          fontSize: 14, 
                          color: styles.muted,
                          lineHeight: 1.5
                        }}>
                          {doc.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ 
                    marginTop: 'auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                    color: styles.muted
                  }}>
                    <span>{doc.slug}</span>
                    {doc.lastModified && (
                      <span>
                        {new Date(doc.lastModified).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <footer style={{ 
          marginTop: 64, 
          padding: 32,
          textAlign: 'center',
          borderTop: `1px solid ${styles.headerBorder}`,
          color: styles.muted
        }}>
          <p style={{ margin: 0, fontSize: 14 }}>
            Powered by MoltenDocs • Built with Next.js
          </p>
        </footer>
      </main>
    </div>
  );
}
