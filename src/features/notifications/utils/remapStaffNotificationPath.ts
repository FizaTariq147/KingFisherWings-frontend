/**
 * Backend / demo notification `link_path` values often point at legacy or
 * missing routes (e.g. `/timesheets`, `/wms/low-stock`, bare `/jobs/:id`).
 * Map them onto real staff routes so Live activity / Notifications do not 404.
 *
 * Returns `null` when the path is a known dead-end (caller should fall through
 * to entity / type inference).
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

  // Payment proof API paths have no staff screen — drop so invoice entity wins.
  if (
    lower === '/payment-proofs' ||
    lower === '/payment-proof' ||
    lower.startsWith('/payment-proofs/') ||
    lower.startsWith('/payment-proof/')
  ) {
    return null;
  }

  // Legacy demo segment aliases → real job list/detail prefixes
  const legacyJobSeg: Record<string, string> = {
    '/jobs/sea-fcl': '/jobs/sea-export',
    '/jobs/sea-lcl': '/jobs/sea-export',
    '/jobs/sea-fcl-import': '/jobs/sea-import',
    '/jobs/sea-lcl-import': '/jobs/sea-import',
    '/jobs/land': '/jobs/road-freight',
    '/jobs/courier': '/jobs/road-freight',
    '/jobs/freight': '/jobs/road-freight',
  };
  for (const [from, to] of Object.entries(legacyJobSeg)) {
    if (lower === from) return `${to}${q}`;
    if (lower.startsWith(`${from}/`)) {
      return `${to}${pathname.slice(from.length)}${q}`;
    }
  }

  // Reopen-request inbox (Tenant Admin) — BE may link /jobs/reopen-requests or nested.
  if (
    lower === '/jobs/reopen-requests' ||
    lower.startsWith('/jobs/reopen-requests/') ||
    lower === '/reopen-requests'
  ) {
    return `/jobs/reopen-requests${q}`;
  }

  // Bare `/jobs/:id` is handled by JobDeepLinkPage (resolves segment from job type).
  // Already-correct routes
  if (lower.startsWith('/hr/timesheets')) return pathname + q;
  if (lower.startsWith('/warehouse/stock')) {
    if (!q && /low.?stock/i.test(raw)) return '/warehouse/stock?tab=low-stock';
    return pathname + q;
  }

  return pathname + q;
}

/** True when FE has no matching screen for this path (do not navigate to it). */
export function isDeadEndStaffNotificationPath(path: string | null | undefined): boolean {
  if (!path || typeof path !== 'string') return true;
  const lower = path.trim().split('?')[0].replace(/\/+$/, '').toLowerCase() || '/';
  if (
    lower === '/payment-proofs' ||
    lower === '/payment-proof' ||
    lower.startsWith('/payment-proofs/') ||
    lower.startsWith('/payment-proof/')
  ) {
    return true;
  }
  // Portal/vendor paths are not staff screens
  if (lower.startsWith('/portal') || lower.startsWith('/vendor')) return true;
  return false;
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
  if (/PAYMENT_PROOF|PROOF_SUBMITTED|PROOF_UPLOADED/.test(blob)) {
    return '/invoices';
  }
  if (/JOB_MILESTONE|MILESTONE_UPDATED|\bMILESTONE\b/.test(blob)) {
    return '/jobs/all';
  }
  if (/REOPEN_REQUEST|JOB_REOPEN|REOPEN_APPROV|REOPEN_REJECT/.test(blob)) {
    return '/jobs/reopen-requests';
  }
  return null;
}
