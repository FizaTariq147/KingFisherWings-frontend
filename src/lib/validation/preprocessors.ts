/** Shared preprocessors for Zod schemas. */

export function trimString(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value.trim();
}

/** Empty / whitespace-only strings → undefined (for optional fields). */
export function emptyToUndefined(value: unknown): unknown {
  if (value === '' || value == null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  return value;
}

export function toLowerCaseEmail(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value.trim().toLowerCase();
}

export function toUpperCaseCode(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value.trim().toUpperCase();
}

/** Coerce form select/input empties to number | undefined. */
export function emptyToNumber(value: unknown): unknown {
  if (value === '' || value == null) return undefined;
  if (typeof value === 'number') return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : value;
}

/** Extract ISO-3166 alpha-2 from "Name (AE)" labels or raw codes. */
export function normalizeIsoCountryCode(value: unknown): string {
  const raw = String(value ?? '').trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(raw)) return raw;
  const paren = raw.match(/\(([A-Z]{2})\)\s*$/);
  if (paren?.[1]) return paren[1];
  const token = raw.match(/\b([A-Z]{2})\b/);
  return token?.[1] ?? raw;
}

/**
 * Normalize a name for validation:
 * - trim ends
 * - collapse consecutive whitespace to a single space
 */
export function normalizeName(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Logical name: has at least one letter, allowed charset, sensible start/end.
 * Allows trailing "." for abbreviations (Inc., Ltd., Co.).
 */
export function isLogicalName(value: string): { ok: true } | { ok: false; reason: 'chars' | 'logical' | 'edges' } {
  const v = value.trim();
  // Unicode letters (any language) + marks + numbers + common punctuation
  if (!/^[\p{L}\p{M}0-9\s\-'&(),./]+$/u.test(v)) {
    return { ok: false, reason: 'chars' };
  }
  if (!/\p{L}/u.test(v)) {
    return { ok: false, reason: 'logical' };
  }
  // Must start with a letter or number (not punctuation)
  if (!/^[\p{L}\p{M}0-9]/u.test(v)) {
    return { ok: false, reason: 'edges' };
  }
  // Must end with letter, number, or a single period after a word char (Inc.)
  if (!/[\p{L}\p{M}0-9]$/u.test(v) && !/[\p{L}\p{M}0-9]\.$/u.test(v)) {
    return { ok: false, reason: 'edges' };
  }
  return { ok: true };
}

/**
 * Stricter check for department (and similar) display names:
 * valid charset + enough letters + not digit/junk-dominated.
 */
export function isValidLogicalDepartmentName(
  value: string,
): { ok: true } | { ok: false; reason: 'logical' | 'letters' | 'junk' } {
  const v = value.trim().replace(/\s+/g, ' ');
  const logical = isLogicalName(v);
  if (!logical.ok) {
    return { ok: false, reason: 'logical' };
  }

  const letters = v.match(/\p{L}/gu) ?? [];
  if (letters.length < 2) {
    return { ok: false, reason: 'letters' };
  }

  const digits = (v.match(/\d/g) ?? []).length;
  // Digit-heavy strings are codes, not department names (e.g. "1234A", "99-99").
  if (digits > 0 && digits >= letters.length) {
    return { ok: false, reason: 'junk' };
  }

  // Reject keyboard smash / filler (aaaa, #### already caught by charset).
  const compacted = v.replace(/\s+/g, '');
  if (/(.)\1{3,}/u.test(compacted)) {
    return { ok: false, reason: 'junk' };
  }

  // Must start with a letter (departments are labels, not numeric codes).
  if (!/^\p{L}/u.test(v)) {
    return { ok: false, reason: 'logical' };
  }

  return { ok: true };
}
