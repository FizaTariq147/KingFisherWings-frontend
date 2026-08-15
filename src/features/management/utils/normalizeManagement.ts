import type { User } from '@/features/users/types/user.types';
import type { UserRow } from '../types/user.types';
import type {
  ManagementChartPoint,
  ManagementComplaintRow,
  ManagementDashboardPayload,
  ManagementPerformanceRow,
} from '../types/management.types';
import { isWithinDateRange } from './managementFilters';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export function mapUserToRow(user: User): UserRow {
  const extra = user as User & {
    company_name?: string;
    branch_name?: string;
    department_name?: string;
    designation?: string;
    roles?: string[];
  };
  const name =
    user.full_name?.trim() ||
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    user.email;
  const status =
    user.status === 'ACTIVE'
      ? 'ACTIVE'
      : user.status === 'SUSPENDED' || user.status === 'LOCKED'
        ? 'BLOCK'
        : 'INACTIVE';
  return {
    id: user.id,
    name,
    displayName: name,
    status,
    company: extra.company_name || extra.branch_name || '—',
    type: user.role || extra.roles?.[0] || '—',
    remarks: extra.department_name || extra.designation || '—',
    login: user.email,
  };
}

export function mapDisputeToComplaint(row: {
  id: string;
  reason?: string;
  description?: string;
  status?: string;
  invoiceNumber?: string;
  partyName?: string;
  createdAt?: string;
}): ManagementComplaintRow {
  return {
    id: row.id,
    name: row.partyName || row.invoiceNumber || row.id.slice(0, 8),
    category: row.reason || 'Invoice dispute',
    status: row.status || 'OPEN',
    invoiceNumber: row.invoiceNumber,
    partyName: row.partyName,
    createdAt: row.createdAt,
    description: row.description,
  };
}

function monthLabel(raw: string): string {
  const d = Date.parse(raw);
  if (Number.isNaN(d)) return raw.slice(0, 3).toUpperCase() || raw;
  return new Date(d).toLocaleString('en', { month: 'short' }).toUpperCase();
}

function seriesKey(raw: string): string {
  return raw.replaceAll('_', ' ').toUpperCase();
}

const PERIOD_KEYS = ['month', 'period', 'label', 'date', 'week', 'year_month', 'month_name', 'month_label'];
const SERIES_KEYS = [
  'job_type',
  'service_type',
  'type',
  'category',
  'mode',
  'series',
  'status',
  'name',
  'group',
  'metric',
];
const VALUE_KEYS = [
  'count',
  'total',
  'value',
  'amount',
  'no_of_jobs',
  'no_of_shipments',
  'shipments',
  'jobs',
  'quotes',
  'quotations',
  'enquiries',
  'quantity',
  'volume',
];

function extractReportRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is Record<string, unknown> => !!asRecord(x));
  }
  const root = asRecord(raw);
  if (!root) return [];
  for (const key of [
    'rows',
    'items',
    'data',
    'results',
    'series',
    'by_service_type',
    'by_month',
    'by_job_type',
    'by_status',
    'breakdown',
  ]) {
    const value = root[key];
    if (Array.isArray(value)) {
      return value.filter((x): x is Record<string, unknown> => !!asRecord(x));
    }
  }
  const nested = asRecord(root.data);
  if (nested && nested !== root) return extractReportRows(nested);
  return [];
}

function rowText(row: Record<string, unknown>): string {
  return JSON.stringify(row).toLowerCase();
}

function rowHint(row: Record<string, unknown>, pattern: RegExp): boolean {
  return pattern.test(rowText(row));
}

function buildChartFromRows(
  rows: Record<string, unknown>[],
  defaultSeries = 'COUNT',
): ManagementChartPoint[] {
  if (!rows.length) return [];

  const buckets: Record<string, Record<string, number>> = {};

  const add = (period: string, series: string, value: number) => {
    const key = monthLabel(period);
    buckets[key] ??= {};
    const seriesName = seriesKey(series);
    buckets[key][seriesName] = (buckets[key][seriesName] ?? 0) + value;
  };

  for (const row of rows) {
    const period = PERIOD_KEYS.map((key) => pickString(row[key])).find(Boolean) ?? '';
    const series =
      SERIES_KEYS.map((key) => pickString(row[key])).find(Boolean) ?? defaultSeries;
    const value = VALUE_KEYS.map((key) => pickNumber(row[key])).find((n) => n != null);
    if (value == null) continue;

    if (period) add(period, series, value);
    else add(series, defaultSeries, value);
  }

  if (Object.keys(buckets).length === 0) {
    for (const row of rows) {
      const label = pickString(row.label, row.name, row.group, row.metric, row.widget, row.title);
      const value = VALUE_KEYS.map((key) => pickNumber(row[key])).find((n) => n != null);
      if (label && value != null) add(label, defaultSeries, value);
    }
  }

  return Object.entries(buckets).map(([month, seriesMap]) => ({ month, ...seriesMap }));
}

function mergeCharts(...charts: ManagementChartPoint[][]): ManagementChartPoint[] {
  for (const chart of charts) {
    if (chart.length > 0) return chart;
  }
  return [];
}

function isDashboardPayload(raw: unknown): raw is ManagementDashboardPayload {
  const r = asRecord(raw);
  return Boolean(
    r &&
      ('misDashboardRows' in r ||
        'misOperationalRows' in r ||
        'crmServiceType' in r ||
        'quotationAnalytics' in r),
  );
}

function mapLegacyDashboard(raw: unknown): {
  shipments: ManagementChartPoint[];
  jobs: ManagementChartPoint[];
  enquiries: ManagementChartPoint[];
  quotes: ManagementChartPoint[];
} {
  const empty = { shipments: [], jobs: [], enquiries: [], quotes: [] };
  const root = asRecord(raw);
  if (!root) return empty;

  const buckets: Record<string, Record<string, Record<string, number>>> = {
    shipments: {},
    jobs: {},
    enquiries: {},
    quotes: {},
  };

  const assign = (
    target: keyof typeof buckets,
    period: string,
    series: string,
    value: number,
  ) => {
    const key = monthLabel(period);
    buckets[target][key] ??= {};
    buckets[target][key][series] = (buckets[target][key][series] ?? 0) + value;
  };

  const walk = (node: unknown, hint = '') => {
    if (Array.isArray(node)) {
      node.forEach((item) => walk(item, hint));
      return;
    }
    const r = asRecord(node);
    if (!r) return;

    const period = pickString(r.month, r.period, r.label, r.date, r.name);
    const series = pickString(r.job_type, r.service_type, r.type, r.category, r.series, hint);
    const value = pickNumber(r.count, r.total, r.value, r.amount, r.shipments, r.jobs);
    const lowerHint = hint.toLowerCase();

    if (period && series && value != null) {
      if (/ship/i.test(lowerHint) || /shipment/i.test(series)) assign('shipments', period, seriesKey(series), value);
      else if (/job/i.test(lowerHint) || /job/i.test(series)) assign('jobs', period, seriesKey(series), value);
      else if (/enquir/i.test(lowerHint) || /enquir/i.test(series)) assign('enquiries', period, seriesKey(series), value);
      else if (/quote|quotation/i.test(lowerHint) || /quote|quotation/i.test(series))
        assign('quotes', period, seriesKey(series), value);
      else assign('jobs', period, seriesKey(series), value);
    }

    for (const [key, value] of Object.entries(r)) {
      if (['rows', 'items', 'data', 'series', 'widgets', 'charts', 'by_job_type', 'by_service', 'by_month'].includes(key)) {
        walk(value, key);
      }
    }
  };

  walk(root.data ?? root);

  const toPoints = (map: Record<string, Record<string, number>>): ManagementChartPoint[] =>
    Object.entries(map).map(([month, seriesMap]) => ({ month, ...seriesMap }));

  return {
    shipments: toPoints(buckets.shipments),
    jobs: toPoints(buckets.jobs),
    enquiries: toPoints(buckets.enquiries),
    quotes: toPoints(buckets.quotes),
  };
}

function mapCombinedDashboard(payload: ManagementDashboardPayload): {
  shipments: ManagementChartPoint[];
  jobs: ManagementChartPoint[];
  enquiries: ManagementChartPoint[];
  quotes: ManagementChartPoint[];
} {
  const legacy = mapLegacyDashboard(payload.misDashboard);
  const misRows = [...payload.misDashboardRows, ...payload.misOperationalRows];

  const shipmentRows = misRows.filter((row) => rowHint(row, /shipment|consignment|awb|hbl|mbl/));
  const jobRows = misRows.filter((row) => rowHint(row, /\bjob\b|job_count|no_of_jobs/));
  const enquiryRows = misRows.filter((row) => rowHint(row, /enquir/));
  const quoteRows = misRows.filter((row) => rowHint(row, /quote|quotation/));

  const shipments = mergeCharts(
    buildChartFromRows(shipmentRows, 'SHIPMENTS'),
    legacy.shipments,
    buildChartFromRows(
      payload.misOperationalRows.filter((row) => !rowHint(row, /\bjob\b/)),
      'SHIPMENTS',
    ),
  );

  const jobs = mergeCharts(
    buildChartFromRows(jobRows.length ? jobRows : payload.misOperationalRows, 'JOBS'),
    buildChartFromRows(payload.misProfitabilityRows, 'JOBS'),
    legacy.jobs,
  );

  const enquiries = mergeCharts(
    buildChartFromRows(extractReportRows(payload.crmServiceType), 'ENQUIRIES'),
    buildChartFromRows(extractReportRows(payload.crmEnquiryConversion), 'ENQUIRIES'),
    buildChartFromRows(enquiryRows, 'ENQUIRIES'),
    legacy.enquiries,
  );

  const quotes = mergeCharts(
    buildChartFromRows(extractReportRows(payload.quotationAnalytics), 'QUOTES'),
    buildChartFromRows(quoteRows, 'QUOTES'),
    legacy.quotes,
  );

  return { shipments, jobs, enquiries, quotes };
}

/** Best-effort chart mapper for GL MIS / CRM / quotation dashboard payloads. */
export function mapDashboardCharts(raw: unknown): {
  shipments: ManagementChartPoint[];
  jobs: ManagementChartPoint[];
  enquiries: ManagementChartPoint[];
  quotes: ManagementChartPoint[];
} {
  if (isDashboardPayload(raw)) return mapCombinedDashboard(raw);
  return mapLegacyDashboard(raw);
}

export function mapPerformanceRows(
  users: User[],
  reportRows: Record<string, unknown>[],
  countMetricsByUser: Map<string, Record<string, number>> = new Map(),
): ManagementPerformanceRow[] {
  const byUser = new Map<string, Record<string, unknown>>();
  for (const row of reportRows) {
    const userId = pickString(row.user_id, row.userId, row.salesperson_id, row.salespersonId);
    const email = pickString(row.email, row.user_email, row.salesperson_email);
    const key = userId || email;
    if (!key) continue;
    const existing = byUser.get(key) ?? {};
    byUser.set(key, { ...existing, ...row });
  }

  const skipMetricKeys = new Set([
    'id',
    'user_id',
    'userid',
    'salesperson_id',
    'salespersonid',
    'email',
    'user_email',
    'salesperson_email',
    'name',
    'user_name',
    'salesperson_name',
    'full_name',
  ]);

  return users.map((user) => {
    const match = byUser.get(user.id) || byUser.get(user.email);
    const metrics: Record<string, string | number> = {
      ...(countMetricsByUser.get(user.id) ?? {}),
    };

    if (match) {
      for (const [key, value] of Object.entries(match)) {
        if (skipMetricKeys.has(key.toLowerCase())) continue;
        if (typeof value === 'string' || typeof value === 'number') {
          metrics[formatPerformanceMetricKey(key)] = value;
        }
      }
    }

    return {
      id: user.id,
      userName: user.full_name || `${user.first_name} ${user.last_name}`.trim() || user.email,
      email: user.email,
      role: user.role,
      metrics,
    };
  });
}

export const PERFORMANCE_METRIC_ORDER = [
  'Enquiries',
  'Quotations',
  'Jobs',
  'Shipments',
  'Calls',
  'Call Count',
  'Total Calls',
  'Revenue',
  'Total Revenue',
  'Won',
  'Conversion Rate',
];

function formatPerformanceMetricKey(key: string): string {
  const normalized = key.trim().toLowerCase();
  const labels: Record<string, string> = {
    enquiries: 'Enquiries',
    enquiry_count: 'Enquiries',
    open_enquiries: 'Enquiries',
    quotations: 'Quotations',
    quotation_count: 'Quotations',
    quotes: 'Quotations',
    quote_count: 'Quotations',
    jobs: 'Jobs',
    job_count: 'Jobs',
    shipments: 'Shipments',
    shipment_count: 'Shipments',
    call_count: 'Calls',
    total_calls: 'Calls',
    calls: 'Calls',
    revenue: 'Revenue',
    total_revenue: 'Revenue',
    won: 'Won',
    conversion_rate: 'Conversion Rate',
  };
  if (labels[normalized]) return labels[normalized];
  return key.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function orderPerformanceMetricKeys(keys: string[]): string[] {
  const unique = [...new Set(keys)];
  return unique.sort((a, b) => {
    const aIndex = PERFORMANCE_METRIC_ORDER.indexOf(a);
    const bIndex = PERFORMANCE_METRIC_ORDER.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

export function countRecordsByUser<T extends Record<string, unknown>>(
  items: T[],
  userField: keyof T,
  params: { from_date?: string; to_date?: string },
  dateField?: keyof T,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (dateField) {
      const dateValue = String(item[dateField] ?? '');
      if (!isWithinDateRange(dateValue, params.from_date, params.to_date)) continue;
    }
    const userId = String(item[userField] ?? '').trim();
    if (!userId) continue;
    counts.set(userId, (counts.get(userId) ?? 0) + 1);
  }
  return counts;
}

export function extractPerformanceReportRows(raw: unknown): Record<string, unknown>[] {
  return extractReportRows(raw);
}

export function normalizeReportRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is Record<string, unknown> => !!asRecord(x));
  }
  const rows = extractReportRows(raw);
  if (rows.length) return rows;
  const root = asRecord(raw);
  if (!root) return [];
  if (Array.isArray(root.lines)) {
    return (root.lines as unknown[]).filter((x): x is Record<string, unknown> => !!asRecord(x));
  }
  return [root];
}

export function profitabilityRowsToPie(
  rows: Record<string, unknown>[],
): Array<{ name: string; value: number }> {
  return rows
    .slice(0, 12)
    .map((row, index) => ({
      name:
        pickString(row.label, row.name, row.salesperson, row.customer, row.group, row.job_type) ||
        `Item ${index + 1}`,
      value: pickNumber(row.gp, row.profit, row.margin, row.amount, row.total, row.revenue) ?? 0,
    }))
    .filter((point) => point.value !== 0);
}

export function profitabilityRowsToChart(rows: Record<string, unknown>[]): ManagementChartPoint[] {
  return profitabilityRowsToPie(rows).map((point) => ({ month: point.name, GP: point.value }));
}
