import {
  SEARCH_RECENT_KEY,
  SEARCH_RECENT_MAX,
} from '../constants/search.constants';

export function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(SEARCH_RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .map((x) => x.trim())
      .slice(0, SEARCH_RECENT_MAX);
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string): string[] {
  const q = query.trim();
  if (!q) return loadRecentSearches();
  const next = [q, ...loadRecentSearches().filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(
    0,
    SEARCH_RECENT_MAX,
  );
  try {
    localStorage.setItem(SEARCH_RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  return next;
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(SEARCH_RECENT_KEY);
  } catch {
    /* ignore */
  }
}
