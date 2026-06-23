import 'dotenv/config';
import express from 'express';
import { join } from 'node:path';
import { sessionMiddleware, requireAuth, login, logout, status } from './auth.js';
import { api } from './routes.js';

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

// static UI
app.use(express.static(publicDir));
app.get('*', (_req, res) => res.sendFile(join(publicDir, 'index.html')));

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`ND SP Tracker listening on http://localhost:${port}`));
