import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionId = req.cookies.session;

    if (sessionId) {
      const db = await getDatabase();
      await db.deleteSession(sessionId);
    }

    // Clear the session cookie
    res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
