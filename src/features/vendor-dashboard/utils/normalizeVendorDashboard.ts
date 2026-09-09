import {
  asRecord,
  pickBoolean,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type {
  VendorDashboardWidgets,
  VendorTaskItem,
} from '../types/vendorDashboard.types';

function nested(data: Record<string, unknown>, ...keys: string[]): Record<string, unknown> | null {
  for (const key of keys) {
    const rec = asRecord(data[key]);
    if (rec) return rec;
  }
  return null;
}

function normalizeTask(raw: unknown, index: number): VendorTaskItem | null {
  const r = asRecord(raw);
  if (!r) return null;
  const label = pickString(r.label, r.title, r.name, r.description, r.message, r.task);
  if (!label) return null;
  return {
    id: pickString(r.id, r.key, r.code) || `task-${index}`,
    label,
    done: pickBoolean(r.done, r.is_done, r.isDone, r.completed) ?? false,
    href: pickString(r.href, r.url, r.link, r.path) || undefined,
    dueAt: pickString(r.due_at, r.dueAt, r.due_date, r.dueDate) || undefined,
    category: pickString(r.category, r.type, r.kind) || undefined,
  };
}

export function normalizeVendorTasks(raw: unknown): VendorTaskItem[] {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw);
  const listSource =
    data && (data.tasks ?? data.items ?? data.results ?? data.todos ?? data.checklist ?? data.data);
  const { items } = Array.isArray(listSource)
    ? { items: listSource }
    : unwrapList(raw, ['tasks', 'items', 'results', 'todos', 'checklist']);
  return items
    .map((item, i) => normalizeTask(item, i))
    .filter((t): t is VendorTaskItem => Boolean(t));
}

export function normalizeVendorDashboard(raw: unknown): VendorDashboardWidgets {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const kpis = nested(data, 'kpis', 'kpi', 'counters', 'summary') ?? data;
  const invoices = nested(data, 'invoices', 'invoice_summary', 'invoiceSummary');
  const schedule = nested(data, 'schedule', 'upcoming', 'due');
  const aging = nested(data, 'aging', 'credit', 'credit_aging');
  const tasksPreview = normalizeVendorTasks(
    data.tasks_preview ?? data.tasksPreview ?? data.tasks ?? data.todos,
  );

  return {
    kpis: {
      invoiceTotal: pickNumber(
        kpis.invoice_total,
        kpis.invoiceTotal,
        kpis.total,
        invoices?.total,
        invoices?.count,
      ),
      dueOpen: pickNumber(
        kpis.due_open,
        kpis.dueOpen,
        kpis.due,
        schedule?.due_count,
        schedule?.dueCount,
        schedule?.due,
      ),
      overdue: pickNumber(
        kpis.overdue,
        kpis.overdue_count,
        invoices?.overdue,
        schedule?.overdue_count,
        schedule?.overdueCount,
      ),
      outstanding: pickNumber(
        kpis.outstanding,
        invoices?.outstanding,
        aging?.outstanding,
        aging?.total,
      ),
      paid: pickNumber(kpis.paid, invoices?.paid),
      agingOutstanding: pickNumber(
        kpis.aging_outstanding,
        kpis.agingOutstanding,
        aging?.total,
        aging?.outstanding,
      ),
    },
    tasksPreview: tasksPreview.length ? tasksPreview : undefined,
    period: pickString(data.period) || undefined,
    raw: data,
  };
}
