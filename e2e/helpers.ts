import { expect, type Page, type Response } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export const tenantAdminAuthFile = 'e2e/.auth/tenant-admin.json';
export const superAdminAuthFile = 'e2e/.auth/superadmin.json';

export function hasTenantAdminCredentials(): boolean {
  return Boolean(process.env.E2E_TENANT_SLUG?.trim() && process.env.E2E_TENANT_PASSWORD?.trim());
}

export function hasStaffCredentials(): boolean {
  return (
    hasTenantAdminCredentials() &&
    Boolean(process.env.E2E_STAFF_EMAIL?.trim() && process.env.E2E_STAFF_PASSWORD?.trim())
  );
}

export function hasSuperAdminCredentials(): boolean {
  return Boolean(
    process.env.E2E_SUPERADMIN_EMAIL?.trim() && process.env.E2E_SUPERADMIN_PASSWORD?.trim(),
  );
}

export function ensureAuthDir(): void {
  fs.mkdirSync(path.dirname(tenantAdminAuthFile), { recursive: true });
}

export async function openErpLoginModal(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Sign in' })).toBeVisible();
  await page.getByRole('button', { name: 'Customer / User Sign On' }).click();
  await expect(page.getByRole('heading', { name: 'KingFisher Single Sign-On' })).toBeVisible();
}

export async function fillTenantAdminCredentials(
  page: Page,
  slug = process.env.E2E_TENANT_SLUG!,
  password = process.env.E2E_TENANT_PASSWORD!,
): Promise<void> {
  await page.locator('#kf-tenant-slug').fill(slug);
  await page.locator('#kf-pw').fill(password);
  await page.getByText('I agree to the terms of the').locator('..').locator('input[type="checkbox"]').check();
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
  await page.getByText('I agree to the terms of the').locator('..').locator('input[type="checkbox"]').check();
}

export async function submitLogin(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Continue to Sign On' }).click();
}

export async function loginAsTenantAdmin(page: Page): Promise<void> {
  await openErpLoginModal(page);
  await page.getByRole('button', { name: 'Tenant Admin' }).click();
  await fillTenantAdminCredentials(page);
  await submitLogin(page);
  await page.waitForURL(/\/(dashboard|change-password)/, { timeout: 120_000 });
}

export async function loginAsStaff(page: Page): Promise<void> {
  await openErpLoginModal(page);
  await fillStaffCredentials(page);
  await submitLogin(page);
  await page.waitForURL(/\/(dashboard|change-password)/, { timeout: 120_000 });
}

export async function loginAsSuperAdmin(page: Page): Promise<void> {
  await page.goto('/superadmin/login');
  await page.getByLabel(/email/i).fill(process.env.E2E_SUPERADMIN_EMAIL!);
  await page.getByLabel(/password/i).fill(process.env.E2E_SUPERADMIN_PASSWORD!);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
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

export async function expectProtectedRedirect(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page).toHaveURL(/\/login/);
}

export function apiPathPattern(segment: string): RegExp {
  return new RegExp(`${segment.replace(/\//g, '\\/')}`);
}
