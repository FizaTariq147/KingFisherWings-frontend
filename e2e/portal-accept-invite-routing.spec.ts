/**
 * Customer portal invitation activation routing.
 * Emails link to /login/portal/accept-invite?token=… — that path must not 404.
 */
import { test, expect } from '@playwright/test';

test.describe('Portal accept-invite routing', () => {
  test('email URL /login/portal/accept-invite renders activation form (not 404)', async ({
    page,
  }) => {
    await page.goto('/login/portal/accept-invite?token=test-invite-token-e2e', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByRole('heading', { name: /404/i })).toHaveCount(0);
    await expect(page.getByText(/Activate account/i).first()).toBeVisible({ timeout: 60_000 });
    await expect(page.getByLabel(/New password/i)).toBeVisible();
  });

  test('canonical /portal/accept-invite still works', async ({ page }) => {
    await page.goto('/portal/accept-invite?token=test-invite-token-e2e', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByRole('heading', { name: /404/i })).toHaveCount(0);
    await expect(page.getByLabel(/New password/i)).toBeVisible({ timeout: 60_000 });
  });

  test('missing token shows graceful message', async ({ page }) => {
    await page.goto('/login/portal/accept-invite', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /404/i })).toHaveCount(0);
    await expect(page.getByText(/missing a token/i)).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole('button', { name: /portal sign in/i })).toBeVisible();
  });

  test('refresh keeps activation page (SPA fallback + session token)', async ({ page }) => {
    await page.goto('/login/portal/accept-invite?token=test-invite-token-e2e', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByLabel(/New password/i)).toBeVisible({ timeout: 60_000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /404/i })).toHaveCount(0);
    await expect(page.getByLabel(/New password/i)).toBeVisible({ timeout: 60_000 });
  });
});
