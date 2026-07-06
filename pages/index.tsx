import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";
import Link from "next/link";
import { IconSun, IconMoon, IconBook, IconPen, IconFile } from "@/lib/icons";

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
    <>
      <main style={{ maxWidth: 1560, margin: '0 auto', padding: 32, overflowY: 'auto', flex: 1, width: '100%' }}>
	        <div style={{ marginBottom: 24 }}>
	          <h3 style={{ 
	            margin: '0 0 16px 0', 
	            fontSize: 20, 
	            color: styles.h3Color,
	            fontWeight: 600 
	          }}>
	            All Documents
	          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: 14, 
            color: styles.muted 
          }}>
            Click on the available documentation from the Molten Series to guide you with your configuration journey!
          </p>
        </div>

        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: 48,
            color: styles.muted 
          }}>
            <div style={{ fontSize: 18, marginBottom: 8 }}><IconBook /></div>
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
            <div style={{ fontSize: 32, marginBottom: 16 }}><IconPen /></div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 18 }}>No documents yet</h4>
            <p style={{ margin: 0, fontSize: 14, color: styles.muted }}>
              Content is being prepared. Check back soon.
            </p>
          </div>
        )}

        {!loading && documents.length > 0 && (
          <>
            {/* Table view — large screens */}
            <div className="doc-table-view">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${styles.cardBorder}` }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 600, color: styles.h3Color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Document
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: styles.h3Color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Last Modified
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr
                      key={doc.slug}
                      style={{ borderBottom: `1px solid ${styles.cardBorder}`, transition: 'background 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = styles.buttonSecondary; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <Link
                          href={`/docs/${doc.slug}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            textDecoration: 'none',
                            color: 'inherit',
                            fontSize: 15,
                            fontWeight: 500,
                          }}
                        >
                          <span style={{ color: styles.muted, fontSize: 16, display: 'inline-flex' }}>
                            <IconFile />
                          </span>
                          {doc.title}
                        </Link>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: styles.muted, fontSize: 13 }}>
                        {doc.lastModified ? new Date(doc.lastModified).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card grid — small screens */}
            <div className="doc-card-grid" style={{
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
                        color: styles.muted
                      }}>
                        <IconFile />
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
                            {/* {doc.excerpt} */}
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
                      {doc.lastModified && (
                        <span style={{marginLeft: 'auto'}}>
                          {new Date(doc.lastModified).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <style>{`
              .doc-table-view { display: none; }
              .doc-card-grid { display: grid; }
              @media (min-width: 1024px) {
                .doc-table-view { display: block; }
                .doc-card-grid { display: none; }
              }
            `}</style>
          </>
        )}

      </main>
    </>
  );
}
