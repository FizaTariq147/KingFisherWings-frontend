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

/**
 * Sample-shaped strings are never exempt from the empty-record leak check,
 * even when they also appear on the allowlist.
 * Numerals, dates, currency codes, punctuation-only strings, and short tokens
 * that are not allowlisted headers.
 */
export function isBareSample(text) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return false;
  if (/\d/.test(raw) && /^[\d,.\s]+$/.test(raw)) return true;
  if (/^\d{1,4}[/. -]\d{1,2}[/. -]\d{1,4}$/.test(raw)) return true;
  if (/^\d{1,2}[/-][A-Za-z]{3}[/-]\d{2,4}$/.test(raw)) return true;
  if (/^(INR|USD|AED|EUR|GBP|SGD|VND|PKR|SAR|QAR|CNY|JPY)$/i.test(raw)) return true;
  if (/^[\W_]+$/.test(raw)) return true;
  if (raw.length <= 2 && !allowlistTexts().has(raw)) return true;
  return false;
}

export function leaksOnEmptyRecord(text, supplied) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return false;
  if (supplied?.has(raw)) return false;
  if (isBareSample(raw)) return true;
  return !isAllowlisted(raw);
}
