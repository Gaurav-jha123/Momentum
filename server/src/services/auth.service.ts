import jwt from 'jsonwebtoken';
import { IUser } from '../models/user.model'; 

export interface TokenPayload {
  userId: string;
  name: string; 
}

class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string = '1h'; 

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key'; 
    if (this.jwtSecret === 'fallback_secret_key') {
        console.warn('Warning: JWT_SECRET is not set in .env file. Using insecure fallback.');
    }
  }

  generateAccessToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id.toString(), 
      name: user.name,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    });
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as TokenPayload;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }
}

export default new AuthService();