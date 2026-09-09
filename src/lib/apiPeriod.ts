/** Backend dashboard/summary period enum (OpenAPI). */
export type ApiPeriod = '7d' | '30d' | 'mtd' | 'custom';

/** Common staff/portal/vendor home period toggles. */
export type UiDashboardPeriod = 'today' | 'week' | 'month';

export interface ApiPeriodQuery {
  period?: ApiPeriod;
  from_date?: string;
  to_date?: string;
  /** CRM-style aliases accepted by several dashboards. */
  from?: string;
  to?: string;
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Map UI today/week/month → backend period query. */
export function uiPeriodToApi(
  ui: UiDashboardPeriod,
  now = new Date(),
): ApiPeriodQuery {
  const to = isoDate(now);
  if (ui === 'today') {
    return { period: 'custom', from_date: to, to_date: to, from: to, to };
  }
  if (ui === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    const from = isoDate(start);
    return { period: '7d', from_date: from, to_date: to, from, to };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const from = isoDate(start);
  return { period: 'mtd', from_date: from, to_date: to, from, to };
}

/** Flatten period query into axios/search params (omit empties). */
export function periodQueryParams(
  query?: ApiPeriodQuery | null,
): Record<string, string> {
  if (!query) return {};
  const out: Record<string, string> = {};
  if (query.period) out.period = query.period;
  if (query.from_date?.trim()) out.from_date = query.from_date.trim();
  if (query.to_date?.trim()) out.to_date = query.to_date.trim();
  if (query.from?.trim()) out.from = query.from.trim();
  if (query.to?.trim()) out.to = query.to.trim();
  return out;
}
