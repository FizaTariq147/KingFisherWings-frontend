import type { Tariff } from '../types/tariff.types';

const STORAGE_KEY = 'kf.onlineTariffs.session';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readAll(): Tariff[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row) => {
      const rec = asRecord(row);
      return Boolean(rec && typeof rec.id === 'string' && rec.id);
    }) as Tariff[];
  } catch {
    return [];
  }
}

function writeAll(items: Tariff[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 200)));
  } catch {
    // ignore quota / private mode
  }
}

/** Remember a tariff created in this browser session (list API may be shadowed). */
export function rememberSessionTariff(tariff: Tariff) {
  if (!tariff?.id) return;
  const next = [tariff, ...readAll().filter((t) => t.id !== tariff.id)];
  writeAll(next);
}

export function listSessionTariffs(): Tariff[] {
  return readAll();
}

export function forgetSessionTariff(id: string) {
  writeAll(readAll().filter((t) => t.id !== id));
}
