/** Shared token helpers for report catalog search (browse list + strips). */

export function tokenizeReportSearch(searchQuery: string): string[] {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return [];
  // Ignore 1-char tokens — they match almost every code/name and feel broken.
  return q.split(/\s+/).filter((token) => token.length >= 2);
}

export function matchesReportSearchTokens(
  haystack: string,
  tokens: string[],
): boolean {
  if (!tokens.length) return true;
  const hay = haystack.toLowerCase();
  return tokens.every((token) => hay.includes(token));
}

export function reportTemplateMatchesSearch(
  item: { name: string; code: string; description?: string; family?: string },
  searchQuery: string,
): boolean {
  const tokens = tokenizeReportSearch(searchQuery);
  if (!tokens.length) return true;
  return matchesReportSearchTokens(
    `${item.name} ${item.code} ${item.description ?? ''} ${item.family ?? ''}`,
    tokens,
  );
}

/**
 * Dynamic section hit-test: true when any catalog row's name/code/kind
 * contains every search token. No hardcoded aliases.
 */
export function catalogRowsMatchSearch(
  rows: ReadonlyArray<{ name: string; code: string; kind?: string }>,
  searchQuery: string,
): boolean {
  const tokens = tokenizeReportSearch(searchQuery);
  if (!tokens.length) return false;
  return rows.some((row) =>
    matchesReportSearchTokens(`${row.name} ${row.code} ${row.kind ?? ''}`, tokens),
  );
}
