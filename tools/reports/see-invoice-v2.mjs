/**
 * Opens the invoice catalogue in the running dev server and checks the v2 list.
 * Reads .env.e2e. Prints no credentials.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, '.env.e2e'), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    }),
);
const invoiceId = 'd7280830-7eea-463e-a21e-cc59d2900807';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const notes = [];
try {
  await page.goto('http://127.0.0.1:5173/staff/login', { waitUntil: 'networkidle' });
  await page.fill('#kf-tenant-slug', env.E2E_TENANT_SLUG);
  await page.fill('#kf-email', env.E2E_STAFF_EMAIL);
  await page.fill('#kf-pw', env.E2E_STAFF_PASSWORD);
  await page.locator('input[type="checkbox"]').nth(1).check();
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 120000 });
  notes.push(`signed in at ${page.url()}`);
  const responsePromise = page.waitForResponse(
    (item) => item.url().includes('/__reports/invoice-v2') && item.request().method() === 'POST',
    { timeout: 30000 },
  );
  await page.goto(
    `http://127.0.0.1:5173/reports/catalog?context=invoice&family=commercial&invoice_id=${invoiceId}&code=INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA`,
    { waitUntil: 'domcontentloaded' },
  );
  const response = await responsePromise.catch(() => null);
  await page.waitForTimeout(1000);
  const body = await page.locator('body').innerText();
  const formatAt = body.indexOf('Format-1');
  const laterAt = body.indexOf('Format-22');
  notes.push(`format 1 listed: ${formatAt >= 0}`);
  notes.push(`format 1 before a non-spec invoice code: ${laterAt < 0 || (formatAt >= 0 && formatAt < laterAt)}`);
  notes.push(`badge visible: ${body.toLowerCase().includes('approximate, not final')}`);
  notes.push(`preview request: ${response ? response.status() : 'none'}`);
  notes.push(`pdf bytes: ${response ? response.headers()['content-type'] : ''}`);
  notes.push(`viewer open: ${await page.getByRole('dialog').count()}`);
  notes.push(`notice: ${body.includes('could not be built') || body.includes('Showing the classic invoice')}`);
} catch (error) {
  const alert = await page.locator('[role="alert"]').allTextContents().catch(() => []);
  notes.push(`failed: ${error instanceof Error ? error.message.split('\n')[0] : 'unknown'}`);
  notes.push(`alert: ${alert.join(' | ').slice(0, 300)}`);
} finally {
  await browser.close();
}
console.log(notes.join('\n'));
