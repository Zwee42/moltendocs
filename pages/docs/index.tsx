import { GetServerSideProps } from 'next';
import Head from 'next/head';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import { useTheme } from '@/lib/theme';
import { Header } from '@/components/Header';
import { Geist } from 'next/font/google';
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

type PageNode = { slug: string; title: string; filename?: string; children?: PageNode[]; kind: 'dir' | 'file'; hasIndex?: boolean };

type Props = { pages: PageNode[] };

export default function DocsIndex({ pages }: Props) {
  const { getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const getFirstLink = (node: PageNode): string => {
    if (node.hasIndex) return `/docs/${node.slug}`;
    if (node.kind === 'file') return `/docs/${node.slug}`;
    const firstChild = (node.children || []).find((c) => c.kind === 'file' || (c.children && c.children.length));
    return firstChild ? `/docs/${firstChild.slug}` : `/docs/${node.slug}`;
  };

  return (
    <div className={geistSans.className} style={{ background: styles.background, color: styles.color, minHeight: '100vh' }}>
      <Head>
        <title>Documentation - MoltenDocs</title>
      </Head>
      
      <Header 
        title="Documentation"
        subtitle="Browse all available documentation"
        breadcrumbs={[
          { label: 'MoltenDocs', href: '/' },
          { label: 'Docs' }
        ]}
        actions={
          <Link  
            href="/admin"
            style={{
              padding: '6px 12px',
              background: styles.buttonSecondary,
              color: styles.buttonSecondaryText,
              textDecoration: 'none',
              borderRadius: 4,
              fontSize: 12
            }}
          >
            Admin
          </Link>
        }
      />
      
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: 24 
        }}>
          {pages.map((node) => (
            <Link
              key={node.slug}
              href={getFirstLink(node)}
              style={{
                display: 'block',
                padding: 24,
                background: styles.cardBackground,
                borderRadius: 12,
                border: `1px solid ${styles.headerBorder}`,
                textDecoration: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.15)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h3 style={{ 
                margin: 0, 
                marginBottom: 8, 
                color: styles.accent,
                fontSize: 18,
                fontWeight: 600
              }}>
                {node.title}
              </h3>
              <p style={{ 
                margin: 0, 
                color: styles.muted, 
                fontSize: 14 
              }}>
                {node.kind === 'dir' && node.children 
                  ? `${node.children.length} page${node.children.length !== 1 ? 's' : ''}`
                  : 'View documentation'
                }
              </p>
            </Link>
          ))}
        </div>

        {pages.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: 64, 
            color: styles.muted 
          }}>
            <p>No documentation available yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function listTree(dir: string, baseSlug = ''): PageNode[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const nodes: PageNode[] = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const headSlug = baseSlug ? `${baseSlug}/${entry.name}` : entry.name;
      const indexFile = path.join(dir, entry.name, 'index.md');
      const hasIndex = fs.existsSync(indexFile);
      const headTitle = entry.name;
      const children = listTree(path.join(dir, entry.name), headSlug);
      nodes.push({ slug: headSlug, title: headTitle, children, kind: 'dir', hasIndex });
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      if (entry.name.toLowerCase() === 'index.md') continue;
      const filename = entry.name;
      const nameWithoutExt = filename.replace(/\.md$/, '');
      const s = baseSlug ? `${baseSlug}/${nameWithoutExt}` : nameWithoutExt;
      const f = path.join(dir, filename);
      let t = nameWithoutExt;
      try {
        const raw = fs.readFileSync(f, 'utf8');
        const fm = matter(raw);
        if (typeof fm.data.title === 'string' && fm.data.title.trim().length) t = fm.data.title.trim();
      } catch {}
      nodes.push({ slug: s, title: t, filename, kind: 'file' });
    }
  }
  // Apply _order.json if present
  const orderPath = path.join(dir, '_order.json');
  if (fs.existsSync(orderPath)) {
    try {
      const raw = fs.readFileSync(orderPath, 'utf8');
      const cfg = JSON.parse(raw) as { order: string[] };
      const order = Array.isArray(cfg.order) ? cfg.order : [];
      const idxOf = (slug: string) => {
        const name = slug.split('/').pop() as string;
        const i = order.indexOf(name);
        return i === -1 ? Number.MAX_SAFE_INTEGER : i;
      };
      nodes.sort((a, b) => {
        const ia = idxOf(a.slug);
        const ib = idxOf(b.slug);
        if (ia !== ib) return ia - ib;
        return a.title.localeCompare(b.title);
      });
    } catch {}
  } else {
    nodes.sort((a, b) => a.title.localeCompare(b.title));
  }
  return nodes;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const contentDir = path.join(process.cwd(), 'public/content');
  const pages = listTree(contentDir);
  return { props: { pages } };
};
