import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middleware/authMiddleware';
import { isValidEmail, isValidPassword } from '../validators';

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      const { gymName, ownerName, email, phone, password } = req.body;
      if (!gymName?.trim() || !ownerName?.trim() || !email?.trim() || !password?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Gym name, owner name, email, and password are required.',
        });
      }
      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.',
        });
      }
      if (!isValidPassword(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters.',
        });
      }

      const result = await AuthService.register({
        gymName,
        ownerName,
        email,
        phone: phone || '',
        password,
      });
      res.status(201).json({
        success: true,
        message: 'Gym registered successfully',
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Registration failed' });
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }
      const result = await AuthService.login(email, password);
      res.json({ success: true, message: 'Login successful', data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Login failed' });
    }
  }

  public static async logout(req: Request, res: Response) {
    res.json({ success: true, message: 'Logged out successfully' });
  }

  public static async refresh(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token missing for refresh.' });
      }
      const oldToken = authHeader.split(' ')[1];
      const result = await AuthService.refreshToken(oldToken);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(401).json({ success: false, message: err.message || 'Refresh failed' });
    }
  }

  public static async me(req: AuthRequest, res: Response) {
    try {
      const result = await AuthService.getCurrentUser(req.user!.userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  public static async changePassword(req: AuthRequest, res: Response) {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Old and new passwords are required.' });
      }
      await AuthService.changePassword(req.user!.userId, oldPassword, newPassword);
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required.' });
      }
      const result = await AuthService.forgotPassword(email);
      res.json({ success: true, message: result.message, resetToken: result.resetToken });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
      }
      await AuthService.resetPassword(token, newPassword);
      res.json({
        success: true,
        message: 'Password has been reset successfully. Please log in with your new credentials.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
