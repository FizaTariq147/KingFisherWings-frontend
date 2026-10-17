import { useCallback, useMemo } from 'react';
import {
  useFavouritesList,
  useFavouritesMutations,
} from '@/features/favourites/hooks/useFavourites';

/**
 * Report catalogue favorites via GET/POST /favourites (kind=report_template).
 * `target_key` is the stable template `code` (not a UUID).
 */
export function useReportFavorites() {
  const list = useFavouritesList(true);
  const { toggle } = useFavouritesMutations();

  const favorites = useMemo(() => {
    const items = list.data ?? [];
    return items
      .filter((f) => {
        const kind = f.kind.trim().toLowerCase();
        return kind === 'report_template' || kind === 'report';
      })
      .map((f) => f.target_key.trim())
      .filter(Boolean);
  }, [list.data]);

  const isFavorite = useCallback(
    (code: string) => favorites.includes(code.trim()),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (code: string, label?: string) => {
      const key = code.trim();
      if (!key) return;
      void toggle.mutateAsync({
        kind: 'report_template',
        target_key: key,
        ...(label?.trim() ? { label: label.trim() } : {}),
      });
    },
    [toggle],
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoading: list.isLoading,
    isPending: toggle.isPending,
  };
}
