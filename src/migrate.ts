import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pool } from './db.js';

const migrationsDir = join(process.cwd(), 'migrations');

async function run() {
  await pool.query('create table if not exists _migrations (name text primary key, applied_at timestamptz default now())');
  const applied = new Set((await pool.query('select name from _migrations')).rows.map((r) => r.name));
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    if (applied.has(f)) { console.log(`= skip ${f} (already applied)`); continue; }
    const sql = readFileSync(join(migrationsDir, f), 'utf8');
    console.log(`+ applying ${f}`);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('insert into _migrations(name) values($1)', [f]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      console.error(`! failed ${f}:`, e);
      throw e;
    } finally {
      client.release();
    }
  }
  console.log('migrations complete');
  await pool.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
