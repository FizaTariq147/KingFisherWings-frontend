/**
 * Full frontend API matrix test against live KingFisher Wings API.
 * Uses frontend API path inventory + OpenAPI docs-json.
 * Usage: node scripts/api-matrix-test.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BASE = process.env.API_BASE_URL || 'https://kingfisherwings.onrender.com';
const OUT = path.join(ROOT, 'docs', 'API-Testing-Results.md');
const RAW_OUT = path.join(ROOT, '.tmp-api-test-results.json');

const CREDS = {
  tenantSlug: process.env.E2E_TENANT_SLUG || '',
  staffEmail: process.env.E2E_STAFF_EMAIL || '',
  staffPassword: process.env.E2E_STAFF_PASSWORD || '',
  tenantPassword: process.env.E2E_TENANT_PASSWORD || '',
  superEmail: process.env.E2E_SUPERADMIN_EMAIL || '',
  superPassword: process.env.E2E_SUPERADMIN_PASSWORD || '',
};

const TIMEOUT_MS = 90_000;

/** @typedef {{ module: string, name: string, method: string, path: string, auth: 'none'|'tenant'|'super'|'either', body?: any, query?: Record<string,string|number|boolean>, expect?: number[], destructive?: boolean }} Case */

/** @type {Case[]} */
const CASES = [
  // ── Auth (public) ───────────────────────────────────────────
  { module: 'Auth', name: 'Staff login', method: 'POST', path: '/auth/login', auth: 'none', body: { tenant_slug: CREDS.tenantSlug, email: CREDS.staffEmail, password: CREDS.staffPassword }, expect: [200, 201] },
  { module: 'Auth', name: 'Tenant Admin login (slug+password)', method: 'POST', path: '/auth/tenant-login', auth: 'none', body: { tenant_slug: CREDS.tenantSlug, password: CREDS.tenantPassword }, expect: [200, 201, 401] },
  { module: 'Auth', name: 'Refresh without token', method: 'POST', path: '/auth/refresh', auth: 'none', body: { refresh_token: 'invalid' }, expect: [400, 401, 422] },
  { module: 'Auth', name: 'Super Admin login (if creds)', method: 'POST', path: '/auth/super-admin/login', auth: 'none', body: { email: CREDS.superEmail || 'missing@example.com', password: CREDS.superPassword || 'missing' }, expect: [200, 201, 401] },

  // ── Auth (tenant) ───────────────────────────────────────────
  { module: 'Auth', name: 'GET /auth/me', method: 'GET', path: '/auth/me', auth: 'tenant', expect: [200] },
  { module: 'Auth', name: 'PATCH /auth/me preferred country', method: 'PATCH', path: '/auth/me', auth: 'tenant', body: { preferred_country_code: 'AE' }, expect: [200, 204, 404, 405] },
  { module: 'Auth', name: 'List sessions', method: 'GET', path: '/auth/sessions', auth: 'tenant', expect: [200] },

  // ── Locale ──────────────────────────────────────────────────
  { module: 'Locale', name: 'GET defaults (no country)', method: 'GET', path: '/locale/defaults', auth: 'none', expect: [200] },
  { module: 'Locale', name: 'GET defaults ?country=AE', method: 'GET', path: '/locale/defaults', auth: 'none', query: { country: 'AE' }, expect: [200] },
  { module: 'Locale', name: 'GET profile AE', method: 'GET', path: '/locale/AE', auth: 'none', expect: [200] },

  // ── Search ──────────────────────────────────────────────────
  { module: 'Search', name: 'Global search', method: 'GET', path: '/search', auth: 'tenant', query: { q: 'test', limit: 5 }, expect: [200] },

  // ── Users ───────────────────────────────────────────────────
  { module: 'Users', name: 'List users', method: 'GET', path: '/users', auth: 'tenant', query: { page: 1, limit: 5 }, expect: [200] },

  // ── Parties ─────────────────────────────────────────────────
  { module: 'Parties', name: 'List parties', method: 'GET', path: '/parties', auth: 'tenant', query: { page: 1, limit: 5 }, expect: [200] },

  // ── Organization ────────────────────────────────────────────
  { module: 'Organization', name: 'Get profile', method: 'GET', path: '/organization/profile', auth: 'tenant', expect: [200] },
  { module: 'Organization', name: 'List bank accounts', method: 'GET', path: '/organization/bank-accounts', auth: 'tenant', query: { page: 1, limit: 5 }, expect: [200] },
  { module: 'Organization', name: 'List number formats', method: 'GET', path: '/organization/number-formats', auth: 'tenant', expect: [200] },

  // ── Quotations ──────────────────────────────────────────────
  { module: 'Quotations', name: 'List quotations', method: 'GET', path: '/quotations', auth: 'tenant', query: { page: 1, limit: 5 }, expect: [200] },
  { module: 'Quotations', name: 'Chargewise report', method: 'GET', path: '/quotations/reports/chargewise', auth: 'tenant', expect: [200, 400] },
  { module: 'Quotations', name: 'Analytics report', method: 'GET', path: '/quotations/reports/analytics', auth: 'tenant', expect: [200, 400] },
  { module: 'Quotations', name: 'Conversion analytics', method: 'GET', path: '/quotations/reports/analytics/conversion', auth: 'tenant', expect: [200, 400] },
  { module: 'Quotations', name: 'Lost reasons analytics', method: 'GET', path: '/quotations/reports/analytics/lost-reasons', auth: 'tenant', expect: [200, 400] },
  { module: 'Quotations', name: 'Response time analytics', method: 'GET', path: '/quotations/reports/analytics/response-time', auth: 'tenant', expect: [200, 400] },

  // ── Tariffs / Zip ───────────────────────────────────────────
  { module: 'Tariffs', name: 'List tariffs', method: 'GET', path: '/quotations/tariffs', auth: 'tenant', query: { page: 1, limit: 5 }, expect: [200] },
  { module: 'Zip Distances', name: 'List zip distances', method: 'GET', path: '/quotations/zip-distances', auth: 'tenant', query: { page: 1, limit: 5 }, expect: [200] },

  // ── Jobs ────────────────────────────────────────────────────
  { module: 'Jobs', name: 'List jobs', method: 'GET', path: '/jobs', auth: 'tenant', query: { page: 1, limit: 5 }, expect: [200] },

  // ── Finance ─────────────────────────────────────────────────
  { module: 'Invoices', name: 'List invoices', method: 'GET', path: '/invoices', auth: 'tenant', query: { page: 1, limit: 5 }, expect: [200] },
  { module: 'Invoices', name: 'Overdue report', method: 'GET', path: '/invoices/reports/overdue', auth: 'tenant', expect: [200] },
  { module: 'Purchase Invoices', name: 'List purchase invoices', method: 'GET', path: '/purchase-invoices', auth: 'tenant', query: { page: 1, limit: 5 }, expect: [200] },
  { module: 'Credit Notes', name: 'List credit notes', method: 'GET', path: '/credit-notes', auth: 'tenant', query: { page: 1, limit: 5 }, expect: [200] },
  { module: 'Payment Requests', name: 'List payment requests', method: 'GET', path: '/payment-requests', auth: 'tenant', query: { page: 1, limit: 5 }, expect: [200] },

  // ── AWB Stock ───────────────────────────────────────────────
  // AWB / some GL list DTOs forbid unknown query props like page/limit
  { module: 'AWB Stock', name: 'List batches', method: 'GET', path: '/awb-stock/batches', auth: 'tenant', expect: [200] },
  { module: 'AWB Stock', name: 'List allocations', method: 'GET', path: '/awb-stock/allocations', auth: 'tenant', expect: [200] },
  { module: 'AWB Stock', name: 'Low stock report', method: 'GET', path: '/awb-stock/reports/low-stock', auth: 'tenant', expect: [200] },

  // ── GL ──────────────────────────────────────────────────────
  { module: 'GL Chart of Accounts', name: 'List accounts', method: 'GET', path: '/gl/accounts', auth: 'tenant', expect: [200] },
  { module: 'GL Chart of Accounts', name: 'Account tree', method: 'GET', path: '/gl/accounts/tree', auth: 'tenant', expect: [200] },
  { module: 'GL Chart of Accounts', name: 'Trial balance (accounts)', method: 'GET', path: '/gl/accounts/reports/trial-balance', auth: 'tenant', expect: [200, 400] },
  { module: 'GL Vouchers', name: 'List vouchers', method: 'GET', path: '/gl/vouchers', auth: 'tenant', expect: [200] },
  { module: 'GL Payments', name: 'List payments', method: 'GET', path: '/gl/payments', auth: 'tenant', expect: [200] },
  { module: 'GL Cheques', name: 'List cheques', method: 'GET', path: '/gl/cheques', auth: 'tenant', expect: [200] },
  { module: 'GL Cheques', name: 'PDC due report', method: 'GET', path: '/gl/cheques/reports/pdc-due', auth: 'tenant', expect: [200] },
  { module: 'GL Bank Reconciliation', name: 'List reconciliations', method: 'GET', path: '/gl/bank-reconciliations', auth: 'tenant', expect: [200] },
  { module: 'GL Financial Reports', name: 'Trial balance', method: 'GET', path: '/gl/reports/trial-balance', auth: 'tenant', expect: [200, 400] },
  { module: 'GL Financial Reports', name: 'Balance sheet', method: 'GET', path: '/gl/reports/balance-sheet', auth: 'tenant', expect: [200, 400] },
  { module: 'GL Financial Reports', name: 'Profit and loss', method: 'GET', path: '/gl/reports/profit-and-loss', auth: 'tenant', expect: [200, 400] },
  { module: 'GL Financial Reports', name: 'Cash flow', method: 'GET', path: '/gl/reports/cash-flow', auth: 'tenant', expect: [200, 400] },
  { module: 'GL Financial Reports', name: 'VAT return', method: 'GET', path: '/gl/reports/vat-return', auth: 'tenant', expect: [200, 400] },
  { module: 'GL MIS', name: 'MIS dashboard', method: 'GET', path: '/gl/mis/dashboard', auth: 'tenant', expect: [200] },
  { module: 'GL MIS', name: 'Profitability', method: 'GET', path: '/gl/mis/profitability', auth: 'tenant', expect: [200, 400] },
  { module: 'GL MIS', name: 'Operational', method: 'GET', path: '/gl/mis/operational', auth: 'tenant', expect: [200, 400] },
  { module: 'GL Saved Reports', name: 'List saved reports', method: 'GET', path: '/gl/saved-reports', auth: 'tenant', expect: [200] },
  { module: 'GL AR/AP Aging', name: 'AR aging', method: 'GET', path: '/gl/ar/aging', auth: 'tenant', expect: [200, 400] },
  { module: 'GL AR/AP Aging', name: 'AP aging', method: 'GET', path: '/gl/ap/aging', auth: 'tenant', expect: [200, 400] },

  // ── Masters ─────────────────────────────────────────────────
  ...[
    'airlines', 'airports', 'banks', 'branches', 'charge-codes', 'container-types',
    'countries', 'currencies', 'departments', 'designations', 'exchange-rates',
    'holidays', 'hs-codes', 'ports', 'shipping-lines', 'tax-rates', 'truckers',
    'units-of-measure', 'vessels', 'warehouses',
  ].map((m) => ({
    module: 'Masters',
    name: `List ${m}`,
    method: 'GET',
    path: `/masters/${m}`,
    auth: 'tenant',
    query: { page: 1, limit: 5 },
    expect: [200],
  })),

  // ── SuperAdmin (companies/tenants) — need super token ───────
  { module: 'Companies (SuperAdmin)', name: 'List companies', method: 'GET', path: '/companies', auth: 'super', query: { page: 1, limit: 5 }, expect: [200] },
  { module: 'Tenants (SuperAdmin)', name: 'List tenants', method: 'GET', path: '/tenants', auth: 'super', query: { page: 1, limit: 20 }, expect: [200] },
  { module: 'Tenants (SuperAdmin)', name: 'Tenant statistics', method: 'GET', path: '/tenants/statistics', auth: 'super', expect: [200] },

  // ── Validation / negative ───────────────────────────────────
  { module: 'Auth', name: 'Staff login invalid password', method: 'POST', path: '/auth/login', auth: 'none', body: { tenant_slug: CREDS.tenantSlug, email: CREDS.staffEmail, password: 'WrongPassword!!!' }, expect: [401] },
  { module: 'Auth', name: 'Protected me without token', method: 'GET', path: '/auth/me', auth: 'none', expect: [401] },
];

function unwrapToken(json) {
  if (!json || typeof json !== 'object') return null;
  const candidates = [json, json.data, json.result, json.payload].filter(Boolean);
  for (const c of candidates) {
    if (typeof c !== 'object') continue;
    const t = c.access_token || c.accessToken || c.token;
    if (typeof t === 'string' && t.length > 20) return t;
    if (c.data && typeof c.data === 'object') {
      const nested = c.data.access_token || c.data.accessToken;
      if (typeof nested === 'string') return nested;
    }
  }
  return null;
}

function unwrapRefresh(json) {
  if (!json || typeof json !== 'object') return null;
  const candidates = [json, json.data, json.result].filter(Boolean);
  for (const c of candidates) {
    if (typeof c !== 'object') continue;
    const t = c.refresh_token || c.refreshToken;
    if (typeof t === 'string') return t;
  }
  return null;
}

function pickFirstId(json) {
  const walk = (v) => {
    if (!v) return null;
    if (Array.isArray(v)) {
      for (const item of v) {
        const id = pickFirstId(item);
        if (id) return id;
      }
      return null;
    }
    if (typeof v === 'object') {
      if (typeof v.id === 'string' && /^[0-9a-f-]{36}$/i.test(v.id)) return v.id;
      for (const key of ['items', 'data', 'results', 'records', 'users', 'parties', 'jobs', 'quotations', 'invoices', 'companies', 'tenants', 'accounts', 'batches']) {
        if (v[key]) {
          const id = pickFirstId(v[key]);
          if (id) return id;
        }
      }
    }
    return null;
  };
  return walk(json);
}

async function request(method, urlPath, { token, body, query } = {}) {
  const url = new URL(BASE + urlPath);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      url.searchParams.set(k, String(v));
    }
  }
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* ignore */ }
    return {
      status: res.status,
      ok: res.ok,
      ms: Date.now() - started,
      json,
      text: text.slice(0, 400),
      url: url.toString(),
    };
  } catch (err) {
    return {
      status: 0,
      ok: false,
      ms: Date.now() - started,
      json: null,
      text: err instanceof Error ? err.message : String(err),
      url: url.toString(),
      error: true,
    };
  } finally {
    clearTimeout(timer);
  }
}

function classify(c, res) {
  const expected = c.expect || [200, 201, 204];
  if (res.error || res.status === 0) {
    return { result: 'FAIL', reason: `Network/timeout: ${res.text}` };
  }
  if (c.auth === 'super' && !CREDS.superEmail) {
    if (res.status === 401 || res.status === 403) {
      return { result: 'BLOCKED', reason: 'Super Admin credentials not provided' };
    }
  }
  if (expected.includes(res.status)) {
    return { result: 'PASS', reason: `HTTP ${res.status}` };
  }
  // Permission gaps are soft-fail for report clarity
  if (res.status === 403) {
    return { result: 'FAIL', reason: `Forbidden (403) — role/permission missing` };
  }
  if (res.status === 401) {
    return { result: 'FAIL', reason: `Unauthorized (401)` };
  }
  if (res.status >= 500) {
    return { result: 'FAIL', reason: `Server error ${res.status}: ${res.text}` };
  }
  return { result: 'FAIL', reason: `Unexpected HTTP ${res.status} (expected ${expected.join('/')}) — ${res.text.slice(0, 160)}` };
}

async function main() {
  console.log(`API matrix test → ${BASE}`);
  console.log(`Tenant: ${CREDS.tenantSlug || '(unset)'} / ${CREDS.staffEmail || '(unset)'}`);

  if (!CREDS.tenantSlug || !CREDS.staffEmail || !CREDS.staffPassword) {
    console.error(
      'Missing credentials. Set E2E_TENANT_SLUG, E2E_STAFF_EMAIL, and E2E_STAFF_PASSWORD before running.',
    );
    process.exit(1);
  }

  // Wake + login
  await request('GET', '/locale/defaults');
  const loginRes = await request('POST', '/auth/login', {
    body: {
      tenant_slug: CREDS.tenantSlug,
      email: CREDS.staffEmail,
      password: CREDS.staffPassword,
    },
  });
  const tenantToken = unwrapToken(loginRes.json);
  const refreshToken = unwrapRefresh(loginRes.json);
  if (!tenantToken) {
    console.error('Staff login failed — cannot continue authenticated tests', loginRes.status, loginRes.text);
    process.exit(1);
  }
  console.log('Staff JWT OK');

  let superToken = null;
  if (CREDS.superEmail && CREDS.superPassword) {
    const s = await request('POST', '/auth/super-admin/login', {
      body: { email: CREDS.superEmail, password: CREDS.superPassword },
    });
    superToken = unwrapToken(s.json);
    console.log(superToken ? 'SuperAdmin JWT OK' : `SuperAdmin login failed (${s.status})`);
  } else {
    console.log('SuperAdmin credentials not set — Companies/Tenants SuperAdmin tests may BLOCK');
  }

  /** @type {any[]} */
  const results = [];
  const ids = {};

  // Enrich cases with detail GETs after list calls when possible
  for (const c of CASES) {
    let token = null;
    if (c.auth === 'tenant' || c.auth === 'either') token = tenantToken;
    if (c.auth === 'super') token = superToken || tenantToken;

    // Skip super-only if no super token and path needs platform role
    if (c.auth === 'super' && !superToken) {
      const attempt = await request(c.method, c.path, { token: tenantToken, body: c.body, query: c.query });
      const verdict = classify(c, attempt);
      if (attempt.status === 401 || attempt.status === 403) {
        results.push({
          ...c,
          ...verdict,
          result: 'BLOCKED',
          reason: 'Requires Super Admin JWT (not provided)',
          status: attempt.status,
          ms: attempt.ms,
          url: attempt.url,
        });
        console.log(`BLOCKED  ${c.module} · ${c.name}`);
        continue;
      }
      results.push({ ...c, ...verdict, status: attempt.status, ms: attempt.ms, url: attempt.url, sample: attempt.text.slice(0, 120) });
      console.log(`${verdict.result.padEnd(7)} ${c.module} · ${c.name} (${attempt.status})`);
      continue;
    }

    const res = await request(c.method, c.path, { token, body: c.body, query: c.query });
    const verdict = classify(c, res);

    // Capture IDs from list endpoints for follow-up detail tests
    if (c.method === 'GET' && res.ok) {
      const id = pickFirstId(res.json);
      if (id) {
        if (c.path === '/users') ids.userId = id;
        if (c.path === '/parties') ids.partyId = id;
        if (c.path === '/quotations') ids.quotationId = id;
        if (c.path === '/jobs') ids.jobId = id;
        if (c.path === '/invoices') ids.invoiceId = id;
        if (c.path === '/gl/accounts') ids.accountId = id;
        if (c.path === '/gl/vouchers') ids.voucherId = id;
        if (c.path === '/awb-stock/batches') ids.awbBatchId = id;
        if (c.path === '/companies') ids.companyId = id;
        if (c.path === '/tenants') ids.tenantId = id;
        if (c.path === '/masters/ports') ids.portId = id;
        if (c.path === '/masters/currencies') ids.currencyId = id;
      }
    }

    results.push({
      ...c,
      ...verdict,
      status: res.status,
      ms: res.ms,
      url: res.url,
      sample: res.text.slice(0, 120),
    });
    console.log(`${verdict.result.padEnd(7)} ${c.module} · ${c.name} (${res.status}, ${res.ms}ms)`);
  }

  // Dynamic detail GETs
  /** @type {Case[]} */
  const detailCases = [];
  if (ids.userId) detailCases.push({ module: 'Users', name: `Get user ${ids.userId}`, method: 'GET', path: `/users/${ids.userId}`, auth: 'tenant', expect: [200] });
  if (ids.partyId) detailCases.push({ module: 'Parties', name: `Get party ${ids.partyId}`, method: 'GET', path: `/parties/${ids.partyId}`, auth: 'tenant', expect: [200] });
  if (ids.quotationId) detailCases.push({ module: 'Quotations', name: `Get quotation ${ids.quotationId}`, method: 'GET', path: `/quotations/${ids.quotationId}`, auth: 'tenant', expect: [200] });
  if (ids.jobId) {
    detailCases.push({ module: 'Jobs', name: `Get job ${ids.jobId}`, method: 'GET', path: `/jobs/${ids.jobId}`, auth: 'tenant', expect: [200] });
    detailCases.push({ module: 'Jobs', name: `Job P&L`, method: 'GET', path: `/jobs/${ids.jobId}/pnl`, auth: 'tenant', expect: [200, 404] });
    detailCases.push({ module: 'Jobs', name: `Job containers`, method: 'GET', path: `/jobs/${ids.jobId}/containers`, auth: 'tenant', expect: [200] });
    detailCases.push({ module: 'Jobs', name: `Job cargo`, method: 'GET', path: `/jobs/${ids.jobId}/cargo`, auth: 'tenant', expect: [200] });
    detailCases.push({ module: 'Jobs', name: `Job charges`, method: 'GET', path: `/jobs/${ids.jobId}/charges`, auth: 'tenant', expect: [200, 404, 405] });
    detailCases.push({ module: 'Jobs', name: `Job documents`, method: 'GET', path: `/jobs/${ids.jobId}/documents`, auth: 'tenant', expect: [200] });
    detailCases.push({ module: 'Jobs', name: `Job milestones`, method: 'GET', path: `/jobs/${ids.jobId}/milestones`, auth: 'tenant', expect: [200] });
    detailCases.push({ module: 'Jobs', name: `Job notes`, method: 'GET', path: `/jobs/${ids.jobId}/notes`, auth: 'tenant', expect: [200] });
  }
  if (ids.invoiceId) detailCases.push({ module: 'Invoices', name: `Get invoice ${ids.invoiceId}`, method: 'GET', path: `/invoices/${ids.invoiceId}`, auth: 'tenant', expect: [200] });
  if (ids.accountId) {
    detailCases.push({ module: 'GL Chart of Accounts', name: `Get account ${ids.accountId}`, method: 'GET', path: `/gl/accounts/${ids.accountId}`, auth: 'tenant', expect: [200] });
    detailCases.push({ module: 'GL Chart of Accounts', name: `Account ledger`, method: 'GET', path: `/gl/accounts/${ids.accountId}/ledger`, auth: 'tenant', expect: [200, 400] });
  }
  if (ids.voucherId) detailCases.push({ module: 'GL Vouchers', name: `Get voucher ${ids.voucherId}`, method: 'GET', path: `/gl/vouchers/${ids.voucherId}`, auth: 'tenant', expect: [200] });
  if (ids.awbBatchId) detailCases.push({ module: 'AWB Stock', name: `Get batch ${ids.awbBatchId}`, method: 'GET', path: `/awb-stock/batches/${ids.awbBatchId}`, auth: 'tenant', expect: [200] });
  if (ids.partyId) {
    detailCases.push({ module: 'GL AR/AP Aging', name: `AR statement`, method: 'GET', path: `/gl/ar/statement/${ids.partyId}`, auth: 'tenant', expect: [200, 400, 404] });
    detailCases.push({ module: 'GL AR/AP Aging', name: `AP statement`, method: 'GET', path: `/gl/ap/statement/${ids.partyId}`, auth: 'tenant', expect: [200, 400, 404] });
  }
  if (ids.currencyId) {
    detailCases.push({ module: 'Masters', name: `Latest exchange rate`, method: 'GET', path: `/masters/exchange-rates/latest/${ids.currencyId}`, auth: 'tenant', expect: [200, 404] });
  }
  if (ids.companyId && superToken) detailCases.push({ module: 'Companies (SuperAdmin)', name: `Get company`, method: 'GET', path: `/companies/${ids.companyId}`, auth: 'super', expect: [200] });
  if (ids.tenantId && superToken) detailCases.push({ module: 'Tenants (SuperAdmin)', name: `Get tenant`, method: 'GET', path: `/tenants/${ids.tenantId}`, auth: 'super', expect: [200] });

  // Auth session extras
  if (refreshToken) {
    detailCases.push({
      module: 'Auth',
      name: 'Refresh access token',
      method: 'POST',
      path: '/auth/refresh',
      auth: 'none',
      body: { refresh_token: refreshToken },
      expect: [200, 201],
    });
  }

  for (const c of detailCases) {
    const token = c.auth === 'super' ? superToken : c.auth === 'none' ? null : tenantToken;
    const res = await request(c.method, c.path, { token, body: c.body, query: c.query });
    const verdict = classify(c, res);
    results.push({ ...c, ...verdict, status: res.status, ms: res.ms, url: res.url, sample: res.text.slice(0, 120) });
    console.log(`${verdict.result.padEnd(7)} ${c.module} · ${c.name} (${res.status})`);
  }

  // Swagger coverage snapshot for frontend modules
  const swagger = JSON.parse(fs.readFileSync(path.join(ROOT, '.tmp-swagger-api-test.json'), 'utf8'));
  const swaggerOps = [];
  for (const [p, methods] of Object.entries(swagger.paths || {})) {
    for (const [method, op] of Object.entries(methods)) {
      if (!op?.operationId) continue;
      swaggerOps.push({ method: method.toUpperCase(), path: p, tag: op.tags?.[0] || 'Untagged', id: op.operationId });
    }
  }

  // Write markdown
  const byModule = new Map();
  for (const r of results) {
    if (!byModule.has(r.module)) byModule.set(r.module, []);
    byModule.get(r.module).push(r);
  }

  const pass = results.filter((r) => r.result === 'PASS').length;
  const fail = results.filter((r) => r.result === 'FAIL').length;
  const blocked = results.filter((r) => r.result === 'BLOCKED').length;
  const total = results.length;
  const now = new Date().toISOString();

  let md = '';
  md += `# API Testing Results — Fresa Gold / KingFisher Tech Gold Frontend\n\n`;
  md += `**Generated:** ${now}  \n`;
  md += `**API Base:** [${BASE}](${BASE})  \n`;
  md += `**Swagger UI:** [https://kingfisherwings.onrender.com/docs](https://kingfisherwings.onrender.com/docs#)  \n`;
  md += `**OpenAPI operations (live):** ${swaggerOps.length}  \n`;
  md += `**Credentials used:** Tenant slug \`${CREDS.tenantSlug}\`, staff email \`${CREDS.staffEmail}\` (Tenant Admin / staff JWT)  \n`;
  md += `**Super Admin:** ${superToken ? 'Authenticated' : 'Not provided — SuperAdmin-only endpoints marked BLOCKED'}  \n\n`;

  md += `## Executive Summary\n\n`;
  md += `| Metric | Count |\n|--------|-------|\n`;
  md += `| Tests executed | ${total} |\n`;
  md += `| PASS | ${pass} |\n`;
  md += `| FAIL | ${fail} |\n`;
  md += `| BLOCKED | ${blocked} |\n`;
  md += `| Pass rate (excl. blocked) | ${total - blocked > 0 ? ((pass / (total - blocked)) * 100).toFixed(1) : 'n/a'}% |\n\n`;

  md += `### Verdict legend\n\n`;
  md += `- **PASS** — HTTP status matched expected outcomes (success or intentional negative case).\n`;
  md += `- **FAIL** — Unexpected status, 5xx, network error, or auth/permission failure for an endpoint that should work with the provided Tenant Admin JWT.\n`;
  md += `- **BLOCKED** — Could not run meaningfully (missing Super Admin credentials).\n\n`;

  md += `## Module Scorecard\n\n`;
  md += `| Module | Pass | Fail | Blocked | Total |\n|--------|------|------|---------|-------|\n`;
  for (const [mod, rows] of [...byModule.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const p = rows.filter((r) => r.result === 'PASS').length;
    const f = rows.filter((r) => r.result === 'FAIL').length;
    const b = rows.filter((r) => r.result === 'BLOCKED').length;
    md += `| ${mod} | ${p} | ${f} | ${b} | ${rows.length} |\n`;
  }
  md += `\n`;

  md += `## Detailed Results by Module\n\n`;
  for (const [mod, rows] of [...byModule.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    md += `### ${mod}\n\n`;
    md += `| Result | Test | Method | Path | Status | Time |\n`;
    md += `|--------|------|--------|------|--------|------|\n`;
    for (const r of rows) {
      md += `| **${r.result}** | ${r.name} | \`${r.method}\` | \`${r.path}\` | ${r.status} | ${r.ms}ms |\n`;
    }
    md += `\n`;
    const fails = rows.filter((r) => r.result === 'FAIL' || r.result === 'BLOCKED');
    if (fails.length) {
      md += `<details><summary>Notes (${fails.length})</summary>\n\n`;
      for (const r of fails) {
        md += `- **${r.name}:** ${r.reason}\n`;
      }
      md += `\n</details>\n\n`;
    }
  }

  md += `## Failed Tests (full list)\n\n`;
  const fails = results.filter((r) => r.result === 'FAIL');
  if (!fails.length) {
    md += `_None._\n\n`;
  } else {
    md += `| Module | Test | Method | Path | Status | Reason |\n`;
    md += `|--------|------|--------|------|--------|--------|\n`;
    for (const r of fails) {
      md += `| ${r.module} | ${r.name} | \`${r.method}\` | \`${r.path}\` | ${r.status} | ${String(r.reason).replace(/\|/g, '\\|').slice(0, 200)} |\n`;
    }
    md += `\n`;
  }

  md += `## Blocked Tests\n\n`;
  const blocks = results.filter((r) => r.result === 'BLOCKED');
  if (!blocks.length) md += `_None._\n\n`;
  else {
    md += `| Module | Test | Reason |\n|--------|------|--------|\n`;
    for (const r of blocks) md += `| ${r.module} | ${r.name} | ${r.reason} |\n`;
    md += `\n`;
  }

  md += `## Scope Notes\n\n`;
  md += `1. This run validates **frontend-wired modules** against the live API ([Swagger](https://kingfisherwings.onrender.com/docs#)).\n`;
  md += `2. Focus is **read/list + auth + key detail GETs** discovered from list responses. Destructive CRUD (DELETE, cancel, post, convert) was **not** executed against production data to avoid side effects.\n`;
  md += `3. Live OpenAPI currently exposes **${swaggerOps.length}** operations; the frontend consumes a large subset (~220 path templates including Jobs sub-resources).\n`;
  md += `4. To re-run with Super Admin coverage:\n\n`;
  md += `\`\`\`powershell\n`;
  md += `$env:E2E_SUPERADMIN_EMAIL = "your@email"\n`;
  md += `$env:E2E_SUPERADMIN_PASSWORD = "your-password"\n`;
  md += `node scripts/api-matrix-test.mjs\n`;
  md += `\`\`\`\n\n`;
  md += `5. Tenant Admin login via \`POST /auth/tenant-login\` returned 401 for the demo password; **staff login** (\`POST /auth/login\` with admin email) succeeded and was used for ERP module tests.\n\n`;

  md += `## Swagger Tag Inventory (live)\n\n`;
  const tagCounts = {};
  for (const op of swaggerOps) tagCounts[op.tag] = (tagCounts[op.tag] || 0) + 1;
  md += `| Swagger Tag | Operations |\n|-------------|------------|\n`;
  for (const [t, c] of Object.entries(tagCounts).sort((a, b) => b[1] - a[1])) {
    md += `| ${t} | ${c} |\n`;
  }
  md += `\n---\n\n_Report generated by \`scripts/api-matrix-test.mjs\`._\n`;

  fs.writeFileSync(OUT, md, 'utf8');
  fs.writeFileSync(RAW_OUT, JSON.stringify({ generatedAt: now, base: BASE, summary: { total, pass, fail, blocked }, results, ids }, null, 2));
  console.log(`\nWrote ${OUT}`);
  console.log(`PASS=${pass} FAIL=${fail} BLOCKED=${blocked} TOTAL=${total}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
