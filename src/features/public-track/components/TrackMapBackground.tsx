import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Tooltip,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Moon, Sun } from 'lucide-react';
import type { PublicTrackResult } from '../types/publicTrack.types';
import {
  interpolateArc,
  resolvePortCoordinates,
  type LatLng,
} from '../utils/portCoordinates';
import { computeTrackMetrics } from '../utils/trackMetrics';

setWorkerUrl(maplibreWorkerUrl);

const ENGLISH_TEXT_FIELD = [
  'coalesce',
  ['get', 'name:en'],
  ['get', 'name_en'],
  ['get', 'name:latin'],
  ['get', 'name'],
] as const;

function preferEnglishLabels(maplibreMap: {
  getStyle: () => { layers?: Array<Record<string, unknown>> } | undefined;
  getLayoutProperty: (id: string, key: string) => unknown;
  setLayoutProperty: (id: string, key: string, value: unknown) => void;
}) {
  const layers = maplibreMap.getStyle()?.layers ?? [];
  for (const layer of layers) {
    if (layer.type !== 'symbol' || typeof layer.id !== 'string') continue;
    let textField: unknown;
    try {
      textField = maplibreMap.getLayoutProperty(layer.id, 'text-field');
    } catch {
      continue;
    }
    if (textField == null) continue;
    const serialized = JSON.stringify(textField);
    // Keep highway shields / refs as numbers, not place names.
    if (serialized.includes('"ref"') && !serialized.includes('"name"')) continue;
    try {
      maplibreMap.setLayoutProperty(layer.id, 'text-field', [...ENGLISH_TEXT_FIELD]);
    } catch {
      // Some style layers reject text-field updates — ignore.
    }
  }
}

type Props = {
  result?: PublicTrackResult | null;
  /** Prefer dark or light tiles. */
  dark?: boolean;
  className?: string;
  /** Kept for call-site compat (unused). */
  showLiveBadge?: boolean;
  /**
   * Extra left padding when an expandable panel covers the left side
   * so POL→POD stays visible on the right ([top, right, bottom, left]).
   */
  fitPadding?: [number, number, number, number];
};

type Waypoint = LatLng & { label?: string; role?: string };

type GoogleMapsNamespace = {
  maps: {
    Map: new (
      el: HTMLElement,
      opts: Record<string, unknown>,
    ) => GoogleMapInstance;
    LatLngBounds: new () => GoogleLatLngBounds;
    Polyline: new (opts: Record<string, unknown>) => { setMap: (m: unknown) => void };
    Marker: new (opts: Record<string, unknown>) => { setMap: (m: unknown) => void };
    SymbolPath: { CIRCLE: unknown };
    TravelMode?: unknown;
  };
};

type GoogleMapInstance = {
  fitBounds: (b: GoogleLatLngBounds, padding?: number | Record<string, number>) => void;
  setCenter: (c: { lat: number; lng: number }) => void;
  setZoom: (z: number) => void;
};

type GoogleLatLngBounds = {
  extend: (p: { lat: number; lng: number }) => void;
  isEmpty: () => boolean;
};

declare global {
  interface Window {
    google?: GoogleMapsNamespace;
    __kfGoogleMapsPromise?: Promise<GoogleMapsNamespace>;
  }
}

function googleMapsApiKey(): string {
  return String(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
}

function loadGoogleMaps(apiKey: string): Promise<GoogleMapsNamespace> {
  if (window.google?.maps) return Promise.resolve(window.google);
  if (window.__kfGoogleMapsPromise) return window.__kfGoogleMapsPromise;

  window.__kfGoogleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-kf-google-maps="1"]',
    );
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.google?.maps) resolve(window.google);
        else reject(new Error('Google Maps failed to load'));
      });
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.dataset.kfGoogleMaps = '1';
    script.async = true;
    script.defer = true;
    // language=en → English labels like the Google Maps link.
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&language=en&v=weekly`;
    script.onload = () => {
      if (window.google?.maps) resolve(window.google);
      else reject(new Error('Google Maps failed to load'));
    };
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });

  return window.__kfGoogleMapsPromise;
}

/** Green POL pin + white anchor — matches reference. */
function polIcon(label: string) {
  const safe = label.replace(/[<>&"]/g, '');
  return L.divIcon({
    className: 'kf-track-pol-icon',
    iconSize: [22, 40],
    iconAnchor: [11, 11],
    html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 1px 3px rgba(0,0,0,.35));pointer-events:none">
      <div style="width:22px;height:22px;border-radius:9999px;background:#22C55E;border:2.5px solid #fff;display:flex;align-items:center;justify-content:center">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M12 2v3M8 8h8M12 5c-3 0-5 2-5 5v2h3v8h4v-8h3v-2c0-3-2-5-5-5z"/></svg>
      </div>
      <span style="margin-top:4px;padding:2px 7px;border-radius:9999px;background:#fff;font:700 10px/1.2 system-ui,sans-serif;color:#0A2942;white-space:nowrap;border:1px solid rgba(10,41,66,.08)">POL ${safe}</span>
    </div>`,
  });
}

/** Blue POD pin + white flag — matches reference. */
function podIcon(label: string) {
  const safe = label.replace(/[<>&"]/g, '');
  return L.divIcon({
    className: 'kf-track-pod-icon',
    iconSize: [22, 40],
    iconAnchor: [11, 11],
    html: `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 1px 3px rgba(0,0,0,.35));pointer-events:none">
      <div style="width:22px;height:22px;border-radius:9999px;background:#2563EB;border:2.5px solid #fff;display:flex;align-items:center;justify-content:center">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M5 3v18M5 4h10l-2 3 2 3H5"/></svg>
      </div>
      <span style="margin-top:4px;padding:2px 7px;border-radius:9999px;background:#fff;font:700 10px/1.2 system-ui,sans-serif;color:#0A2942;white-space:nowrap;border:1px solid rgba(10,41,66,.08)">POD ${safe}</span>
    </div>`,
  });
}

/** Green live vessel disc — matches reference ship marker. */
function vesselIcon() {
  return L.divIcon({
    className: 'kf-track-vessel-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `<div style="width:30px;height:30px;border-radius:9999px;background:#22C55E;border:2.5px solid #fff;box-shadow:0 0 0 5px rgba(34,197,94,.25),0 2px 6px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M3 16 12 5l9 11H3zm9-8.2L7.2 14h9.6L12 7.8zM4 18h16v2H4z"/></svg>
    </div>`,
  });
}

function fitMaxZoom(points: LatLng[]): number {
  if (points.length < 2) return 12;
  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;
  for (const p of points) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }
  const span = Math.max(maxLat - minLat, maxLng - minLng);
  if (span < 0.08) return 14;
  if (span < 0.4) return 12;
  if (span < 2) return 9;
  if (span < 8) return 7;
  if (span < 25) return 5;
  return 4;
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
      map.setView([points[0].lat, points[0].lng], 10);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, {
      paddingTopLeft: [padding[3], padding[0]],
      paddingBottomRight: [padding[1], padding[2]],
      maxZoom: fitMaxZoom(points),
    });
  }, [map, points, padding]);
  return null;
}

function InvalidateMapSize({ revision }: { revision?: string }) {
  const map = useMap();
  useEffect(() => {
    const refresh = () => map.invalidateSize({ animate: false });
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

/** Free OpenFreeMap vector basemap with English-only place labels. */
function EnglishBasemap({ dark }: { dark: boolean }) {
  const map = useMap();

  useEffect(() => {
    const styleUrl = dark
      ? 'https://tiles.openfreemap.org/styles/dark'
      : 'https://tiles.openfreemap.org/styles/liberty';

    const glLayer = maplibreGL({
      style: styleUrl,
      interactive: false,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://openfreemap.org">OpenFreeMap</a>',
    });
    glLayer.addTo(map);

    const mlMap = glLayer.getMaplibreMap?.() as
      | {
          getStyle: () => { layers?: Array<Record<string, unknown>> } | undefined;
          getLayoutProperty: (id: string, key: string) => unknown;
          setLayoutProperty: (id: string, key: string, value: unknown) => void;
          once: (event: string, cb: () => void) => void;
          on: (event: string, cb: () => void) => void;
          off: (event: string, cb: () => void) => void;
        }
      | undefined;

    const apply = () => {
      if (!mlMap) return;
      preferEnglishLabels(mlMap);
    };

    if (mlMap) {
      mlMap.once('load', apply);
      mlMap.on('styledata', apply);
      // Style may already be ready.
      apply();
    }

    return () => {
      if (mlMap) {
        mlMap.off('styledata', apply);
      }
      try {
        map.removeLayer(glLayer);
      } catch {
        // Layer may already be gone with map remount.
      }
    };
  }, [map, dark]);

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
    out.push({ ...pt, label: row.label || undefined, role: row.role });
  }
  return out;
}

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
  if (waypoints.length === 2) return interpolateArc(waypoints[0], waypoints[1], 80);
  const arc: LatLng[] = [];
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const segment = interpolateArc(waypoints[i], waypoints[i + 1], 32);
    if (i > 0) segment.shift();
    arc.push(...segment);
  }
  return arc;
}

function splitRoute(arc: LatLng[], progressPct: number, livePosition?: LatLng | null) {
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
  const pct = Math.max(0, Math.min(100, progressPct > 0 ? progressPct : 45));
  const idx = Math.max(1, Math.min(arc.length - 1, Math.round((pct / 100) * (arc.length - 1))));
  return {
    done: arc.slice(0, idx + 1),
    rest: arc.slice(idx),
    vessel: arc[idx],
    live: false as const,
  };
}

function shortPortLabel(raw?: string): string {
  if (!raw?.trim()) return '';
  return raw
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\b[A-Z]{5}\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/[,/–—-]/)[0]
    .trim();
}

function useTrackMapModel(result?: PublicTrackResult | null) {
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
    if (arc.length > 2) {
      pts.push(arc[Math.floor(arc.length * 0.35)]);
      pts.push(arc[Math.floor(arc.length * 0.65)]);
    }
    return pts;
  }, [waypoints, split.vessel, arc]);

  const originLabel =
    shortPortLabel(origin?.label || metrics?.origin) || 'Origin';
  const destLabel =
    shortPortLabel(dest?.label || metrics?.destination) || 'Destination';

  return {
    metrics,
    waypoints,
    origin,
    dest,
    arc,
    livePosition,
    split,
    fitPoints,
    originLabel,
    destLabel,
    midStops: waypoints.slice(1, -1),
  };
}

/** Live Google Maps (English) when VITE_GOOGLE_MAPS_API_KEY is set. */
function GoogleTrackMap({
  result,
  dark: darkProp,
  className,
  fitPadding = [56, 56, 56, 520],
  apiKey,
}: Props & { apiKey: string }) {
  const [dark, setDark] = useState(Boolean(darkProp));
  const [error, setError] = useState<string | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const overlaysRef = useRef<Array<{ setMap: (m: unknown) => void }>>([]);
  const model = useTrackMapModel(result);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then((g) => {
        if (cancelled || !hostRef.current) return;
        if (!mapRef.current) {
          mapRef.current = new g.maps.Map(hostRef.current, {
            center: { lat: 22, lng: 55 },
            zoom: 3,
            mapTypeId: dark ? 'hybrid' : 'roadmap',
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: { position: 9 },
            gestureHandling: 'greedy',
            clickableIcons: false,
            keyboardShortcuts: false,
          });
        } else {
          (mapRef.current as unknown as { setMapTypeId: (id: string) => void }).setMapTypeId(
            dark ? 'hybrid' : 'roadmap',
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Google Maps key invalid or blocked. Falling back…');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey, dark]);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then((g) => {
        if (cancelled || !mapRef.current) return;
        for (const o of overlaysRef.current) o.setMap(null);
        overlaysRef.current = [];

        const map = mapRef.current;
        const { split, origin, dest, midStops, originLabel, destLabel, fitPoints, livePosition } =
          model;

        if (split.done.length > 1) {
          const line = new g.maps.Polyline({
            path: split.done,
            geodesic: true,
            strokeColor: '#22C55E',
            strokeOpacity: 1,
            strokeWeight: 5,
            map,
          });
          overlaysRef.current.push(line);
        }
        if (split.rest.length > 1) {
          const line = new g.maps.Polyline({
            path: split.rest,
            geodesic: true,
            strokeColor: '#3B82F6',
            strokeOpacity: 0,
            strokeWeight: 4.5,
            map,
            icons: [
              {
                icon: {
                  path: 'M 0,-1 0,1',
                  strokeOpacity: 0.95,
                  strokeColor: '#3B82F6',
                  scale: 3,
                },
                offset: '0',
                repeat: '14px',
              },
            ],
          });
          overlaysRef.current.push(line);
        }

        const pin = (
          position: LatLng,
          title: string,
          color: string,
        ) => {
          const m = new g.maps.Marker({
            position,
            map,
            title,
            icon: {
              path: g.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2.5,
            },
          });
          overlaysRef.current.push(m);
        };

        if (origin) pin(origin, `POL ${originLabel}`, '#22C55E');
        for (const stop of midStops) pin(stop, stop.label || 'TS', '#F59E0B');
        if (dest) pin(dest, `POD ${destLabel}`, '#2563EB');
        if (split.vessel) {
          const m = new g.maps.Marker({
            position: split.vessel,
            map,
            title: livePosition ? 'Live position' : 'In transit',
            icon: {
              path: g.maps.SymbolPath.CIRCLE,
              scale: 11,
              fillColor: '#22C55E',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2.5,
            },
            zIndex: 999,
          });
          overlaysRef.current.push(m);
        }

        if (fitPoints.length) {
          const bounds = new g.maps.LatLngBounds();
          for (const p of fitPoints) bounds.extend(p);
          if (!bounds.isEmpty()) {
            map.fitBounds(bounds, {
              top: fitPadding[0],
              right: fitPadding[1],
              bottom: fitPadding[2],
              left: fitPadding[3],
            });
          }
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [apiKey, model, fitPadding]);

  if (error) {
    return <LeafletTrackMap result={result} dark={dark} className={className} fitPadding={fitPadding} />;
  }

  return (
    <div className={className ?? 'absolute inset-0 z-0 h-full w-full'}>
      <button
        type="button"
        onClick={() => setDark((v) => !v)}
        className="absolute right-3 top-3 z-[6] flex h-9 w-9 items-center justify-center rounded-full border border-black/5 bg-white/95 text-[#0A2942] shadow-md backdrop-blur hover:bg-white"
        aria-label={dark ? 'Switch to light map' : 'Switch to dark map'}
        title={dark ? 'Light map' : 'Satellite map'}
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <div ref={hostRef} className="h-full w-full min-h-[280px]" />
    </div>
  );
}

/** Free English-label basemap (OpenFreeMap) — used when Google key is absent. */
function LeafletTrackMap({
  result,
  dark: darkProp,
  className,
  fitPadding = [56, 56, 56, 520],
}: Props) {
  const [dark, setDark] = useState(Boolean(darkProp));
  const model = useTrackMapModel(result);
  const {
    waypoints,
    origin,
    dest,
    split,
    fitPoints,
    originLabel,
    destLabel,
    midStops,
    livePosition,
  } = model;

  const mapKey = [
    result?.reference ?? 'empty',
    origin ? `${origin.lat.toFixed(2)},${origin.lng.toFixed(2)}` : '',
    dest ? `${dest.lat.toFixed(2)},${dest.lng.toFixed(2)}` : '',
    String(waypoints.length),
  ].join('|');

  const polMarkerIcon = useMemo(() => polIcon(originLabel), [originLabel]);
  const podMarkerIcon = useMemo(() => podIcon(destLabel), [destLabel]);
  const shipMarkerIcon = useMemo(() => vesselIcon(), []);

  return (
    <div className={className ?? 'absolute inset-0 z-0 h-full w-full'}>
      <button
        type="button"
        onClick={() => setDark((v) => !v)}
        className="absolute right-3 top-3 z-[6] flex h-9 w-9 items-center justify-center rounded-full border border-black/5 bg-white/95 text-[#0A2942] shadow-md backdrop-blur hover:bg-white"
        aria-label={dark ? 'Switch to light map' : 'Switch to dark map'}
        title={dark ? 'Light map' : 'Dark map'}
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <MapContainer
        key={mapKey}
        center={[20, 60]}
        zoom={3}
        minZoom={1}
        maxBounds={[
          [-85, -180],
          [85, 180],
        ]}
        maxBoundsViscosity={1}
        className="h-full w-full min-h-[280px] [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full"
        style={{ height: '100%', width: '100%', minHeight: 280 }}
        zoomControl={false}
        attributionControl
        scrollWheelZoom
      >
        <EnglishBasemap dark={dark} />
        <ZoomControl position="bottomright" />
        <InvalidateMapSize revision={`${mapKey}|${dark ? 'd' : 'l'}`} />
        <FitRoute points={fitPoints} padding={fitPadding} />

        {split.done.length > 1 ? (
          <Polyline
            positions={split.done.map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{ color: '#22C55E', weight: 5, opacity: 1, lineCap: 'round' }}
          />
        ) : null}
        {split.rest.length > 1 ? (
          <Polyline
            positions={split.rest.map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{
              color: '#3B82F6',
              weight: 4.5,
              opacity: 0.95,
              dashArray: '12 9',
              lineCap: 'round',
            }}
          />
        ) : null}

        {origin ? (
          <Marker position={[origin.lat, origin.lng]} icon={polMarkerIcon} zIndexOffset={400} />
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
          <Marker position={[dest.lat, dest.lng]} icon={podMarkerIcon} zIndexOffset={400} />
        ) : null}

        {split.vessel ? (
          <Marker
            position={[split.vessel.lat, split.vessel.lng]}
            icon={shipMarkerIcon}
            zIndexOffset={600}
          >
            <Tooltip direction="top" offset={[0, -14]}>
              {livePosition ? 'Live position' : 'In transit'}
            </Tooltip>
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  );
}

/**
 * Full-bleed live Track & Trace map.
 * - Set `VITE_GOOGLE_MAPS_API_KEY` for real Google Maps (English roadmap / hybrid).
 * - Otherwise free OpenFreeMap with English-only place labels (no key).
 */
export function TrackMapBackground(props: Props) {
  const apiKey = googleMapsApiKey();
  if (apiKey) {
    return <GoogleTrackMap {...props} apiKey={apiKey} />;
  }
  return <LeafletTrackMap {...props} />;
}
