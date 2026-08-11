import { asRecord, pickNumber, unwrapData } from '@/features/portal-shared/normalize';
import type { PortalDashboardWidgets } from '../types/portalDashboard.types';

function nested(data: Record<string, unknown>, ...keys: string[]): Record<string, unknown> | null {
  for (const key of keys) {
    const rec = asRecord(data[key]);
    if (rec) return rec;
  }
  return null;
}

export function normalizePortalDashboard(raw: unknown): PortalDashboardWidgets {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const shipments = nested(data, 'shipments', 'shipment_summary', 'shipmentSummary');
  const quotations = nested(data, 'quotations', 'quotes', 'quotation_summary', 'quotationSummary');
  const documents = nested(data, 'documents', 'document_summary', 'documentSummary');
  const invoices = nested(data, 'invoices', 'invoice_summary', 'invoiceSummary');

  return {
    shipmentsTotal: pickNumber(data.shipments_total, data.shipmentsTotal, shipments?.total, shipments?.count),
    shipmentsActive: pickNumber(data.shipments_active, data.shipmentsActive, shipments?.active, shipments?.in_progress),
    shipmentsDelivered: pickNumber(
      data.shipments_delivered,
      data.shipmentsDelivered,
      shipments?.delivered,
    ),
    quotationsTotal: pickNumber(data.quotations_total, data.quotationsTotal, quotations?.total, quotations?.count),
    quotationsOpen: pickNumber(data.quotations_open, data.quotationsOpen, quotations?.open, quotations?.pending),
    documentsTotal: pickNumber(data.documents_total, data.documentsTotal, documents?.total, documents?.count),
    invoicesOutstanding: pickNumber(
      data.invoices_outstanding,
      data.invoicesOutstanding,
      invoices?.outstanding,
    ),
    invoicesOverdue: pickNumber(data.invoices_overdue, data.invoicesOverdue, invoices?.overdue),
    raw: data,
  };
}
