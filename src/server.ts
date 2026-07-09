import 'dotenv/config';
import express from 'express';
import { join } from 'node:path';
import { sessionMiddleware, requireAuth, login, logout, status } from './auth.js';
import { api } from './routes.js';
import { runMigrations } from './migrate.js';
import { seedIfEmpty } from './seed-if-empty.js';

// Anchor to the working directory so the path is correct in dev (tsx from src/)
// and in production (compiled to dist/). Railway runs from the repo root.
const publicDir = join(process.cwd(), 'public');

const app = express();
app.set('trust proxy', 1); // Railway terminates TLS in front of us
app.use(express.json({ limit: '30mb' }));
app.use(sessionMiddleware());

// auth endpoints (open)
app.post('/api/login', login);
app.post('/api/logout', logout);
app.get('/api/auth/status', status);
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// everything else under /api requires auth
app.use('/api', requireAuth, api);

// JSON error handler for the wrapped async routes (see routes.ts) — log and
// answer 500 instead of letting the error take the process down.
app.use('/api', (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API error:', err?.stack || err);
  if (!res.headersSent) res.status(500).json({ error: err?.message || 'internal error' });
});
process.on('unhandledRejection', (e) => console.error('unhandledRejection:', e));

// static UI
app.use(express.static(publicDir));
app.get('*', (_req, res) => res.sendFile(join(publicDir, 'index.html')));

// Run DB migrations + first-boot seed in-process, then always start listening.
// Retry a few times in case the database isn't accepting connections yet on a
// fresh deploy. If it never succeeds we still bind the port (so the health check
// passes and the error is visible in logs) rather than crash-looping.
async function start() {
  let initialized = false;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await runMigrations();
      await seedIfEmpty();
      initialized = true;
      break;
    } catch (e) {
      console.error(`DB init attempt ${attempt}/5 failed:`, e instanceof Error ? e.message : e);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  if (!initialized) console.error('DB init did not complete — starting server anyway; API calls will error until the database is reachable.');

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => console.log(`SP Tracker listening on :${port}`));
}
start();
