import { withAuth, AuthenticatedRequest } from '../../../../lib/middleware';
import { getDatabase } from '../../../../lib/db';
import { NextApiResponse } from 'next';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  const userId = parseInt(id as string, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const db = await getDatabase();

  if (req.method === 'DELETE') {
    // Delete user
    try {
      await db.deleteUser(userId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      if (error.message === 'User not found or cannot delete admin user') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete user' });
      }
    }
  } else if (req.method === 'PUT') {
    // Update user password
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      await db.updateUserPassword(userId, password);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error updating user password:', error);
      if (error.message === 'User not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update user password' });
      }
    }
  } else {
    res.setHeader('Allow', ['DELETE', 'PUT']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);
