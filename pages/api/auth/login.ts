import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const db = await getDatabase();
    const user = await db.authenticate(username, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const sessionId = await db.createSession(user.id);

    // Set httpOnly cookie
    res.setHeader('Set-Cookie', `session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
    
    res.status(200).json({ 
      success: true, 
      user: { id: user.id, username: user.username } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
