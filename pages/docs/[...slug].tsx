import { GetServerSideProps } from 'next';
import Head from 'next/head';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { useTheme } from '@/lib/theme';
import { Header } from '@/components/Header';
import { Geist } from 'next/font/google';
import Link from "next/link";


const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

type PageNode = { slug: string; title: string; filename?: string; children?: PageNode[]; kind: 'dir' | 'file'; hasIndex?: boolean };

type Props = { slug: string; content: string; title: string; pages: PageNode[]; nextSlug: string | null };

export default function DocPage({ slug, content, title, pages, nextSlug }: Props) {
  const { getThemeStyles } = useTheme();
  const styles = getThemeStyles();
  
  const headSlug = slug.split('/')[0];
  const headNode = pages.find((p) => p.slug === headSlug);
  const headHref = (() => {
    if (!headNode) return `/docs/${headSlug}`;
    if (headNode.hasIndex) return `/docs/${headSlug}`; // index route resolves to index.md
    const firstChild = (headNode.children || []).find((c) => c.kind === 'file' || (c.children && c.children.length));
    return firstChild ? `/docs/${firstChild.slug}` : `/docs/${headSlug}`;
  })();
  
  return (
    <div className={geistSans.className} style={{ background: styles.background, color: styles.color, minHeight: '100vh' }}>
      <Head>
        <title>{`${title || slug} - MoltenDocs`}</title>
      </Head>
      
      <Header 
        title="Documentation"
        subtitle={title}
        breadcrumbs={[
          { label: 'MoltenDocs', href: '/' },
          { label: 'Docs', href: '/docs' },
          ...(slug !== 'sample' ? [{ label: title }] : [])
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
      
      <div style={{ display: 'flex', maxWidth: 1600, margin: '0 auto' }}>
        <aside style={{ 
          width: 280, 
          borderRight: `1px solid ${styles.headerBorder}`, 
          padding: 24,
          background: styles.cardBackground,
          height: 'calc(100vh - 80px)',
          overflowY: 'auto'
        }}>
          <div style={{ fontWeight: 600, marginBottom: 16, color: styles.accent }}>Navigation</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pages.map((node) => {
              return (
                <div key={node.slug}>
                  <Link 
                    href={node.slug === headSlug ? headHref : `/docs/${node.slug}`} 
                    style={{ 
                      display: 'block', 
                      padding: '8px 12px', 
                      borderRadius: 6, 
                      background: node.slug === headSlug && (slug === headSlug || slug === `${headSlug}/index`) ? styles.buttonPrimary : 'transparent',
                      color: node.slug === headSlug && (slug === headSlug || slug === `${headSlug}/index`) ? styles.buttonPrimaryText : styles.color,
                      textDecoration: 'none',
                      fontSize: 14,
                      fontWeight: 500
                    }}
                  >
                    {node.title}
                  </Link>
                  {node.slug === headSlug && node.children && node.children.length > 0 && (
                    <div style={{ marginLeft: 16, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {node.children.map((child) => (
                        <Link 
                          key={child.slug} 
                          href={`/docs/${child.slug}`} 
                          style={{ 
                            display: 'block', 
                            padding: '6px 12px', 
                            borderRadius: 6, 
                            background: child.slug === slug ? styles.accent : 'transparent',
                            color: child.slug === slug ? '#fff' : styles.muted,
                            textDecoration: 'none',
                            fontSize: 13
                          }}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>
        
        <main style={{ 
          flex: 1, 
          padding: 24,
          height: 'calc(100vh - 80px)',
          overflowY: 'auto'
        }}>
          <div style={{
            maxWidth: 800,
            lineHeight: 1.6,
            fontSize: 16
          }}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkBreaks]} 
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ children }) => (
                  <h1 style={{ color: styles.accent, fontSize: 32, marginBottom: 16, marginTop: 24 }}>
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 style={{ color: styles.accent, fontSize: 24, marginBottom: 12, marginTop: 20 }}>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 style={{ color: styles.accent, fontSize: 20, marginBottom: 8, marginTop: 16 }}>
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p style={{ marginBottom: 16, color: styles.color }}>
                    {children}
                  </p>
                ),
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-');
                  return isBlock ? (
                    <code style={{
                      background: styles.cardBackground,
                      border: `1px solid ${styles.cardBorder}`,
                      borderRadius: 6,
                      padding: 16,
                      display: 'block',
                      fontFamily: 'var(--font-geist-mono)',
                      fontSize: 14,
                      overflow: 'auto',
                      color: styles.color
                    }}>
                      {children}
                    </code>
                  ) : (
                    <code style={{
                      background: styles.cardBackground,
                      border: `1px solid ${styles.cardBorder}`,
                      borderRadius: 3,
                      padding: '2px 6px',
                      fontFamily: 'var(--font-geist-mono)',
                      fontSize: 14,
                      color: styles.color
                    }}>
                      {children}
                    </code>
                  );
                },
                a: ({ children, href }) => (
                  <a href={href} style={{ color: styles.accent, textDecoration: 'underline' }}>
                    {children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul style={{ marginBottom: 16, paddingLeft: 24, color: styles.color }}>
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol style={{ marginBottom: 16, paddingLeft: 24, color: styles.color }}>
                    {children}
                  </ol>
                ),
                blockquote: ({ children }) => (
                  <blockquote style={{
                    borderLeft: `4px solid ${styles.accent}`,
                    paddingLeft: 16,
                    marginLeft: 0,
                    marginBottom: 16,
                    fontStyle: 'italic',
                    color: styles.muted
                  }}>
                    {children}
                  </blockquote>
                )
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
          
          {nextSlug && (
            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
              <Link 
                href={`/docs/${nextSlug}`} 
                style={{ 
                  padding: '12px 20px', 
                  borderRadius: 6, 
                  background: styles.buttonPrimary,
                  color: styles.buttonPrimaryText,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                Next →
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function readFileWithFrontmatter(filePath: string): { title: string; content: string } {
  let title = filePath;
  let content = '';
  const raw = fs.readFileSync(filePath, 'utf8');
  const fm = matter(raw);
  content = fm.content || raw;
  if (typeof fm.data.title === 'string' && fm.data.title.trim().length) {
    title = fm.data.title.trim();
  }
  return { title, content };
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

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slugParts = (ctx.params?.slug as string[]) || ['sample'];
  const slug = slugParts.join('/');
  const contentDir = path.join(process.cwd(), 'public/content');

  // Resolve file path for head vs child
  let filePath = path.join(contentDir, `${slug}.md`);
  if (slugParts.length === 1) {
    const head = slugParts[0];
    const indexCandidate = path.join(contentDir, head, 'index.md');
    if (fs.existsSync(indexCandidate)) filePath = indexCandidate;
  }

  let title = slug;
  let content = '';
  try {
    const result = readFileWithFrontmatter(filePath);
    title = result.title;
    content = result.content;
  } catch (e) {
    void e
    content = '# Not found\nThe requested page does not exist.';
  }

  const pages = listTree(contentDir);

  // Next within head
  const headSlug = slug.split('/')[0];
  const headNode = pages.find((p) => p.slug === headSlug);
  let nextSlug: string | null = null;
  if (headNode) {
    const flat: string[] = [];
    if (headNode.hasIndex) flat.push(headSlug);
    const pushNodes = (ns: PageNode[]) => {
      for (const node of ns) {
        if (node.kind === 'file') flat.push(node.slug);
        if (node.children && node.children.length) pushNodes(node.children);
      }
    };
    if (headNode.children) pushNodes(headNode.children);
    const idx = flat.indexOf(slug);
    if (idx >= 0 && idx < flat.length - 1) nextSlug = flat[idx + 1];
  }

  return { props: { slug, content, title, pages, nextSlug } };
};


