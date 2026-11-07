import { useEffect, useMemo } from 'react';
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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
};

type Waypoint = LatLng & { label?: string; role?: string };

function FitRoute({ points }: { points: LatLng[] }) {
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
    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 6 });
  }, [map, points]);
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
    // Only pan when the pin drifts far from the current view center.
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
    { label: metrics.origin || 'Origin', role: 'POL' },
    { label: metrics.destination || 'Destination', role: 'POD' },
  ]);
}

function buildRouteArc(waypoints: Waypoint[]): LatLng[] {
  if (waypoints.length < 2) return waypoints.map((w) => ({ lat: w.lat, lng: w.lng }));
  const arc: LatLng[] = [];
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const segment = interpolateArc(waypoints[i], waypoints[i + 1], 24);
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
 * Prefers live lat/lng + progress legs / port-of-call from the track payload;
 * falls back to resolved port labels and progress-based position.
 */
export function TrackMapBackground({
  result,
  dark = false,
  className,
  showLiveBadge = false,
}: Props) {
  const metrics = result ? computeTrackMetrics(result) : null;
  const waypoints = useMemo(() => buildLiveWaypoints(result), [result]);
  const origin = waypoints[0] ?? null;
  const dest = waypoints.length > 1 ? waypoints[waypoints.length - 1] : null;

  const arc = useMemo(() => buildRouteArc(waypoints), [waypoints]);

  const livePosition = useMemo(() => {
    if (
      result?.currentLat != null &&
      result?.currentLng != null &&
      Number.isFinite(result.currentLat) &&
      Number.isFinite(result.currentLng)
    ) {
      return { lat: result.currentLat, lng: result.currentLng };
    }
    const currentLeg = (result?.progressLegs ?? []).find((l) => l.current);
    if (currentLeg) {
      const fromLeg = resolveWaypoint(currentLeg.name, currentLeg.lat, currentLeg.lng);
      if (fromLeg) return fromLeg;
    }
    // Latest completed milestone location → live pin when BE omits current_position.
    for (const m of result?.milestones ?? []) {
      if (m.pending) continue;
      const fromMilestone = resolvePortCoordinates(m.location || m.terminal);
      if (fromMilestone) return fromMilestone;
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

  // Remount when the tracked shipment / route ends change (not every live ping).
  const mapKey = [
    result?.reference ?? 'empty',
    origin ? `${origin.lat.toFixed(2)},${origin.lng.toFixed(2)}` : '',
    dest ? `${dest.lat.toFixed(2)},${dest.lng.toFixed(2)}` : '',
    String(waypoints.length),
  ].join('|');

  const sizeRevision = [
    mapKey,
    split.vessel ? `${split.vessel.lat.toFixed(3)},${split.vessel.lng.toFixed(3)}` : '',
  ].join('|');

  const tileUrl = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const midStops = waypoints.slice(1, -1);
  const originLabel = origin?.label || metrics?.origin || 'Origin';
  const destLabel = dest?.label || metrics?.destination || 'Destination';

  return (
    <div className={className ?? 'absolute inset-0 z-0 h-full w-full'}>
      {showLiveBadge ? (
        <div className="pointer-events-none absolute left-3 top-3 z-[6] max-w-[min(90%,20rem)] rounded-lg bg-white/95 px-3 py-2 text-[11px] shadow-md backdrop-blur">
          <div className="flex items-center gap-1.5 font-semibold text-[#0A2942]">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                split.live ? 'animate-pulse bg-emerald-500' : 'bg-sky-500'
              }`}
            />
            {split.live ? 'Live tracking' : 'Route tracking'}
          </div>
          <p className="mt-1 leading-snug text-[#64748b]">
            <span className="font-medium text-emerald-700">{originLabel}</span>
            {' → '}
            <span className="font-medium text-sky-700">{destLabel}</span>
          </p>
        </div>
      ) : null}

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
        <FitRoute points={fitPoints} />
        <FollowLiveVessel point={split.live ? split.vessel : null} />

        {split.done.length > 1 ? (
          <Polyline
            positions={split.done.map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{ color: '#16A34A', weight: 4, opacity: 0.9 }}
          />
        ) : null}
        {split.rest.length > 1 ? (
          <Polyline
            positions={split.rest.map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{
              color: '#2563EB',
              weight: 3.5,
              opacity: 0.85,
              dashArray: '10 8',
            }}
          />
        ) : null}

        {origin ? (
          <CircleMarker
            center={[origin.lat, origin.lng]}
            radius={10}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: '#16A34A',
              fillOpacity: 1,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -8]}>
              POL {originLabel}
            </Tooltip>
          </CircleMarker>
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

        {dest ? (
          <CircleMarker
            center={[dest.lat, dest.lng]}
            radius={10}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: '#2563EB',
              fillOpacity: 1,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -8]}>
              POD {destLabel}
            </Tooltip>
          </CircleMarker>
        ) : null}

        {split.vessel ? (
          <>
            {split.live ? (
              <CircleMarker
                center={[split.vessel.lat, split.vessel.lng]}
                radius={16}
                pathOptions={{
                  color: '#22C55E',
                  weight: 1,
                  fillColor: '#22C55E',
                  fillOpacity: 0.2,
                }}
              />
            ) : null}
            <CircleMarker
              center={[split.vessel.lat, split.vessel.lng]}
              radius={8}
              pathOptions={{
                color: '#0A2942',
                weight: 2,
                fillColor: '#22C55E',
                fillOpacity: 1,
              }}
            >
              <Tooltip direction="right" offset={[10, 0]}>
                {split.live
                  ? 'Current position (live)'
                  : 'Current position (from progress)'}
              </Tooltip>
            </CircleMarker>
          </>
        ) : null}
      </MapContainer>
    </div>
  );
}
