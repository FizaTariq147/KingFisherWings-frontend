import { expect, test } from '@playwright/test';
import { openErpLoginModal, submitLogin } from './helpers';

test.describe('Form validation — Login', () => {
  test('rejects invalid email format on staff login', async ({ page }) => {
    await openErpLoginModal(page);
    await page.getByRole('button', { name: 'Staff / User' }).click();
    await page.locator('#kf-tenant-slug').fill('demo');
    await page.locator('#kf-email').fill('bad-email');
    await page.locator('#kf-pw').fill('x');
    await page.getByText('I agree to the terms of the').locator('..').locator('input[type="checkbox"]').check();
    await submitLogin(page);
    await expect(page.getByText('Enter a valid email address')).toBeVisible();
  });

  test('shows required field messages for empty staff email', async ({ page }) => {
    await openErpLoginModal(page);
    await page.getByRole('button', { name: 'Staff / User' }).click();
    await page.locator('#kf-tenant-slug').fill('demo');
    await page.locator('#kf-pw').fill('x');
    await page.getByText('I agree to the terms of the').locator('..').locator('input[type="checkbox"]').check();
    await submitLogin(page);
    await expect(page.getByText(/valid email|email/i).first()).toBeVisible();
  });
});

test.describe('Form validation — Super Admin signup', () => {
  test('signup validates password minimum length', async ({ page }) => {
    await page.goto('/superadmin/login');
    await page.getByRole('button', { name: 'Register' }).click();
    await page.getByLabel('First name').fill('Test');
    await page.getByLabel('Last name').fill('User');
    await page.getByLabel('Email', { exact: true }).fill('test@example.com');
    await page.locator('#signup_password').fill('short');
    await page.getByRole('button', { name: 'Create platform account' }).click();
    await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
  });

  test('signup validates invalid email', async ({ page }) => {
    await page.goto('/superadmin/login');
    await page.getByRole('button', { name: 'Register' }).click();
    await page.locator('#signup_email').fill('not-email');
    await page.locator('#signup_password').fill('validpass1');
    await page.getByRole('button', { name: 'Create platform account' }).click();
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });
});

test.describe('API — Locale (public)', () => {
  test('locale defaults endpoint returns expected shape', async ({ request }) => {
    const res = await request.get('/backend/locale/defaults');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      country_required: expect.any(Boolean),
      has_postal_pattern: expect.any(Boolean),
      has_tax_pattern: expect.any(Boolean),
    });
  });

  test('locale profile endpoint returns country-specific data', async ({ request }) => {
    const res = await request.get('/backend/locale/AE');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.country_code).toBe('AE');
    expect(body.base_currency).toBeTruthy();
  });
});

test.describe('Error handling', () => {
  test('404 page for unknown routes when unauthenticated', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-e2e');
    await expect(page.getByText('404 — Page Not Found')).toBeVisible({ timeout: 15_000 });
  });

  test('403 page renders', async ({ page }) => {
    await page.goto('/403');
    await expect(page.getByText('403 — Access Denied')).toBeVisible();
  });
});
