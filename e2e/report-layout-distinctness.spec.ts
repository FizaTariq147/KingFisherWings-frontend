/**
 * Phase 5 — Playwright regression: catalogue layout mounts must stay visually distinct
 * for official Fresa Invoice 1–3, HAWB draft, and HBL Jasper (smoke batch).
 *
 * Full pixel diffs vs reference PDFs are produced by scripts/compare-report-pdf-batch.mjs
 * (requires prior discovery downloads).
 */
import { test, expect } from '@playwright/test';

test.describe('Report layout distinctness (smoke)', () => {
  test.skip(true, 'Enable after catalogue route harness is wired for headless layout mount');

  test('placeholder — use node validate-layout-distinctness.mjs in CI', async () => {
    expect(true).toBe(true);
  });
});
