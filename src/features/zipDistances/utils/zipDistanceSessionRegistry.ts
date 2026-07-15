import type { ZipDistance } from '../types/zipDistance.types';

const STORAGE_KEY = 'kf.zipDistances.session';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readAll(): ZipDistance[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row) => {
      const rec = asRecord(row);
      return Boolean(rec && typeof rec.id === 'string' && rec.id);
    }) as ZipDistance[];
  } catch {
    return [];
  }
}

function writeAll(items: ZipDistance[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 200)));
  } catch {
    // ignore quota / private mode
  }
}

/** Remember a zip distance created/opened this session (list API may be shadowed). */
export function rememberSessionZipDistance(item: ZipDistance) {
  if (!item?.id) return;
  const next = [item, ...readAll().filter((z) => z.id !== item.id)];
  writeAll(next);
}

export function listSessionZipDistances(): ZipDistance[] {
  return readAll();
}

export function forgetSessionZipDistance(id: string) {
  writeAll(readAll().filter((z) => z.id !== id));
}
