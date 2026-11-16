import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';
import {
  HAWB_OFFICIAL_LAYOUTS,
  hawbOfficialLayoutCodesMatchGovernance,
  getHawbOfficialLayout,
} from './layouts';
import { hawbOfficialPreviewDownloadSameBlob } from './generateHawbOfficialPdf';
import { createHawbOfficialEvidencePdf } from './createHawbOfficialEvidencePdf';
import { HAWB_FORMAT_CATALOG } from '../../../constants/hawbFormatCatalog';
import { isHblJasperPilotCode } from '../../hbl/jasperPilot';
import { REPORT_BRANDING_RULES } from '../../../engines/pdf/documentBrandingContract';
import { HAWB_ORIGINAL1_OVERLAY_SLOTS } from './overlays/hawbOriginal1.fields';
import { HAWB_ORIGINAL2_OVERLAY_SLOTS } from './overlays/hawbOriginal2.fields';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../qa');
const P24 = join(ROOT, 'phase2-4-hawb');
const P22 = join(ROOT, 'phase2-2-hawb/production');

const PROD_FILES = [
  ['draft', 'draft-production.pdf', 595, 845, 1],
  ['draft1', 'draft1-production.pdf', 595, 842, 9],
  ['draft2', 'draft2-production.pdf', 595, 845, 1],
  ['original1', 'original1-production.pdf', 737, 923, 1],
  ['original2', 'original2-production.pdf', 595, 845, 1],
] as const;

describe('Phase 2.4 HAWB acceptance closure gates', () => {
  it('keeps five independent official layouts and governance', () => {
    expect(HAWB_FORMAT_CATALOG).toHaveLength(5);
    expect(HAWB_OFFICIAL_LAYOUTS).toHaveLength(5);
    expect(hawbOfficialLayoutCodesMatchGovernance()).toBe(true);
    expect(REPORT_BRANDING_RULES.allowFresaIdentity).toBe(false);
    expect(isHblJasperPilotCode('HBL_DRAFT_REPORT_FORMAT_JASPER')).toBe(true);
  });

  it('preview/download share identical blob bytes', async () => {
    const { blob } = createHawbOfficialEvidencePdf('HAWB_DRAFT_REPORT_FORMAT', {
      entityBound: true,
      companyName: 'Org',
    });
    const { identical } = await hawbOfficialPreviewDownloadSameBlob(blob);
    expect(identical).toBe(true);
  });

  it.each(PROD_FILES)(
    '%s production PDF MediaBox and page count',
    async (variant, fileName, w, h, pages) => {
      const p24 = join(P24, 'production', fileName);
      const p22 = join(P22, fileName);
      const prodPath = existsSync(p24) ? p24 : p22;
      expect(existsSync(prodPath), prodPath).toBe(true);
      const prod = await PDFDocument.load(readFileSync(prodPath));
      expect(prod.getPageCount()).toBe(pages);
      const ps = prod.getPage(0).getSize();
      expect(Math.round(ps.width)).toBe(w);
      expect(Math.round(ps.height)).toBe(h);
    },
  );

  it('Draft-1 nine intentional copy faces', () => {
    const layout = getHawbOfficialLayout('HAWB_DRAFT_REPORT_FORMAT_1')!;
    expect(layout.copyBanners).toHaveLength(9);
    expect(layout.showNotify).toBe(true);
    expect(layout.copyBanners.every((b) => /^COPY FACE \d\/9$/.test(b))).toBe(true);
  });

  it('Original overlays are sparse with execution Y near Fresa coords', () => {
    expect(getHawbOfficialLayout('HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1')!.sparseOverlay).toBe(
      true,
    );
    expect(getHawbOfficialLayout('HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2')!.sparseOverlay).toBe(
      true,
    );
    const o1Exec = HAWB_ORIGINAL1_OVERLAY_SLOTS.find((s) => s.id === 'executedOn')!;
    const o2Exec = HAWB_ORIGINAL2_OVERLAY_SLOTS.find((s) => s.id === 'executedOn')!;
    expect(o1Exec.topPct).toBeGreaterThan(80);
    expect(o2Exec.topPct).toBeGreaterThan(85);
  });

  it('Phase 2.4 acceptance manifest exists with original modes when generated', () => {
    const man = join(P24, 'acceptance-manifest.json');
    if (!existsSync(man)) {
      expect(existsSync(join(P22, 'draft-production.pdf'))).toBe(true);
      return;
    }
    const m = JSON.parse(readFileSync(man, 'utf8'));
    expect(m.formats).toHaveLength(5);
    expect(m.draft1CopyInvestigation?.pageCountMatch).toBe(true);
    expect(Array.isArray(m.originalModes)).toBe(true);
    if (m.originalModes.length) {
      expect(m.originalModes.some((x: { mode: string }) => x.mode === 'physical-sparse')).toBe(
        true,
      );
      expect(m.originalModes.some((x: { mode: string }) => x.mode === 'digital-underlay')).toBe(
        true,
      );
    }
  });
});
