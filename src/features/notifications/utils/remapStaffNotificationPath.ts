/**
 * Backend / demo notification `link_path` values often point at legacy or
 * missing routes (e.g. `/timesheets`, `/wms/low-stock`). Map them onto real
 * staff routes so Live activity / Notifications do not 404.
 */
export function remapStaffNotificationPath(path: string | null | undefined): string | null {
  if (!path || typeof path !== 'string') return null;
  const raw = path.trim();
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;

  const [pathnameOnly, query = ''] = raw.split('?');
  const pathname = pathnameOnly.replace(/\/+$/, '') || '/';
  const q = query ? `?${query}` : '';
  const lower = pathname.toLowerCase();

  // HR timesheets
  if (
    lower === '/timesheets' ||
    lower === '/timesheet' ||
    lower === '/hr/timesheet' ||
    lower === '/missing-timesheet' ||
    lower === '/hr/missing-timesheet' ||
    lower.startsWith('/timesheets/')
  ) {
    return `/hr/timesheets${q}`;
  }

  // WMS low stock / stock board
  if (
    lower === '/wms/low-stock' ||
    lower === '/wms/lowstock' ||
    lower === '/warehouse/low-stock' ||
    lower === '/low-stock' ||
    lower === '/wms/stock/low-stock' ||
    lower === '/warehouse/stock/low-stock'
  ) {
    return '/warehouse/stock?tab=low-stock';
  }
  if (lower === '/wms/stock' || lower === '/wms/stocks') {
    return `/warehouse/stock${q || '?tab=on-hand'}`;
  }
  if (lower === '/wms' || lower === '/wms/dashboard') {
    return '/warehouse';
  }
  if (lower.startsWith('/wms/items')) {
    return pathname.replace(/^\/wms/i, '/warehouse') + q;
  }

  // Already-correct routes
  if (lower.startsWith('/hr/timesheets')) return pathname + q;
  if (lower.startsWith('/warehouse/stock')) {
    if (!q && /low.?stock/i.test(raw)) return '/warehouse/stock?tab=low-stock';
    return pathname + q;
  }

  return pathname + q;
}

/** Infer a staff path from notification type / title when link_path is missing or bad. */
export function inferStaffNotificationPath(opts: {
  type?: string | null;
  title?: string | null;
  body?: string | null;
  kind?: string | null;
}): string | null {
  const blob = `${opts.type || ''} ${opts.kind || ''} ${opts.title || ''} ${opts.body || ''}`
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  if (/TIMESHEET|MISSING_TIMESHEET|TIME_SHEET/.test(blob)) {
    return '/hr/timesheets';
  }
  if (/LOW_STOCK|LOWSTOCK|STOCK_ALERT|WMS_LOW/.test(blob)) {
    return '/warehouse/stock?tab=low-stock';
  }
  if (/\bWMS\b|WAREHOUSE_STOCK|STOCK_ON_HAND/.test(blob)) {
    return '/warehouse/stock';
  }
  return null;
}
