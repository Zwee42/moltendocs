// import type { NextApiRequest, NextApiResponse } from 'next';
// import fs from 'fs';
// import path from 'path';

// const CONTENT_DIR = path.join(process.cwd(), 'public/content');

// function getAbsoluteContentPath(slug: string | undefined): string {
//   const safeSlug = (slug && /^[a-z0-9\-_/]+$/i.test(slug)) ? slug : 'sample';
//   return path.join(CONTENT_DIR, `${safeSlug}.md`);
// }

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   const slug = (req.query.slug as string) || (req.body && (req.body as unknown).slug);
//   console.log(req.body)
//   const filePath = getAbsoluteContentPath(slug);

//   if (req.method === 'GET') {
//     try {
//       const content = fs.readFileSync(filePath, 'utf8');
//       res.status(200).json({ content });
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to read markdown file' });
//     }
//     return;
//   }

//   if (req.method === 'POST') {
//     const { content } = req.body as { content?: string };
//     if (typeof content !== 'string') {
//       res.status(400).json({ error: 'Invalid content' });
//       return;
//     }
//     try {
//       fs.writeFileSync(filePath, content, 'utf8');
//       res.status(200).json({ ok: true });
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to write markdown file' });
//     }
//     return;
//   }

//   res.setHeader('Allow', 'GET, POST');
//   res.status(405).end('Method Not Allowed');
// }


