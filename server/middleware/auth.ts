import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../services/dbStore.js';

export const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'hamro-bca-ultra-secure-key-2026';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  semester?: number;
  emailVerified: Date | null;
  isPremium?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please login.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await db.findUserById(decoded.id);

    if (!user) {
      res.status(401).json({ error: 'User session invalid or user no longer exists.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ error: 'Account has been deactivated. Contact administration.' });
      return;
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      semester: user.semester,
      emailVerified: user.emailVerified,
      isPremium: user.isPremium === true,
    };

    next();
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

/**
 * Attaches req.user when a valid token is present, but never rejects the request.
 * Used for endpoints that stay publicly readable while still needing to know
 * whether the caller holds an active premium subscription.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || req.cookies?.token;

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await db.findUserById(decoded.id);

    if (user && user.status !== 'suspended') {
      req.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        semester: user.semester,
        emailVerified: user.emailVerified,
        isPremium: user.isPremium === true,
      };
    }
  } catch (err) {
    // Invalid or expired token is treated as an anonymous visitor.
  }

  next();
}

export function requireRoles(allowedRoles: Array<'student' | 'teacher' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Requires one of [${allowedRoles.join(', ')}] role privilege.`,
      });
      return;
    }

    next();
  };
}
