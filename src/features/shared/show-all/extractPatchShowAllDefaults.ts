import type { PatchShowAllDto } from '@/features/jobs/types/job.types';

const PATCH_KEYS: (keyof PatchShowAllDto)[] = [
  'commodity',
  'pieces',
  'gross_weight',
  'volume_cbm',
  'etd',
  'eta',
  'job_date',
  'mbl_number',
  'hbl_number',
  'origin_port_name',
  'origin_port_code',
  'dest_port_name',
  'dest_port_code',
  'shipper_name',
  'shipper_code',
  'consignee_name',
  'consignee_code',
  'billing_party_name',
  'billing_party_code',
  'agent_name',
  'agent_code',
  'carrier_name',
  'carrier_code',
  'customer_name',
  'customer_code',
];

const ALIASES: Record<string, keyof PatchShowAllDto> = {
  shipment_date: 'job_date',
  grossweight: 'gross_weight',
  volume: 'volume_cbm',
  cbm: 'volume_cbm',
  mbl: 'mbl_number',
  hbl: 'hbl_number',
  origin_name: 'origin_port_name',
  origin_code: 'origin_port_code',
  destination_port_name: 'dest_port_name',
  destination_port_code: 'dest_port_code',
  dest_name: 'dest_port_name',
  dest_code: 'dest_port_code',
  billing_party: 'billing_party_name',
  customer: 'customer_name',
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[-.\s]+/g, '_');
}

function pickString(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s ? s : undefined;
}

function pickNumber(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function pickDate(value: unknown): string | undefined {
  const s = pickString(value);
  if (!s) return undefined;
  // Keep YYYY-MM-DD for date inputs when ISO datetime.
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

function collectFromRecord(
  rec: Record<string, unknown>,
  into: PatchShowAllDto,
): void {
  for (const [rawKey, rawVal] of Object.entries(rec)) {
    const norm = normalizeKey(rawKey);
    const mapped =
      (PATCH_KEYS.includes(norm as keyof PatchShowAllDto)
        ? (norm as keyof PatchShowAllDto)
        : ALIASES[norm]) ?? undefined;
    if (!mapped || (into[mapped] != null && into[mapped] !== '')) continue;

    if (
      mapped === 'pieces' ||
      mapped === 'gross_weight' ||
      mapped === 'volume_cbm'
    ) {
      const n = pickNumber(rawVal);
      if (n != null) into[mapped] = n;
      continue;
    }
    if (mapped === 'etd' || mapped === 'eta' || mapped === 'job_date') {
      const d = pickDate(rawVal);
      if (d) into[mapped] = d;
      continue;
    }
    const s = pickString(rawVal);
    if (s) into[mapped] = s;
  }
}

function walk(value: unknown, into: PatchShowAllDto, depth = 0): void {
  if (depth > 4) return;
  const rec = asRecord(value);
  if (!rec) return;
  collectFromRecord(rec, into);
  for (const nested of Object.values(rec)) {
    if (nested && typeof nested === 'object') walk(nested, into, depth + 1);
  }
}

/**
 * Prefill Show All edit form from aggregated Show All sections / entity payload.
 * Prefer first non-empty value found for each PatchShowAllDto field.
 */
export function extractPatchShowAllDefaults(
  sources: unknown[],
): PatchShowAllDto {
  const into: PatchShowAllDto = {};
  for (const source of sources) {
    if (Array.isArray(source)) {
      for (const item of source) walk(item, into);
      continue;
    }
    const rec = asRecord(source);
    if (rec && Array.isArray(rec.sections)) {
      for (const section of rec.sections) {
        const sec = asRecord(section);
        if (sec?.data) walk(sec.data, into);
      }
      continue;
    }
    walk(source, into);
  }
  return into;
}

/** Build a partial PATCH body — omit blank strings; keep explicit numbers/dates. */
export function toPatchShowAllPayload(draft: PatchShowAllDto): PatchShowAllDto {
  const out: PatchShowAllDto = {};
  for (const key of PATCH_KEYS) {
    const value = draft[key];
    if (value == null) continue;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) continue;
      out[key] = trimmed as never;
      continue;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      out[key] = value as never;
    }
  }
  return out;
}

export function isPatchShowAllFieldEmpty(
  defaults: PatchShowAllDto,
  key: keyof PatchShowAllDto,
): boolean {
  const v = defaults[key];
  if (v == null) return true;
  if (typeof v === 'string') return !v.trim();
  return false;
}
