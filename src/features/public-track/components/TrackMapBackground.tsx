import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Moon, Sun } from 'lucide-react';
import type { PublicTrackResult } from '../types/publicTrack.types';
import {
  interpolateArc,
  resolvePortCoordinates,
  type LatLng,
} from '../utils/portCoordinates';
import { computeTrackMetrics } from '../utils/trackMetrics';

type Props = {
  result?: PublicTrackResult | null;
  /** Prefer dark (CARTO-like) or light OSM tiles. */
  dark?: boolean;
  className?: string;
  /** Show origin → destination live chip over the map. */
  showLiveBadge?: boolean;
  /**
   * Extra left padding when an expandable panel covers the left side
   * so POL→POD stays visible on the right (Leaflet [top, right, bottom, left]).
   */
  fitPadding?: [number, number, number, number];
};

type Waypoint = LatLng & { label?: string; role?: string };

function portIcon(kind: 'pol' | 'pod', label: string) {
  const fill = kind === 'pol' ? '#16A34A' : '#2563EB';
  const title = kind === 'pol' ? 'POL' : 'POD';
  const safe = label.replace(/[<>&"]/g, '');
  return L.divIcon({
    className: 'kf-track-port-icon',
    iconSize: [28, 36],
    iconAnchor: [14, 34],
    html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))">
      <div style="width:22px;height:22px;border-radius:9999px;background:${fill};border:2px solid #fff;display:flex;align-items:center;justify-content:center">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5" fill="#fff" stroke="none"/></svg>
      </div>
      <span style="margin-top:2px;padding:1px 6px;border-radius:9999px;background:rgba(255,255,255,.95);font:600 10px/1.2 system-ui,sans-serif;color:#0A2942;white-space:nowrap;max-width:9rem;overflow:hidden;text-overflow:ellipsis">${title} ${safe}</span>
    </div>`,
  });
}

function vesselIcon(live: boolean) {
  const ring = live ? 'box-shadow:0 0 0 6px rgba(34,197,94,.28);' : '';
  return L.divIcon({
    className: 'kf-track-vessel-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="width:28px;height:28px;border-radius:9999px;background:#22C55E;border:2px solid #0A2942;display:flex;align-items:center;justify-content:center;${ring}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A2942"><path d="M3 15.5 12 4l9 11.5H3Zm2.2-1.5h13.6L12 7.2 5.2 14Z"/><path d="M4 17h16v2H4z"/></svg>
    </div>`,
  });
}

function FitRoute({
  points,
  padding,
}: {
  points: LatLng[];
  padding: [number, number, number, number];
}) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) {
      map.setView([22, 55], 3);
      return;
    }
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 5);
      return;
    }
    const bounds = points.map((p) => [p.lat, p.lng] as [number, number]);
    map.fitBounds(bounds, { paddingTopLeft: [padding[3], padding[0]], paddingBottomRight: [padding[1], padding[2]], maxZoom: 5 });
  }, [map, points, padding]);
  return null;
}

/** Leaflet often paints blank until the container has a real size — force refresh. */
function InvalidateMapSize({ revision }: { revision?: string }) {
  const map = useMap();
  useEffect(() => {
    const refresh = () => {
      map.invalidateSize({ animate: false });
    };
    refresh();
    const t1 = window.setTimeout(refresh, 80);
    const t2 = window.setTimeout(refresh, 320);
    const t3 = window.setTimeout(refresh, 700);
    window.addEventListener('resize', refresh);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener('resize', refresh);
    };
  }, [map, revision]);
  return null;
}

/** Keep the live vessel in view without remounting the map on every ping. */
function FollowLiveVessel({ point }: { point?: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (!point) return;
    const center = map.getCenter();
    const dist =
      (center.lat - point.lat) ** 2 + (center.lng - point.lng) ** 2;
    if (dist > 0.08) {
      map.panTo([point.lat, point.lng], { animate: true, duration: 0.6 });
    }
  }, [map, point?.lat, point?.lng]);
  return null;
}

function nearlySame(a: LatLng, b: LatLng): boolean {
  return Math.abs(a.lat - b.lat) < 0.02 && Math.abs(a.lng - b.lng) < 0.02;
}

function resolveWaypoint(
  label?: string | null,
  lat?: number,
  lng?: number,
): LatLng | null {
  if (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  ) {
    return { lat, lng };
  }
  return resolvePortCoordinates(label);
}

function collectWaypoints(
  rows: Array<{
    label?: string | null;
    lat?: number;
    lng?: number;
    role?: string;
  }>,
): Waypoint[] {
  const out: Waypoint[] = [];
  for (const row of rows) {
    const pt = resolveWaypoint(row.label, row.lat, row.lng);
    if (!pt) continue;
    const last = out[out.length - 1];
    if (last && nearlySame(last, pt)) {
      if (row.label && !last.label) last.label = row.label;
      if (row.role && !last.role) last.role = row.role;
      continue;
    }
    out.push({
      ...pt,
      label: row.label || undefined,
      role: row.role,
    });
  }
  return out;
}

/** Build route stops from live tracking payload (legs → POC → origin/dest). */
function buildLiveWaypoints(result: PublicTrackResult | null | undefined): Waypoint[] {
  if (!result) return [];

  const fromLegs = collectWaypoints(
    (result.progressLegs ?? []).map((leg) => ({
      label: leg.name,
      lat: leg.lat,
      lng: leg.lng,
      role: String(leg.code || ''),
    })),
  );
  if (fromLegs.length >= 2) return fromLegs;

  const fromPoc = collectWaypoints(
    (result.route?.portOfCall ?? []).map((stop) => ({
      label: stop.name || stop.code,
      lat: stop.lat,
      lng: stop.lng,
      role: stop.role || stop.code,
    })),
  );
  if (fromPoc.length >= 2) return fromPoc;

  const metrics = computeTrackMetrics(result);
  return collectWaypoints([
    { label: metrics.origin || result.origin || 'Origin', role: 'POL' },
    { label: metrics.destination || result.destination || 'Destination', role: 'POD' },
  ]);
}

function buildRouteArc(waypoints: Waypoint[]): LatLng[] {
  if (waypoints.length < 2) return waypoints.map((w) => ({ lat: w.lat, lng: w.lng }));
  const arc: LatLng[] = [];
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const segment = interpolateArc(waypoints[i], waypoints[i + 1], 64);
    if (i > 0) segment.shift();
    arc.push(...segment);
  }
  return arc;
}

function splitRoute(
  arc: LatLng[],
  progressPct: number,
  livePosition?: LatLng | null,
) {
  if (livePosition && arc.length) {
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < arc.length; i += 1) {
      const d =
        (arc[i].lat - livePosition.lat) ** 2 + (arc[i].lng - livePosition.lng) ** 2;
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    return {
      done: arc.slice(0, bestIdx + 1),
      rest: arc.slice(bestIdx),
      vessel: livePosition,
      live: true as const,
    };
  }
  if (arc.length < 2) {
    return { done: arc, rest: [] as LatLng[], vessel: undefined, live: false as const };
  }
  const pct = Math.max(0, Math.min(100, progressPct || 0));
  const idx =
    pct <= 0
      ? 0
      : Math.max(
          1,
          Math.min(arc.length - 1, Math.round((pct / 100) * (arc.length - 1))),
        );
  return {
    done: arc.slice(0, idx + 1),
    rest: arc.slice(idx),
    vessel: arc[idx],
    live: false as const,
  };
}

/**
 * Full-bleed OSM map behind Track & Trace.
 * Prefers live lat/lng from the track payload; otherwise places the vessel
 * along the ocean route using progress % / ATD→ETA.
 */
export function TrackMapBackground({
  result,
  dark: darkProp,
  className,
  showLiveBadge = false,
  fitPadding = [48, 48, 48, 360],
}: Props) {
  const [dark, setDark] = useState(Boolean(darkProp));
  const metrics = result ? computeTrackMetrics(result) : null;
  const waypoints = useMemo(() => buildLiveWaypoints(result), [result]);
  const origin = waypoints[0] ?? null;
  const dest = waypoints.length > 1 ? waypoints[waypoints.length - 1] : null;

  const arc = useMemo(() => buildRouteArc(waypoints), [waypoints]);

  const livePosition = useMemo(() => {
    // Only trust explicit live / AIS coordinates — not milestone port names
    // (those pin the ship to POL and break the mid-ocean reference look).
    if (
      result?.currentLat != null &&
      result?.currentLng != null &&
      Number.isFinite(result.currentLat) &&
      Number.isFinite(result.currentLng)
    ) {
      return { lat: result.currentLat, lng: result.currentLng };
    }
    const currentLeg = (result?.progressLegs ?? []).find((l) => l.current);
    if (
      currentLeg &&
      typeof currentLeg.lat === 'number' &&
      typeof currentLeg.lng === 'number'
    ) {
      return { lat: currentLeg.lat, lng: currentLeg.lng };
    }
    return null;
  }, [result]);

  const split = useMemo(
    () => splitRoute(arc, metrics?.progressPct ?? 0, livePosition),
    [arc, metrics?.progressPct, livePosition],
  );

  const fitPoints = useMemo(() => {
    const pts: LatLng[] = [...waypoints];
    if (split.vessel) pts.push(split.vessel);
    return pts;
  }, [waypoints, split.vessel]);

  const mapKey = [
    result?.reference ?? 'empty',
    origin ? `${origin.lat.toFixed(2)},${origin.lng.toFixed(2)}` : '',
    dest ? `${dest.lat.toFixed(2)},${dest.lng.toFixed(2)}` : '',
    String(waypoints.length),
  ].join('|');

  const sizeRevision = [
    mapKey,
    split.vessel ? `${split.vessel.lat.toFixed(3)},${split.vessel.lng.toFixed(3)}` : '',
    dark ? 'dark' : 'light',
  ].join('|');

  const tileUrl = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const midStops = waypoints.slice(1, -1);
  const originLabel = (origin?.label || metrics?.origin || 'Origin').replace(
    /\s*\([^)]*\)\s*/g,
    ' ',
  ).trim();
  const destLabel = (dest?.label || metrics?.destination || 'Destination')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .trim();

  const polIcon = useMemo(
    () => (origin ? portIcon('pol', originLabel) : null),
    [origin, originLabel],
  );
  const podIcon = useMemo(
    () => (dest ? portIcon('pod', destLabel) : null),
    [dest, destLabel],
  );
  const shipIcon = useMemo(() => vesselIcon(split.live), [split.live]);

  return (
    <div className={className ?? 'absolute inset-0 z-0 h-full w-full'}>
      {showLiveBadge ? (
        <div className="pointer-events-none absolute right-14 top-3 z-[6] max-w-[min(90%,18rem)] rounded-lg bg-white/95 px-3 py-2 text-[11px] shadow-md backdrop-blur">
          <div className="flex items-center gap-1.5 font-semibold text-[#0A2942]">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                split.live ? 'animate-pulse bg-emerald-500' : 'bg-sky-500'
              }`}
            />
            {split.live ? 'Live AIS position' : 'Live route progress'}
          </div>
          <p className="mt-1 leading-snug text-[#64748b]">
            <span className="font-medium text-emerald-700">{originLabel}</span>
            {' → '}
            <span className="font-medium text-sky-700">{destLabel}</span>
            {metrics && metrics.progressPct > 0 ? (
              <span className="ms-1 text-[#94A3B8]">· {metrics.progressPct}%</span>
            ) : null}
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setDark((v) => !v)}
        className="absolute right-3 top-3 z-[6] flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/95 text-[#0A2942] shadow-md backdrop-blur hover:bg-white"
        aria-label={dark ? 'Switch to light map' : 'Switch to dark map'}
        title={dark ? 'Light map' : 'Dark map'}
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <MapContainer
        key={mapKey}
        center={[22, 55]}
        zoom={3}
        className="h-full w-full min-h-[280px] [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full"
        style={{ height: '100%', width: '100%', minHeight: 280 }}
        zoomControl={false}
        attributionControl
        scrollWheelZoom
      >
        <TileLayer
          attribution={
            dark
              ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
          url={tileUrl}
        />
        <ZoomControl position="bottomright" />
        <InvalidateMapSize revision={sizeRevision} />
        <FitRoute points={fitPoints} padding={fitPadding} />
        <FollowLiveVessel point={split.live ? split.vessel : null} />

        {split.done.length > 1 ? (
          <Polyline
            positions={split.done.map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{ color: '#16A34A', weight: 4.5, opacity: 0.95 }}
          />
        ) : null}
        {split.rest.length > 1 ? (
          <Polyline
            positions={split.rest.map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{
              color: '#2563EB',
              weight: 4,
              opacity: 0.9,
              dashArray: '10 8',
            }}
          />
        ) : null}

        {origin && polIcon ? (
          <Marker position={[origin.lat, origin.lng]} icon={polIcon} />
        ) : null}

        {midStops.map((stop, i) => (
          <CircleMarker
            key={`ts-${i}-${stop.lat}-${stop.lng}`}
            center={[stop.lat, stop.lng]}
            radius={6}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: '#F59E0B',
              fillOpacity: 1,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {stop.label || stop.role || 'TS'}
            </Tooltip>
          </CircleMarker>
        ))}

        {dest && podIcon ? (
          <Marker position={[dest.lat, dest.lng]} icon={podIcon} />
        ) : null}

        {split.vessel ? (
          <Marker position={[split.vessel.lat, split.vessel.lng]} icon={shipIcon}>
            <Tooltip direction="right" offset={[12, 0]}>
              {split.live ? 'Current position (live AIS)' : 'Current position (route progress)'}
            </Tooltip>
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  );
}
