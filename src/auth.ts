import type { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool, query } from './db.js';

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
  interface SessionData { authed?: boolean; username?: string; }
}

/** Gate every /api/* route (except /api/login and /api/auth/status).
    Sessions without a username (pre-username deploys) must log in again so
    the change log can attribute every write. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.authed && req.session.username) return next();
  res.status(401).json({ error: 'unauthorized' });
}

/* Admin allowlist for the Admin tabs (Settings / Change log) and their APIs.
   Usernames are free-form at login, so match loosely: case-insensitive,
   ignoring dots/spaces/punctuation — "Troy.Steiss", "troy steiss" and
   "TroySteiss" all match. Override/extend with ADMIN_USERS (comma-separated). */
const normUser = (u: any): string => String(u || '').toLowerCase().replace(/[^a-z]/g, '');
const ADMIN_USERS = new Set((process.env.ADMIN_USERS || 'Troy Steiss,Riley Combs').split(',').map(normUser).filter(Boolean));
export const isAdminUser = (u?: string): boolean => !!u && ADMIN_USERS.has(normUser(u));

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.authed && isAdminUser(req.session.username)) return next();
  res.status(403).json({ error: 'Admin access is limited to authorized users' });
}

export function login(req: Request, res: Response) {
  const { username, password } = req.body || {};
  const expected = process.env.APP_PASSWORD || 'northdakota';
  const user = typeof username === 'string' ? username.trim().slice(0, 60) : '';
  if (!user) return res.status(400).json({ error: 'Username is required' });
  if (typeof password === 'string' && password === expected) {
    req.session.authed = true;
    req.session.username = user;
    return res.json({ ok: true, username: user, isAdmin: isAdminUser(user) });
  }
  res.status(401).json({ error: 'Incorrect password' });
}

export function logout(req: Request, res: Response) {
  req.session.destroy(() => res.json({ ok: true }));
}

export async function status(req: Request, res: Response) {
  // App title is served pre-auth so the login card can show it.
  let appTitle = '';
  try { appTitle = (await query<{ app_title: string }>('select app_title from app_meta where id=1')).rows[0]?.app_title || ''; } catch { /* pre-migration */ }
  const authed = !!(req.session && req.session.authed && req.session.username);
  res.json({ authed, username: authed ? req.session.username : '', isAdmin: authed && isAdminUser(req.session.username), appTitle });
}
