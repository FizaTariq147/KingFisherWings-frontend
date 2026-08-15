/**
 * Public Track & Trace — unauthenticated E2E (GET /track, /track/embed, /track/widget.js).
 */
import { expect, test } from '@playwright/test';
import { waitForApi } from './helpers';

const tenantSlug = process.env.E2E_TENANT_SLUG?.trim() || 'demo-trade-house';

test.describe('Public Track & Trace', () => {
  test('track page renders and calls GET /track/embed with tenant headers', async ({ page }) => {
    const embed = waitForApi(page, '/track/embed', 'GET');
    await page.goto('/track');
    await expect(page.getByText('Track & Trace')).toBeVisible();
    await expect(page.getByRole('heading', { name: /find your shipment/i })).toBeVisible();

    const res = await embed;
    expect(res.status(), 'embed should not 5xx').toBeLessThan(500);

    const reqHeaders = res.request().headers();
    const host = reqHeaders.host || reqHeaders.Host;
    const tenantDomain = reqHeaders['x-tenant-domain'] || reqHeaders['X-Tenant-Domain'];
    expect(host, 'host header sent').toBeTruthy();
    expect(tenantDomain, 'x-tenant-domain header sent').toBeTruthy();
  });

  test('track search enables when reference has 2+ characters', async ({ page }) => {
    await page.goto('/track');
    const btn = page.getByRole('button', { name: 'Track shipment' });
    await expect(btn).toBeDisabled();
    await page.getByLabel(/^Reference/i).fill('AB');
    await expect(btn).toBeEnabled();
  });

  test('track deep link auto-triggers GET /track lookup', async ({ page }) => {
    const track = waitForApi(page, '/track', 'GET');
    await page.goto(`/track?tenant=${tenantSlug}&ref=KFW-J-00042`);
    const res = await track;
    expect(res.status(), 'track lookup should not 5xx').toBeLessThan(500);

    const reqHeaders = res.request().headers();
    expect(reqHeaders.host || reqHeaders.Host).toBeTruthy();
    expect(reqHeaders['x-tenant-domain'] || reqHeaders['X-Tenant-Domain']).toBeTruthy();

    const url = new URL(res.url());
    expect(url.searchParams.get('ref')).toBe('KFW-J-00042');
  });

  test('track widget page loads embed config and widget script', async ({ page }) => {
    const embed = waitForApi(page, '/track/embed', 'GET');
    const widget = page.waitForResponse(
      (res) => res.url().includes('/track/widget.js') && res.request().method() === 'GET',
      { timeout: 60_000 },
    );

    await page.goto(`/track/widget?tenant=${tenantSlug}`);
    await expect(page.getByText('Track widget')).toBeVisible();

    const embedRes = await embed;
    expect(embedRes.status()).toBeLessThan(500);
    await widget;
  });

  test('public track routes do not require ERP login', async ({ page }) => {
    await page.goto('/track');
    await expect(page).not.toHaveURL(/\/login/);
    await page.goto('/track/widget');
    await expect(page).not.toHaveURL(/\/login/);
  });
});
