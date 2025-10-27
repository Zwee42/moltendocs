import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from './db';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: { id: number; username: string };
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
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

      req.user = user;
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
