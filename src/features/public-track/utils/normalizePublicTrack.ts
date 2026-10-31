import {
  asRecord,
  pickString,
  unwrapData,
} from '@/features/portal-shared/normalize';
import type {
  PublicTrackEmbedConfig,
  PublicTrackMatch,
  PublicTrackMilestone,
  PublicTrackResult,
} from '../types/publicTrack.types';

function pickNumber(...values: unknown[]): number | undefined {
  for (const v of values) {
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export function normalizePublicMilestone(
  raw: unknown,
  index: number,
): PublicTrackMilestone | null {
  const r = asRecord(raw);
  if (!r) return null;

  const completedAt =
    pickString(
      r.completed_at,
      r.completedAt,
      r.occurred_at,
      r.occurredAt,
      r.actual_date,
      r.actualDate,
      r.date,
    ) || undefined;
  const status = pickString(r.status) || undefined;
  const pending =
    r.pending === true ||
    status?.toUpperCase() === 'PENDING' ||
    status?.toUpperCase() === 'PLANNED' ||
    (!completedAt && status?.toUpperCase() !== 'COMPLETED');

  const eventType =
    pickString(r.event_type, r.eventType, r.type, r.kind, r.category) || undefined;
  const summary =
    pickString(r.summary, r.message, r.detail, r.comment_summary, r.commentSummary) ||
    undefined;
  const containerNumber =
    pickString(r.container_number, r.containerNumber, r.container_no, r.containerNo) ||
    undefined;
  const labelSource =
    pickString(
      r.label,
      r.name,
      r.milestone_name,
      r.milestoneName,
      r.milestone,
      r.code,
      eventType,
      summary,
    ) || 'Milestone';

  return {
    id: pickString(r.id) || String(index),
    label: labelSource
      .replace(/[/\\|]+/g, ' ')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    description:
      pickString(r.description, r.notes, r.remark, summary) || undefined,
    occurredAt: completedAt,
    completedAt,
    location: pickString(r.location, r.place) || undefined,
    status,
    pending: Boolean(pending),
    eventType,
    summary,
    containerNumber,
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
      r.bl_number,
      r.awb_number,
    );
    if (!reference) continue;
    out.push({
      reference,
      kind: pickString(r.kind, r.type, r.match_type) || undefined,
      status: pickString(r.status) || undefined,
    });
  }
  return out.length ? out : undefined;
}

export function normalizePublicTrack(raw: unknown): PublicTrackResult | null {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!d) return null;
  const shipment = asRecord(d.shipment) ?? asRecord(d.job) ?? d;
  const ref = pickString(
    shipment.reference,
    shipment.job_number,
    shipment.jobNumber,
    shipment.shipment_number,
    d.ref,
    d.reference,
  );
  if (!ref) return null;
  const msRaw = Array.isArray(shipment.milestones)
    ? shipment.milestones
    : Array.isArray(d.milestones)
      ? d.milestones
      : Array.isArray(d.events)
        ? d.events
        : Array.isArray(d.timeline)
          ? d.timeline
          : Array.isArray(shipment.events)
            ? shipment.events
            : Array.isArray(shipment.timeline)
              ? shipment.timeline
              : [];

  let progress = pickNumber(
    shipment.progress,
    d.progress,
    shipment.progress_pct,
    d.progress_pct,
  );
  if (progress != null && progress > 0 && progress <= 1) progress = Math.round(progress * 100);

  return {
    reference: ref,
    status: pickString(shipment.status, d.status, d.current_status) || undefined,
    currentStatus:
      pickString(
        d.current_status,
        d.currentStatus,
        shipment.current_status,
        shipment.status,
        d.status,
      ) || undefined,
    progress,
    expectedDelivery:
      pickString(
        d.expected_delivery,
        d.expectedDelivery,
        shipment.expected_delivery,
        shipment.expectedDelivery,
        shipment.eta,
        d.eta,
      ) || undefined,
    origin: pickString(shipment.origin, shipment.origin_name, shipment.origin_port_name) || undefined,
    destination:
      pickString(shipment.destination, shipment.dest_name, shipment.dest_port_name) || undefined,
    jobType: pickString(shipment.job_type, shipment.jobType) || undefined,
    partyName: pickString(shipment.party_name, d.party_name) || undefined,
    milestones: msRaw
      .map(normalizePublicMilestone)
      .filter((m): m is PublicTrackMilestone => Boolean(m)),
    matches: normalizeMatches(d.matches ?? d.results ?? d.alternates),
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
