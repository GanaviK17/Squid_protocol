import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'squid-protocol-ultra-secure-jwt-key-dev-32chars';

export interface AuthUser {
  userId: string;
  username: string;
  role: UserRole;
  teamId?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function generateToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  let token: string | undefined;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies.squid_token) {
    token = req.cookies.squid_token;
  }

  // 2. Fallback to Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_REQUIRED',
      message: 'Access denied. Valid session or authentication token required.'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Authentication session expired or invalid. Please log in again.'
    });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required.'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `Forbidden: Action requires one of roles [${roles.join(', ')}].`
      });
      return;
    }

    next();
  };
}

export function requireTeam(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== UserRole.TEAM || !req.user.teamId) {
    res.status(403).json({
      success: false,
      error: 'TEAM_ONLY',
      message: 'Access restricted to authenticated team accounts.'
    });
    return;
  }
  next();
}
