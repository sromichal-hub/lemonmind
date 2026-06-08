import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  headers: any;
  user?: {
    id: number;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    req.user = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
    ) as { id: number; email: string };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
