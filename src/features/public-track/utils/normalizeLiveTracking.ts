import type { LiveTrackingCard, LiveTrackingLink } from '../types/liveTracking.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(...vals: unknown[]): string | undefined {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return undefined;
}

function pickNumber(...vals: unknown[]): number | undefined {
  for (const v of vals) {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim()) {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function pickLatLng(rec: Record<string, unknown> | null): { lat?: number; lng?: number } {
  if (!rec) return {};
  const nested =
    asRecord(rec.position) ??
    asRecord(rec.coordinates) ??
    asRecord(rec.location) ??
    asRecord(rec.current_position) ??
    asRecord(rec.currentPosition);
  const lat = pickNumber(
    rec.lat,
    rec.latitude,
    nested?.lat,
    nested?.latitude,
  );
  const lng = pickNumber(
    rec.lng,
    rec.lon,
    rec.longitude,
    nested?.lng,
    nested?.lon,
    nested?.longitude,
  );
  return { lat, lng };
}

function normalizeLinks(raw: unknown): LiveTrackingLink[] {
  if (!Array.isArray(raw)) return [];
  const out: LiveTrackingLink[] = [];
  for (const row of raw) {
    if (typeof row === 'string' && /^https?:\/\//i.test(row)) {
      out.push({ label: 'Open', url: row });
      continue;
    }
    const rec = asRecord(row);
    if (!rec) continue;
    const url = pickString(rec.url, rec.href, rec.link);
    if (!url) continue;
    out.push({
      label: pickString(rec.label, rec.name, rec.title, rec.provider) || 'Open',
      url,
    });
  }
  return out;
}

function inferKind(
  hint: 'flight' | 'vessel' | undefined,
  rec: Record<string, unknown>,
): LiveTrackingCard['kind'] {
  if (hint) return hint;
  const explicit = pickString(rec.kind, rec.type, rec.mode)?.toLowerCase();
  if (explicit?.includes('flight') || explicit === 'air') return 'flight';
  if (explicit?.includes('vessel') || explicit === 'sea' || explicit === 'ais') {
    return 'vessel';
  }
  if (pickString(rec.flight_number, rec.flightNumber, rec.flight_no, rec.flightNo)) {
    return 'flight';
  }
  if (pickString(rec.vessel_name, rec.vesselName, rec.imo, rec.mmsi)) {
    return 'vessel';
  }
  return 'unknown';
}

function defaultLinks(card: Omit<LiveTrackingCard, 'links'>): LiveTrackingLink[] {
  const links: LiveTrackingLink[] = [];
  if (card.lat != null && card.lng != null) {
    links.push({
      label: 'Google Maps',
      url: `https://www.google.com/maps?q=${card.lat},${card.lng}`,
    });
  }
  if (card.kind === 'flight' && card.flightNumber) {
    const q = encodeURIComponent(card.flightNumber);
    links.push({
      label: 'FlightAware',
      url: `https://www.flightaware.com/live/flight/${q}`,
    });
    links.push({
      label: 'Flightradar24',
      url: `https://www.flightradar24.com/${q}`,
    });
  }
  if (card.kind === 'vessel') {
    const q = encodeURIComponent(card.imo || card.vesselName || card.query || '');
    if (q) {
      links.push({
        label: 'MarineTraffic',
        url: `https://www.marinetraffic.com/en/ais/index/search/all?keyword=${q}`,
      });
      links.push({
        label: 'VesselFinder',
        url: `https://www.vesselfinder.com/?name=${q}`,
      });
    }
  }
  return links;
}

/** Normalize GET /track/live/flight|vessel, job/shipment tracking/live, or live_tracking bag. */
export function normalizeLiveTracking(
  raw: unknown,
  opts?: { kind?: 'flight' | 'vessel'; query?: string },
): LiveTrackingCard | null {
  const root = asRecord(raw);
  if (!root) return null;
  const body =
    asRecord(root.data) ??
    asRecord(root.live_tracking) ??
    asRecord(root.liveTracking) ??
    asRecord(root.result) ??
    root;
  const { lat, lng } = pickLatLng(body);
  const kind = inferKind(opts?.kind, body);
  const flightNumber = pickString(
    body.flight_number,
    body.flightNumber,
    body.flight_no,
    body.flightNo,
    body.flight,
  );
  const vesselName = pickString(
    body.vessel_name,
    body.vesselName,
    body.vessel,
    body.name,
  );
  const cardBase = {
    kind,
    query: opts?.query || pickString(body.query, body.q, body.search),
    status: pickString(body.status, body.state, body.phase),
    summary: pickString(body.summary, body.description, body.message, body.detail),
    title:
      pickString(body.title, body.label) ||
      (kind === 'flight' ? flightNumber : vesselName) ||
      opts?.query,
    subtitle: pickString(body.subtitle, body.route, body.lane),
    flightNumber,
    airlineName: pickString(body.airline_name, body.airlineName, body.airline, body.carrier),
    vesselName,
    voyageNumber: pickString(body.voyage_number, body.voyageNumber, body.voyage),
    imo: pickString(body.imo, body.IMO, body.mmsi, body.MMSI),
    lat,
    lng,
    updatedAt: pickString(
      body.updated_at,
      body.updatedAt,
      body.last_updated,
      body.lastUpdated,
      body.timestamp,
    ),
    provider: pickString(body.provider, body.source, body.vendor),
    raw: body,
  };
  const apiLinks = normalizeLinks(
    body.links ?? body.urls ?? body.providers ?? body.external_links,
  );
  const links = apiLinks.length ? apiLinks : defaultLinks(cardBase);
  if (
    !cardBase.title &&
    !cardBase.status &&
    !cardBase.summary &&
    cardBase.lat == null &&
    !links.length
  ) {
    return null;
  }
  return { ...cardBase, links };
}

/** Pull live card from a full tracking payload (`live_tracking` / nested). */
export function extractLiveTrackingFromPayload(raw: unknown): LiveTrackingCard | null {
  const root = asRecord(raw);
  if (!root) return null;
  const candidates = [
    root.live_tracking,
    root.liveTracking,
    asRecord(root.tracking)?.live_tracking,
    asRecord(root.tracking)?.liveTracking,
    asRecord(root.data)?.live_tracking,
    asRecord(root.data)?.liveTracking,
  ];
  for (const c of candidates) {
    const card = normalizeLiveTracking(c);
    if (card) return card;
  }
  return null;
}
