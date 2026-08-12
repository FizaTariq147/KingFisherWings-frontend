import type { MenuTile } from '../../features/customers/types/menu.types';

/** Case-insensitive match on title, description, and id tokens. */
export function filterMenuTiles(tiles: MenuTile[], query: string): MenuTile[] {
  const q = query.trim().toLowerCase();
  if (!q) return tiles;

  const tokens = q.split(/\s+/).filter(Boolean);
  return tiles.filter((tile) => {
    const haystack = `${tile.title} ${tile.description} ${tile.id} ${tile.section ?? ''}`.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
}
