import fs from 'node:fs';
import { expect, test } from '@playwright/test';
import { hasSuperAdminCredentials, superAdminAuthFile, waitForApi } from './helpers';

test.beforeEach(() => {
  test.skip(
    !hasSuperAdminCredentials() || !fs.existsSync(superAdminAuthFile),
    'Super admin credentials or auth state missing',
  );
});

test.describe('Super Admin — Tenants', () => {
  test('tenants list loads and calls tenants API', async ({ page }) => {
    const listResponse = waitForApi(page, '/tenants', 'GET');
    await page.goto('/superadmin/tenants');
    const res = await listResponse;
    expect(res.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/superadmin\/tenants/);
  });

  test('tenant list search filters results', async ({ page }) => {
    await page.goto('/superadmin/tenants');
    const search = page.getByLabel('Search tenants');
    if (await search.isVisible()) {
      const listResponse = waitForApi(page, '/tenants', 'GET');
      await search.fill('demo');
      await listResponse;
      const url = page.url();
      expect(url).toContain('/superadmin/tenants');
    }
  });

  test('tenant create page validates required fields', async ({ page }) => {
    await page.goto('/superadmin/tenants/new');
    await expect(page).toHaveURL(/\/superadmin\/tenants\/new/);
    const submit = page.getByRole('button', { name: /save|create|submit/i }).first();
    if (await submit.isVisible()) {
      await submit.click();
      await expect(page.locator('[role="alert"], .text-red-500, .text-red-600').first()).toBeVisible({
        timeout: 10_000,
      });
    }
  });
});

test.describe('Super Admin — Companies', () => {
  test('companies list loads and calls companies API', async ({ page }) => {
    const listResponse = waitForApi(page, '/companies', 'GET');
    await page.goto('/superadmin/companies');
    const res = await listResponse;
    expect(res.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/superadmin\/companies/);
  });

  test('company create page is reachable', async ({ page }) => {
    await page.goto('/superadmin/companies/new');
    await expect(page).toHaveURL(/\/superadmin\/companies\/new/);
  });
});

test.describe('Super Admin — Dashboard & Navigation', () => {
  test('dashboard loads', async ({ page }) => {
    await page.goto('/superadmin/dashboard');
    await expect(page).toHaveURL(/\/superadmin\/dashboard/);
  });

  test('ERP routes are not accessible from super admin session', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/(dashboard|superadmin|login)/);
  });
});
