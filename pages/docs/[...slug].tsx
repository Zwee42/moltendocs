import { GetServerSideProps } from 'next';
import Head from 'next/head';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import { useTheme } from '@/lib/theme';
import { Header } from '@/components/Header';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import Link from "next/link";
import { IconArrowRight } from '@/lib/icons';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';

type PageNode = { slug: string; title: string; filename?: string; children?: PageNode[]; kind: 'dir' | 'file'; hasIndex?: boolean };

type TocNode = { id: string; text: string; level: number; children: TocNode[] };

type Props = { slug: string; content: string; title: string; pages: PageNode[]; nextSlug: string | null; toc: TocNode[] };

export default function DocPage({ slug, content, title, pages, nextSlug, toc }: Props) {
  const { getThemeStyles } = useTheme();
  const styles = getThemeStyles();
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});

  const togglePage = (pageSlug: string) => {
    setExpandedPages(prev => ({ ...prev, [pageSlug]: !prev[pageSlug] }));
  };
  
  return (
    <>
      <Head>
        <title>{`${title || slug} - MoltenDocs`}</title>
      </Head>
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          pages={pages}
          currentSlug={slug}
          toc={toc}
          expandedPages={expandedPages}
          onTogglePage={togglePage}
        />
        
        <main style={{ 
          flex: 1, 
          padding: 24,
          overflowY: 'auto'
        }}>
          <div style={{
            maxWidth: 800,
            lineHeight: 1.6,
            fontSize: 16
          }}>
            <MarkdownRenderer content={content} />
          </div>
          
          {nextSlug && (
            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
              <Link 
                href={`/docs/${nextSlug}`} 
                style={{ 
                  padding: '12px 20px', 
                  background: styles.buttonPrimary,
                  color: styles.buttonPrimaryText,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                Next <IconArrowRight />
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
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

function extractToc(markdown: string): TocNode[] {
  const root: TocNode[] = [];
  const lines = markdown.split('\n');
  let inCodeBlock = false;
  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '');
      const node: TocNode = { id, text, level, children: [] };
      if (level === 1) {
        root.push(node);
      } else {
        let parent = root.length > 0 ? root[root.length - 1] : null;
        for (let i = level - 1; i > 1 && parent && parent.children.length > 0; i--) {
          parent = parent.children[parent.children.length - 1];
        }
        if (parent) {
          parent.children.push(node);
        } else {
          root.push(node);
        }
      }
    }
  }
  return root;
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

  const toc = extractToc(content);

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

  return { props: { slug, content, title, pages, nextSlug, toc } };
};


