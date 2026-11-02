import {
  asRecord,
  pickString,
  unwrapData,
} from '@/features/portal-shared/normalize';
import type {
  PublicTrackEmbedConfig,
  PublicTrackMatch,
  PublicTrackMilestone,
  PublicTrackProgressLeg,
  PublicTrackResult,
} from '../types/publicTrack.types';

function pickNumber(...values: unknown[]): number | undefined {
  for (const v of values) {
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function titleCaseMove(value: string): string {
  return value
    .replace(/[/\\|]+/g, ' ')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function unwrapArray(...candidates: unknown[]): unknown[] {
  for (const c of candidates) {
    if (Array.isArray(c) && c.length) return c;
    const rec = asRecord(c);
    if (!rec) continue;
    for (const key of ['items', 'results', 'rows', 'data', 'legs', 'ports', 'points']) {
      if (Array.isArray(rec[key]) && (rec[key] as unknown[]).length) {
        return rec[key] as unknown[];
      }
    }
  }
  return [];
}

function formatContainerType(type?: string, iso?: string): string | undefined {
  const t = type?.trim();
  const i = iso?.trim();
  if (t && i && t.toUpperCase() !== i.toUpperCase()) return `${i} (${t})`;
  return t || i || undefined;
}

function containerKindOf(rec: Record<string, unknown> | null): 'ACTUAL' | 'PLANNED' | undefined {
  const kind = pickString(rec?.kind, rec?.container_kind, rec?.containerKind)?.toUpperCase();
  if (kind === 'ACTUAL' || kind === 'PLANNED') return kind;
  return undefined;
}

/** OpenAPI TrackHistoryEventDto (+ legacy aliases). */
export function normalizePublicMilestone(
  raw: unknown,
  index: number,
): PublicTrackMilestone | null {
  const r = asRecord(raw);
  if (!r) return null;

  const completedAt =
    pickString(
      r.actual_at,
      r.actualAt,
      r.completed_at,
      r.completedAt,
      r.occurred_at,
      r.occurredAt,
      r.planned_at,
      r.plannedAt,
      r.date,
      r.timestamp,
    ) || undefined;

  const isCompleted =
    r.is_completed === true ||
    r.isCompleted === true ||
    Boolean(
      pickString(r.actual_at, r.actualAt, r.completed_at, r.completedAt, r.occurred_at),
    );

  const moveRaw =
    pickString(r.move, r.label, r.code, r.type, r.event_type, r.eventType) || 'EVENT';
  const move = titleCaseMove(moveRaw);

  return {
    id: pickString(r.id, r.code) || String(index),
    label: move,
    move,
    description: pickString(r.notes, r.description, r.summary) || undefined,
    summary: pickString(r.notes, r.summary) || undefined,
    occurredAt: completedAt,
    completedAt,
    location: pickString(r.location, r.place, r.port, r.port_name, r.city) || undefined,
    terminal: pickString(r.terminal, r.terminal_name, r.facility, r.depot) || undefined,
    status: pickString(r.status) || undefined,
    pending: !isCompleted,
    eventType: pickString(r.type, r.code) || undefined,
    containerNumber:
      pickString(r.container_number, r.containerNumber, r.container_no) || undefined,
    vessel: pickString(r.vessel_name, r.vesselName, r.vessel) || undefined,
    voyage: pickString(r.voyage_number, r.voyageNumber, r.voyage) || undefined,
  };
}

function normalizeMatches(raw: unknown): PublicTrackMatch[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: PublicTrackMatch[] = [];
  for (const row of raw) {
    const r = asRecord(row);
    if (!r) continue;
    const reference = pickString(
      r.reference,
      r.ref,
      r.job_number,
      r.jobNumber,
      r.shipment_number,
      r.container_number,
    );
    if (!reference) continue;
    out.push({
      reference,
      kind: pickString(r.kind, r.type) || undefined,
      status: pickString(r.status) || undefined,
    });
  }
  return out.length ? out : undefined;
}

/** OpenAPI TrackRouteLegDto (+ legacy). */
function normalizeProgressLegs(body: Record<string, unknown>): PublicTrackProgressLeg[] {
  const raw = unwrapArray(
    body.progress_legs,
    body.progressLegs,
    body.route_legs,
    body.routeLegs,
    body.ports,
    body.route,
  );

  return raw
    .map((row, index) => {
      const r = asRecord(row);
      if (!r) {
        const name = pickString(row);
        if (!name) return null;
        return {
          id: String(index),
          code: index === 0 ? 'POL' : index === raw.length - 1 ? 'POD' : 'PTS',
          name,
        } satisfies PublicTrackProgressLeg;
      }
      const name =
        pickString(r.name, r.port_name, r.portName, r.location, r.city, r.label) || '';
      if (!name) return null;
      const code =
        pickString(r.code, r.leg_type, r.legType, r.role, r.kind, r.type)?.toUpperCase() ||
        (index === 0 ? 'POL' : index === raw.length - 1 ? 'POD' : 'PTS');
      return {
        id: pickString(r.id, r.un_locode, r.unLocode) || String(index),
        code,
        name,
        country: pickString(r.country, r.country_code, r.countryCode) || undefined,
        current: r.current === true || r.is_current === true || r.isCurrent === true,
        completed:
          r.completed === true ||
          r.is_completed === true ||
          Boolean(pickString(r.completed_at, r.actual_date)),
      } satisfies PublicTrackProgressLeg;
    })
    .filter((l): l is PublicTrackProgressLeg => Boolean(l));
}

function pickContainerFromBody(body: Record<string, unknown>): {
  containerNumber?: string;
  containerType?: string;
  containerKind?: 'ACTUAL' | 'PLANNED';
} {
  const topNumber = pickString(body.container_number, body.containerNumber);
  const topType = formatContainerType(
    pickString(body.container_type, body.containerType),
    pickString(body.iso_size, body.isoSize),
  );

  const list = unwrapArray(body.containers);
  const rows = list
    .map((row) => {
      const r = asRecord(row);
      if (!r) return null;
      const number = pickString(r.container_number, r.containerNumber) || '';
      const type = formatContainerType(
        pickString(r.container_type, r.containerType, r.status_label),
        pickString(r.iso_size, r.isoSize),
      );
      return {
        number,
        type: type || '',
        kind: containerKindOf(r),
      };
    })
    .filter((r): r is { number: string; type: string; kind: 'ACTUAL' | 'PLANNED' | undefined } =>
      Boolean(r && (r.number || r.type)),
    );

  const preferred =
    rows.find((r) => r.kind === 'ACTUAL' && r.number) ||
    rows.find((r) => r.kind === 'PLANNED' && r.number) ||
    rows.find((r) => r.number) ||
    rows[0];

  return {
    containerNumber: preferred?.number || topNumber || undefined,
    containerType: preferred?.type || topType || undefined,
    containerKind: preferred?.kind,
  };
}

/**
 * Peel TrackShipmentResponseDto and nested `{ success, data }` envelopes until
 * we reach TrackShipmentBodyDto (or the best available object).
 */
function peelTrackBody(raw: unknown): Record<string, unknown> | null {
  let cur: unknown = raw;
  for (let i = 0; i < 4; i += 1) {
    const rec = asRecord(cur);
    if (!rec) return null;
    // Prefer explicit track body keys before peeling another `data` wrapper.
    if (
      rec.current_status != null ||
      rec.currentStatus != null ||
      Array.isArray(rec.history) ||
      Array.isArray(rec.moves) ||
      Array.isArray(rec.events) ||
      Array.isArray(rec.progress_legs) ||
      Array.isArray(rec.progressLegs) ||
      Array.isArray(rec.route_legs) ||
      Array.isArray(rec.ports) ||
      Array.isArray(rec.containers) ||
      rec.container_number != null ||
      rec.job_number != null
    ) {
      return rec;
    }
    const nested =
      asRecord(rec.data) ??
      asRecord(rec.tracking) ??
      asRecord(rec.track) ??
      asRecord(rec.shipment) ??
      asRecord(rec.job) ??
      asRecord(unwrapData(rec));
    if (!nested || nested === rec) return rec;
    cur = nested;
  }
  return asRecord(cur);
}

/**
 * Normalize TrackShipmentResponseDto / TrackShipmentBodyDto and legacy envelopes.
 * OpenAPI: `{ success, data: TrackShipmentBodyDto }`.
 * Always returns a result when `fallbackRef` is provided so the reference UI can render.
 */
export function normalizePublicTrack(
  raw: unknown,
  opts?: { fallbackRef?: string },
): PublicTrackResult | null {
  const body = peelTrackBody(raw) ?? asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!body) {
    if (!opts?.fallbackRef?.trim()) return null;
    return {
      reference: opts.fallbackRef.trim(),
      progressLegs: [],
      milestones: [],
    };
  }

  const root = body;
  const summary = asRecord(body.summary);

  const ref =
    pickString(
      body.job_number,
      body.jobNumber,
      body.reference,
      body.shipment_number,
      body.shipmentNumber,
      body.container_number,
      root.job_number,
      root.reference,
      root.ref,
      summary?.job_number,
      summary?.reference,
      opts?.fallbackRef,
    ) || '';
  if (!ref) return null;

  const historyRaw = unwrapArray(
    body.history,
    body.moves,
    body.events,
    body.timeline,
    body.milestones,
    root.history,
    root.moves,
    root.events,
    root.milestones,
  );

  const milestones = historyRaw
    .map(normalizePublicMilestone)
    .filter((m): m is PublicTrackMilestone => Boolean(m));

  // Prefer newest first for "current move" + previous collapses.
  const ordered = [...milestones].sort((a, b) => {
    const ta = Date.parse(a.completedAt || a.occurredAt || '') || 0;
    const tb = Date.parse(b.completedAt || b.occurredAt || '') || 0;
    return tb - ta;
  });

  let progress = pickNumber(body.progress, root.progress, summary?.progress);
  if (progress != null && progress > 0 && progress <= 1) progress = Math.round(progress * 100);

  const origin =
    pickString(body.origin, body.origin_name, body.pol, summary?.origin) || undefined;
  const destination =
    pickString(body.destination, body.dest_name, body.pod, summary?.destination) ||
    undefined;

  const container = pickContainerFromBody(body);
  let progressLegs = normalizeProgressLegs(body);

  if (!progressLegs.length && (origin || destination)) {
    progressLegs = [];
    if (origin) progressLegs.push({ id: 'pol', code: 'POL', name: origin, completed: true });
    if (destination) {
      progressLegs.push({ id: 'pod', code: 'POD', name: destination, current: true });
    }
  }

  if (progressLegs.length && !progressLegs.some((l) => l.current)) {
    progressLegs[progressLegs.length - 1] = {
      ...progressLegs[progressLegs.length - 1],
      current: true,
    };
  }

  const topVessel = pickString(body.vessel_name, body.vesselName);
  const topVoyage = pickString(body.voyage_number, body.voyageNumber);
  if (topVessel || topVoyage) {
    for (const m of ordered) {
      if (!m.vessel && topVessel) m.vessel = topVessel;
      if (!m.voyage && topVoyage) m.voyage = topVoyage;
    }
  }

  return {
    reference: ref,
    status: pickString(body.status, root.status) || undefined,
    currentStatus:
      pickString(
        body.current_status,
        body.currentStatus,
        summary?.current_status,
        body.status,
        root.current_status,
      ) || undefined,
    progress,
    expectedDelivery:
      pickString(body.expected_delivery, body.eta, summary?.eta) || undefined,
    origin,
    destination,
    jobType: pickString(body.job_type, body.jobType) || undefined,
    partyName: pickString(body.party_name, summary?.party_name) || undefined,
    containerNumber: container.containerNumber,
    containerType: container.containerType,
    containerKind: container.containerKind,
    progressLegs,
    milestones: ordered,
    matches: normalizeMatches(root.matches ?? root.results ?? root.alternates),
  };
}

export function normalizeEmbedConfig(raw: unknown): PublicTrackEmbedConfig {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return {
    tenantSlug: pickString(d.tenant_slug, d.tenantSlug) || undefined,
    companyName: pickString(d.company_name, d.companyName, d.tenant_name) || undefined,
    primaryColor: pickString(d.primary_color, d.primaryColor) || undefined,
    logoUrl: pickString(d.logo_url, d.logoUrl) || undefined,
    trackUrl: pickString(d.track_url, d.trackUrl, d.endpoint) || undefined,
    apiBaseUrl: pickString(d.api_base_url, d.apiBaseUrl, d.base_url) || undefined,
    widgetScriptUrl:
      pickString(d.widget_script_url, d.widgetScriptUrl, d.widget_url) || undefined,
  };
}
