import { test as base, type BrowserContext } from '@playwright/test';
import fs from 'node:fs';
import { erpSessionStorageFile, superAdminSessionStorageFile } from './helpers';

type ErpFixtures = {
  /** Injects ERP sessionStorage (zustand auth) before each page loads. */
  erpSession: void;
};

type SuperAdminFixtures = {
  /** Injects Super Admin sessionStorage when present. */
  superAdminSession: void;
};

async function injectSessionStorage(
  context: BrowserContext,
  filePath: string,
): Promise<void> {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const entries = JSON.parse(raw) as Record<string, string>;
  await context.addInitScript((storage) => {
    for (const [key, value] of Object.entries(storage)) {
      window.sessionStorage.setItem(key, value);
    }
  }, entries);
}

/**
 * Authenticated ERP specs must import `test` from here so sessionStorage
 * (KingFisher Tech-auth) is restored — Playwright storageState only covers
 * cookies + localStorage.
 */
export const test = base.extend<ErpFixtures>({
  erpSession: [
    async ({ context }, use) => {
      await injectSessionStorage(context, erpSessionStorageFile);
      await use();
    },
    { auto: true },
  ],
});

export const superAdminTest = base.extend<SuperAdminFixtures>({
  superAdminSession: [
    async ({ context }, use) => {
      await injectSessionStorage(context, superAdminSessionStorageFile);
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
