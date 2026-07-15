import type { ZipDistance } from '../types/zipDistance.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s || undefined;
}

function num(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function bool(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 0 || value === '0') return false;
  return undefined;
}

export function normalizeZipDistance(raw: unknown): ZipDistance | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id =
    str(r.id) ||
    str(r.zip_distance_id) ||
    (typeof r.id === 'number' ? String(r.id) : undefined);
  if (!id) return null;
  const from_zip = str(r.from_zip) ?? '';
  const to_zip = str(r.to_zip) ?? '';
  return {
    id,
    from_zip,
    from_city: str(r.from_city),
    to_zip,
    to_city: str(r.to_city),
    distance: num(r.distance) ?? 0,
    unit: str(r.unit) ?? 'KM',
    is_active: bool(r.is_active) ?? true,
    deleted_at: (str(r.deleted_at) as string | null | undefined) ?? null,
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
  };
}

export function normalizeZipDistances(raw: unknown): ZipDistance[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeZipDistance).filter((z): z is ZipDistance => Boolean(z));
}

export function zipDistanceDisplayLabel(z: ZipDistance): string {
  const from = z.from_city ? `${z.from_zip} (${z.from_city})` : z.from_zip;
  const to = z.to_city ? `${z.to_zip} (${z.to_city})` : z.to_zip;
  return `${from} → ${to}`;
}
