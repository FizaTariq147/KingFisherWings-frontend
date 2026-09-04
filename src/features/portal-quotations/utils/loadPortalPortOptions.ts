import {
  asRecord,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import { portalApiClient } from '@/lib/portalApiClient';
import { isUuid } from '@/lib/isUuid';
import { PORTAL_LOOKUPS_API } from '../api/portalReference.api';

export type PortalLookupKind = 'ports' | 'airports';

export interface PortalPortOption {
  id: string;
  code?: string;
  name?: string;
  label: string;
  kind?: PortalLookupKind;
}

function placeLabel(record: Record<string, unknown>): string {
  const code = pickString(
    record.code,
    record.un_locode,
    record.unLocode,
    record.port_code,
    record.portCode,
    record.iata_code,
    record.iataCode,
    record.icao_code,
    record.icaoCode,
  );
  const name = pickString(
    record.name,
    record.city,
    record.port_name,
    record.portName,
    record.airport_name,
    record.airportName,
  );
  if (code && name && code.toLowerCase() !== name.toLowerCase()) return `${code} — ${name}`;
  return code || name || '';
}

function normalizePortalPlace(
  raw: unknown,
  kind: PortalLookupKind,
): PortalPortOption | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record.id, record.port_id, record.portId, record.airport_id, record.airportId);
  if (!id || !isUuid(id)) return null;
  const code = pickString(
    record.code,
    record.un_locode,
    record.unLocode,
    record.port_code,
    record.iata_code,
    record.iataCode,
  );
  const name = pickString(record.name, record.city, record.port_name, record.airport_name);
  const label = placeLabel(record);
  if (!label) return null;
  return { id, code: code || undefined, name: name || undefined, label, kind };
}

async function fetchLookup(
  path: string,
  kind: PortalLookupKind,
  search?: string,
): Promise<PortalPortOption[]> {
  const res = await portalApiClient.get<unknown>(path, {
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
    .map((row) => normalizePortalPlace(row, kind))
    .filter((p): p is PortalPortOption => Boolean(p))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Active sea ports for portal quote booking (Bearer portal JWT). */
export async function fetchPortalPortOptions(search?: string): Promise<PortalPortOption[]> {
  try {
    return await fetchLookup(PORTAL_LOOKUPS_API.ports, 'ports', search);
  } catch {
    return fetchLookup(PORTAL_LOOKUPS_API.portsLegacy, 'ports', search);
  }
}

/** World airports for air quote origin/destination. */
export async function fetchPortalAirportOptions(search?: string): Promise<PortalPortOption[]> {
  return fetchLookup(PORTAL_LOOKUPS_API.airports, 'airports', search);
}

export function portalPortsToSelectOptions(ports: PortalPortOption[]) {
  return ports.map((p) => ({ value: p.id, label: p.label }));
}

/** Prefer airports for air jobs; ports for sea / other. */
export { isAirJobType } from '@/features/jobs/constants/job.constants';

