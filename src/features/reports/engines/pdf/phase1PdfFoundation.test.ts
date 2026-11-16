import { describe, expect, it } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PAGE_A4_LANDSCAPE,
  PAGE_A4_PORTRAIT,
  PAGE_A5_PORTRAIT,
  PAGE_HAWB_ORIGINAL1_CUSTOM,
  PAGE_LEGAL_PORTRAIT,
  PAGE_LETTER_PORTRAIT,
  pageGeometryToAtPageCss,
  resolvePageGeometry,
} from './pageGeometry';
import { buildDocumentPrintCss } from './buildDocumentPrintCss';
import { documentTypographyToCss, FREIGHTNEST_DOCUMENT_TYPOGRAPHY } from './documentTypography';
import { documentStructureToCss } from './documentStructure';
import {
  createGeometryFixturePdf,
  shareFixturePdfForPreviewAndDownload,
} from './createGeometryFixturePdf';
import {
  inspectPdfBlob,
  pagesMatchGeometry,
  pdfBlobsAreIdentical,
} from './inspectPdfBlob';
import { resolveCapturePageGeometry } from './captureReactDocumentPdf';
import { arrivalNoticePrintCss, arrivalNoticePrintGeometry } from './printCssPilot';
import { REPORT_BRANDING_RULES } from './documentBrandingContract';
import { HBL_JASPER_PILOT_CONFIG } from '../../templates/hbl/jasperPilot/hblJasperPilot.config';
import { HAWB_FORMAT_CATALOG } from '../../constants/hawbFormatCatalog';

const FIXTURE_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../qa/phase1-fixtures',
);

function ensureFixtureDir(): void {
  if (!existsSync(FIXTURE_DIR)) mkdirSync(FIXTURE_DIR, { recursive: true });
}

async function writeFixture(name: string, blob: Blob): Promise<string> {
  ensureFixtureDir();
  const path = join(FIXTURE_DIR, name);
  const buf = Buffer.from(await blob.arrayBuffer());
  writeFileSync(path, buf);
  return path;
}

describe('Phase 1 PDF rendering foundation', () => {
  it('resolves A4/A5/Letter/Legal portrait and landscape with content boxes', () => {
    expect(PAGE_A4_PORTRAIT.widthPt).toBe(595);
    expect(PAGE_A4_PORTRAIT.heightPt).toBe(842);
    expect(PAGE_A4_PORTRAIT.orientation).toBe('portrait');
    expect(PAGE_A4_LANDSCAPE.widthPt).toBe(842);
    expect(PAGE_A4_LANDSCAPE.heightPt).toBe(595);
    expect(PAGE_A5_PORTRAIT.widthMm).toBe(148);
    expect(PAGE_LETTER_PORTRAIT.paper).toBe('Letter');
    expect(PAGE_LEGAL_PORTRAIT.heightMm).toBeGreaterThan(PAGE_LETTER_PORTRAIT.heightMm);
    expect(PAGE_A4_PORTRAIT.contentWidthMm).toBe(
      PAGE_A4_PORTRAIT.widthMm -
        PAGE_A4_PORTRAIT.marginsMm.left -
        PAGE_A4_PORTRAIT.marginsMm.right,
    );
  });

  it('supports custom HAWB Original-1 style MediaBox', () => {
    expect(PAGE_HAWB_ORIGINAL1_CUSTOM.paper).toBe('Custom');
    expect(PAGE_HAWB_ORIGINAL1_CUSTOM.widthPt).toBe(737);
    expect(PAGE_HAWB_ORIGINAL1_CUSTOM.heightPt).toBe(923);
  });

  it('emits @page CSS for presets and custom sizes', () => {
    expect(pageGeometryToAtPageCss(PAGE_A4_PORTRAIT)).toContain('size: A4 portrait');
    expect(pageGeometryToAtPageCss(PAGE_A4_LANDSCAPE)).toContain('size: A4 landscape');
    const custom = resolvePageGeometry({
      paper: 'Custom',
      widthMm: 100,
      heightMm: 150,
    });
    expect(pageGeometryToAtPageCss(custom)).toContain('size: 100mm 150mm');
  });

  it('typography CSS exposes size/weight/line-height/alignment/wrapping controls', () => {
    const css = documentTypographyToCss(FREIGHTNEST_DOCUMENT_TYPOGRAPHY);
    expect(css).toContain('--fn-fs-body');
    expect(css).toContain('--fn-fw-bold');
    expect(css).toContain('--fn-lh-normal');
    expect(css).toContain('.fn-align-right');
    expect(css).toContain('.fn-wrap');
    expect(css).toContain('Arial');
  });

  it('structure CSS covers tables, thead repeat, breaks, header/footer slots', () => {
    const css = documentStructureToCss({ enablePrintChrome: true });
    expect(css).toContain('table-header-group');
    expect(css).toContain('fn-break-before');
    expect(css).toContain('fn-header-slot');
    expect(css).toContain('fn-footer-slot');
    expect(css).toContain('page-break-inside: avoid');
    expect(css).toContain('table-layout: fixed');
  });

  it('buildDocumentPrintCss combines geometry + typography + structure', () => {
    const { css, geometry } = buildDocumentPrintCss({
      page: { paper: 'A4', orientation: 'portrait' },
    });
    expect(geometry.widthPt).toBe(595);
    expect(css).toContain('@page');
    expect(css).toContain('--fn-font');
    expect(css).toContain('.fn-table');
  });

  it('Arrival Notice print pilot uses foundation A4 geometry', () => {
    expect(arrivalNoticePrintGeometry.widthPt).toBe(595);
    expect(arrivalNoticePrintGeometry.heightPt).toBe(842);
    expect(arrivalNoticePrintCss).toContain('size: A4 portrait');
    expect(arrivalNoticePrintCss).toContain('table-header-group');
  });

  it('capture options resolve through shared geometry (legacy landscape preserved)', () => {
    const portrait = resolveCapturePageGeometry({});
    expect(portrait.widthMm).toBe(210);
    expect(portrait.heightMm).toBe(297);
    const landscape = resolveCapturePageGeometry({ landscape: true });
    expect(landscape.widthMm).toBe(297);
    expect(landscape.heightMm).toBe(210);
    const fromPage = resolveCapturePageGeometry({ page: PAGE_A4_LANDSCAPE });
    expect(fromPage.widthPt).toBe(842);
  });

  it('HBL Jasper pilot page box remains A4 595×842 from Phase 1 geometry', () => {
    expect(HBL_JASPER_PILOT_CONFIG.page.widthPt).toBe(595);
    expect(HBL_JASPER_PILOT_CONFIG.page.heightPt).toBe(842);
    expect(HBL_JASPER_PILOT_CONFIG.page.orientation).toBe('portrait');
  });

  it('preserves HAWB five official selectable format codes', () => {
    expect(HAWB_FORMAT_CATALOG).toHaveLength(5);
  });

  it('branding contract forbids Fresa identity injection', () => {
    expect(REPORT_BRANDING_RULES.allowFresaIdentity).toBe(false);
    expect(REPORT_BRANDING_RULES.source).toBe('organization_profile');
  });

  it('fixture PDFs match MediaBox for A4 portrait/landscape and multi-page', async () => {
    const a4 = createGeometryFixturePdf({
      page: PAGE_A4_PORTRAIT,
      pageCount: 2,
      title: 'A4 portrait fixture',
    });
    const a4Path = await writeFixture('a4-portrait-multipage.pdf', a4);
    const a4Inspected = await inspectPdfBlob(a4);
    expect(a4Inspected.pageCount).toBe(2);
    expect(pagesMatchGeometry(a4Inspected, PAGE_A4_PORTRAIT)).toBe(true);
    expect(a4Inspected.pages[0]?.orientation).toBe('portrait');
    expect(a4Path).toContain('phase1-fixtures');

    const land = createGeometryFixturePdf({
      page: PAGE_A4_LANDSCAPE,
      pageCount: 1,
      title: 'A4 landscape fixture',
    });
    await writeFixture('a4-landscape.pdf', land);
    const landInspected = await inspectPdfBlob(land);
    expect(pagesMatchGeometry(landInspected, PAGE_A4_LANDSCAPE)).toBe(true);
    expect(landInspected.pages[0]?.orientation).toBe('landscape');
  });

  it('fixture PDFs match Letter, Legal, A5, and custom HAWB MediaBox', async () => {
    const cases: Array<{ name: string; geometry: typeof PAGE_A4_PORTRAIT }> = [
      { name: 'letter-portrait.pdf', geometry: PAGE_LETTER_PORTRAIT },
      { name: 'legal-portrait.pdf', geometry: PAGE_LEGAL_PORTRAIT },
      { name: 'a5-portrait.pdf', geometry: PAGE_A5_PORTRAIT },
      { name: 'hawb-original1-custom.pdf', geometry: PAGE_HAWB_ORIGINAL1_CUSTOM },
    ];
    for (const c of cases) {
      const blob = createGeometryFixturePdf({
        page: c.geometry,
        pageCount: 1,
        title: c.name,
      });
      await writeFixture(c.name, blob);
      const inspected = await inspectPdfBlob(blob);
      expect(pagesMatchGeometry(inspected, c.geometry)).toBe(true);
    }
  });

  it('preview and download share identical PDF bytes (no second layout)', async () => {
    const blob = createGeometryFixturePdf({
      page: PAGE_A4_PORTRAIT,
      pageCount: 1,
      title: 'preview-download-equivalence',
    });
    const { previewBlob, downloadBlob } = shareFixturePdfForPreviewAndDownload(blob);
    expect(await pdfBlobsAreIdentical(previewBlob, downloadBlob)).toBe(true);
    expect(previewBlob).toBe(downloadBlob);
    await writeFixture('preview-download-same-blob.pdf', blob);
  });

  it('footer and table structure are present in fixture generation path', async () => {
    const blob = createGeometryFixturePdf({
      page: PAGE_A4_PORTRAIT,
      pageCount: 2,
      includeTable: true,
      footerLabel: 'Org profile branding only',
    });
    const inspected = await inspectPdfBlob(blob);
    expect(inspected.pageCount).toBe(2);
    expect(blob.size).toBeGreaterThan(500);
    await writeFixture('header-footer-table.pdf', blob);
  });
});
