import { Request, Response } from 'express';
import UserModel, { IUser } from '../models/user.model';
import AuthService from '../services/auth.service';

class AuthController {

  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password' });
      }

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      const user = new UserModel({ name, email, password });
      await user.save();

      return res.status(201).json({
          message: 'User registered successfully. Please log in.',
          userId: user._id 
      });

    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Server error during registration' });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

       if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const accessToken = AuthService.generateAccessToken(user);

      return res.status(200).json({
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Server error during login' });
    }
  }
}

export default new AuthController();