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
import { mapToHawbOfficialModel } from './mapToHawbOfficialModel';
import { hawbOfficialPreviewDownloadSameBlob } from './generateHawbOfficialPdf';
import { createHawbOfficialEvidencePdf } from './createHawbOfficialEvidencePdf';
import { HAWB_FORMAT_CATALOG, getHawbFormatSpec } from '../../../constants/hawbFormatCatalog';
import { isHblJasperPilotCode } from '../../hbl/jasperPilot';
import { REPORT_BRANDING_RULES } from '../../../engines/pdf/documentBrandingContract';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../qa');
const PROD = join(ROOT, 'phase2-2-hawb/production');
const REF = join(ROOT, 'fresa-references/pdfs');
const SBS = join(ROOT, 'phase2-2-hawb/side-by-side');

const PROD_FILES = [
  ['draft', 'draft-production.pdf', 'hawb-draft-report-format.pdf', 595, 845, 1],
  ['draft1', 'draft1-production.pdf', 'hawb-draft-report-format-1.pdf', 595, 842, 9],
  ['draft2', 'draft2-production.pdf', 'hawb-draft-report-format-2.pdf', 595, 845, 1],
  [
    'original1',
    'original1-production.pdf',
    'hawb-original-pre-printed-report-format-1.pdf',
    737,
    923,
    1,
  ],
  [
    'original2',
    'original2-production.pdf',
    'hawb-original-pre-printed-report-format-2.pdf',
    595,
    845,
    1,
  ],
] as const;

describe('Phase 2.3 HAWB acceptance gates', () => {
  it('keeps exactly five independent official layouts', () => {
    expect(HAWB_FORMAT_CATALOG).toHaveLength(5);
    expect(HAWB_OFFICIAL_LAYOUTS).toHaveLength(5);
    expect(hawbOfficialLayoutCodesMatchGovernance()).toBe(true);
    const faces = new Set(HAWB_OFFICIAL_LAYOUTS.map((l) => l.variant));
    expect(faces.size).toBe(5);
  });

  it('preserves historical HAWB resolution and HBL Jasper', () => {
    expect(getHawbFormatSpec('HAWB_DRAFT_REPORT_FORMAT_15')?.code).toBe(
      'HAWB_DRAFT_REPORT_FORMAT_15',
    );
    expect(getHawbOfficialLayout('HAWB_DRAFT_REPORT_FORMAT_15')).toBeUndefined();
    expect(isHblJasperPilotCode('HBL_DRAFT_REPORT_FORMAT_JASPER')).toBe(true);
  });

  it('does not fabricate optional fields or Fresa branding', () => {
    expect(REPORT_BRANDING_RULES.allowFresaIdentity).toBe(false);
    const empty = mapToHawbOfficialModel('HAWB_DRAFT_REPORT_FORMAT', {
      entityBound: true,
      companyName: 'Org Co',
    });
    expect(empty.hawbNo).toBe('');
    expect(empty.pieces).toBe('');
    expect(empty.natureOfGoods).toBe('');
    expect(empty.declaredCarriage).toBe('');
    expect(empty.companyName).toBe('Org Co');
  });

  it('preserves long text without overflow fillers', () => {
    const long = `${'LONG MARKS AND DESCRIPTION '.repeat(12)}END`;
    const model = mapToHawbOfficialModel('HAWB_DRAFT_REPORT_FORMAT_2', {
      entityBound: true,
      commodity: long,
    });
    expect(model.natureOfGoods).toBe(long);
    expect(model.natureOfGoods.includes('AS ARRANGED')).toBe(false);
  });

  it('preview/download share identical blob bytes', async () => {
    const { blob } = createHawbOfficialEvidencePdf('HAWB_DRAFT_REPORT_FORMAT', {
      entityBound: true,
      companyName: 'Org',
    });
    const { identical, previewBlob, downloadBlob } =
      await hawbOfficialPreviewDownloadSameBlob(blob);
    expect(identical).toBe(true);
    expect(previewBlob).toBe(downloadBlob);
  });

  it.each(PROD_FILES)(
    '%s production PDF exists with reference MediaBox and page count',
    async (variant, prodName, refName, w, h, pages) => {
      const prodPath = join(PROD, prodName);
      const refPath = join(REF, refName);
      expect(existsSync(prodPath), prodPath).toBe(true);
      expect(existsSync(refPath), refPath).toBe(true);
      const prod = await PDFDocument.load(readFileSync(prodPath));
      const ref = await PDFDocument.load(readFileSync(refPath));
      expect(prod.getPageCount()).toBe(pages);
      expect(ref.getPageCount()).toBe(pages);
      const ps = prod.getPage(0).getSize();
      const rs = ref.getPage(0).getSize();
      expect(Math.round(ps.width)).toBe(w);
      expect(Math.round(ps.height)).toBe(h);
      expect(Math.round(rs.width)).toBe(w);
      expect(Math.round(rs.height)).toBe(h);
      expect(existsSync(join(SBS, `${variant}-p1-sbs.png`))).toBe(true);
    },
  );

  it('Draft-1 layout contracts nine intentional copy faces', () => {
    const layout = getHawbOfficialLayout('HAWB_DRAFT_REPORT_FORMAT_1')!;
    expect(layout.copyBanners).toHaveLength(9);
    expect(layout.showNotify).toBe(true);
    expect(layout.referencePageCount).toBe(9);
    expect(layout.copyBanners.every((b) => /^COPY FACE \d\/9$/.test(b))).toBe(true);
  });

  it('Original layouts require sparse overlay / preprinted behavior', () => {
    expect(getHawbOfficialLayout('HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1')!.sparseOverlay).toBe(
      true,
    );
    expect(getHawbOfficialLayout('HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2')!.sparseOverlay).toBe(
      true,
    );
    expect(getHawbOfficialLayout('HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1')!.page.widthPt).toBe(
      737,
    );
  });
});
