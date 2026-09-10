import { asRecord, pickBoolean, pickNumber, pickString, unwrapData, unwrapList } from '@/features/portal-shared/normalize';
import type {
  PortalDashboardAlert,
  PortalDashboardWidgets,
  PortalTaskItem,
} from '../types/portalDashboard.types';

function nested(data: Record<string, unknown>, ...keys: string[]): Record<string, unknown> | null {
  for (const key of keys) {
    const rec = asRecord(data[key]);
    if (rec) return rec;
  }
  return null;
}

function normalizeTask(raw: unknown, index: number): PortalTaskItem | null {
  const r = asRecord(raw);
  if (!r) return null;
  const label =
    pickString(r.label, r.title, r.name, r.description, r.message, r.task) || undefined;
  if (!label) return null;
  const id = pickString(r.id, r.key, r.code) || `task-${index}`;
  return {
    id,
    label,
    done: pickBoolean(r.done, r.is_done, r.isDone, r.completed, r.is_completed) ?? false,
    href: pickString(r.href, r.url, r.link, r.path) || undefined,
    dueAt: pickString(r.due_at, r.dueAt, r.due_date, r.dueDate) || undefined,
    category: pickString(r.category, r.type, r.kind) || undefined,
  };
}

export function normalizePortalTasks(raw: unknown): PortalTaskItem[] {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw);
  const listSource =
    data &&
    (data.tasks ??
      data.items ??
      data.results ??
      data.todos ??
      data.checklist ??
      data.data);
  const { items } = Array.isArray(listSource)
    ? { items: listSource }
    : unwrapList(raw, ['tasks', 'items', 'results', 'todos', 'checklist']);
  return items
    .map((item, i) => normalizeTask(item, i))
    .filter((t): t is PortalTaskItem => Boolean(t));
}

function normalizeAlerts(raw: unknown): PortalDashboardAlert[] | undefined {
  const source = Array.isArray(raw)
    ? raw
    : (() => {
        const rec = asRecord(raw);
        if (!rec) return null;
        if (Array.isArray(rec.items)) return rec.items;
        if (Array.isArray(rec.alerts)) return rec.alerts;
        // Object map: { customs_hold: 2, docs_pending: 1 }
        return Object.entries(rec).map(([key, value]) => {
          if (typeof value === 'number') return { type: key, label: key, count: value };
          const nestedRec = asRecord(value);
          if (!nestedRec) return null;
          return {
            type: key,
            label: pickString(nestedRec.label, nestedRec.title, nestedRec.message) || key,
            count: pickNumber(nestedRec.count, nestedRec.total),
            href: pickString(nestedRec.href, nestedRec.url, nestedRec.link),
            severity: pickString(nestedRec.severity, nestedRec.level),
          };
        });
      })();
  if (!source) return undefined;
  const alerts: PortalDashboardAlert[] = [];
  source.forEach((entry, index) => {
    if (entry == null) return;
    const r = asRecord(entry);
    if (!r) return;
    const label = pickString(r.label, r.title, r.message, r.name, r.type);
    if (!label) return;
    alerts.push({
      id: pickString(r.id) || `alert-${index}`,
      type: pickString(r.type, r.kind) || undefined,
      label,
      severity: pickString(r.severity, r.level, r.tone) || undefined,
      href: pickString(r.href, r.url, r.link) || undefined,
      count: pickNumber(r.count, r.total),
    });
  });
  return alerts.length ? alerts : undefined;
}

export function normalizePortalDashboard(raw: unknown): PortalDashboardWidgets {
  // Support `{ data: {...} }` and occasional double envelopes from gateways.
  const outer = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const data = asRecord(unwrapData(outer)) ?? outer;
  const kpis = nested(data, 'kpis', 'kpi', 'counters', 'metrics', 'stats', 'summary') ?? {};

  const shipments =
    nested(data, 'shipments', 'shipment_summary', 'shipmentSummary', 'jobs', 'job_summary') ??
    nested(kpis, 'shipments', 'shipment_summary', 'shipmentSummary', 'jobs');
  const quotations =
    nested(
      data,
      'quotations',
      'quotes',
      'quotation_summary',
      'quotationSummary',
      'quote_summary',
      'quoteSummary',
    ) ?? nested(kpis, 'quotations', 'quotes', 'quotation_summary', 'quotationSummary');
  const documents =
    nested(data, 'documents', 'document_summary', 'documentSummary') ??
    nested(kpis, 'documents', 'document_summary', 'documentSummary');
  const invoices =
    nested(data, 'invoices', 'invoice_summary', 'invoiceSummary', 'ar', 'receivables') ??
    nested(kpis, 'invoices', 'invoice_summary', 'invoiceSummary', 'ar', 'receivables');
  const onTimeRaw =
    nested(data, 'on_time', 'onTime', 'otp', 'delivery_otp', 'deliveryOtp') ??
    nested(kpis, 'on_time', 'onTime', 'otp', 'delivery_otp');
  const payments =
    nested(data, 'payments', 'payment', 'credit', 'payments_credit', 'paymentsCredit') ??
    nested(kpis, 'payments', 'payment', 'credit');

  const tasksPreview = normalizePortalTasks(
    data.tasks_preview ?? data.tasksPreview ?? data.tasks ?? data.todos ?? kpis.tasks,
  );

  return {
    shipmentsTotal: pickNumber(
      data.shipments_total,
      data.shipmentsTotal,
      data.total_shipments,
      data.totalShipments,
      kpis.shipments_total,
      kpis.shipmentsTotal,
      kpis.total_shipments,
      kpis.totalShipments,
      shipments?.total,
      shipments?.count,
      shipments?.total_count,
      shipments?.totalCount,
    ),
    shipmentsActive: pickNumber(
      data.shipments_active,
      data.shipmentsActive,
      data.active_shipments,
      data.activeShipments,
      data.active_jobs,
      data.activeJobs,
      kpis.shipments_active,
      kpis.shipmentsActive,
      kpis.active_shipments,
      kpis.activeShipments,
      kpis.active,
      shipments?.active,
      shipments?.active_count,
      shipments?.activeCount,
      shipments?.in_progress,
      shipments?.inProgress,
      shipments?.open,
      shipments?.open_count,
      shipments?.openCount,
    ),
    shipmentsDelivered: pickNumber(
      data.shipments_delivered,
      data.shipmentsDelivered,
      data.delivered_shipments,
      data.deliveredShipments,
      kpis.shipments_delivered,
      kpis.shipmentsDelivered,
      shipments?.delivered,
      shipments?.completed,
    ),
    quotationsTotal: pickNumber(
      data.quotations_total,
      data.quotationsTotal,
      data.quotes_total,
      data.quotesTotal,
      kpis.quotations_total,
      kpis.quotationsTotal,
      quotations?.total,
      quotations?.count,
    ),
    quotationsOpen: pickNumber(
      data.quotations_open,
      data.quotationsOpen,
      data.pending_quotations,
      data.pendingQuotations,
      data.open_quotations,
      data.openQuotations,
      data.quotes_open,
      data.quotesOpen,
      kpis.quotations_open,
      kpis.quotationsOpen,
      kpis.pending_quotations,
      kpis.pendingQuotations,
      kpis.open_quotations,
      kpis.openQuotations,
      kpis.pending,
      quotations?.open,
      quotations?.pending,
      quotations?.awaiting,
      quotations?.awaiting_approval,
      quotations?.awaitingApproval,
      quotations?.open_count,
      quotations?.openCount,
      quotations?.pending_count,
      quotations?.pendingCount,
    ),
    documentsTotal: pickNumber(
      data.documents_total,
      data.documentsTotal,
      kpis.documents_total,
      documents?.total,
      documents?.count,
    ),
    invoicesOutstanding: pickNumber(
      data.invoices_outstanding,
      data.invoicesOutstanding,
      data.outstanding,
      data.outstanding_amount,
      data.outstandingAmount,
      data.outstanding_balance,
      data.outstandingBalance,
      data.amount_outstanding,
      data.amountOutstanding,
      data.balance_due,
      data.balanceDue,
      kpis.invoices_outstanding,
      kpis.invoicesOutstanding,
      kpis.outstanding,
      kpis.outstanding_amount,
      kpis.outstandingAmount,
      kpis.outstanding_balance,
      kpis.outstandingBalance,
      invoices?.outstanding,
      invoices?.outstanding_amount,
      invoices?.outstandingAmount,
      invoices?.outstanding_balance,
      invoices?.outstandingBalance,
      invoices?.amount_outstanding,
      invoices?.amountOutstanding,
      invoices?.balance_due,
      invoices?.balanceDue,
      invoices?.total_outstanding,
      invoices?.totalOutstanding,
    ),
    invoicesOverdue: pickNumber(
      data.invoices_overdue,
      data.invoicesOverdue,
      data.overdue,
      data.overdue_count,
      data.overdueCount,
      data.overdue_amount,
      data.overdueAmount,
      kpis.invoices_overdue,
      kpis.invoicesOverdue,
      kpis.overdue,
      invoices?.overdue,
      invoices?.overdue_count,
      invoices?.overdueCount,
      invoices?.overdue_amount,
      invoices?.overdueAmount,
    ),
    invoicesTotal: pickNumber(
      data.invoices_total,
      data.invoicesTotal,
      kpis.invoices_total,
      invoices?.total,
      invoices?.count,
    ),
    onTime: onTimeRaw
      ? {
          pct: pickNumber(
            onTimeRaw.pct,
            onTimeRaw.percent,
            onTimeRaw.percentage,
            onTimeRaw.on_time_pct,
            onTimeRaw.onTimePct,
            onTimeRaw.rate,
            onTimeRaw.value,
          ),
          target: pickNumber(onTimeRaw.target, onTimeRaw.target_pct, onTimeRaw.targetPct),
          delivered: pickNumber(onTimeRaw.delivered, onTimeRaw.delivered_count, onTimeRaw.deliveredCount),
          total: pickNumber(onTimeRaw.total, onTimeRaw.count),
        }
      : undefined,
    alerts: normalizeAlerts(data.alerts ?? data.alert_pills ?? data.alertPills ?? kpis.alerts),
    paymentsOutstanding: pickNumber(
      data.payments_outstanding,
      data.paymentsOutstanding,
      payments?.outstanding,
      payments?.balance,
    ),
    creditAvailable: pickNumber(
      data.credit_available,
      data.creditAvailable,
      payments?.credit_available,
      payments?.available,
      payments?.credit,
    ),
    tasksPreview: tasksPreview.length ? tasksPreview : undefined,
    period: pickString(data.period, kpis.period) || undefined,
    raw: data,
  };
}
