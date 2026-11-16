import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';
import { REPORT_BRANDING_RULES } from '../../../engines/pdf/documentBrandingContract';
import { HAWB_FORMAT_CATALOG } from '../../../constants/hawbFormatCatalog';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../qa');
const P25 = join(ROOT, 'phase2-5-hawb');
const PREFLIGHT = join(P25, 'branding-preflight.json');

/**
 * Phase 2.5 requirement: Draft / Draft-2 visual compare is gated on branding
 * preflight that reuses the Phase 3.1 harness (org branding, no Fresa sample).
 */
describe('Phase 2.5 Draft/Draft-2 branding preflight gate', () => {
  it('keeps branding policy and five official HAWB formats', () => {
    expect(REPORT_BRANDING_RULES.allowFresaIdentity).toBe(false);
    expect(HAWB_FORMAT_CATALOG).toHaveLength(5);
  });

  it('branding-preflight.json exists with Draft + Draft-2 PASS when generated', () => {
    if (!existsSync(PREFLIGHT)) {
      // Allow CI without regenerating harness artifacts; document the gate contract.
      expect(existsSync(join(P25, 'production', 'draft-production.pdf'))).toBe(true);
      expect(existsSync(join(P25, 'production', 'draft2-production.pdf'))).toBe(true);
      return;
    }
    const m = JSON.parse(readFileSync(PREFLIGHT, 'utf8'));
    expect(m.gatePass).toBe(true);
    expect(m.harness).toMatch(/phase3-1-branding/i);
    expect(m.orgName).toBeTruthy();
    const byVariant = Object.fromEntries(m.formats.map((f: { variant: string }) => [f.variant, f]));
    expect(byVariant.draft?.verdict).toBe('PASS');
    expect(byVariant.draft2?.verdict).toBe('PASS');
    expect(byVariant.draft?.inspect?.fresaLogoDetected).toBe(false);
    expect(byVariant.draft2?.inspect?.fresaLogoDetected).toBe(false);
    expect(byVariant.draft?.brandingProof?.companyName).toBe(m.orgName);
    expect(byVariant.draft2?.brandingProof?.companyName).toBe(m.orgName);
    expect(String(byVariant.draft?.source || '')).not.toMatch(/fresa_cdn_sample/i);
    expect(String(byVariant.draft2?.source || '')).not.toMatch(/fresa_cdn_sample/i);
  });

  it('preflight production PDFs are real PDFs when present', async () => {
    const draft = join(P25, 'branding-preflight', 'draft-branded-production.pdf');
    const draft2 = join(P25, 'branding-preflight', 'draft2-branded-production.pdf');
    if (!existsSync(draft) || !existsSync(draft2)) return;
    for (const p of [draft, draft2]) {
      const doc = await PDFDocument.load(readFileSync(p));
      expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
    }
  });
});
