// import { NextApiRequest, NextApiResponse } from 'next';
// import { withAuth, AuthenticatedRequest } from '../../../lib/middleware';
// import fs from 'fs';
// import path from 'path';

// const DATA_DIR = path.join(process.cwd(), 'data');

// async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
//   if (req.method !== 'PUT') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const { documents } = req.body;
    
//     if (!Array.isArray(documents)) {
//       return res.status(400).json({ error: 'Documents must be an array' });
//     }

//     const orderConfig = { documents };
//     const orderFilePath = path.join(DATA_DIR, 'order.json');
    
//     // Ensure data directory exists
//     if (!fs.existsSync(DATA_DIR)) {
//       fs.mkdirSync(DATA_DIR, { recursive: true });
//     }
    
//     fs.writeFileSync(orderFilePath, JSON.stringify(orderConfig, null, 2), 'utf8');
    
//     res.status(200).json({ success: true });
//   } catch (error) {
//     console.error('Update order error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

// export default withAuth(handler);
