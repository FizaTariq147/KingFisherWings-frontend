import {
  asRecord,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import { portalApiClient } from '@/lib/portalApiClient';
import { isUuid } from '@/lib/isUuid';
import { isAirJobType } from '@/features/jobs/constants/job.constants';
import { PORTAL_LOOKUPS_API } from '../api/portalReference.api';

export type PortalLookupKind = 'ports' | 'airports';

export interface PortalPortOption {
  id: string;
  code?: string;
  name?: string;
  label: string;
  kind?: PortalLookupKind;
  /** ISO country from lookup row (used to guess UN/LOCODE = country + IATA). */
  countryCode?: string;
  /** When airport rows reference a ports-master UUID (API may send linked_port_id etc.). */
  linkedPortId?: string;
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

  // Airports: never treat port_id as the row id (it may be a FK to ports master).
  const id =
    kind === 'airports'
      ? pickString(record.id, record.airport_id, record.airportId)
      : pickString(record.id, record.port_id, record.portId);

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

  const countryCode = pickString(
    record.country_code,
    record.countryCode,
    record.country,
  )?.toUpperCase();

  let linkedPortId: string | undefined;
  if (kind === 'airports') {
    const candidate = pickString(
      record.linked_port_id,
      record.linkedPortId,
      record.related_port_id,
      record.relatedPortId,
      record.sea_port_id,
      record.seaPortId,
      record.port_id,
      record.portId,
    );
    // Only keep a real cross-table link (must differ from the airport row id).
    if (candidate && isUuid(candidate) && candidate !== id) {
      linkedPortId = candidate;
    }
  }

  return {
    id,
    code: code || undefined,
    name: name || undefined,
    label,
    kind,
    ...(countryCode && /^[A-Z]{2}$/.test(countryCode) ? { countryCode } : {}),
    ...(linkedPortId ? { linkedPortId } : {}),
  };
}

async function fetchLookup(
  path: string,
  kind: PortalLookupKind,
  search?: string,
  extraParams?: Record<string, string | number | boolean | undefined>,
): Promise<PortalPortOption[]> {
  const res = await portalApiClient.get<unknown>(path, {
    params: {
      page: 1,
      limit: 500,
      is_active: true,
      order: 'asc',
      search: search?.trim() || undefined,
      ...extraParams,
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

/** Active ports for portal quote booking (Bearer portal JWT). Optional mode e.g. AIR/SEA. */
export async function fetchPortalPortOptions(
  search?: string,
  opts?: { mode?: string },
): Promise<PortalPortOption[]> {
  const mode = opts?.mode?.trim().toUpperCase() || undefined;
  const extra = mode ? { mode } : undefined;
  try {
    return await fetchLookup(PORTAL_LOOKUPS_API.ports, 'ports', search, extra);
  } catch {
    return fetchLookup(PORTAL_LOOKUPS_API.portsLegacy, 'ports', search, extra);
  }
}

/** World airports for air quote origin/destination. */
export async function fetchPortalAirportOptions(search?: string): Promise<PortalPortOption[]> {
  return fetchLookup(PORTAL_LOOKUPS_API.airports, 'airports', search);
}

/**
 * Route place options for portal book quote.
 * Air / courier → world airports catalog (GET /portal/lookups/airports),
 * same tenant seed as GET /masters/airports. Sea / other → ports.
 */
export async function fetchPortalRoutePlaceOptions(
  jobType: string | null | undefined,
  search?: string,
): Promise<PortalPortOption[]> {
  if (isAirJobType(jobType)) {
    return fetchPortalAirportOptions(search);
  }
  return fetchPortalPortOptions(search);
}

export function portalPortsToSelectOptions(ports: PortalPortOption[]) {
  return ports.map((p) => ({ value: p.id, label: p.label }));
}

/** Prefer airports for air jobs; ports for sea / other. */
export { isAirJobType } from '@/features/jobs/constants/job.constants';
