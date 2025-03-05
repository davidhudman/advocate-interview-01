import { Request, Response, NextFunction } from 'express';

export const validateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // For our mock API, we'll just check if the token is the expected value
  if (token !== 'mock_token') {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }

  next();
};
