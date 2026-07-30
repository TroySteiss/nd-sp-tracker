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
export const normUser = (u: any): string => String(u || '').toLowerCase().replace(/[^a-z]/g, '');

/* Two admin tiers.
   ADMIN   — full control: Settings, the user roster, backup/restore/reset,
             countersigning, clearing a revision flag, bid approval, the change log.
   MANAGER — second level. Named and allowlisted so the tier exists and the people
             in it are on record, but it currently carries EXACTLY the same rights
             as a plain user: no change log, no bid approval. It is a place to hang
             future permissions, not a grant. Widening it means changing the gates
             in routes.ts (they all check isAdminUser today), not this file.
   Both are env allowlists so they survive a database restore; the app_users
   roster only ever adds 'user' / 'pm'. Names match loosely (letters only), so
   "Holly Haman", "holly.haman" and "HollyHaman" are the same person. */
const ADMIN_USERS = new Set((process.env.ADMIN_USERS || 'Troy Steiss,Riley Combs').split(',').map(normUser).filter(Boolean));
// Purdue/Perdue both listed — the spelling in use varies and a mismatch would
// silently drop someone to a plain user.
const MANAGER_USERS = new Set(
  (process.env.MANAGER_USERS || 'Holly Haman,Brittanee Purdue,Brittanee Perdue').split(',').map(normUser).filter(Boolean)
);

export const isAdminUser = (u?: string): boolean => !!u && ADMIN_USERS.has(normUser(u));
/** Second-tier admin. Admins are managers too — the tiers nest. */
export const isManagerUser = (u?: string): boolean =>
  !!u && (ADMIN_USERS.has(normUser(u)) || MANAGER_USERS.has(normUser(u)));

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.authed && isAdminUser(req.session.username)) return next();
  res.status(403).json({ error: 'This action is limited to top-level admins' });
}


/* ---------- Roles (app_users, migration 023) ----------
   'admin' — the env allowlist, always wins; full view + Settings/Change log.
   'user'  — full view, no admin tabs. The default for anyone not on the roster,
             so adding this feature downgrades nobody.
   'pm'    — the stripped /pm view, scoped to the sites on their roster row.

   Login is a shared password with a free-form username, so this is a UI/route
   guardrail, not authentication. Don't treat a role as proof of identity. */
export type Role = 'admin' | 'manager' | 'user' | 'pm';

export interface UserRecord { key: string; display: string; role: Role; sites: string[]; }

export async function getUserRecord(username?: string): Promise<UserRecord | null> {
  const key = normUser(username);
  if (!key) return null;
  try {
    const r = (await query<any>('select key, display, role, sites from app_users where key=$1', [key])).rows[0];
    if (!r) return null;
    return { key: r.key, display: r.display || '', role: r.role as Role, sites: Array.isArray(r.sites) ? r.sites : [] };
  } catch {
    return null; // pre-migration DB — everyone falls through to the default role
  }
}

export async function roleOf(username?: string): Promise<Role> {
  // Env allowlists are authoritative and outrank anything on the roster.
  if (isAdminUser(username)) return 'admin';
  if (isManagerUser(username)) return 'manager';
  const rec = await getUserRecord(username);
  return rec?.role === 'pm' || rec?.role === 'user' ? rec.role : 'user';
}

/** Record the display spelling on login so Settings can list real names. */
export async function touchUser(username: string): Promise<void> {
  const key = normUser(username);
  if (!key) return;
  try {
    await query(
      `insert into app_users(key, display, role) values($1,$2,$3)
       on conflict (key) do update set display=excluded.display, updated_at=now()`,
      [key, username, isAdminUser(username) ? 'admin' : isManagerUser(username) ? 'manager' : 'user']
    );
  } catch { /* pre-migration DB */ }
}

export function requirePM(req: Request, res: Response, next: NextFunction) {
  if (!(req.session && req.session.authed && req.session.username)) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

/** Roster names close enough to `key` to be a likely typo. */
async function similarUsers(key: string): Promise<string[]> {
  if (key.length < 1) return [];
  try {
    const rows = (await query<{ key: string; display: string }>('select key, display from app_users')).rows;
    return rows
      .filter((r) => r.key !== key && (r.key.startsWith(key) || key.startsWith(r.key) || lev(r.key, key) <= 2))
      .map((r) => r.display || r.key)
      .slice(0, 5);
  } catch {
    return [];
  }
}

/** Levenshtein, capped small — only used to spot login typos. */
function lev(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 3) return 99;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let last = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, last + (a[i - 1] === b[j - 1] ? 0 : 1));
      last = tmp;
    }
  }
  return prev[b.length];
}

export async function login(req: Request, res: Response) {
  const { username, password, confirmNew } = req.body || {};
  const expected = process.env.APP_PASSWORD || 'northdakota';
  const user = typeof username === 'string' ? username.trim().slice(0, 60) : '';
  if (!user) return res.status(400).json({ error: 'Username is required' });
  if (!(typeof password === 'string' && password === expected)) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  /* Usernames are free text normalised to letters, so a typo silently creates a
     brand-new account with no role and no sites — and the user just sees an
     access error later with no clue why. Confirm before minting one. The check
     runs only after the password is correct, so it never leaks the roster. */
  const key = normUser(user);
  if (!confirmNew && !isManagerUser(user) && !(await getUserRecord(user))) {
    return res.status(409).json({
      error: 'newUser',
      username: user,
      suggestions: await similarUsers(key),
    });
  }

  req.session.authed = true;
  req.session.username = user;
  touchUser(user).catch(() => { /* roster is best-effort */ });
  const role = await roleOf(user);
  res.json({ ok: true, username: user, isAdmin: role === 'admin', isManager: role === 'admin' || role === 'manager', role });
}

export function logout(req: Request, res: Response) {
  req.session.destroy(() => res.json({ ok: true }));
}

export async function status(req: Request, res: Response) {
  // App title is served pre-auth so the login card can show it.
  let appTitle = '';
  try { appTitle = (await query<{ app_title: string }>('select app_title from app_meta where id=1')).rows[0]?.app_title || ''; } catch { /* pre-migration */ }
  const authed = !!(req.session && req.session.authed && req.session.username);
  const role: Role | '' = authed ? await roleOf(req.session.username) : '';
  const rec = authed && role === 'pm' ? await getUserRecord(req.session.username) : null;
  res.json({
    authed,
    username: authed ? req.session.username : '',
    isAdmin: role === 'admin',
    isManager: role === 'admin' || role === 'manager',
    role,
    sites: rec ? rec.sites : undefined,   // PM's covered sites; drives the /pm first-run picker
    appTitle,
  });
}
