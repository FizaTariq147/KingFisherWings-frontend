import { isUuid } from '@/lib/isUuid';
import { isAirJobType } from '@/features/jobs/constants/job.constants';
import {
  fetchPortalPortOptions,
  type PortalPortOption,
} from './loadPortalPortOptions';

export interface PortalQuotationFormRoute {
  origin_port?: string;
  dest_port?: string;
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

/** Match typed place text or UUID to a lookup row id. */
export function resolvePortalPortId(
  value: string | undefined,
  ports: PortalPortOption[],
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (isUuid(trimmed)) {
    const byId = ports.find((p) => p.id === trimmed);
    return byId?.id ?? trimmed;
  }

  const token = normalizeToken(trimmed);
  for (const port of ports) {
    const candidates = [port.label, port.code, port.name]
      .filter(Boolean)
      .map((s) => normalizeToken(String(s)));
    if (candidates.some((c) => c === token)) return port.id;
  }

  for (const port of ports) {
    const label = normalizeToken(port.label);
    const code = port.code ? normalizeToken(port.code) : '';
    const name = port.name ? normalizeToken(port.name) : '';
    if (
      label.includes(token) ||
      token.includes(label) ||
      (code && (code === token || token.includes(code) || code.includes(token))) ||
      (name && (name === token || token.includes(name) || name.includes(token)))
    ) {
      return port.id;
    }
  }

  return undefined;
}

/** Ports-master code matches airport IATA (e.g. AEDXB ↔ DXB) using only API values. */
function portCodeMatchesAirportCode(portCode: string | undefined, airportCode: string): boolean {
  if (!portCode?.trim() || !airportCode.trim()) return false;
  const p = portCode.trim().toLowerCase();
  const a = airportCode.trim().toLowerCase();
  if (p === a) return true;
  if (a.length >= 3 && p.endsWith(a)) return true;
  return false;
}

function findPortForAirport(
  airport: PortalPortOption,
  ports: PortalPortOption[],
): PortalPortOption | undefined {
  if (airport.code) {
    const byCode = ports.find((p) => portCodeMatchesAirportCode(p.code, airport.code!));
    if (byCode) return byCode;
  }

  const airportName = (airport.name || airport.label || '').split('—')[0]?.trim();
  if (airportName) {
    const nameToken = normalizeToken(airportName);
    const byName = ports.find((p) => {
      const n = p.name ? normalizeToken(p.name) : '';
      const l = normalizeToken(p.label);
      return (
        (n && (n === nameToken || n.includes(nameToken) || nameToken.includes(n))) ||
        (l && (l.includes(nameToken) || nameToken.includes(l)))
      );
    });
    if (byName) return byName;
  }

  if (ports.length === 1) return ports[0];
  return undefined;
}

async function lookupPortsMatchingAirport(
  airport: PortalPortOption,
): Promise<PortalPortOption | undefined> {
  const code = airport.code?.trim();
  const country = airport.countryCode?.trim().toUpperCase();
  const searchTerms = [
    // Prefer UN/LOCODE-style guess from airport fields (country + IATA), then IATA, then name.
    code && country && code.length === 3 ? `${country}${code}` : undefined,
    code,
    airport.name,
    airport.label?.includes('—') ? airport.label.split('—')[0]?.trim() : airport.label,
  ]
    .map((s) => s?.trim())
    .filter((s): s is string => Boolean(s));

  if (!searchTerms.length) return undefined;

  const seen = new Set<string>();
  const candidates: PortalPortOption[] = [];

  for (const term of searchTerms) {
    let ports: PortalPortOption[] = [];
    try {
      ports = await fetchPortalPortOptions(term);
    } catch {
      ports = [];
    }
    for (const p of ports) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      candidates.push(p);
    }
    const match = findPortForAirport(airport, candidates);
    if (match) return match;
  }

  return findPortForAirport(airport, candidates);
}

/**
 * Resolve a portal place selection to a UUID the quote APIs can validate.
 *
 * Portal estimate/request/costing validate `origin_port_id` / `dest_port_id`
 * against the **ports** master only. Airport catalog UUIDs must never be sent
 * as those fields — map to a ports row (linked id / code / name) or omit.
 */
export async function resolvePlaceIdForPortalQuoteApi(
  value: string | undefined,
  places: PortalPortOption[],
  jobType?: string | null,
): Promise<string | undefined> {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const resolved = resolvePortalPortId(trimmed, places);
  const place =
    places.find((p) => p.id === resolved) ||
    places.find((p) => p.id === trimmed) ||
    undefined;

  if (!isAirJobType(jobType)) {
    return resolved;
  }

  // Ports-master row (rare for air UI, but valid if present).
  if (place?.kind === 'ports') return place.id;

  const airport =
    place?.kind === 'airports'
      ? place
      : place
        ? undefined
        : resolved && isUuid(resolved)
          ? ({ id: resolved, label: trimmed, kind: 'airports' } as PortalPortOption)
          : undefined;

  // Unknown non-airport selection — do not invent an id.
  if (!airport) {
    // If cache says this UUID is not an airport and not a port, still avoid
    // sending a raw UUID that might be an airport outside cache.
    if (place) return place.id;
    return undefined;
  }

  if (airport.linkedPortId && isUuid(airport.linkedPortId) && airport.linkedPortId !== airport.id) {
    return airport.linkedPortId;
  }

  const mapped = await lookupPortsMatchingAirport(airport);
  // Critical: never return the airport UUID — API looks up ports only.
  return mapped?.id;
}

function stripPreviousRouteNotes(specialRequirements: string | undefined): string {
  if (!specialRequirements?.trim()) return '';
  return specialRequirements
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (/^Customer route:/i.test(line)) return false;
      if (/^Origin port:/i.test(line)) return false;
      if (/^Destination port:/i.test(line)) return false;
      if (/Origin port:.*Destination port:/i.test(line)) return false;
      return true;
    })
    .join('\n')
    .trim();
}

function appendCustomerRouteNote(
  specialRequirements: string | undefined,
  originRaw?: string,
  destRaw?: string,
): string | undefined {
  const cleaned = stripPreviousRouteNotes(specialRequirements);
  if (!originRaw && !destRaw) return cleaned || undefined;

  const routeLine = `Customer route: ${originRaw || '—'} → ${destRaw || '—'}`;
  return cleaned ? `${routeLine}\n\n${cleaned}` : routeLine;
}

type PortalRoutableDto = {
  origin_port_id?: string;
  dest_port_id?: string;
  special_requirements?: string;
};

function displayRouteLabel(value: string | undefined, ports: PortalPortOption[]): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (isUuid(trimmed)) {
    return ports.find((p) => p.id === trimmed)?.label ?? trimmed;
  }
  return trimmed;
}

/**
 * Attach route fields for portal estimate/request.
 * Air airports are mapped to ports UUIDs when possible; otherwise route is
 * kept in special_requirements and port ids are omitted (avoids API error).
 */
export async function applyPortalRouteFields<T extends PortalRoutableDto>(
  dto: T,
  route: PortalQuotationFormRoute,
  ports: PortalPortOption[] = [],
  jobType?: string | null,
): Promise<T> {
  const next = { ...dto };
  const originRaw = route.origin_port?.trim();
  const destRaw = route.dest_port?.trim();

  if (originRaw) {
    const id = await resolvePlaceIdForPortalQuoteApi(originRaw, ports, jobType);
    if (id) next.origin_port_id = id;
    else delete next.origin_port_id;
  }
  if (destRaw) {
    const id = await resolvePlaceIdForPortalQuoteApi(destRaw, ports, jobType);
    if (id) next.dest_port_id = id;
    else delete next.dest_port_id;
  }

  if (originRaw || destRaw) {
    next.special_requirements = appendCustomerRouteNote(
      dto.special_requirements,
      displayRouteLabel(originRaw, ports),
      displayRouteLabel(destRaw, ports),
    );
  }

  return next;
}
