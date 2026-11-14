import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env) || process.env[key] === '') process.env[key] = value;
  }
}

loadEnvFile(path.join(root, '.env.e2e'));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const posts = [];
page.on('request', (r) => {
  if (r.method() === 'POST') posts.push(r.url());
});
page.on('response', (r) => {
  if (r.request().method() === 'POST') {
    console.log('RESP', r.status(), r.url());
  }
});

await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Admin Login/i }).click();
await page.getByRole('button', { name: 'Staff / User' }).click();
await page.locator('#kf-tenant-slug').fill(process.env.E2E_TENANT_SLUG || '');
await page.locator('#kf-email').fill(process.env.E2E_STAFF_EMAIL || '');
await page.locator('#kf-pw').fill(process.env.E2E_STAFF_PASSWORD || '');
await page.locator('input[type="checkbox"]').last().check({ force: true });
await page.getByRole('button', { name: /Sign In/i }).click();
await page.waitForTimeout(10000);
const out = path.join(
  root,
  'src/features/reports/qa/visual-evidence/branding/login-after-submit.png',
);
fs.mkdirSync(path.dirname(out), { recursive: true });
await page.screenshot({ path: out, fullPage: true });
console.log(
  JSON.stringify(
    {
      url: page.url(),
      posts,
      body: (await page.locator('body').innerText()).slice(0, 1200),
    },
    null,
    2,
  ),
);
await browser.close();
