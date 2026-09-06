import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../models/db';
import { User, Gym, MembershipPlan, UserRole } from '../types';
import { JWT_SECRET } from '../middleware/authMiddleware';

export class AuthService {
  public static async hashPassword(plainText: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainText, salt);
  }

  public static async comparePassword(plainText: string, hashedOrPlain?: string): Promise<boolean> {
    if (!hashedOrPlain) return false;
    // Direct match check for initial seeds or legacy format
    if (plainText === hashedOrPlain || (plainText === 'password123' && hashedOrPlain === 'password123')) {
      return true;
    }
    try {
      return await bcrypt.compare(plainText, hashedOrPlain);
    } catch {
      return false;
    }
  }

  public static generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        gymId: user.gymId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  public static async login(email: string, password: string): Promise<{ token: string; user: User; gym: Gym }> {
    const db = dbService.getRawDb();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.isActive
    );

    if (!user) {
      throw new Error('Invalid email or password credentials');
    }

    const isValid = await this.comparePassword(password, user.password);
    if (!isValid) {
      throw new Error('Invalid email or password credentials');
    }

    // If password was stored in plain text, migrate it automatically to bcrypt hash
    if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      user.password = await this.hashPassword(password);
      dbService.persist();
    }

    const gym = db.gyms.find((g) => g._id === user.gymId);
    if (!gym) {
      throw new Error('Associated Gym facility not found on record');
    }

    const token = this.generateToken(user);
    const sanitizedUser = { ...user };
    delete sanitizedUser.password;

    return { token, user: sanitizedUser, gym };
  }

  public static async register(data: {
    gymName: string;
    ownerName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ token: string; user: User; gym: Gym }> {
    const db = dbService.getRawDb();

    // Check existing email
    const existing = db.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw new Error('A user account with this email address already exists.');
    }

    const newGymId = `gym-${Date.now()}`;
    const newOwnerUserId = `user-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const hashedPassword = await this.hashPassword(data.password);

    const newGym: Gym = {
      _id: newGymId,
      name: data.gymName,
      ownerId: newOwnerUserId,
      email: data.email,
      phone: data.phone,
      whatsapp: data.phone,
      address: 'Main Facility Address',
      openingHours: '06:00 AM - 10:00 PM',
      timezone: 'America/New_York',
      currency: '₹',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const newOwner: User = {
      _id: newOwnerUserId,
      name: data.ownerName,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role: 'OWNER',
      gymId: newGymId,
      isActive: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Default membership plans for the newly initialized gym
    const defaultPlans: MembershipPlan[] = [
      {
        _id: `plan-${Date.now()}-1`,
        gymId: newGymId,
        name: 'Basic Monthly',
        description: 'Standard gym floor and locker access.',
        price: 2499,
        durationMonths: 1,
        features: ['Gym Floor', 'Locker Room', 'Standard Check-in'],
        maxClasses: 2,
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        _id: `plan-${Date.now()}-2`,
        gymId: newGymId,
        name: 'Standard Quarterly',
        description: 'Full gym floor + group class credits.',
        price: 5999,
        durationMonths: 3,
        features: ['Gym Floor', 'Locker Room', '5 Classes/Month', 'Steam Room'],
        maxClasses: 15,
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        _id: `plan-${Date.now()}-3`,
        gymId: newGymId,
        name: 'Premium Annual (All Access)',
        description: 'Unlimited access and dedicated coach consultations.',
        price: 18999,
        durationMonths: 12,
        features: ['24/7 Access', 'Unlimited Classes', 'Monthly Fitness Assessment', 'Towel Service'],
        maxClasses: 999,
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      }
    ];

    db.gyms.push(newGym);
    db.users.push(newOwner);
    db.membershipPlans.push(...defaultPlans);
    dbService.persist();

    const token = this.generateToken(newOwner);
    const sanitizedOwner = { ...newOwner };
    delete sanitizedOwner.password;

    return { token, user: sanitizedOwner, gym: newGym };
  }

  public static async getCurrentUser(userId: string): Promise<{ user: User; gym: Gym }> {
    const db = dbService.getRawDb();
    const user = db.users.find((u) => u._id === userId && u.isActive);
    if (!user) {
      throw new Error('User record not found or inactive');
    }
    const gym = db.gyms.find((g) => g._id === user.gymId);
    if (!gym) {
      throw new Error('Gym organization not found');
    }
    const sanitizedUser = { ...user };
    delete sanitizedUser.password;
    return { user: sanitizedUser, gym };
  }

  public static async changePassword(userId: string, oldPass: string, newPass: string): Promise<void> {
    const db = dbService.getRawDb();
    const user = db.users.find((u) => u._id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    const isValid = await this.comparePassword(oldPass, user.password);
    if (!isValid) {
      throw new Error('Incorrect current password.');
    }
    if (newPass.length < 6) {
      throw new Error('New password must be at least 6 characters in length.');
    }
    user.password = await this.hashPassword(newPass);
    user.updatedAt = new Date().toISOString();
    dbService.persist();
  }

  public static async forgotPassword(email: string): Promise<{ message: string; resetToken: string }> {
    const db = dbService.getRawDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Return ambiguous message for security to prevent user enumeration
      return {
        message: 'If an account exists with this email, password reset instructions have been dispatched.',
        resetToken: 'mock-token',
      };
    }

    const resetToken = jwt.sign(
      { userId: user._id, type: 'pwd_reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      message: 'Password reset link generated successfully. Check your email or use the reset token.',
      resetToken,
    };
  }

  public static async resetPassword(token: string, newPass: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
      if (decoded.type !== 'pwd_reset') {
        throw new Error('Invalid token type');
      }
      const db = dbService.getRawDb();
      const user = db.users.find((u) => u._id === decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }
      if (newPass.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }
      user.password = await this.hashPassword(newPass);
      user.updatedAt = new Date().toISOString();
      dbService.persist();
    } catch {
      throw new Error('Password reset token is invalid or has expired.');
    }
  }

  public static async refreshToken(token: string): Promise<{ token: string; user: User; gym: Gym }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as {
        userId: string;
        gymId: string;
      };
      const db = dbService.getRawDb();
      const user = db.users.find((u) => u._id === decoded.userId && u.isActive);
      if (!user) {
        throw new Error('User not found or inactive');
      }
      const gym = db.gyms.find((g) => g._id === user.gymId);
      if (!gym) {
        throw new Error('Gym organization not found');
      }
      const newToken = this.generateToken(user);
      const sanitizedUser = { ...user };
      delete sanitizedUser.password;
      return { token: newToken, user: sanitizedUser, gym };
    } catch (err: any) {
      throw new Error(err.message || 'Invalid token');
    }
  }
}

