/**
 * Exact strings the live invoice renderer may paint when they are not record values.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let cached = null;

export function allowlistTexts() {
  if (cached) return cached;
  const doc = JSON.parse(fs.readFileSync(path.join(root, 'reports/label-allowlist.json'), 'utf8'));
  cached = new Set(
    [...(doc.labels || []), ...(doc.headers || []), ...(doc.legal || [])]
      .map((text) => String(text).replace(/\s+/g, ' ').trim())
      .filter(Boolean),
  );
  return cached;
}

export function isAllowlisted(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return true;
  return allowlistTexts().has(raw);
}
