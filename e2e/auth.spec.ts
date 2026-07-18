import { expect, test } from '@playwright/test';
import {
  erpPostLoginUrl,
  fillStaffCredentials,
  hasStaffCredentials,
  hasTenantAdminCredentials,
  loginAsTenantAdmin,
  openErpLoginModal,
  submitLogin,
} from './helpers';

test.describe('Authentication', () => {
  test('login page renders marketing shell and opens sign-in dialog', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /KINGFISHER WINGS/i })).toBeVisible();
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Customer / User Sign On' })).toBeVisible();
  });

  test('shows validation for empty tenant admin credentials', async ({ page }) => {
    await openErpLoginModal(page);
    await page.getByRole('button', { name: 'Tenant Admin' }).click();
    await submitLogin(page);
    await expect(page.getByText('Tenant slug is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('shows validation for invalid staff email', async ({ page }) => {
    await openErpLoginModal(page);
    await page.getByRole('button', { name: 'Staff / User' }).click();
    await page.locator('#kf-tenant-slug').fill('demo-tenant');
    await page.locator('#kf-email').fill('not-an-email');
    await page.locator('#kf-pw').fill('secret');
    await page.getByText('I agree to the terms of the').locator('..').locator('input[type="checkbox"]').check();
    await submitLogin(page);
    await expect(page.getByText('Enter a valid email address')).toBeVisible();
  });

  test('requires terms acceptance before submit', async ({ page }) => {
    await openErpLoginModal(page);
    await page.getByRole('button', { name: 'Tenant Admin' }).click();
    await page.locator('#kf-tenant-slug').fill('demo-tenant');
    await page.locator('#kf-pw').fill('secret');
    await submitLogin(page);
    await expect(page.getByRole('dialog', { name: 'Sign in' })).toBeVisible();
  });

  test('protected routes redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await page.goto('/quotations/all');
    await expect(page).toHaveURL(/\/login/);
    await page.goto('/superadmin/tenants');
    await expect(page).toHaveURL(/\/superadmin\/login/);
  });

  test('tenant admin login calls auth API and navigates to dashboard', async ({ page }) => {
    // Only enable when POST /auth/tenant-login works for the demo tenant (often staff-only).
    test.skip(
      !hasTenantAdminCredentials() || process.env.E2E_ENABLE_TENANT_LOGIN !== '1',
      'Set E2E_TENANT_SLUG, E2E_TENANT_PASSWORD, and E2E_ENABLE_TENANT_LOGIN=1',
    );

    const loginResponse = page.waitForResponse(
      (res) =>
        res.url().includes('/auth/tenant-login') && res.request().method() === 'POST',
      { timeout: 120_000 },
    );
    const meResponse = page.waitForResponse(
      (res) => res.url().includes('/auth/me') && res.request().method() === 'GET',
      { timeout: 120_000 },
    );

    await loginAsTenantAdmin(page);

    const loginRes = await loginResponse;
    expect(loginRes.status()).toBeLessThan(500);
    expect([200, 201]).toContain(loginRes.status());

    const loginBody = await loginRes.json();
    expect(loginBody).toBeTruthy();

    const meRes = await meResponse;
    expect(meRes.status()).toBeLessThan(500);

    await expect(page).toHaveURL(erpPostLoginUrl);
  });

  test('staff login calls staff auth endpoint when credentials provided', async ({ page }) => {
    test.skip(!hasStaffCredentials(), 'Set E2E_STAFF_EMAIL and E2E_STAFF_PASSWORD');

    await openErpLoginModal(page);
    const loginResponse = page.waitForResponse(
      (res) => res.url().includes('/auth/login') && res.request().method() === 'POST',
      { timeout: 120_000 },
    );
    await fillStaffCredentials(page);
    await submitLogin(page);

    const loginRes = await loginResponse;
    expect(loginRes.status()).toBeLessThan(500);
    expect([200, 201]).toContain(loginRes.status());
    await expect(page).toHaveURL(erpPostLoginUrl, { timeout: 120_000 });
  });

  test('invalid credentials show error without breaking login dialog', async ({ page }) => {
    await openErpLoginModal(page);
    await page.getByRole('button', { name: 'Tenant Admin' }).click();
    await page.locator('#kf-tenant-slug').fill('nonexistent-tenant-slug-e2e');
    await page.locator('#kf-pw').fill('wrong-password-123');
    await page.getByText('I agree to the terms of the').locator('..').locator('input[type="checkbox"]').check();

    const loginResponse = page.waitForResponse(
      (res) =>
        res.url().includes('/auth/tenant-login') && res.request().method() === 'POST',
      { timeout: 120_000 },
    );
    await submitLogin(page);

    const loginRes = await loginResponse;
    expect([401, 403, 404]).toContain(loginRes.status());
    await expect(page.getByRole('dialog', { name: 'Sign in' })).toBeVisible();
  });
});

test.describe('Super Admin Authentication', () => {
  test('super admin login page renders', async ({ page }) => {
    await page.goto('/superadmin/login');
    await expect(page.getByRole('heading', { name: /KingFisher Tech Gold/i })).toBeVisible();
    await expect(page.getByText('Super Admin Portal')).toBeVisible();
  });

  test('super admin login validates empty password', async ({ page }) => {
    await page.goto('/superadmin/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.locator('form').getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });
});
