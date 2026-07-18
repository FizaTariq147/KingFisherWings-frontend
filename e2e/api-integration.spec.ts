/**
 * Frontend ↔ API integration tests.
 * Visits ERP routes and asserts the correct backend endpoints are called
 * (method, path, non-5xx status) through the Vite `/backend` proxy.
 */
import fs from 'node:fs';
import { expect, test } from './fixtures';
import {
  dismissSessionIdleIfPresent,
  erpSessionStorageFile,
  expectPageCallsApi,
  hasErpCredentials,
  tenantAdminAuthFile,
  waitForApi,
} from './helpers';

test.beforeEach(async ({ page }) => {
  test.skip(
    !hasErpCredentials() ||
      !fs.existsSync(tenantAdminAuthFile) ||
      !fs.existsSync(erpSessionStorageFile),
    'ERP credentials / auth state missing — set E2E_* env vars',
  );
  page.on('dialog', (d) => d.dismiss().catch(() => undefined));
});

test.describe('API integration — Auth bootstrap', () => {
  test('session restore hits /auth/me and locale defaults', async ({ page }) => {
    const me = waitForApi(page, '/auth/me', 'GET');
    const defaults = waitForApi(page, '/locale/defaults', 'GET');
    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
    await dismissSessionIdleIfPresent(page);
    const meRes = await me;
    expect(meRes.status()).toBe(200);
    expect(meRes.request().headers()['authorization'] || '').toMatch(/^Bearer\s+/i);
    const localeRes = await defaults;
    expect(localeRes.status()).toBe(200);
  });
});

test.describe('API integration — Core modules', () => {
  test('Users list → GET /users', async ({ page }) => {
    const res = await expectPageCallsApi(page, '/admin/users', '/users');
    expect(res.request().method()).toBe('GET');
  });

  test('Parties list → GET /parties', async ({ page }) => {
    await expectPageCallsApi(page, '/parties', '/parties');
  });

  test('Organization profile → GET /organization/profile', async ({ page }) => {
    await expectPageCallsApi(page, '/organization', '/organization/profile');
  });

  test('Quotations list → GET /quotations', async ({ page }) => {
    await expectPageCallsApi(page, '/quotations/all', '/quotations');
  });

  test('Tariffs list → GET /quotations/tariffs', async ({ page }) => {
    await expectPageCallsApi(page, '/quotations/tariff-master', '/quotations/tariffs');
  });

  test('Zip distances → GET /quotations/zip-distances', async ({ page }) => {
    await expectPageCallsApi(page, '/quotations/zip-distance-master', '/quotations/zip-distances');
  });

  test('Jobs air-export → GET /jobs', async ({ page }) => {
    await expectPageCallsApi(page, '/jobs/air-export', '/jobs');
  });

  test('Invoices list → GET /invoices', async ({ page }) => {
    await expectPageCallsApi(page, '/invoices', '/invoices');
  });

  test('Purchase invoices → GET /purchase-invoices', async ({ page }) => {
    await expectPageCallsApi(page, '/purchase-invoices', '/purchase-invoices');
  });

  test('Credit notes → GET /credit-notes', async ({ page }) => {
    await expectPageCallsApi(page, '/credit-notes', '/credit-notes');
  });

  test('Payment requests → GET /payment-requests', async ({ page }) => {
    await expectPageCallsApi(page, '/payment-requests', '/payment-requests');
  });
});

test.describe('API integration — GL / Accounts', () => {
  test('Chart of accounts → GET /gl/accounts', async ({ page }) => {
    await expectPageCallsApi(page, '/gl/accounts', '/gl/accounts');
  });

  test('Vouchers → GET /gl/vouchers', async ({ page }) => {
    await expectPageCallsApi(page, '/gl/vouchers', '/gl/vouchers');
  });

  test('GL payments → GET /gl/payments', async ({ page }) => {
    await expectPageCallsApi(page, '/gl/payments', '/gl/payments');
  });

  test('Cheques → GET /gl/cheques', async ({ page }) => {
    await expectPageCallsApi(page, '/gl/cheques', '/gl/cheques');
  });

  test('Bank reconciliations → GET /gl/bank-reconciliations', async ({ page }) => {
    await expectPageCallsApi(page, '/gl/bank-reconciliations', '/gl/bank-reconciliations');
  });

  test('MIS dashboard → GET /gl/mis/dashboard', async ({ page }) => {
    await expectPageCallsApi(page, '/gl/mis/dashboard', '/gl/mis/dashboard');
  });

  test('AR aging → GET /gl/ar/aging', async ({ page }) => {
    await expectPageCallsApi(page, '/gl/ar/aging', '/gl/ar/aging');
  });

  test('AP aging → GET /gl/ap/aging', async ({ page }) => {
    await expectPageCallsApi(page, '/gl/ap/aging', '/gl/ap/aging');
  });
});

test.describe('API integration — Masters & AWB', () => {
  test('AWB stock batches → GET /awb-stock/batches', async ({ page }) => {
    await expectPageCallsApi(page, '/masters/awb-stock-master', '/awb-stock/batches');
  });

  test('Masters airlines → GET /masters/airlines', async ({ page }) => {
    await expectPageCallsApi(page, '/masters/airlines', '/masters/airlines');
  });

  test('Masters ports → GET /masters/ports', async ({ page }) => {
    await expectPageCallsApi(page, '/masters/ports', '/masters/ports');
  });

  test('Masters currencies → GET /masters/currencies', async ({ page }) => {
    await expectPageCallsApi(page, '/masters/currencies', '/masters/currencies');
  });
});

test.describe('API integration — Search & Profile', () => {
  test('Global search → GET /search with q', async ({ page }) => {
    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
    await dismissSessionIdleIfPresent(page);
    await page.getByRole('button', { name: 'Search' }).click();
    const input = page.getByPlaceholder('Search jobs, quotations, parties…');
    await expect(input).toBeVisible();
    const pending = waitForApi(page, '/search', 'GET');
    await input.fill('integration-test');
    const res = await pending;
    expect(res.status()).not.toBe(401);
    expect(res.status()).toBeLessThan(500);
    const url = new URL(res.url());
    expect(url.searchParams.get('q')).toBe('integration-test');
  });

  test('My profile → GET /auth/me', async ({ page }) => {
    const pending = waitForApi(page, '/auth/me', 'GET');
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
    await dismissSessionIdleIfPresent(page);
    const res = await pending;
    expect(res.status()).toBe(200);
  });
});
