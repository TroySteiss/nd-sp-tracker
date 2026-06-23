import type { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db.js';

const PgSession = connectPgSimple(session);

export function sessionMiddleware() {
  return session({
    store: new PgSession({ pool, tableName: 'session', createTableIfMissing: false }),
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
  });
}

declare module 'express-session' {
  interface SessionData { authed?: boolean; }
}

/** Gate every /api/* route (except /api/login and /api/auth/status). */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.authed) return next();
  res.status(401).json({ error: 'unauthorized' });
}

export function login(req: Request, res: Response) {
  const { password } = req.body || {};
  const expected = process.env.APP_PASSWORD || 'northdakota';
  if (typeof password === 'string' && password === expected) {
    req.session.authed = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Incorrect password' });
}

export function logout(req: Request, res: Response) {
  req.session.destroy(() => res.json({ ok: true }));
}

export function status(req: Request, res: Response) {
  res.json({ authed: !!(req.session && req.session.authed) });
}
