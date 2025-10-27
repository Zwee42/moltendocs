import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionId = req.cookies.session;

    if (!sessionId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const db = await getDatabase();
    const user = await db.validateSession(sessionId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    res.status(200).json({ 
      success: true, 
      user: { id: user.id, username: user.username } 
    });
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
