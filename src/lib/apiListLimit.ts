/** Backend list endpoints reject `limit` above this (HTTP 400). */
export const API_LIST_LIMIT_MAX = 100;

/** Clamp a list `limit` query param to the API-allowed range [1, 100]. */
export function clampApiListLimit(limit?: number, fallback = 20): number {
  const n = Number(limit ?? fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), 1), API_LIST_LIMIT_MAX);
}
