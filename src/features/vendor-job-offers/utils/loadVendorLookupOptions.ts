import {
  asRecord,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/vendor-shared/normalize';
import { vendorApiClient } from '@/lib/vendorApiClient';
import { isUuid } from '@/lib/isUuid';
import { VENDOR_JOB_OFFERS_API } from '../api/vendorJobOffers.api';

export type VendorLookupKind = 'ports' | 'airports';

export interface VendorPlaceOption {
  id: string;
  code?: string;
  name?: string;
  label: string;
  kind: VendorLookupKind;
}

function placeLabel(record: Record<string, unknown>): string {
  const code = pickString(
    record.code,
    record.un_locode,
    record.unLocode,
    record.port_code,
    record.iata_code,
    record.iataCode,
    record.icao_code,
  );
  const name = pickString(
    record.name,
    record.city,
    record.port_name,
    record.airport_name,
  );
  if (code && name && code.toLowerCase() !== name.toLowerCase()) return `${code} — ${name}`;
  return code || name || '';
}

function normalizePlace(raw: unknown, kind: VendorLookupKind): VendorPlaceOption | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record.id, record.port_id, record.airport_id);
  if (!id || !isUuid(id)) return null;
  const code = pickString(record.code, record.un_locode, record.iata_code, record.port_code);
  const name = pickString(record.name, record.city, record.port_name, record.airport_name);
  const label = placeLabel(record);
  if (!label) return null;
  return { id, code: code || undefined, name: name || undefined, label, kind };
}

async function fetchLookup(
  path: string,
  kind: VendorLookupKind,
  search?: string,
): Promise<VendorPlaceOption[]> {
  const res = await vendorApiClient.get<unknown>(path, {
    params: {
      page: 1,
      limit: 500,
      is_active: true,
      order: 'asc',
      search: search?.trim() || undefined,
    },
  });

  const payload = unwrapData(res.data);
  const { items } = unwrapList(payload ?? res.data, [
    'items',
    'results',
    'ports',
    'airports',
    'data',
  ]);
  const list = Array.isArray(payload) ? payload : items;

  return (Array.isArray(list) ? list : [])
    .map((row) => normalizePlace(row, kind))
    .filter((p): p is VendorPlaceOption => Boolean(p))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** GET /vendor/lookups/ports — world sea ports for vendor typeahead. */
export async function fetchVendorPortOptions(search?: string): Promise<VendorPlaceOption[]> {
  return fetchLookup(VENDOR_JOB_OFFERS_API.lookupsPorts, 'ports', search);
}

/** GET /vendor/lookups/airports — world airports for vendor typeahead. */
export async function fetchVendorAirportOptions(search?: string): Promise<VendorPlaceOption[]> {
  return fetchLookup(VENDOR_JOB_OFFERS_API.lookupsAirports, 'airports', search);
}

export function vendorPlacesToSelectOptions(places: VendorPlaceOption[]) {
  return places.map((p) => ({ value: p.id, label: p.label }));
}
