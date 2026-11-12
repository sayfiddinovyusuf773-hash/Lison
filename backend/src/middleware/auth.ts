import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { queryOne, executeRun } from '../db/index';

export const JWT_SECRET = process.env.JWT_SECRET || 'ziyo_academy_super_secret_jwt_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || (req as any).cookies?.['lison_session'];

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await queryOne(
      `SELECT id, email, role, first_name, last_name, is_suspended, is_active FROM users WHERE id = ?`,
      [decoded.id]
    );

    if (!user || !user.is_active || user.is_suspended) {
      res.status(403).json({ success: false, message: 'Account is inactive or suspended.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    };
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || (req as any).cookies?.['lison_session'];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await queryOne(
        `SELECT id, email, role, first_name, last_name FROM users WHERE id = ? AND is_active = 1 AND is_suspended = 0`,
        [decoded.id]
      );
      if (user) {
        req.user = user;
      }
    } catch {
      // ignore invalid optional token
    }
  }
  next();
};

export const requireRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${roles.join(', ')}] roles.`
      });
      return;
    }
    next();
  };
};

export const logAudit = async (
  userId: string | null,
  action: string,
  resource: string,
  details: string,
  ipAddress?: string
): Promise<void> => {
  try {
    const id = 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    await executeRun(
      `INSERT INTO audit_logs (id, user_id, action, resource, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userId, action, resource, details, ipAddress || '127.0.0.1']
    );
  } catch (err) {
    console.error('Audit log failed:', err);
  }
};
