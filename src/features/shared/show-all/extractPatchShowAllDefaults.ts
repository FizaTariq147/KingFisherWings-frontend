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
  'origin_port_id',
  'dest_port_name',
  'dest_port_code',
  'dest_port_id',
  'shipper_name',
  'shipper_code',
  'shipper_id',
  'consignee_name',
  'consignee_code',
  'consignee_id',
  'billing_party_name',
  'billing_party_code',
  'billing_party_id',
  'agent_name',
  'agent_code',
  'agent_id',
  'carrier_name',
  'carrier_code',
  'carrier_id',
  'customer_name',
  'customer_code',
  'customer_id',
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
  // Shared date alias (sea shipment show_all + air cargo date)
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
  'pieces',
  'etd',
  'eta',
  'job_date',
  'mbl_number',
  'hbl_number',
  'bl_number',
  'rotation_number',
  'vessel_name',
  'vessel_number',
  'voyage_number',
  'line_code',
  'line_no',
  'location_terminal',
  'company_code',
  'origin_port_name',
  'origin_port_code',
  'origin_port_id',
  'dest_port_name',
  'dest_port_code',
  'dest_port_id',
  'shipper_name',
  'shipper_code',
  'shipper_id',
  'consignee_name',
  'consignee_code',
  'consignee_id',
  'billing_party_name',
  'billing_party_code',
  'billing_party_id',
  'agent_name',
  'agent_code',
  'agent_id',
  'carrier_name',
  'carrier_code',
  'carrier_id',
  'customer_name',
  'customer_code',
  'customer_id',
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
  // Shared shipment_date (not air-only); also mirrors job_date for sea reads.
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
  origin_port_id: 'origin_port_id',
  destination_port_name: 'dest_port_name',
  destination_port_code: 'dest_port_code',
  dest_name: 'dest_port_name',
  dest_code: 'dest_port_code',
  dest_port_id: 'dest_port_id',
  destination_port_id: 'dest_port_id',
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
  payableat: 'freight_payable_at',
  chargeable_unit: 'chargeable_units',
  chargeableunit: 'chargeable_units',
  chargeableunits: 'chargeable_units',
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

/** Flat root aliases BE accepts when FE does not nest under `warehouse`. */
const FLAT_WAREHOUSE_ROOT_KEYS = new Set<string>([
  'warehouse_name',
  'warehouse_id',
  'expected_inbound_at',
  'expected_outbound_at',
  'storage_days_requested',
  'bonded',
  'temperature_controlled',
]);

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

const FLAT_TRANSPORT_ROOT_KEYS = new Set<string>(TRANSPORT_KEYS as string[]);

/** Nested party/port objects from show_all → flat PatchShowAllDto fields (compact keys). */
const NESTED_ENTITY: Record<
  string,
  {
    name: keyof PatchShowAllDto;
    code: keyof PatchShowAllDto;
    id: keyof PatchShowAllDto;
    nested?: keyof PatchShowAllDto;
  }
> = {
  originport: {
    name: 'origin_port_name',
    code: 'origin_port_code',
    id: 'origin_port_id',
    nested: 'origin_port',
  },
  pol: {
    name: 'origin_port_name',
    code: 'origin_port_code',
    id: 'origin_port_id',
    nested: 'origin_port',
  },
  destport: {
    name: 'dest_port_name',
    code: 'dest_port_code',
    id: 'dest_port_id',
    nested: 'dest_port',
  },
  destinationport: {
    name: 'dest_port_name',
    code: 'dest_port_code',
    id: 'dest_port_id',
    nested: 'destination_port',
  },
  pod: {
    name: 'dest_port_name',
    code: 'dest_port_code',
    id: 'dest_port_id',
    nested: 'dest_port',
  },
  shipper: {
    name: 'shipper_name',
    code: 'shipper_code',
    id: 'shipper_id',
    nested: 'shipper',
  },
  consignee: {
    name: 'consignee_name',
    code: 'consignee_code',
    id: 'consignee_id',
    nested: 'consignee',
  },
  billingparty: {
    name: 'billing_party_name',
    code: 'billing_party_code',
    id: 'billing_party_id',
    nested: 'billing_party',
  },
  agent: {
    name: 'agent_name',
    code: 'agent_code',
    id: 'agent_id',
    nested: 'agent',
  },
  carrier: {
    name: 'carrier_name',
    code: 'carrier_code',
    id: 'carrier_id',
    nested: 'carrier',
  },
  customer: {
    name: 'customer_name',
    code: 'customer_code',
    id: 'customer_id',
    nested: 'customer',
  },
};

const PARTY_PORT_NESTED: {
  id: keyof PatchShowAllDto;
  name: keyof PatchShowAllDto;
  code: keyof PatchShowAllDto;
  nested: keyof PatchShowAllDto;
}[] = [
  {
    id: 'origin_port_id',
    name: 'origin_port_name',
    code: 'origin_port_code',
    nested: 'origin_port',
  },
  {
    id: 'dest_port_id',
    name: 'dest_port_name',
    code: 'dest_port_code',
    nested: 'dest_port',
  },
  {
    id: 'shipper_id',
    name: 'shipper_name',
    code: 'shipper_code',
    nested: 'shipper',
  },
  {
    id: 'consignee_id',
    name: 'consignee_name',
    code: 'consignee_code',
    nested: 'consignee',
  },
  {
    id: 'billing_party_id',
    name: 'billing_party_name',
    code: 'billing_party_code',
    nested: 'billing_party',
  },
  {
    id: 'agent_id',
    name: 'agent_name',
    code: 'agent_code',
    nested: 'agent',
  },
  {
    id: 'carrier_id',
    name: 'carrier_name',
    code: 'carrier_code',
    nested: 'carrier',
  },
  {
    id: 'customer_id',
    name: 'customer_name',
    code: 'customer_code',
    nested: 'customer',
  },
];

function compactKey(key: string): string {
  return normalizeKey(key).replace(/_/g, '');
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/** snake_case + camelCase → snake_case (payableAt → payable_at). */
function normalizeKey(key: string): string {
  return key
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[-.\s]+/g, '_');
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

function samePatchValue(a: unknown, b: unknown): boolean {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  if (typeof a === 'number' || typeof b === 'number') {
    const na = typeof a === 'number' ? a : Number(a);
    const nb = typeof b === 'number' ? b : Number(b);
    return Number.isFinite(na) && Number.isFinite(nb) && na === nb;
  }
  if (typeof a === 'boolean' || typeof b === 'boolean') return a === b;
  return String(a).trim() === String(b).trim();
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
  const id =
    pickString(rec.id) ||
    pickString(rec.uuid) ||
    pickString(rec.port_id) ||
    pickString(rec.party_id);
  setIfEmpty(into, mapping.name, name);
  setIfEmpty(into, mapping.code, code);
  setIfEmpty(into, mapping.id, id);
  if (mapping.nested && (id || name || code)) {
    const existing = asRecord(into[mapping.nested]) ?? {};
    into[mapping.nested] = {
      ...existing,
      ...(id ? { id } : {}),
      ...(name ? { name } : {}),
      ...(code ? { code } : {}),
    } as never;
  }
  return true;
}

function mergeWarehouseBag(into: PatchShowAllDto, raw: unknown): void {
  const rec = asRecord(raw);
  if (!rec) return;
  const bag: ShowAllWarehouseDto = { ...(into.warehouse ?? {}) };
  let touched = false;
  for (const key of WAREHOUSE_KEYS) {
    // Accept camelCase inside nested bag too.
    const rawVal =
      rec[key] ??
      rec[key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())];
    if (rawVal === undefined) continue;
    const val = rawVal;
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
    if (key === 'expected_inbound_at' || key === 'expected_outbound_at') {
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

function mergeTransportBag(into: PatchShowAllDto, raw: unknown): void {
  const rec = asRecord(raw);
  if (!rec) return;
  const bag: ShowAllTransportDto = { ...(into.transport ?? {}) };
  let touched = false;
  for (const key of TRANSPORT_KEYS) {
    const rawVal =
      rec[key] ??
      rec[key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())];
    if (rawVal === undefined) continue;
    if (bag[key] != null && bag[key] !== '') continue;
    const s = pickString(rawVal);
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
    if (
      compact === 'warehouse' ||
      compact === 'warehousebooking' ||
      compact === 'warehouse_booking'
    ) {
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

    // Flat warehouse / transport root aliases → nested bags (BE whitelist).
    if (FLAT_WAREHOUSE_ROOT_KEYS.has(norm)) {
      mergeWarehouseBag(into, { [norm]: rawVal });
      continue;
    }
    if (FLAT_TRANSPORT_ROOT_KEYS.has(norm)) {
      mergeTransportBag(into, { [norm]: rawVal });
      continue;
    }

    const mapped =
      (PATCH_KEYS.includes(norm as keyof PatchShowAllDto)
        ? (norm as keyof PatchShowAllDto)
        : ALIASES[norm] ?? ALIASES[compact]) ?? undefined;
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
      if (n != null) into[mapped] = n as never;
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
        into[mapped] = d as never;
        // Sea show_all historically used shipment_date as job_date.
        if (mapped === 'shipment_date') setIfEmpty(into, 'job_date', d);
      }
      continue;
    }
    const s = pickString(rawVal);
    if (s) into[mapped] = s as never;
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
        if (!samePatchValue(trimmed, prev)) {
          out[key] = trimmed;
          touched = true;
        }
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
      if (!samePatchValue(next, prev)) {
        out[key] = next;
        touched = true;
      }
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
 * Build a partial PATCH body for a normal save.
 * - Only dirty (changed vs defaults) real values are sent — avoids null/"" echoes
 *   that used to trip cross-mode guards.
 * - Cleared clearable fields send `null`.
 * - Party/port ids are included; nested bags accompany flat ids when present.
 */
export function toPatchShowAllPayload(
  draft: PatchShowAllDto,
  defaults?: PatchShowAllDto,
): PatchShowAllDto {
  const out: PatchShowAllDto = {};
  const numericKeys = new Set<keyof PatchShowAllDto>([
    'pieces',
    'gross_weight',
    'volume_cbm',
    'chargeable_units',
    'chargeable_unit',
    'chargeable_weight',
    'pallet_count',
    'dimensions',
    'weight',
  ]);
  for (const key of PATCH_KEYS) {
    const value = draft[key];
    const prev = defaults?.[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        const next = numericKeys.has(key)
          ? Number.isFinite(Number(trimmed))
            ? Number(trimmed)
            : trimmed
          : trimmed;
        if (!defaults || !samePatchValue(next, prev)) {
          out[key] = next as never;
        }
        continue;
      }
      // Cleared previously-filled clearable field → null (real clear, not echo).
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
      if (!defaults || !samePatchValue(value, prev)) {
        out[key] = value as never;
      }
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

  // When FE only has nested party/port objects, BE still reads .id — emit both.
  for (const group of PARTY_PORT_NESTED) {
    const idChanged = Object.prototype.hasOwnProperty.call(out, group.id);
    const nameChanged = Object.prototype.hasOwnProperty.call(out, group.name);
    const codeChanged = Object.prototype.hasOwnProperty.call(out, group.code);
    if (!idChanged && !nameChanged && !codeChanged) continue;
    const id = pickString(out[group.id] ?? draft[group.id] ?? defaults?.[group.id]);
    const name = pickString(
      out[group.name] ?? draft[group.name] ?? defaults?.[group.name],
    );
    const code = pickString(
      out[group.code] ?? draft[group.code] ?? defaults?.[group.code],
    );
    if (!id && !name && !code) continue;
    out[group.nested] = {
      ...(id ? { id } : {}),
      ...(name ? { name } : {}),
      ...(code ? { code } : {}),
    } as never;
  }

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
