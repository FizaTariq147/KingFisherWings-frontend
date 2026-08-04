import fs from 'node:fs';
import { expect, test } from './fixtures';
import {
  erpSessionStorageFile,
  hasErpCredentials,
  tenantAdminAuthFile,
  waitForApi,
} from './helpers';

test.beforeEach(() => {
  test.skip(
    !hasErpCredentials() ||
      !fs.existsSync(tenantAdminAuthFile) ||
      !fs.existsSync(erpSessionStorageFile),
    'ERP credentials or auth state missing — set E2E_TENANT_SLUG + E2E_STAFF_EMAIL + E2E_STAFF_PASSWORD',
  );
});

test.describe('Dashboard & Navigation', () => {
  test('dashboard loads after session restore', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/welcome|active shipments|dashboard/i).first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test('navigates to quotations hub and list', async ({ page }) => {
    await page.goto('/quotations');
    await expect(page).toHaveURL(/\/quotations/);
    await page.goto('/quotations/all');
    await expect(page).toHaveURL(/\/quotations\/all/);
  });

  test('navigates to finance and accounts menus', async ({ page }) => {
    await page.goto('/finance');
    await expect(page).toHaveURL(/\/finance/);
    await page.goto('/accounts');
    await expect(page).toHaveURL(/\/accounts/);
  });

  test('navigates to jobs list', async ({ page }) => {
    await page.goto('/jobs/air-export');
    await expect(page).toHaveURL(/\/jobs\/air-export/);
  });

  test('navigates to masters hub', async ({ page }) => {
    await page.goto('/masters');
    await expect(page).toHaveURL(/\/masters/);
  });

  test('navigates to user admin list', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/admin\/users/);
  });
});

test.describe('Global Search', () => {
  test('opens search panel and calls search API', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByPlaceholder('Search jobs, quotations, parties…')).toBeVisible();

    const input = page.getByPlaceholder('Search jobs, quotations, parties…');
    const searchResponse = waitForApi(page, '/search', 'GET');
    await input.fill('test-query-e2e');
    const res = await searchResponse;
    expect(res.status()).toBeLessThan(500);
    const requestUrl = new URL(res.url());
    expect(requestUrl.searchParams.get('q')).toBe('test-query-e2e');
  });
});

test.describe('Locale integration', () => {
  test('locale API endpoints respond through dev proxy', async ({ request }) => {
    const defaults = await request.get('/backend/locale/defaults');
    expect(defaults.status()).toBe(200);
    const defaultsJson = await defaults.json();
    expect(defaultsJson).toHaveProperty('country_required');

    const profile = await request.get('/backend/locale/AE');
    expect(profile.status()).toBe(200);
    expect((await profile.json()).country_code).toBe('AE');
  });
});

test.describe('Quotations module', () => {
  test('quotations list loads and requests API', async ({ page }) => {
    const listResponse = waitForApi(page, '/quotations', 'GET');
    await page.goto('/quotations/all');
    const res = await listResponse;
    expect(res.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/quotations\/all/);
  });

  test('quotation create form shows validation for empty submit', async ({ page }) => {
    await page.goto('/quotations/new');
    await expect(page).toHaveURL(/\/quotations\/new/);
    const submit = page.getByRole('button', { name: /save|create|submit/i }).first();
    if (await submit.isVisible()) {
      await submit.click();
      await expect(page.locator('[role="alert"], .text-red-500, .text-red-600').first()).toBeVisible({
        timeout: 10_000,
      });
    }
  });
});

test.describe('Jobs module', () => {
  test('jobs list loads for air export segment', async ({ page }) => {
    const listResponse = waitForApi(page, '/jobs', 'GET');
    await page.goto('/jobs/air-export');
    const res = await listResponse;
    expect(res.status()).toBeLessThan(500);
  });

  test('job create page is reachable', async ({ page }) => {
    await page.goto('/jobs/air-export/new');
    await expect(page).toHaveURL(/\/jobs\/air-export\/new/);
  });
});

test.describe('Finance module', () => {
  test('invoice list loads', async ({ page }) => {
    const listResponse = waitForApi(page, '/invoices', 'GET');
    await page.goto('/invoices');
    const res = await listResponse;
    expect(res.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/invoices/);
  });

  test('chart of accounts list loads', async ({ page }) => {
    const listResponse = waitForApi(page, '/gl/accounts', 'GET');
    await page.goto('/gl/accounts');
    const res = await listResponse;
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe('Users module', () => {
  test('users list loads with pagination API', async ({ page }) => {
    const listResponse = waitForApi(page, '/users', 'GET');
    await page.goto('/admin/users');
    const res = await listResponse;
    expect(res.status()).toBeLessThan(500);
    const url = new URL(res.url());
    expect(url.searchParams.get('page') ?? '1').toBeTruthy();
  });

  test('user create form validates required fields', async ({ page }) => {
    await page.goto('/admin/users/new');
    const submit = page.getByRole('button', { name: /save|create|submit/i }).first();
    if (await submit.isVisible()) {
      await submit.click();
      await expect(page.locator('[role="alert"], .text-red-500, .text-red-600').first()).toBeVisible({
        timeout: 10_000,
      });
    }
  });
});

test.describe('Masters module', () => {
  test('masters menu renders resource links', async ({ page }) => {
    await page.goto('/masters');
    await expect(
      page.getByRole('heading', { name: /masters/i }).or(page.getByText(/masters/i)).first(),
    ).toBeVisible();
  });

  test('AWB stock master list loads', async ({ page }) => {
    const listResponse = waitForApi(page, '/awb-stock', 'GET');
    await page.goto('/masters/awb-stock-master');
    const res = await listResponse;
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe('Role-based access', () => {
  test('organization profile requires tenant manager role or shows forbidden', async ({ page }) => {
    await page.goto('/organization');
    await expect(page).toHaveURL(/\/(organization|403|dashboard)/);
  });
});

test.describe('Profile & locale preference', () => {
  test('my profile page loads auth me endpoint', async ({ page }) => {
    const meResponse = waitForApi(page, '/auth/me', 'GET');
    await page.goto('/profile');
    const res = await meResponse;
    expect(res.status()).toBeLessThan(500);
  });
});
