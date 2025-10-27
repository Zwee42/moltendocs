import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'public/content');
const DATA_DIR = path.join(process.cwd(), 'data');

type PageNode = { slug: string; title: string; filename?: string; children?: PageNode[]; kind: 'dir' | 'file'; hasIndex?: boolean };

type OrderConfig = { order: string[] };

function readTitleFromFile(filePath: string, fallback: string): string {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const fm = matter(raw);
    if (typeof fm.data.title === 'string' && fm.data.title.trim().length) {
      return fm.data.title.trim();
    }
  } catch {}
  return fallback;
}

function readOrderFile(): string[] | null {
  const cfgPath = path.join(DATA_DIR, 'order.json');
  try {
    if (fs.existsSync(cfgPath)) {
      const raw = fs.readFileSync(cfgPath, 'utf8');
      const cfg = JSON.parse(raw) as OrderConfig;
      if (Array.isArray(cfg.order)) return cfg.order.filter((s) => typeof s === 'string');
    }
  } catch {}
  return null;
}

function sortByOrder(children: PageNode[]): PageNode[] {
  const order = readOrderFile();
  if (!order) return children.sort((a, b) => a.title.localeCompare(b.title));
  const nameOf = (n: PageNode) => n.slug.split('/').pop() as string;
  const indexOf = (n: PageNode) => {
    const name = nameOf(n);
    const idx = order.indexOf(name);
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  };
  const ordered = [...children].sort((a, b) => {
    const ia = indexOf(a);
    const ib = indexOf(b);
    if (ia !== ib) return ia - ib;
    return a.title.localeCompare(b.title);
  });
  return ordered;
}

function buildTree(dir: string, baseSlug: string = ''): PageNode[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let nodes: PageNode[] = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const headSlug = baseSlug ? `${baseSlug}/${entry.name}` : entry.name;
      const indexFile = path.join(dir, entry.name, 'index.md');
      const hasIndex = fs.existsSync(indexFile);
      const title = entry.name;
      const children = buildTree(path.join(dir, entry.name), headSlug);
      nodes.push({ slug: headSlug, title, children: sortByOrder(children, path.join(dir, entry.name)), kind: 'dir', hasIndex });
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      if (entry.name.toLowerCase() === 'index.md') continue;
      const filename = entry.name;
      const nameWithoutExt = filename.replace(/\.md$/, '');
      const slug = baseSlug ? `${baseSlug}/${nameWithoutExt}` : nameWithoutExt;
      const filePath = path.join(dir, filename);
      const title = readTitleFromFile(filePath, nameWithoutExt);
      nodes.push({ slug, title, filename, kind: 'file' });
    }
  }
  nodes = sortByOrder(nodes, dir);
  return nodes;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const tree = buildTree(CONTENT_DIR);
    res.status(200).json({ pages: tree });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list pages' });
  }
}


