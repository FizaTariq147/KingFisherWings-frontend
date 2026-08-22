/** Shared 12-bar mini chart used on admin, customer, and vendor dashboard KPI cards. */
export const DASHBOARD_KPI_BAR_COUNT = 12;

export function expandDashboardKpiSeries(
  values: number[],
  length = DASHBOARD_KPI_BAR_COUNT,
): number[] {
  const source = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0));
  if (!source.length) return Array.from({ length }, () => 0);
  if (source.length === length) return source;
  if (source.length === 1) return Array.from({ length }, () => source[0]);
  if (source.length > length) {
    return Array.from({ length }, (_, i) => {
      const start = Math.floor((i * source.length) / length);
      const end = Math.max(start + 1, Math.floor(((i + 1) * source.length) / length));
      const slice = source.slice(start, end);
      return slice.reduce((sum, n) => sum + n, 0) / slice.length;
    });
  }
  return Array.from({ length }, (_, i) => {
    const t = (i / (length - 1)) * (source.length - 1);
    const left = Math.floor(t);
    const right = Math.min(source.length - 1, left + 1);
    const frac = t - left;
    return source[left] * (1 - frac) + source[right] * frac;
  });
}

/** Status/count map from API summary → ordered bar values. */
export function dashboardBarsFromStatusMap(byStatus?: Record<string, number>): number[] {
  if (!byStatus) return [];
  return Object.keys(byStatus)
    .sort()
    .map((key) => byStatus[key] ?? 0);
}

/** Aging bucket amounts → bar values. */
export function dashboardBarsFromBuckets(
  buckets: Array<{ amount?: number | null }> | undefined,
): number[] {
  if (!buckets?.length) return [];
  return buckets.map((bucket) =>
    Number.isFinite(bucket.amount) && (bucket.amount ?? 0) > 0 ? (bucket.amount as number) : 0,
  );
}

/** Schedule/outstanding rows → bar heights from real balances. */
export function dashboardBarsFromScheduleItems(
  items: Array<{ overdue?: boolean; outstanding?: number; amount?: number }> | undefined,
  fallback: number[] = [],
): number[] {
  if (!items?.length) return fallback;
  const values = items
    .map((item) => item.outstanding ?? item.amount ?? 0)
    .filter((value) => Number.isFinite(value) && value > 0);
  return values.length ? values : fallback;
}
