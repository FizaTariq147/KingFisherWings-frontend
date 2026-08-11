import { asRecord, pickBoolean, pickString, unwrapData } from '@/features/portal-shared/normalize';
import type { PortalPreferences, PortalSavedFilters } from '../types/portalPreferences.types';

function normalizeFilters(raw: unknown): PortalSavedFilters | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const search = pickString(rec.search) || undefined;
  const status = pickString(rec.status) || undefined;
  if (!search && !status && Object.keys(rec).length === 0) return null;
  return { ...rec, search, status };
}

export function normalizePortalPreferences(raw: unknown): PortalPreferences {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return {
    milestoneAlertsEnabled: pickBoolean(data.milestone_alerts_enabled, data.milestoneAlertsEnabled) ?? false,
    documentAlertsEnabled: pickBoolean(data.document_alerts_enabled, data.documentAlertsEnabled) ?? true,
    defaultShipmentFilters: normalizeFilters(
      data.default_shipment_filters ?? data.defaultShipmentFilters,
    ),
    defaultInvoiceFilters: normalizeFilters(
      data.default_invoice_filters ?? data.defaultInvoiceFilters,
    ),
    raw: data,
  };
}
