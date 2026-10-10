/**
 * Smoke / navigation coverage for FCL continuum screens.
 * Full Export/Import mutations require live ERP credentials and backend flags.
 */
import fs from 'node:fs';
import { expect, test } from './fixtures';
import {
  dismissSessionIdleIfPresent,
  erpSessionStorageFile,
  hasErpCredentials,
  tenantAdminAuthFile,
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

test.describe('FCL continuum — navigation smoke', () => {
  test('Enquiries list loads with FCL create shortcuts', async ({ page }) => {
    await page.goto('/sales/enquiries', { waitUntil: 'domcontentloaded' });
    await dismissSessionIdleIfPresent(page);
    await expect(page.getByRole('heading', { name: /enquiries/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /new fcl export/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /new fcl import/i })).toBeVisible();
  });

  test('FCL Export enquiry create preselects service type', async ({ page }) => {
    await page.goto('/sales/enquiries/new?service_type=SEA_FCL_EXPORT', {
      waitUntil: 'domcontentloaded',
    });
    await dismissSessionIdleIfPresent(page);
    await expect(page.getByRole('heading', { name: /create enquiry/i })).toBeVisible();
    const service = page.locator('select').filter({ has: page.locator('option[value="SEA_FCL_EXPORT"]') }).first();
    await expect(service).toHaveValue('SEA_FCL_EXPORT');
  });

  test('FCL Import enquiry create preselects service type', async ({ page }) => {
    await page.goto('/sales/enquiries/new?service_type=SEA_FCL_IMPORT', {
      waitUntil: 'domcontentloaded',
    });
    await dismissSessionIdleIfPresent(page);
    const service = page.locator('select').filter({ has: page.locator('option[value="SEA_FCL_IMPORT"]') }).first();
    await expect(service).toHaveValue('SEA_FCL_IMPORT');
  });

  test('Shipments operations list route loads', async ({ page }) => {
    await page.goto('/operations/shipments', { waitUntil: 'domcontentloaded' });
    await dismissSessionIdleIfPresent(page);
    await expect(page.getByRole('heading', { name: /shipments/i })).toBeVisible();
  });

  test('Create enquiry requires party for FCL Export (client validation)', async ({ page }) => {
    await page.goto('/sales/enquiries/new?service_type=SEA_FCL_EXPORT', {
      waitUntil: 'domcontentloaded',
    });
    await dismissSessionIdleIfPresent(page);
    await page.getByRole('button', { name: /create enquiry/i }).click();
    await expect(page.getByText(/select a party for fcl/i)).toBeVisible();
  });
});
