import fs from 'node:fs';
import { test as setup } from '@playwright/test';
import {
  ensureAuthDir,
  hasSuperAdminCredentials,
  hasTenantAdminCredentials,
  loginAsSuperAdmin,
  loginAsTenantAdmin,
  superAdminAuthFile,
  tenantAdminAuthFile,
} from './helpers';

const emptyStorage = JSON.stringify({ cookies: [], origins: [] });

setup('tenant admin auth', async ({ page }) => {
  ensureAuthDir();
  if (!hasTenantAdminCredentials()) {
    fs.writeFileSync(tenantAdminAuthFile, emptyStorage);
    setup.skip(true, 'Set E2E_TENANT_SLUG and E2E_TENANT_PASSWORD');
    return;
  }
  await loginAsTenantAdmin(page);
  await page.context().storageState({ path: tenantAdminAuthFile });
});

setup('super admin auth', async ({ page }) => {
  ensureAuthDir();
  if (!hasSuperAdminCredentials()) {
    fs.writeFileSync(superAdminAuthFile, emptyStorage);
    setup.skip(true, 'Set E2E_SUPERADMIN_EMAIL and E2E_SUPERADMIN_PASSWORD');
    return;
  }
  await loginAsSuperAdmin(page);
  await page.context().storageState({ path: superAdminAuthFile });
});
