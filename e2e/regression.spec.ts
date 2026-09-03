import fs from 'node:fs';
import { expect, test } from './fixtures';
import { erpSessionStorageFile, hasErpCredentials, tenantAdminAuthFile } from './helpers';

test.beforeEach(() => {
  test.skip(
    !hasErpCredentials() ||
      !fs.existsSync(tenantAdminAuthFile) ||
      !fs.existsSync(erpSessionStorageFile),
    'ERP credentials required for regression suite',
  );
});

test.describe('Regression — Recent integrations', () => {
  test('hub All Jobs pages load (NVOCC, Management) and Documentation menu loads', async ({ page }) => {
    await page.goto('/nvocc/all-jobs');
    await expect(page).toHaveURL(/\/nvocc\/all-jobs/);

    await page.goto('/documentation');
    await expect(page).toHaveURL(/\/documentation$/);

    await page.goto('/management/all-jobs-mis');
    await expect(page).toHaveURL(/\/management\/all-jobs-mis/);
  });

  test('finance menu no longer shows separate New Invoice hub tile', async ({ page }) => {
    await page.goto('/finance');
    await expect(page.getByRole('link', { name: /^New Invoice$/i })).toHaveCount(0);
  });

  test('accounts menu no longer shows separate New Receipt hub tile', async ({ page }) => {
    await page.goto('/accounts');
    await expect(page.getByRole('link', { name: /^New Receipt$/i })).toHaveCount(0);
  });

  test('profile page supports preferred country (locale integration surface)', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByText(/country|preferred/i).first()).toBeVisible({ timeout: 20_000 });
  });

  test('quotations list still accessible after menu changes', async ({ page }) => {
    await page.goto('/quotations/all');
    await expect(page).toHaveURL(/\/quotations\/all/);
  });
});
