/** Shared detail-contract helpers for path_hints / ops_continuum. */

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function normalizePathHints(raw: unknown): string[] | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    const hints = raw
      .map((h) => (typeof h === 'string' ? h.trim() : ''))
      .filter(Boolean);
    return hints.length ? hints : undefined;
  }
  const rec = asRecord(raw);
  if (!rec) return undefined;
  const hints = Object.keys(rec).filter((k) => {
    const v = rec[k];
    return v === true || v === 'true' || typeof v === 'string';
  });
  return hints.length ? hints : undefined;
}

export function normalizeOpsContinuum(
  raw: unknown,
): Record<string, unknown> | undefined {
  const rec = asRecord(raw);
  if (!rec || Object.keys(rec).length === 0) return undefined;
  return rec;
}

/** Pull path_hints + ops_continuum from a detail envelope or entity record. */
export function pickDetailHints(raw: unknown): {
  path_hints?: string[];
  ops_continuum?: Record<string, unknown>;
} {
  const rec = asRecord(raw);
  if (!rec) return {};
  const nested = asRecord(rec.data) ?? rec;
  return {
    path_hints: normalizePathHints(
      nested.path_hints ?? nested.pathHints ?? rec.path_hints ?? rec.pathHints,
    ),
    ops_continuum: normalizeOpsContinuum(
      nested.ops_continuum ??
        nested.opsContinuum ??
        rec.ops_continuum ??
        rec.opsContinuum,
    ),
  };
}
