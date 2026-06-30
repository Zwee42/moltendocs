import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../lib/middleware';

// Mock the database module
jest.mock('../lib/db', () => ({
  getDatabase: jest.fn(),
}));

import { getDatabase } from '../lib/db';

describe('withAuth middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<NextApiResponse>;
  let mockHandler: jest.Mock;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn(() => ({ json: mockJson }));
    
    mockReq = {
      cookies: {},
    };
    
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };

    mockHandler = jest.fn();
  });

  it('returns 401 when no session cookie is present', async () => {
    const wrappedHandler = withAuth(mockHandler);
    
    await wrappedHandler(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Not authenticated' });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('returns 401 when session is invalid', async () => {
    mockReq.cookies = { session: 'invalid-session' };
    
    const mockDb = {
      validateSession: jest.fn().mockResolvedValue(null),
    };
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);

    const wrappedHandler = withAuth(mockHandler);
    
    await wrappedHandler(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

    expect(mockDb.validateSession).toHaveBeenCalledWith('invalid-session');
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid session' });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('calls handler with user attached to request when session is valid', async () => {
    const mockUser = { id: 1, username: 'testuser' };
    mockReq.cookies = { session: 'valid-session' };
    
    const mockDb = {
      validateSession: jest.fn().mockResolvedValue(mockUser),
    };
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);

    const wrappedHandler = withAuth(mockHandler);
    
    await wrappedHandler(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

    expect(mockDb.validateSession).toHaveBeenCalledWith('valid-session');
    expect(mockReq.user).toEqual(mockUser);
    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
  });

  it('returns 500 when database throws an error', async () => {
    mockReq.cookies = { session: 'some-session' };
    
    (getDatabase as jest.Mock).mockRejectedValue(new Error('Database error'));

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const wrappedHandler = withAuth(mockHandler);
    
    await wrappedHandler(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
    expect(mockHandler).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('returns 500 when validateSession throws an error', async () => {
    mockReq.cookies = { session: 'some-session' };
    
    const mockDb = {
      validateSession: jest.fn().mockRejectedValue(new Error('Session error')),
    };
    (getDatabase as jest.Mock).mockResolvedValue(mockDb);

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const wrappedHandler = withAuth(mockHandler);
    
    await wrappedHandler(mockReq as AuthenticatedRequest, mockRes as NextApiResponse);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });

    consoleSpy.mockRestore();
  });
});
