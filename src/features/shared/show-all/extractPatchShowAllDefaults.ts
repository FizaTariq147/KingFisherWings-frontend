import type {
  PatchShowAllDto,
  ShowAllTransportDto,
  ShowAllWarehouseDto,
} from '@/features/jobs/types/job.types';

const PATCH_KEYS: (keyof PatchShowAllDto)[] = [
  'commodity',
  'commodity_description',
  'payable_at',
  'freight_payable_at',
  'chargeable_units',
  'chargeable_unit',
  'chargeable_weight',
  'service_scope',
  'service_type',
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
  'location_terminal',
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
  // Air / MAWB (PATCH show_all writes same as PUT detail/mawb)
  'flight_no',
  'flight_number',
  'flight_status',
  'flight_date',
  'arrival_flight_number',
  'airline_name',
  'mawb_no',
  'mawb_number',
  'hawb_no',
  'hawb_number',
  'shipment_date',
  'pallet_count',
  'dimensions',
  'weight',
];

/** Fields BE accepts as null / "" to clear on show_all PATCH. */
const CLEARABLE_KEYS = new Set<keyof PatchShowAllDto>([
  'commodity',
  'commodity_description',
  'payable_at',
  'freight_payable_at',
  'chargeable_units',
  'chargeable_unit',
  'chargeable_weight',
  'service_scope',
  'service_type',
  'flight_no',
  'flight_number',
  'flight_status',
  'flight_date',
  'arrival_flight_number',
  'airline_name',
  'mawb_no',
  'mawb_number',
  'hawb_no',
  'hawb_number',
  'shipment_date',
  'pallet_count',
  'dimensions',
  'weight',
  'gross_weight',
  'volume_cbm',
  /** Primary container status — OpenAPI: send null/"" to clear. */
  'container_status',
  'container_number',
]);

const ALIASES: Record<string, keyof PatchShowAllDto> = {
  // Prefer dedicated MAWB shipment_date; sea still maps into job_date via walk fallback.
  shipment_date: 'shipment_date',
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
  locationterminal: 'location_terminal',
  location_terminal: 'location_terminal',
  terminal: 'location_terminal',
  location: 'location_terminal',
  depot: 'location_terminal',
  facility: 'location_terminal',
  origin_name: 'origin_port_name',
  origin_code: 'origin_port_code',
  destination_port_name: 'dest_port_name',
  destination_port_code: 'dest_port_code',
  dest_name: 'dest_port_name',
  dest_code: 'dest_port_code',
  billing_party: 'billing_party_name',
  customer: 'customer_name',
  flight_number: 'flight_number',
  flightno: 'flight_no',
  flight_no: 'flight_no',
  mawb_number: 'mawb_number',
  mawbno: 'mawb_no',
  mawb_no: 'mawb_no',
  hawb_number: 'hawb_number',
  hawbno: 'hawb_no',
  hawb_no: 'hawb_no',
  arrival_flight: 'arrival_flight_number',
  arrivalflightnumber: 'arrival_flight_number',
  airline: 'airline_name',
  airlinename: 'airline_name',
  gross_weight_kg: 'gross_weight',
  weight_kg: 'weight',
  payable_at: 'freight_payable_at',
  freightpayableat: 'freight_payable_at',
  chargeable_unit: 'chargeable_units',
  chargeableunit: 'chargeable_units',
  commoditydescription: 'commodity_description',
  chargeableweight: 'chargeable_weight',
  servicescope: 'service_scope',
  servicetype: 'service_type',
  job_type: 'service_type',
  jobtype: 'service_type',
};

const WAREHOUSE_KEYS: (keyof ShowAllWarehouseDto)[] = [
  'warehouse_name',
  'warehouse_id',
  'expected_inbound_at',
  'expected_outbound_at',
  'storage_days_requested',
  'bonded',
  'temperature_controlled',
  'commodity',
];

const TRANSPORT_KEYS: (keyof ShowAllTransportDto)[] = [
  'pickup_address',
  'delivery_address',
  'origin_city_country',
  'destination_city_country',
  'vehicle_number',
  'driver_name',
  'driver_license',
  'trucker_id',
  'freight_terms',
];

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

function mergeWarehouseBag(
  into: PatchShowAllDto,
  raw: unknown,
): void {
  const rec = asRecord(raw);
  if (!rec) return;
  const bag: ShowAllWarehouseDto = { ...(into.warehouse ?? {}) };
  let touched = false;
  for (const key of WAREHOUSE_KEYS) {
    if (!(key in rec)) continue;
    const val = rec[key];
    if (bag[key] != null && bag[key] !== '') continue;
    if (key === 'storage_days_requested') {
      const n = pickNumber(val);
      if (n != null) {
        bag[key] = n;
        touched = true;
      }
      continue;
    }
    if (key === 'bonded' || key === 'temperature_controlled') {
      if (typeof val === 'boolean') {
        bag[key] = val;
        touched = true;
      } else if (val === 'true' || val === '1') {
        bag[key] = true;
        touched = true;
      } else if (val === 'false' || val === '0') {
        bag[key] = false;
        touched = true;
      }
      continue;
    }
    if (
      key === 'expected_inbound_at' ||
      key === 'expected_outbound_at'
    ) {
      const d = pickDate(val) || pickString(val);
      if (d) {
        bag[key] = d;
        touched = true;
      }
      continue;
    }
    const s = pickString(val);
    if (s) {
      bag[key] = s;
      touched = true;
    }
  }
  if (touched) into.warehouse = bag;
}

function mergeTransportBag(
  into: PatchShowAllDto,
  raw: unknown,
): void {
  const rec = asRecord(raw);
  if (!rec) return;
  const bag: ShowAllTransportDto = { ...(into.transport ?? {}) };
  let touched = false;
  for (const key of TRANSPORT_KEYS) {
    if (!(key in rec)) continue;
    if (bag[key] != null && bag[key] !== '') continue;
    const s = pickString(rec[key]);
    if (s) {
      bag[key] = s;
      touched = true;
    }
  }
  if (touched) into.transport = bag;
}

function collectFromRecord(
  rec: Record<string, unknown>,
  into: PatchShowAllDto,
): void {
  for (const [rawKey, rawVal] of Object.entries(rec)) {
    const compact = compactKey(rawKey);
    if (compact === 'warehouse' || compact === 'warehousebooking' || compact === 'warehouse_booking') {
      mergeWarehouseBag(into, rawVal);
      continue;
    }
    if (
      compact === 'transport' ||
      compact === 'land' ||
      compact === 'landdetails' ||
      compact === 'transportrequest'
    ) {
      mergeTransportBag(into, rawVal);
      continue;
    }

    if (collectNestedEntity(rawKey, rawVal, into)) continue;

    const norm = normalizeKey(rawKey);
    const mapped =
      (PATCH_KEYS.includes(norm as keyof PatchShowAllDto)
        ? (norm as keyof PatchShowAllDto)
        : ALIASES[norm]) ?? undefined;
    if (!mapped) continue;
    // First source wins — including intentional clears (null / "") so a removed
    // container_status is not resurrected from a stale sibling tab payload.
    if (Object.prototype.hasOwnProperty.call(into, mapped)) continue;

    if (
      CLEARABLE_KEYS.has(mapped) &&
      (rawVal === null || (typeof rawVal === 'string' && !rawVal.trim()))
    ) {
      into[mapped] = '' as never;
      continue;
    }

    if (
      mapped === 'pieces' ||
      mapped === 'gross_weight' ||
      mapped === 'volume_cbm' ||
      mapped === 'pallet_count' ||
      mapped === 'dimensions' ||
      mapped === 'weight' ||
      mapped === 'chargeable_units' ||
      mapped === 'chargeable_unit' ||
      mapped === 'chargeable_weight'
    ) {
      const n = pickNumber(rawVal);
      if (n != null) into[mapped] = n;
      continue;
    }
    if (
      mapped === 'etd' ||
      mapped === 'eta' ||
      mapped === 'job_date' ||
      mapped === 'flight_date' ||
      mapped === 'shipment_date'
    ) {
      const d = pickDate(rawVal);
      if (d) {
        into[mapped] = d;
        // Sea show_all historically used shipment_date as job_date.
        if (mapped === 'shipment_date') setIfEmpty(into, 'job_date', d);
      }
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

function nestBagChanged(
  draftBag: Record<string, unknown> | null | undefined,
  defaultsBag: Record<string, unknown> | null | undefined,
  keys: string[],
): Record<string, unknown> | null | undefined {
  if (draftBag == null && defaultsBag == null) return undefined;
  if (draftBag == null && defaultsBag != null) return null;
  const out: Record<string, unknown> = {};
  let touched = false;
  for (const key of keys) {
    const next = draftBag?.[key];
    const prev = defaultsBag?.[key];
    if (next === undefined) continue;
    if (typeof next === 'string') {
      const trimmed = next.trim();
      if (trimmed) {
        out[key] = trimmed;
        touched = true;
        continue;
      }
      if (prev != null && String(prev).trim()) {
        out[key] = null;
        touched = true;
      }
      continue;
    }
    if (typeof next === 'boolean') {
      if (next !== prev) {
        out[key] = next;
        touched = true;
      } else if (prev === undefined) {
        out[key] = next;
        touched = true;
      }
      continue;
    }
    if (typeof next === 'number' && Number.isFinite(next)) {
      out[key] = next;
      touched = true;
      continue;
    }
    if (next == null && prev != null && prev !== '') {
      out[key] = null;
      touched = true;
    }
  }
  return touched ? out : undefined;
}

/**
 * Build a partial PATCH body.
 * - Non-empty strings/numbers are sent as usual.
 * - Cleared MAWB/air fields (and related weights) send `null` so BE can clear.
 */
export function toPatchShowAllPayload(
  draft: PatchShowAllDto,
  defaults?: PatchShowAllDto,
): PatchShowAllDto {
  const out: PatchShowAllDto = {};
  for (const key of PATCH_KEYS) {
    const value = draft[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        out[key] = trimmed as never;
        continue;
      }
      // Cleared previously-filled clearable field → null.
      if (
        CLEARABLE_KEYS.has(key) &&
        defaults &&
        !isPatchShowAllFieldEmpty(defaults, key)
      ) {
        out[key] = null as never;
      }
      continue;
    }
    if (value == null) {
      if (
        CLEARABLE_KEYS.has(key) &&
        defaults &&
        !isPatchShowAllFieldEmpty(defaults, key) &&
        Object.prototype.hasOwnProperty.call(draft, key)
      ) {
        out[key] = null as never;
      }
      continue;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      out[key] = value as never;
    }
  }
  // Prefer canonical MAWB keys when both aliases are filled.
  if (out.flight_number && !out.flight_no) out.flight_no = out.flight_number;
  if (out.mawb_number && !out.mawb_no) out.mawb_no = out.mawb_number;
  if (out.hawb_number && !out.hawb_no) out.hawb_no = out.hawb_number;
  if (out.dimensions != null && out.volume_cbm == null) out.volume_cbm = out.dimensions;
  if (out.weight != null && out.gross_weight == null) out.gross_weight = out.weight;
  // Canonical commercial aliases.
  if (out.payable_at && !out.freight_payable_at) {
    out.freight_payable_at = out.payable_at;
  }
  if (out.chargeable_unit != null && out.chargeable_units == null) {
    out.chargeable_units = out.chargeable_unit;
  }
  // Prefer freight_payable_at / chargeable_units on the wire.
  delete out.payable_at;
  delete out.chargeable_unit;

  const warehouse = nestBagChanged(
    draft.warehouse as Record<string, unknown> | undefined,
    defaults?.warehouse as Record<string, unknown> | undefined,
    WAREHOUSE_KEYS as string[],
  );
  if (warehouse !== undefined) {
    out.warehouse = warehouse as ShowAllWarehouseDto;
  }
  const transport = nestBagChanged(
    draft.transport as Record<string, unknown> | undefined,
    defaults?.transport as Record<string, unknown> | undefined,
    TRANSPORT_KEYS as string[],
  );
  if (transport !== undefined) {
    out.transport = transport as ShowAllTransportDto;
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
  const next: PatchShowAllDto = {
    ...previous,
    ...submitted,
    ...fromResponse,
  };
  // Explicit nulls from clear keep an empty claim so reopen shows "—" and
  // stale GET/detail tab payloads cannot resurrect the previous value.
  for (const key of CLEARABLE_KEYS) {
    if (submitted[key] === null) {
      next[key] = '' as never;
    }
  }
  return next;
}
