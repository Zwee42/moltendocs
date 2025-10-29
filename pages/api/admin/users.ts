import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
import { getDatabase } from '../../../lib/db';
import { NextApiResponse } from 'next';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const db = await getDatabase();

  if (req.method === 'GET') {
    // List all users
    try {
      const users = await db.getAllUsers();
      res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  } else if (req.method === 'POST') {
    // Create new user
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      const user = await db.createUser(username, password);
      
      res.status(201).json({ 
        success: true, 
        user 
      });
    } catch (error: unknown) {
      console.error('Error creating user:', error);
      if (error instanceof Error && error.message === 'Username already exists') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create user' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);
