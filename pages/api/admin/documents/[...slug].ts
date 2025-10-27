import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'public/content');

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { slug } = req.query;
  
  if (!slug || !Array.isArray(slug)) {
    return res.status(400).json({ error: 'Invalid slug' });
  }

  const filePath = path.join(CONTENT_DIR, ...slug) + '.md';
  
  try {
    switch (req.method) {
      case 'GET':
        await getDocument(filePath, res);
        break;
      case 'PUT':
        await updateDocument(filePath, req.body, res);
        break;
      case 'DELETE':
        await deleteDocument(filePath, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Document API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getDocument(filePath: string, res: NextApiResponse) {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(content);
  
  res.status(200).json({
    frontmatter: parsed.data,
    content: parsed.content,
    rawContent: content
  });
}

async function updateDocument(filePath: string, body: any, res: NextApiResponse) {
  const { frontmatter, content } = body;
  
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Content must be a string' });
  }

  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Create the full markdown content with frontmatter
  let markdownContent = content;
  if (frontmatter && Object.keys(frontmatter).length > 0) {
    const frontmatterStr = matter.stringify('', frontmatter).replace(/^---\s*$/, '');
    markdownContent = frontmatterStr + content;
  }

  fs.writeFileSync(filePath, markdownContent, 'utf8');
  
  res.status(200).json({ success: true });
}

async function deleteDocument(filePath: string, res: NextApiResponse) {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Document not found' });
  }

  fs.unlinkSync(filePath);
  
  res.status(200).json({ success: true });
}

export default withAuth(handler);
