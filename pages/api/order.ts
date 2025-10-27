import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'public/content');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  const { dirSlug, order } = req.body as { dirSlug?: string; order?: string[] };
  if (!Array.isArray(order)) return res.status(400).json({ error: 'Invalid order' });
  const targetDir = dirSlug ? path.join(CONTENT_DIR, dirSlug) : CONTENT_DIR;
  try {
    const stat = fs.statSync(targetDir);
    if (!stat.isDirectory()) throw new Error('Not a directory');
  } catch (e) {
    return res.status(404).json({ error: 'Directory not found' });
  }
  const cfgPath = path.join(targetDir, '_order.json');
  try {
    fs.writeFileSync(cfgPath, JSON.stringify({ order }, null, 2), 'utf8');
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to write order file' });
  }
}


