import { execFile, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

/* Office → PDF conversion via headless LibreOffice.
   Bid documents embed into contract Exhibit A & B, and only PDF/JPG/PNG can be
   embedded — so Office uploads are converted to PDF at upload time (the
   original is stored alongside for the record). On Railway, LibreOffice is
   installed by nixpacks.toml; locally it's the standard Windows install. */

const OFFICE_EXTS = new Set(['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.rtf', '.odt', '.ods', '.odp']);
export const isOfficeDoc = (name: string): boolean => OFFICE_EXTS.has(extname(String(name || '')).toLowerCase());

let sofficeCache: string | null | undefined;
/** Locate a WORKING LibreOffice binary (env override → known installs → PATH).
    The PATH candidate is actually executed once (--version) so a missing
    binary reports "unavailable" instead of failing at conversion time. */
export function findSoffice(): string | null {
  if (sofficeCache !== undefined) return sofficeCache;
  const absolute = [
    process.env.SOFFICE_PATH,
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
  ].filter(Boolean) as string[];
  for (const c of absolute) { if (existsSync(c)) { sofficeCache = c; return c; } }
  try {
    execFileSync('soffice', ['--version'], { timeout: 20000, stdio: 'ignore', windowsHide: true });
    sofficeCache = 'soffice';
  } catch { sofficeCache = null; }
  return sofficeCache;
}

/** True when conversion is available on this server (used by /healthz). */
export function conversionAvailable(): boolean { return findSoffice() !== null; }

/**
 * Convert an Office document buffer to PDF. Returns the PDF bytes, or null if
 * LibreOffice is unavailable or the conversion fails — callers decide how to
 * respond (bid uploads refuse with a clear message rather than store a file
 * that can never embed).
 */
export async function officeToPdf(buffer: Buffer, name: string): Promise<Buffer | null> {
  const soffice = findSoffice();
  if (!soffice) return null;
  const work = await mkdtemp(join(tmpdir(), 'sp-conv-'));
  try {
    const safe = basename(String(name || 'doc')).replace(/[^\w. -]/g, '_') || ('doc' + extname(name || '.docx'));
    const src = join(work, safe);
    await writeFile(src, buffer);
    // A unique user profile per run avoids LibreOffice's profile lock, so
    // concurrent conversions don't fail.
    const profile = pathToFileURL(join(work, 'profile')).href;
    await new Promise<void>((resolve, reject) => {
      execFile(soffice,
        [`-env:UserInstallation=${profile}`, '--headless', '--norestore', '--convert-to', 'pdf', '--outdir', work, src],
        { timeout: 120000, windowsHide: true },
        (err, _stdout, stderr) => err ? reject(new Error(String(stderr || err.message))) : resolve());
    });
    const out = (await readdir(work)).find((f) => f.toLowerCase().endsWith('.pdf'));
    if (!out) return null;
    const pdf = await readFile(join(work, out));
    // LibreOffice sometimes exits 0 with an empty/invalid file — sanity-check the magic bytes.
    return pdf.length > 4 && pdf.subarray(0, 4).toString() === '%PDF' ? pdf : null;
  } catch (e) {
    console.error('office→pdf conversion failed:', e instanceof Error ? e.message : e);
    return null;
  } finally {
    await rm(work, { recursive: true, force: true }).catch(() => {});
  }
}
