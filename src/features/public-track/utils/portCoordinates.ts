/** Approximate port / city coordinates for Track & Trace map (no AIS). */
export type LatLng = { lat: number; lng: number };

const PORTS: Record<string, LatLng> = {
  CNSHA: { lat: 31.2304, lng: 121.4737 },
  SHANGHAI: { lat: 31.2304, lng: 121.4737 },
  NLRTM: { lat: 51.9225, lng: 4.47917 },
  ROTTERDAM: { lat: 51.9225, lng: 4.47917 },
  AEJEA: { lat: 25.0118, lng: 55.0708 },
  JEBEL_ALI: { lat: 25.0118, lng: 55.0708 },
  JEBELALI: { lat: 25.0118, lng: 55.0708 },
  SGSIN: { lat: 1.2644, lng: 103.822 },
  SINGAPORE: { lat: 1.2644, lng: 103.822 },
  HKHKG: { lat: 22.3089, lng: 114.195 },
  HONG_KONG: { lat: 22.3089, lng: 114.195 },
  HONGKONG: { lat: 22.3089, lng: 114.195 },
  USNYC: { lat: 40.684, lng: -74.006 },
  NEW_YORK: { lat: 40.684, lng: -74.006 },
  USLAX: { lat: 33.7405, lng: -118.27 },
  LOS_ANGELES: { lat: 33.7405, lng: -118.27 },
  DEHAM: { lat: 53.5461, lng: 9.9661 },
  HAMBURG: { lat: 53.5461, lng: 9.9661 },
  BEANR: { lat: 51.2213, lng: 4.4051 },
  ANTWERP: { lat: 51.2213, lng: 4.4051 },
  GBFXT: { lat: 51.955, lng: 1.309 },
  FELIXSTOWE: { lat: 51.955, lng: 1.309 },
  NLAMS: { lat: 52.3779, lng: 4.905 },
  AMSTERDAM: { lat: 52.3779, lng: 4.905 },
  INNSA: { lat: 18.949, lng: 72.844 },
  NHAVA_SHEVA: { lat: 18.949, lng: 72.844 },
  MUMBAI: { lat: 18.949, lng: 72.844 },
  INMAA: { lat: 13.0827, lng: 80.2707 },
  CHENNAI: { lat: 13.0827, lng: 80.2707 },
  CNTAO: { lat: 36.0671, lng: 120.3826 },
  QINGDAO: { lat: 36.0671, lng: 120.3826 },
  CNNGB: { lat: 29.8683, lng: 121.544 },
  NINGBO: { lat: 29.8683, lng: 121.544 },
  KRPUS: { lat: 35.1028, lng: 129.0403 },
  BUSAN: { lat: 35.1028, lng: 129.0403 },
  JPYOK: { lat: 35.4437, lng: 139.638 },
  YOKOHAMA: { lat: 35.4437, lng: 139.638 },
  AUMEL: { lat: -37.846, lng: 144.906 },
  MELBOURNE: { lat: -37.846, lng: 144.906 },
  ZADUR: { lat: -29.867, lng: 31.025 },
  DURBAN: { lat: -29.867, lng: 31.025 },
  EGPSD: { lat: 31.2653, lng: 32.3019 },
  PORT_SAID: { lat: 31.2653, lng: 32.3019 },
  OMSLL: { lat: 24.0, lng: 57.0 },
  SOHAR: { lat: 24.0, lng: 57.0 },
  QAHMD: { lat: 25.02, lng: 51.6 },
  HAMAD: { lat: 25.02, lng: 51.6 },
  SADMM: { lat: 26.5, lng: 50.2 },
  DAMMAM: { lat: 26.5, lng: 50.2 },
  KWKWI: { lat: 29.15, lng: 48.0 },
  KUWAIT: { lat: 29.15, lng: 48.0 },
  LBBEY: { lat: 33.9, lng: 35.5 },
  BEIRUT: { lat: 33.9, lng: 35.5 },
  TRIST: { lat: 40.99, lng: 28.95 },
  ISTANBUL: { lat: 40.99, lng: 28.95 },
  ITGOA: { lat: 44.4056, lng: 8.9463 },
  GENOA: { lat: 44.4056, lng: 8.9463 },
  ESALG: { lat: 36.14, lng: -5.43 },
  ALGECIRAS: { lat: 36.14, lng: -5.43 },
  FRLEH: { lat: 49.49, lng: 0.11 },
  LE_HAVRE: { lat: 49.49, lng: 0.11 },
  GBLGP: { lat: 51.5, lng: 0.05 },
  LONDON_GATEWAY: { lat: 51.5, lng: 0.05 },
  DXB: { lat: 25.2532, lng: 55.3657 },
  DUBAI: { lat: 25.2532, lng: 55.3657 },
  AUH: { lat: 24.433, lng: 54.6511 },
  ABU_DHABI: { lat: 24.433, lng: 54.6511 },
};

function normalizeKey(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/** Extract UN/LOCODE-like token (e.g. CNSHA from "Shanghai (CNSHA)"). */
function extractLocode(raw: string): string | null {
  const m = raw.match(/\(([A-Z]{5})\)/i) || raw.match(/\b([A-Z]{5})\b/i);
  return m ? m[1].toUpperCase() : null;
}

export function resolvePortCoordinates(label?: string | null): LatLng | null {
  if (!label?.trim()) return null;
  const locode = extractLocode(label);
  if (locode && PORTS[locode]) return PORTS[locode];
  const key = normalizeKey(label);
  if (PORTS[key]) return PORTS[key];
  // Partial name match (e.g. "Port of Shanghai Terminal")
  for (const [name, coords] of Object.entries(PORTS)) {
    if (name.length < 4) continue;
    if (key.includes(name) || name.includes(key)) return coords;
  }
  return null;
}

/** Smooth segment between two points (optional southward ocean bulge). */
function interpolateSegment(
  from: LatLng,
  to: LatLng,
  steps: number,
  bulgeLat = 0,
): LatLng[] {
  const out: LatLng[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const ease = t * t * (3 - 2 * t);
    const pull = Math.sin(Math.PI * t) * bulgeLat;
    out.push({
      lat: Math.max(-85, Math.min(85, from.lat + (to.lat - from.lat) * ease + pull)),
      lng: ((from.lng + (to.lng - from.lng) * ease + 540) % 360) - 180,
    });
  }
  return out;
}

/**
 * East Asia → N. Europe sea lane (Shanghai → Rotterdam reference):
 * South China Sea → Malacca → Indian Ocean → Arabian Sea → Red Sea → Med → N. Sea.
 */
const ASIA_TO_EUROPE_VIA: LatLng[] = [
  { lat: 22.0, lng: 118.0 },
  { lat: 7.0, lng: 108.0 },
  { lat: 1.3, lng: 104.0 },
  { lat: 5.5, lng: 80.0 },
  { lat: 8.0, lng: 60.0 },
  { lat: 12.5, lng: 48.0 },
  { lat: 20.0, lng: 39.0 },
  { lat: 29.5, lng: 32.5 },
  { lat: 34.0, lng: 28.0 },
  { lat: 36.5, lng: 15.0 },
  { lat: 37.0, lng: 5.0 },
  { lat: 43.0, lng: -5.0 },
  { lat: 49.0, lng: 0.0 },
];

function isAsiaToNorthEurope(from: LatLng, to: LatLng): boolean {
  return from.lng > 95 && to.lng < 20 && from.lat > 10 && to.lat > 40;
}

/**
 * Shipping-lane style arc between two ports (matches live-track reference maps).
 */
export function interpolateArc(
  from: LatLng,
  to: LatLng,
  steps = 64,
): LatLng[] {
  if (isAsiaToNorthEurope(from, to)) {
    const chain = [from, ...ASIA_TO_EUROPE_VIA, to];
    const per = Math.max(4, Math.floor(steps / (chain.length - 1)));
    const out: LatLng[] = [];
    for (let i = 0; i < chain.length - 1; i += 1) {
      const segment = interpolateSegment(chain[i], chain[i + 1], per, i >= 2 && i <= 5 ? -2 : 0);
      if (i > 0) segment.shift();
      out.push(...segment);
    }
    return out;
  }

  const lngDelta = to.lng - from.lng;
  const westboundOcean = lngDelta < -20 || (from.lng > 100 && to.lng < 50);
  return interpolateSegment(from, to, steps, westboundOcean ? -6 : 1.5);
}
