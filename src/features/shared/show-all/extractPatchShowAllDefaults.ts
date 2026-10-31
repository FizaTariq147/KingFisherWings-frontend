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
  'bl_number',
  'rotation_number',
  'container_number',
  'container_status',
  'vessel_name',
  'vessel_number',
  'voyage_number',
  'line_code',
  'line_no',
  'company_code',
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
  bl: 'bl_number',
  primary_container_number: 'container_number',
  primary_container_status: 'container_status',
  edi_company_code: 'company_code',
  shipping_line_code: 'line_code',
  vessel: 'vessel_name',
  voyage: 'voyage_number',
  origin_name: 'origin_port_name',
  origin_code: 'origin_port_code',
  destination_port_name: 'dest_port_name',
  destination_port_code: 'dest_port_code',
  dest_name: 'dest_port_name',
  dest_code: 'dest_port_code',
  billing_party: 'billing_party_name',
  customer: 'customer_name',
};

/** Nested party/port objects from show_all → flat PatchShowAllDto fields (compact keys). */
const NESTED_ENTITY: Record<
  string,
  { name: keyof PatchShowAllDto; code: keyof PatchShowAllDto }
> = {
  originport: { name: 'origin_port_name', code: 'origin_port_code' },
  pol: { name: 'origin_port_name', code: 'origin_port_code' },
  destport: { name: 'dest_port_name', code: 'dest_port_code' },
  destinationport: { name: 'dest_port_name', code: 'dest_port_code' },
  pod: { name: 'dest_port_name', code: 'dest_port_code' },
  shipper: { name: 'shipper_name', code: 'shipper_code' },
  consignee: { name: 'consignee_name', code: 'consignee_code' },
  billingparty: { name: 'billing_party_name', code: 'billing_party_code' },
  agent: { name: 'agent_name', code: 'agent_code' },
  carrier: { name: 'carrier_name', code: 'carrier_code' },
  customer: { name: 'customer_name', code: 'customer_code' },
};

function compactKey(key: string): string {
  return normalizeKey(key).replace(/_/g, '');
}

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
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

function setIfEmpty(
  into: PatchShowAllDto,
  key: keyof PatchShowAllDto,
  value: string | number | undefined,
): void {
  if (value == null || value === '') return;
  const cur = into[key];
  if (cur != null && cur !== '') return;
  into[key] = value as never;
}

function collectNestedEntity(
  key: string,
  value: unknown,
  into: PatchShowAllDto,
): boolean {
  const mapping = NESTED_ENTITY[compactKey(key)];
  if (!mapping) return false;
  const rec = asRecord(value);
  if (!rec) {
    const s = pickString(value);
    if (s) setIfEmpty(into, mapping.name, s);
    return true;
  }
  const name =
    pickString(rec.name) ||
    pickString(rec.label) ||
    pickString(rec.display_name) ||
    pickString(rec.displayName) ||
    pickString(rec.port_name) ||
    pickString(rec.party_name);
  const code =
    pickString(rec.code) ||
    pickString(rec.port_code) ||
    pickString(rec.party_code) ||
    pickString(rec.unlocode) ||
    pickString(rec.iata);
  setIfEmpty(into, mapping.name, name);
  setIfEmpty(into, mapping.code, code);
  return true;
}

function collectFromRecord(
  rec: Record<string, unknown>,
  into: PatchShowAllDto,
): void {
  for (const [rawKey, rawVal] of Object.entries(rec)) {
    if (collectNestedEntity(rawKey, rawVal, into)) continue;

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
  if (depth > 6) return;
  const rec = asRecord(value);
  if (!rec) return;
  collectFromRecord(rec, into);
  for (const [key, nested] of Object.entries(rec)) {
    if (!nested || typeof nested !== 'object') continue;
    // Nested entities already flattened in collectFromRecord; still walk for deeper bags.
    if (NESTED_ENTITY[compactKey(key)]) continue;
    walk(nested, into, depth + 1);
  }
}

/**
 * Prefill Show All edit form from aggregated Show All sections / entity payload /
 * last PATCH body. Prefer first non-empty value found for each PatchShowAllDto field.
 */
export function extractPatchShowAllDefaults(
  sources: unknown[],
): PatchShowAllDto {
  const into: PatchShowAllDto = {};
  for (const source of sources) {
    if (source == null) continue;
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
      if (Array.isArray(rec.arrays)) {
        for (const block of rec.arrays) {
          const b = asRecord(block);
          if (Array.isArray(b?.rows)) {
            for (const row of b.rows) walk(row, into);
          }
        }
      }
      // Also walk root in case PATCH returned flat show_all beside sections.
      walk(rec, into);
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

/** Merge a successful PATCH payload + optional API response into overlay for reopen. */
export function mergeShowAllSavedOverlay(
  previous: PatchShowAllDto,
  submitted: PatchShowAllDto,
  response?: unknown,
): PatchShowAllDto {
  const fromResponse = response != null ? extractPatchShowAllDefaults([response]) : {};
  return {
    ...previous,
    ...submitted,
    ...fromResponse,
  };
}
