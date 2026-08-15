import {
  asRecord,
  pickString,
  unwrapData
} from '@/features/portal-shared/normalize';
import type { PublicTrackEmbedConfig, PublicTrackMilestone, PublicTrackResult } from '../types/publicTrack.types';

export function normalizePublicMilestone(raw: unknown, index: number): PublicTrackMilestone | null {
  const r = asRecord(raw); if (!r) return null;
  return {
    id: pickString(r.id) || String(index),
    label: pickString(r.label, r.name, r.code, r.milestone) || 'Milestone',
    occurredAt: pickString(r.occurred_at, r.occurredAt, r.date) || undefined,
    location: pickString(r.location, r.place) || undefined,
    status: pickString(r.status) || undefined,
  };
}

export function normalizePublicTrack(raw: unknown): PublicTrackResult | null {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw); if (!d) return null;
  const shipment = asRecord(d.shipment) ?? d;
  const ref = pickString(shipment.reference, shipment.job_number, shipment.jobNumber, d.ref, d.reference);
  if (!ref) return null;
  const msRaw = Array.isArray(shipment.milestones) ? shipment.milestones : Array.isArray(d.milestones) ? d.milestones : [];
  return {
    reference: ref,
    status: pickString(shipment.status, d.status) || undefined,
    origin: pickString(shipment.origin, shipment.origin_name) || undefined,
    destination: pickString(shipment.destination, shipment.dest_name) || undefined,
    jobType: pickString(shipment.job_type, shipment.jobType) || undefined,
    partyName: pickString(shipment.party_name, d.party_name) || undefined,
    milestones: msRaw.map(normalizePublicMilestone).filter((m): m is PublicTrackMilestone => Boolean(m)),
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
    widgetScriptUrl: pickString(d.widget_script_url, d.widgetScriptUrl, d.widget_url) || undefined,
  };
}
