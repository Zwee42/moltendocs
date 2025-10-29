import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'public/content');
const DATA_DIR = path.join(process.cwd(), 'data');

type Document = { 
  slug: string; 
  title: string; 
  excerpt?: string;
  lastModified?: string;
  order?: number;
};

type OrderConfig = { documents: string[] };

function readTitleFromFile(filePath: string, fallback: string): { title: string; excerpt?: string } {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const fm = matter(raw);
    const title = (typeof fm.data.title === 'string' && fm.data.title.trim().length) 
      ? fm.data.title.trim() 
      : fallback;
    
    // Extract first paragraph as excerpt
    const content = fm.content.trim();
    const firstParagraph = content.split('\n\n')[0]?.replace(/#+\s*/, '').trim();
    const excerpt = firstParagraph && firstParagraph.length > 0 && firstParagraph.length < 200 
      ? firstParagraph 
      : undefined;
    
    return { title, excerpt };
  } catch {
    return { title: fallback };
  }
}

function readOrderFile(): string[] {
  const cfgPath = path.join(DATA_DIR, 'order.json');
  try {
    if (fs.existsSync(cfgPath)) {
      const raw = fs.readFileSync(cfgPath, 'utf8');
      const cfg = JSON.parse(raw) as OrderConfig;
      if (Array.isArray(cfg.documents)) {
        return cfg.documents.filter((s) => typeof s === 'string');
      }
    }
  } catch {}
  return [];
}

function getAllDocuments(dir: string, baseSlug: string = ''): Document[] {
  const documents: Document[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Recursively get documents from subdirectories
        const subDocs = getAllDocuments(path.join(dir, entry.name), 
          baseSlug ? `${baseSlug}/${entry.name}` : entry.name);
        documents.push(...subDocs);
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name.toLowerCase() !== 'index.md') {
        const filename = entry.name;
        const nameWithoutExt = filename.replace(/\.md$/, '');
        const slug = baseSlug ? `${baseSlug}/${nameWithoutExt}` : nameWithoutExt;
        const filePath = path.join(dir, filename);
        
        const { title, excerpt } = readTitleFromFile(filePath, nameWithoutExt);
        const stats = fs.statSync(filePath);
        
        documents.push({
          slug,
          title,
          excerpt,
          lastModified: stats.mtime.toISOString()
        });
      }
    }
  } catch (error) {
    console.error('Error reading documents:', error);
  }
  
  return documents;
}

function sortDocumentsByOrder(documents: Document[]): Document[] {
  const order = readOrderFile();
  
  if (order.length === 0) {
    return documents.sort((a, b) => a.title.localeCompare(b.title));
  }
  
  return documents.sort((a, b) => {
    const indexA = order.indexOf(a.slug);
    const indexB = order.indexOf(b.slug);
    
    // If both are in order array
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    // If only A is in order array
    if (indexA !== -1 && indexB === -1) {
      return -1;
    }
    
    // If only B is in order array
    if (indexA === -1 && indexB !== -1) {
      return 1;
    }
    
    // If neither is in order array, sort alphabetically
    return a.title.localeCompare(b.title);
  });
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const allDocuments = getAllDocuments(CONTENT_DIR);
    const sortedDocuments = sortDocumentsByOrder(allDocuments);
    
    res.status(200).json({ documents: sortedDocuments });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
}
