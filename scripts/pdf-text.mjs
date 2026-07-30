// Extract the drawn text out of a generated PDF, page by page.
//
// Used by contract-snapshot.mjs to verify that a refactor of the contract
// generator didn't change the document. Compare this output, not the file bytes:
// pdf-lib's output is not byte-deterministic, so a checksum tells you nothing.
//
// Only the page's own content stream is read. Text inside an embedded bid page
// lives in a Form XObject and does NOT appear here — which is what we want, since
// the bid is opaque pass-through content. Page counts still prove page selection,
// and a 'cover' mark's REMOVED label is drawn by us, so it does show up.
import { PDFDocument, PDFArray, PDFName, PDFRawStream, decodePDFRawStream } from 'pdf-lib';

/** Decode a PDF literal-string body, resolving the standard escapes. */
function decodeLiteral(s) {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '\\') { out += s[i]; continue; }
    const c = s[++i];
    if (c === undefined) break;
    if (c === 'n') out += '\n';
    else if (c === 'r') out += '\r';
    else if (c === 't') out += '\t';
    else if (c === 'b') out += '\b';
    else if (c === 'f') out += '\f';
    else if (c >= '0' && c <= '7') {              // \ddd octal
      let oct = c;
      while (oct.length < 3 && s[i + 1] >= '0' && s[i + 1] <= '7') oct += s[++i];
      out += String.fromCharCode(parseInt(oct, 8));
    } else out += c;                               // \( \) \\ and friends
  }
  return out;
}

/** <48454C4C4F> → "HELLO". pdf-lib writes strings this way for standard fonts. */
function decodeHex(body) {
  const hex = body.replace(/[^0-9A-Fa-f]/g, '');
  let out = '';
  for (let i = 0; i + 1 < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
  return out;
}

/** Pull the show-text operands out of one decoded content stream, in order. */
function textOf(stream) {
  const src = stream.toString('latin1');
  const words = [];
  const shows = /^\s*(?:[-\d.\s]*)(?:Tj|TJ|'|")/;   // the operator that draws it

  for (let i = 0; i < src.length; i++) {
    if (src[i] === '<' && src[i + 1] !== '<') {      // hex string (not a dict)
      const end = src.indexOf('>', i);
      if (end < 0) break;
      const body = src.slice(i + 1, end);
      if (shows.test(src.slice(end + 1, end + 24))) words.push(decodeHex(body));
      i = end;
      continue;
    }
    if (src[i] !== '(') continue;                    // literal string
    let depth = 1, j = i + 1, body = '';
    while (j < src.length) {
      if (src[j] === '\\') { body += src[j] + (src[j + 1] ?? ''); j += 2; continue; }
      if (src[j] === '(') depth++;
      else if (src[j] === ')') { depth--; if (!depth) break; }
      body += src[j]; j++;
    }
    if (shows.test(src.slice(j + 1, j + 24))) words.push(decodeLiteral(body));
    i = j;
  }
  return words;
}

/** @returns {Promise<string[]>} one whitespace-collapsed string per page */
export async function pdfText(bytes) {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = [];
  for (const page of doc.getPages()) {
    const ctx = page.node.context;
    const contents = page.node.get(PDFName.of('Contents'));
    const refs = contents instanceof PDFArray
      ? Array.from({ length: contents.size() }, (_, i) => contents.get(i))
      : [contents];
    const words = [];
    for (const ref of refs) {
      const s = ctx.lookup(ref);
      if (s instanceof PDFRawStream) words.push(...textOf(Buffer.from(decodePDFRawStream(s).decode())));
    }
    pages.push(words.join(' ').replace(/\s+/g, ' ').trim());
  }
  return pages;
}
