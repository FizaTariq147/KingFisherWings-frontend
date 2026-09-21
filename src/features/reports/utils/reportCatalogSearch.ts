/**
 * Shared report-catalogue search — normalize, tokenize, match, and rank.
 * Used by the browse list, format strips, and registry filters.
 */

/** Lowercase; turn `_` `/` `-` `.` `,` into spaces so codes match human queries. */
export function normalizeReportSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_\-/.,+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split query into tokens. Keeps every non-empty piece (including 1-letter and digits)
 * so filtering starts as soon as the user types anything.
 */
export function tokenizeReportSearch(searchQuery: string): string[] {
  const q = normalizeReportSearchText(searchQuery);
  if (!q) return [];
  return [...new Set(q.split(' ').filter(Boolean))];
}

/** True when the search box has any non-empty query (drives strip visibility + match count). */
export function isReportSearchActive(searchQuery: string): boolean {
  return normalizeReportSearchText(searchQuery).length > 0;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Digit tokens must hit a format number / standalone number — not every "1" inside "21". */
function digitTokenMatches(hay: string, digit: string): boolean {
  const n = escapeRegExp(digit);
  return (
    new RegExp(`(?:^|\\s)format\\s*${n}(?:\\s|$)`).test(hay) ||
    new RegExp(`(?:^|\\s)f\\s*${n}(?:\\s|$)`).test(hay) ||
    new RegExp(`(?:^|\\s|#)${n}(?:\\s|$)`).test(hay) ||
    new RegExp(`(?:^|\\s)${n}(?:\\s|$)`).test(hay)
  );
}

export function matchesReportSearchTokens(haystack: string, tokens: string[]): boolean {
  if (!tokens.length) return true;
  const hay = normalizeReportSearchText(haystack);
  return tokens.every((token) => {
    if (/^\d+$/.test(token)) return digitTokenMatches(hay, token);
    // 1–2 letter tokens: match as a word prefix so "i" → invoice, "in" → india.
    // "do" is whole-word only (alias for Delivery Order — avoid matching "document").
    if (token.length <= 2) {
      if (token === 'do') {
        return /(?:^|\s)do(?:\s|$)/.test(hay);
      }
      return new RegExp(`(?:^|\\s)${escapeRegExp(token)}`).test(hay);
    }
    return hay.includes(token);
  });
}

export type ReportSearchableRow = {
  name: string;
  code: string;
  description?: string;
  family?: string;
  kind?: string;
  /** When known (invoice Format-N), improves "format 3" / "f3" matching. */
  formatNumber?: number;
};

/** Build a rich haystack so short aliases and format numbers resolve accurately. */
export function buildReportSearchHaystack(row: ReportSearchableRow): string {
  const parts = [row.name, row.code, row.description ?? '', row.family ?? '', row.kind ?? ''];

  const formatNo =
    row.formatNumber ??
    (() => {
      const fromCode = row.code.match(/(?:FORMAT|format)[_-]?(\d+)/);
      if (fromCode) return Number(fromCode[1]);
      const fromName = row.name.match(/Format-(\d+)/i);
      if (fromName) return Number(fromName[1]);
      return undefined;
    })();

  if (formatNo != null && Number.isFinite(formatNo)) {
    parts.push(`format ${formatNo}`, `format-${formatNo}`, `f${formatNo}`, `#${formatNo}`);
  }

  const blob = `${row.code} ${row.name} ${row.kind ?? ''}`.toLowerCase();
  if (/\bhbl\b/.test(blob) || blob.includes('house bill')) {
    parts.push('hbl', 'house bill', 'bill of lading', 'sea');
  }
  if (/\bhawb\b/.test(blob) || blob.includes('house air')) {
    parts.push('hawb', 'house air waybill', 'air waybill', 'air');
  }
  if (/\bmawb\b/.test(blob) || blob.includes('master air')) {
    parts.push('mawb', 'master air waybill', 'air');
  }
  if (blob.includes('arrival notice') || /\barrival_notice\b/.test(blob)) {
    parts.push('arrival notice', 'can', 'cargo arrival');
  }
  if (blob.includes('delivery order') || blob.includes('delivery_order') || /\bdo\b/.test(blob)) {
    parts.push('delivery order', 'do');
  }
  if (blob.includes('quotation') || blob.includes('quote')) {
    parts.push('quotation', 'quote');
  }
  if (blob.includes('invoice') || blob.includes('debit note') || blob.includes('credit note')) {
    parts.push('invoice', 'commercial');
  }
  if (blob.includes('tax invoice') || blob.includes('india')) {
    parts.push('tax', 'india', 'gst');
  }
  if (blob.includes('arabic')) parts.push('arabic', 'uae', 'gcc');
  if (blob.includes('warehouse') || /\bwms\b/.test(blob)) parts.push('wms', 'warehouse');

  return normalizeReportSearchText(parts.join(' '));
}

export function reportCatalogRowMatchesSearch(
  row: ReportSearchableRow,
  searchQuery: string,
): boolean {
  const tokens = tokenizeReportSearch(searchQuery);
  if (!tokens.length) return true;
  return matchesReportSearchTokens(buildReportSearchHaystack(row), tokens);
}

/** @deprecated Prefer reportCatalogRowMatchesSearch — kept for existing call sites. */
export function reportTemplateMatchesSearch(
  item: { name: string; code: string; description?: string; family?: string },
  searchQuery: string,
): boolean {
  return reportCatalogRowMatchesSearch(item, searchQuery);
}

/**
 * Section hit-test: true when any catalog row matches every search token.
 * Empty / whitespace-only query → false (caller treats as “no search”).
 */
export function catalogRowsMatchSearch(
  rows: ReadonlyArray<ReportSearchableRow>,
  searchQuery: string,
): boolean {
  const tokens = tokenizeReportSearch(searchQuery);
  if (!tokens.length) return false;
  return rows.some((row) => reportCatalogRowMatchesSearch(row, searchQuery));
}

/**
 * Relevance score for sorting search hits (higher = better).
 * Exact / prefix name matches rank above code-only hits.
 */
export function scoreReportSearchMatch(row: ReportSearchableRow, searchQuery: string): number {
  const tokens = tokenizeReportSearch(searchQuery);
  if (!tokens.length) return 0;
  if (!reportCatalogRowMatchesSearch(row, searchQuery)) return -1;

  const name = normalizeReportSearchText(row.name);
  const code = normalizeReportSearchText(row.code);
  const q = normalizeReportSearchText(searchQuery);
  let score = 10;

  if (name === q || code === q) score += 100;
  if (name.startsWith(q)) score += 50;
  if (name.includes(q)) score += 30;
  if (code.includes(q.replace(/\s+/g, ' '))) score += 20;

  for (const token of tokens) {
    if (name.startsWith(token)) score += 8;
    else if (name.includes(token)) score += 4;
    if (code.includes(token)) score += 3;
    if (/^\d+$/.test(token) && digitTokenMatches(buildReportSearchHaystack(row), token)) {
      score += 15;
    }
  }

  return score;
}

export function sortReportSearchResults<T extends ReportSearchableRow>(
  rows: readonly T[],
  searchQuery: string,
): T[] {
  const tokens = tokenizeReportSearch(searchQuery);
  if (!tokens.length) return [...rows];
  return [...rows]
    .map((row) => ({ row, score: scoreReportSearchMatch(row, searchQuery) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score || a.row.name.localeCompare(b.row.name))
    .map((x) => x.row);
}
