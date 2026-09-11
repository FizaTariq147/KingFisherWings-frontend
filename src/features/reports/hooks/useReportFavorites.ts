import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'kfg-report-catalog-favorites';

function readFavorites(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String).filter(Boolean);
  } catch {
    return [];
  }
}

function writeFavorites(codes: string[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
  } catch {
    /* ignore quota */
  }
}

/** Session-scoped favorites by stable template `code` (works across live + FRESA discovery). */
export function useReportFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => readFavorites());

  useEffect(() => {
    writeFavorites(favorites);
  }, [favorites]);

  const isFavorite = useCallback(
    (code: string) => favorites.includes(code),
    [favorites],
  );

  const toggleFavorite = useCallback((code: string) => {
    const key = code.trim();
    if (!key) return;
    setFavorites((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key],
    );
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
