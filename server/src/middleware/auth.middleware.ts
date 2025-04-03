import { Request, Response, NextFunction } from 'express';
import AuthService, { TokenPayload } from '../services/auth.service'; 
import UserModel from '../models/user.model'; 

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload; 
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = AuthService.verifyAccessToken(token);

      if (!decoded) {
         return res.status(401).json({ message: 'Not authorized, token failed' });
      }

      req.user = decoded;

      next(); 
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};