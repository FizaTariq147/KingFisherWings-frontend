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
};

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

function splitRoute(arc: LatLng[], progressPct: number) {
  if (arc.length < 2) return { done: arc, rest: [] as LatLng[] };
  const pct = Math.max(0, Math.min(100, progressPct || 35));
  const idx = Math.max(1, Math.min(arc.length - 1, Math.round((pct / 100) * (arc.length - 1))));
  return {
    done: arc.slice(0, idx + 1),
    rest: arc.slice(idx),
    vessel: arc[idx],
  };
}

/**
 * Full-bleed OSM map behind Track & Trace. Draws POL → POD arc and vessel marker.
 * No live AIS — approximate route from resolved port labels only.
 */
export function TrackMapBackground({ result, dark = false, className }: Props) {
  const metrics = result ? computeTrackMetrics(result) : null;
  const origin = resolvePortCoordinates(metrics?.origin);
  const dest = resolvePortCoordinates(metrics?.destination);

  const arc = useMemo(() => {
    if (origin && dest) return interpolateArc(origin, dest);
    return [] as LatLng[];
  }, [origin, dest]);

  const split = useMemo(
    () => splitRoute(arc, metrics?.progressPct ?? 35),
    [arc, metrics?.progressPct],
  );

  const fitPoints = useMemo(() => {
    const pts: LatLng[] = [];
    if (origin) pts.push(origin);
    if (dest) pts.push(dest);
    if (split.vessel) pts.push(split.vessel);
    return pts;
  }, [origin, dest, split.vessel]);

  // OSM tiles (no API key). Dark style uses Carto dark CDN when available.
  const tileUrl = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className={className ?? 'absolute inset-0 z-0'}>
      <MapContainer
        center={[22, 55]}
        zoom={3}
        className="h-full w-full"
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
        <FitRoute points={fitPoints} />

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
              POL {metrics?.origin || ''}
            </Tooltip>
          </CircleMarker>
        ) : null}

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
              POD {metrics?.destination || ''}
            </Tooltip>
          </CircleMarker>
        ) : null}

        {split.vessel ? (
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
              Current position (approx.)
            </Tooltip>
          </CircleMarker>
        ) : null}
      </MapContainer>
    </div>
  );
}
