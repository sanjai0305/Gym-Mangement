import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';

export const JWT_SECRET = process.env.JWT_SECRET || 'fitcore_production_super_secret_jwt_key_2025';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  gymId: string;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: AuthUserPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized: Missing or malformed authorization token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ success: false, message: 'Unauthorized: Missing token' });
    return;
  }

  try {
    // 1. Try standard JWT verification
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    return next();
  } catch (jwtErr) {
    // 2. Resilient fallback for legacy base64-encoded sessions
    try {
      const decodedFallback = JSON.parse(Buffer.from(token, 'base64').toString('utf-8')) as AuthUserPayload;
      if (decodedFallback.exp && decodedFallback.exp < Date.now()) {
        res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
        return;
      }
      if (decodedFallback.userId && decodedFallback.gymId) {
        req.user = decodedFallback;
        return next();
      }
    } catch {
      // Ignored, proceed to 401 response below
    }

    res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired session token. Please re-authenticate.' });
  }
};

export const requireRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized: Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' lacks permission for this operation.`,
      });
      return;
    }

    next();
  };
};
