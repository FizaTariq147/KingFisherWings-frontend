import { hasAnyFormatUiLayout } from '../data/resolveAnyFormatUiLayout';
import { layoutBlockSignature } from './layoutBlockSignature';

type LayoutLike = {
  code: string;
  name?: string;
  formatNumber?: number;
  blocks?: unknown;
};

/**
 * Build a unique, layout-backed catalogue strip.
 * - Only codes with a permanent JSON layout (registered / AutoPdf-capable)
 * - No remaining/registry extras without layouts
 * - No duplicate codes (case-insensitive)
 * - No duplicate visual templates (same block signature) — prefer seed / lower sort
 * Meta from `seed` (names, sortOrder, family) is kept when the layout exists.
 */
export function buildLayoutBackedFormatCatalog<T extends { code: string; sortOrder: number }>(
  layouts: LayoutLike[],
  seed: T[],
  mapRow: (layout: LayoutLike, seedRow: T | undefined, index: number) => T,
): T[] {
  const seedByCode = new Map<string, T>();
  for (const row of seed) {
    const key = row.code.trim().toUpperCase();
    if (!key) continue;
    if (!seedByCode.has(key)) seedByCode.set(key, row);
  }

  type Candidate = { row: T; sig: string; seeded: boolean; formatNumber: number; index: number };
  const byCode = new Map<string, Candidate>();

  layouts.forEach((layout, i) => {
    const code = String(layout.code || '').trim();
    if (!code || !hasAnyFormatUiLayout(code)) return;
    const key = code.toUpperCase();
    if (byCode.has(key)) return;
    const seedRow = seedByCode.get(key);
    const row = mapRow(layout, seedRow, i);
    byCode.set(key, {
      row,
      sig: layoutBlockSignature(layout.blocks) || `code:${key}`,
      seeded: Boolean(seedRow),
      formatNumber: Number(layout.formatNumber) || row.sortOrder || i + 1,
      index: i,
    });
  });

  // Prefer seeded / lower formatNumber when several codes share one visual template.
  const bySig = new Map<string, Candidate>();
  const ranked = [...byCode.values()].sort((a, b) => {
    if (a.seeded !== b.seeded) return a.seeded ? -1 : 1;
    if (a.row.sortOrder !== b.row.sortOrder) return a.row.sortOrder - b.row.sortOrder;
    if (a.formatNumber !== b.formatNumber) return a.formatNumber - b.formatNumber;
    return a.row.code.localeCompare(b.row.code);
  });
  for (const cand of ranked) {
    if (bySig.has(cand.sig)) continue;
    bySig.set(cand.sig, cand);
  }

  return [...bySig.values()]
    .map((c) => c.row)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code));
}

/** Drop catalogue rows that have no permanent JSON layout. */
export function filterToRegisteredLayouts<T extends { code: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    const key = row.code.trim().toUpperCase();
    if (!key || seen.has(key)) continue;
    if (!hasAnyFormatUiLayout(row.code)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}
