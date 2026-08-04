import { expect, type Page, type Response } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export const tenantAdminAuthFile = 'e2e/.auth/tenant-admin.json';
export const superAdminAuthFile = 'e2e/.auth/superadmin.json';
/** ERP auth (zustand) lives in sessionStorage — not covered by Playwright storageState. */
export const erpSessionStorageFile = 'e2e/.auth/tenant-admin.session.json';
export const superAdminSessionStorageFile = 'e2e/.auth/superadmin.session.json';

/** Post-login ERP homes: Tenant Admin → /admin/users; staff → /dashboard; first login → change-password. */
export const erpPostLoginUrl = /\/(dashboard|change-password|admin\/users)/;

export function hasTenantAdminCredentials(): boolean {
  return Boolean(process.env.E2E_TENANT_SLUG?.trim() && process.env.E2E_TENANT_PASSWORD?.trim());
}

/** Staff / User login: slug + email + password (works for Tenant Admin provisioned as user). */
export function hasStaffCredentials(): boolean {
  return Boolean(
    process.env.E2E_TENANT_SLUG?.trim() &&
      process.env.E2E_STAFF_EMAIL?.trim() &&
      process.env.E2E_STAFF_PASSWORD?.trim(),
  );
}

/** Any credentials that can open the ERP session for authenticated E2E. */
export function hasErpCredentials(): boolean {
  return hasStaffCredentials() || hasTenantAdminCredentials();
}

export function hasSuperAdminCredentials(): boolean {
  return Boolean(
    process.env.E2E_SUPERADMIN_EMAIL?.trim() && process.env.E2E_SUPERADMIN_PASSWORD?.trim(),
  );
}

export function ensureAuthDir(): void {
  fs.mkdirSync(path.dirname(tenantAdminAuthFile), { recursive: true });
}

const ERP_AUTH_STORAGE_KEY = 'KingFisher Tech-auth';

/**
 * Snapshot sessionStorage after login for authenticated projects.
 * Also embeds accessToken + fresh lastActiveAt so workers do not race refresh-token rotation.
 */
export async function saveSessionStorage(
  page: Page,
  filePath: string,
  options?: { accessToken?: string | null },
): Promise<void> {
  ensureAuthDir();
  const json = await page.evaluate(
    ({ authKey, accessToken, now }) => {
      if (accessToken) {
        try {
          const raw = window.sessionStorage.getItem(authKey);
          const parsed = raw
            ? (JSON.parse(raw) as { state?: Record<string, unknown>; version?: number })
            : { state: {}, version: 0 };
          parsed.state = {
            ...(parsed.state ?? {}),
            accessToken,
            sessionExpired: false,
            lastActiveAt: now,
            isAuthenticated: true,
          };
          window.sessionStorage.setItem(authKey, JSON.stringify(parsed));
        } catch {
          /* keep raw sessionStorage */
        }
      }
      const out: Record<string, string> = {};
      for (let i = 0; i < window.sessionStorage.length; i += 1) {
        const key = window.sessionStorage.key(i);
        if (key != null) out[key] = window.sessionStorage.getItem(key) ?? '';
      }
      return JSON.stringify(out);
    },
    {
      authKey: ERP_AUTH_STORAGE_KEY,
      accessToken: options?.accessToken ?? null,
      now: Date.now(),
    },
  );
  fs.writeFileSync(filePath, json, 'utf-8');
}

/** Dismiss the Session idle / expired modal if it is blocking the UI. */
export async function dismissSessionIdleIfPresent(page: Page): Promise<void> {
  const continueBtn = page.getByRole('button', { name: /continue session/i });
  if (await continueBtn.isVisible().catch(() => false)) {
    await continueBtn.click();
    await expect(continueBtn).toBeHidden({ timeout: 15_000 });
  }
}

export async function openErpLoginModal(page: Page): Promise<void> {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  const loginBtn = page.getByRole('button', { name: 'Login', exact: true });
  await expect(loginBtn).toBeVisible({ timeout: 30_000 });
  await loginBtn.click({ timeout: 30_000 });
  await expect(page.getByRole('dialog', { name: 'Sign in' })).toBeVisible();
  await page.getByRole('button', { name: 'Customer / User Sign On' }).click();
  await expect(page.getByRole('heading', { name: 'KingFisher Single Sign-On' })).toBeVisible();
}

export async function acceptTerms(page: Page): Promise<void> {
  const checkbox = page
    .getByText('I agree to the terms of the')
    .locator('..')
    .locator('input[type="checkbox"]');
  await checkbox.check();
}

export async function fillTenantAdminCredentials(
  page: Page,
  slug = process.env.E2E_TENANT_SLUG!,
  password = process.env.E2E_TENANT_PASSWORD!,
): Promise<void> {
  await page.locator('#kf-tenant-slug').fill(slug);
  await page.locator('#kf-pw').fill(password);
  await acceptTerms(page);
}

export async function fillStaffCredentials(
  page: Page,
  slug = process.env.E2E_TENANT_SLUG!,
  email = process.env.E2E_STAFF_EMAIL!,
  password = process.env.E2E_STAFF_PASSWORD!,
): Promise<void> {
  await page.getByRole('button', { name: 'Staff / User' }).click();
  await page.locator('#kf-tenant-slug').fill(slug);
  await page.locator('#kf-email').fill(email);
  await page.locator('#kf-pw').fill(password);
  await acceptTerms(page);
}

export async function submitLogin(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Continue to Sign On' }).click();
}

function pickAccessTokenFromBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const record = body as Record<string, unknown>;
  const direct = record.access_token ?? record.accessToken;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  const nested = record.data;
  if (nested && typeof nested === 'object') {
    const nestedRecord = nested as Record<string, unknown>;
    const nestedToken = nestedRecord.access_token ?? nestedRecord.accessToken;
    if (typeof nestedToken === 'string' && nestedToken.trim()) return nestedToken.trim();
  }
  return null;
}

export async function loginAsTenantAdmin(page: Page): Promise<string | null> {
  await openErpLoginModal(page);
  await page.getByRole('button', { name: 'Tenant Admin' }).click();
  const loginResponse = page.waitForResponse(
    (res) => res.url().includes('/auth/tenant-login') && res.request().method() === 'POST',
    { timeout: 120_000 },
  );
  await fillTenantAdminCredentials(page);
  await submitLogin(page);
  const loginRes = await loginResponse;
  await page.waitForURL(erpPostLoginUrl, { timeout: 120_000 });
  return pickAccessTokenFromBody(await loginRes.json().catch(() => null));
}

export async function loginAsStaff(page: Page): Promise<string | null> {
  await openErpLoginModal(page);
  const loginResponse = page.waitForResponse(
    (res) => res.url().includes('/auth/login') && res.request().method() === 'POST',
    { timeout: 120_000 },
  );
  await fillStaffCredentials(page);
  await submitLogin(page);
  const loginRes = await loginResponse;
  await page.waitForURL(erpPostLoginUrl, { timeout: 120_000 });
  return pickAccessTokenFromBody(await loginRes.json().catch(() => null));
}

/** Prefer staff login (live API), fall back to tenant-login. Returns access token when available. */
export async function loginAsErpUser(page: Page): Promise<string | null> {
  if (hasStaffCredentials()) {
    return loginAsStaff(page);
  }
  if (hasTenantAdminCredentials()) {
    return loginAsTenantAdmin(page);
  }
  throw new Error(
    'Set E2E_TENANT_SLUG + E2E_STAFF_EMAIL + E2E_STAFF_PASSWORD (or E2E_TENANT_PASSWORD)',
  );
}

export async function loginAsSuperAdmin(page: Page): Promise<void> {
  await page.goto('/superadmin/login');
  await page.getByLabel(/email/i).fill(process.env.E2E_SUPERADMIN_EMAIL!);
  await page.getByLabel(/password/i).fill(process.env.E2E_SUPERADMIN_PASSWORD!);
  await page.locator('form').getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL(/\/superadmin\/dashboard/, { timeout: 120_000 });
}

export async function waitForApi(
  page: Page,
  urlPart: string | RegExp,
  method: string = 'GET',
): Promise<Response> {
  return page.waitForResponse(
    (res) => {
      const url = res.url();
      const matches =
        typeof urlPart === 'string' ? url.includes(urlPart) : urlPart.test(url);
      return matches && res.request().method() === method;
    },
    { timeout: 120_000 },
  );
}

/**
 * Visit a route and assert the frontend calls the expected API.
 * Default: authenticated success or permission deny (not 401 / not 5xx).
 */
export async function expectPageCallsApi(
  page: Page,
  route: string,
  apiPath: string | RegExp,
  options?: { method?: string; allowStatuses?: number[] },
): Promise<Response> {
  const method = options?.method ?? 'GET';
  const pending = waitForApi(page, apiPath, method);
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await dismissSessionIdleIfPresent(page);
  const res = await pending;
  if (options?.allowStatuses?.length) {
    expect(options.allowStatuses).toContain(res.status());
  } else {
    const status = res.status();
    expect(status, `${method} ${apiPath} from ${route} — unauthenticated`).not.toBe(401);
    expect(status, `${method} ${apiPath} from ${route}`).toBeLessThan(500);
  }
  return res;
}

export async function expectProtectedRedirect(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page).toHaveURL(/\/login/);
}

export function apiPathPattern(segment: string): RegExp {
  return new RegExp(`${segment.replace(/\//g, '\\/')}`);
}
