import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SRC = 'C:/Users/TroySteiss/Downloads/ND_SP_Tracker_10.html';
const html = readFileSync(SRC, 'utf8');
mkdirSync('public', { recursive: true });

// --- CSS ---
const css = html.slice(html.indexOf('<style>') + 7, html.indexOf('</style>'));
writeFileSync('public/styles.css', css.trim() + '\n', 'utf8');

// --- main app script (the inline <script> that defines boot) ---
// Find all <script>...</script> blocks; pick the one containing "function boot".
const scriptRe = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g;
let m, appScript = null;
while ((m = scriptRe.exec(html))) {
  const tag = html.slice(m.index, m.index + 30);
  if (tag.includes('src=')) continue;          // CDN
  if (/id\s*=\s*["']seed-data["']/.test(tag)) continue; // seed data
  if (m[1].includes('function boot')) { appScript = m[1]; break; }
}
if (!appScript) throw new Error('Could not locate main app script');
writeFileSync('scripts/app.raw.js', appScript, 'utf8');
console.log('Wrote public/styles.css (%d bytes) and scripts/app.raw.js (%d bytes)', css.length, appScript.length);
