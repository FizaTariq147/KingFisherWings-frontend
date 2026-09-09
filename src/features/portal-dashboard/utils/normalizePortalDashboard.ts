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
  if (!Array.isArray(raw)) return undefined;
  const alerts: PortalDashboardAlert[] = [];
  raw.forEach((entry, index) => {
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
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const shipments = nested(data, 'shipments', 'shipment_summary', 'shipmentSummary');
  const quotations = nested(data, 'quotations', 'quotes', 'quotation_summary', 'quotationSummary');
  const documents = nested(data, 'documents', 'document_summary', 'documentSummary');
  const invoices = nested(data, 'invoices', 'invoice_summary', 'invoiceSummary');
  const onTimeRaw = nested(data, 'on_time', 'onTime', 'otp', 'delivery_otp');
  const payments = nested(data, 'payments', 'payment', 'credit', 'payments_credit', 'paymentsCredit');
  const kpis = nested(data, 'kpis', 'kpi', 'counters');

  const tasksPreview = normalizePortalTasks(
    data.tasks_preview ?? data.tasksPreview ?? data.tasks ?? data.todos,
  );

  return {
    shipmentsTotal: pickNumber(
      data.shipments_total,
      data.shipmentsTotal,
      kpis?.shipments_total,
      shipments?.total,
      shipments?.count,
    ),
    shipmentsActive: pickNumber(
      data.shipments_active,
      data.shipmentsActive,
      kpis?.shipments_active,
      shipments?.active,
      shipments?.in_progress,
    ),
    shipmentsDelivered: pickNumber(
      data.shipments_delivered,
      data.shipmentsDelivered,
      kpis?.shipments_delivered,
      shipments?.delivered,
    ),
    quotationsTotal: pickNumber(
      data.quotations_total,
      data.quotationsTotal,
      kpis?.quotations_total,
      quotations?.total,
      quotations?.count,
    ),
    quotationsOpen: pickNumber(
      data.quotations_open,
      data.quotationsOpen,
      kpis?.quotations_open,
      quotations?.open,
      quotations?.pending,
    ),
    documentsTotal: pickNumber(
      data.documents_total,
      data.documentsTotal,
      kpis?.documents_total,
      documents?.total,
      documents?.count,
    ),
    invoicesOutstanding: pickNumber(
      data.invoices_outstanding,
      data.invoicesOutstanding,
      kpis?.invoices_outstanding,
      invoices?.outstanding,
    ),
    invoicesOverdue: pickNumber(
      data.invoices_overdue,
      data.invoicesOverdue,
      kpis?.invoices_overdue,
      invoices?.overdue,
    ),
    invoicesTotal: pickNumber(data.invoices_total, data.invoicesTotal, invoices?.total),
    onTime: onTimeRaw
      ? {
          pct: pickNumber(
            onTimeRaw.pct,
            onTimeRaw.percent,
            onTimeRaw.on_time_pct,
            onTimeRaw.onTimePct,
            onTimeRaw.rate,
          ),
          target: pickNumber(onTimeRaw.target, onTimeRaw.target_pct, onTimeRaw.targetPct),
          delivered: pickNumber(onTimeRaw.delivered, onTimeRaw.delivered_count),
          total: pickNumber(onTimeRaw.total, onTimeRaw.count),
        }
      : undefined,
    alerts: normalizeAlerts(data.alerts ?? data.alert_pills ?? data.alertPills),
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
    period: pickString(data.period) || undefined,
    raw: data,
  };
}
