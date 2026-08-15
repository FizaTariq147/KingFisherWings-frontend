/**
 * E2E API integration for recently wired Customer Service, Sales, CRM, and Public Track modules.
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
    'ERP credentials / auth state missing — set E2E_* env vars in .env.e2e',
  );
  page.on('dialog', (d) => d.dismiss().catch(() => undefined));
});

test.describe('Customer Service — API integration', () => {
  test('All Shipments → GET /jobs on Submit', async ({ page }) => {
    await page.goto('/customer-service/shipments', { waitUntil: 'domcontentloaded' });
    await dismissSessionIdleIfPresent(page);
    const pending = waitForApi(page, '/jobs', 'GET');
    await page.getByRole('button', { name: 'Submit' }).click();
    const res = await pending;
    expect(res.status()).not.toBe(401);
    expect(res.status()).toBeLessThan(500);
  });

  test('Enquiry Sheet → GET /crm/enquiries on Submit', async ({ page }) => {
    await page.goto('/customer-service/enquiry-sheet', { waitUntil: 'domcontentloaded' });
    await dismissSessionIdleIfPresent(page);
    const pending = waitForApi(page, '/crm/enquiries', 'GET');
    await page.getByRole('button', { name: 'Submit' }).click();
    const res = await pending;
    expect(res.status()).not.toBe(401);
    expect(res.status()).toBeLessThan(500);
  });

  test('Shipment Tracking → GET /jobs on Submit', async ({ page }) => {
    await page.goto('/customer-service/tracking', { waitUntil: 'domcontentloaded' });
    await dismissSessionIdleIfPresent(page);
    const pending = waitForApi(page, '/jobs', 'GET');
    await page.getByRole('button', { name: 'Submit' }).click();
    const res = await pending;
    expect(res.status()).not.toBe(401);
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe('Sales — API integration', () => {
  test('Client Request List → GET /parties', async ({ page }) => {
    await expectPageCallsApi(page, '/sales/client-request-list', '/parties');
  });

  test('Rate Charges → GET /quotations/tariffs on Submit', async ({ page }) => {
    await page.goto('/sales/rate-charges', { waitUntil: 'domcontentloaded' });
    await dismissSessionIdleIfPresent(page);
    const pending = waitForApi(page, '/quotations/tariffs', 'GET');
    await page.getByRole('button', { name: 'Submit' }).click();
    const res = await pending;
    expect(res.status()).not.toBe(401);
    expect(res.status()).toBeLessThan(500);
  });

  test('Shipments List-Sales → GET /jobs on Submit', async ({ page }) => {
    await page.goto('/sales/shipments-list', { waitUntil: 'domcontentloaded' });
    await dismissSessionIdleIfPresent(page);
    const pending = waitForApi(page, '/jobs', 'GET');
    await page.getByRole('button', { name: 'Submit' }).click();
    const res = await pending;
    expect(res.status()).not.toBe(401);
    expect(res.status()).toBeLessThan(500);
  });

  test('Visiting Card List → GET /crm/leads on Submit', async ({ page }) => {
    await page.goto('/sales/visiting-card-list', { waitUntil: 'domcontentloaded' });
    await dismissSessionIdleIfPresent(page);
    const pending = waitForApi(page, '/crm/leads', 'GET');
    await page.getByRole('button', { name: 'Submit' }).click();
    const res = await pending;
    expect(res.status()).not.toBe(401);
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe('CRM — API integration (Sales routes)', () => {
  test('Leads → GET /crm/leads', async ({ page }) => {
    await expectPageCallsApi(page, '/sales/lead', '/crm/leads');
  });

  test('Enquiries → GET /crm/enquiries', async ({ page }) => {
    await expectPageCallsApi(page, '/sales/enquiries', '/crm/enquiries');
  });

  test('Call Logs → GET /crm/call-logs', async ({ page }) => {
    await expectPageCallsApi(page, '/sales/call-sheet', '/crm/call-logs');
  });

  test('Follow-ups → GET /crm/follow-ups', async ({ page }) => {
    await expectPageCallsApi(page, '/sales/follow-ups', '/crm/follow-ups');
  });

  test('Sales Dashboard → GET /crm/dashboard', async ({ page }) => {
    await expectPageCallsApi(page, '/sales/sales-dashboard', '/crm/dashboard');
  });
});

test.describe('Menu shells — no regression', () => {
  test('Customers menu page loads', async ({ page }) => {
    await page.goto('/customers', { waitUntil: 'domcontentloaded' });
    await dismissSessionIdleIfPresent(page);
    await expect(page).toHaveURL(/\/customers/);
  });

  test('Sales menu page loads', async ({ page }) => {
    await page.goto('/sales', { waitUntil: 'domcontentloaded' });
    await dismissSessionIdleIfPresent(page);
    await expect(page).toHaveURL(/\/sales/);
  });
});
