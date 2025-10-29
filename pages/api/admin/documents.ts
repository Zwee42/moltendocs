import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'public/content');

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slug, title, content = '', frontmatter = {} } = req.body;
    
    if (!slug || !title) {
      return res.status(400).json({ error: 'Slug and title are required' });
    }

    // Build file path
    const slugParts = slug.split('/').filter(Boolean);
    const filePath = path.join(CONTENT_DIR, ...slugParts) + '.md';
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return res.status(409).json({ error: 'Document already exists' });
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create frontmatter with title
    const fm = { title, ...frontmatter };
    
    // Create the markdown content
    const markdownContent = matter.stringify(content, fm);

    // Write the file
    fs.writeFileSync(filePath, markdownContent, 'utf8');
    
    res.status(201).json({ 
      success: true, 
      path: filePath.replace(CONTENT_DIR, '').replace(/\\/g, '/'),
      slug 
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
