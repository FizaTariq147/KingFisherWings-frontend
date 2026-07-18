import fs from 'node:fs';
import { test as setup } from '@playwright/test';
import {
  ensureAuthDir,
  erpSessionStorageFile,
  hasErpCredentials,
  hasSuperAdminCredentials,
  loginAsErpUser,
  loginAsSuperAdmin,
  saveSessionStorage,
  superAdminAuthFile,
  superAdminSessionStorageFile,
  tenantAdminAuthFile,
} from './helpers';

const emptyStorage = JSON.stringify({ cookies: [], origins: [] });
const emptySession = JSON.stringify({});

setup('erp session auth', async ({ page }) => {
  ensureAuthDir();
  if (!hasErpCredentials()) {
    fs.writeFileSync(tenantAdminAuthFile, emptyStorage);
    fs.writeFileSync(erpSessionStorageFile, emptySession);
    setup.skip(
      true,
      'Set E2E_TENANT_SLUG + E2E_STAFF_EMAIL + E2E_STAFF_PASSWORD (or E2E_TENANT_PASSWORD)',
    );
    return;
  }

  const accessToken = await loginAsErpUser(page);
  await saveSessionStorage(page, erpSessionStorageFile, { accessToken });
  await page.context().storageState({ path: tenantAdminAuthFile });
});

setup('super admin auth', async ({ page }) => {
  ensureAuthDir();
  if (!hasSuperAdminCredentials()) {
    fs.writeFileSync(superAdminAuthFile, emptyStorage);
    fs.writeFileSync(superAdminSessionStorageFile, emptySession);
    setup.skip(true, 'Set E2E_SUPERADMIN_EMAIL and E2E_SUPERADMIN_PASSWORD');
    return;
  }

  await loginAsSuperAdmin(page);
  await saveSessionStorage(page, superAdminSessionStorageFile);
  await page.context().storageState({ path: superAdminAuthFile });
});
