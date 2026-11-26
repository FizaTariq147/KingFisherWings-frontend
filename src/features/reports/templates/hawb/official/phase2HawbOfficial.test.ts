import { describe, expect, it } from 'vitest';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';
import {
  HAWB_OFFICIAL_LAYOUTS,
  hawbOfficialLayoutCodesMatchGovernance,
  getHawbOfficialLayout,
} from './layouts';
import { createHawbOfficialEvidencePdf } from './createHawbOfficialEvidencePdf';
import { mapToHawbOfficialModel } from './mapToHawbOfficialModel';
import { hawbOfficialPreviewDownloadSameBlob } from './generateHawbOfficialPdf';
import { inspectPdfBlob, pagesMatchGeometry } from '../../../engines/pdf/inspectPdfBlob';
import { HAWB_FORMAT_CATALOG } from '../../../constants/hawbFormatCatalog';
import { OFFICIAL_HAWB_FORMAT_CODES } from '../../../utils/officialFormatGovernance';
import { getHawbFormatSpec } from '../../../constants/hawbFormatCatalog';
import { REPORT_BRANDING_RULES } from '../../../engines/pdf/documentBrandingContract';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../qa');
const FIXTURE_DIR = join(ROOT, 'phase2-hawb-fixtures');
const REF_DIR = join(ROOT, 'fresa-references/pdfs');

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function writeBlob(path: string, blob: Blob): Promise<void> {
  ensureDir(dirname(path));
  writeFileSync(path, Buffer.from(await blob.arrayBuffer()));
}

async function inspectRef(file: string) {
  const bytes = readFileSync(join(REF_DIR, file));
  const doc = await PDFDocument.load(bytes);
  const page = doc.getPage(0);
  const { width, height } = page.getSize();
  return { pageCount: doc.getPageCount(), widthPt: width, heightPt: height };
}

const boundFixture = {
  entityBound: true,
  companyName: 'KingFisher Wings Logistics',
  companyAddress: 'Dubai, UAE',
  companyPhone: '+971-4-000-0000',
  logoUrl: '',
  shipperLines: ['ACME EXPORTERS', 'CHENNAI, INDIA'],
  consigneeLines: ['BETA IMPORTS LLC', 'SHARJAH, UAE'],
  notifyLines: ['NOTIFY PARTNER', 'DUBAI'],
  pol: 'CHENNAI (MAA)',
  pod: 'DUBAI INTERNATIONAL AIRPORT (DXB)',
  vesselFlight: 'EK9876 / 20-FEB-26',
  referenceNo: 'MAA/DXB/260014',
  jobNumber: 'JOB-260014',
  commodity: 'STC: PAPER CUPS',
  currencyCode: 'INR',
  invoiceDate: '18-FEB-26',
  tableRows: [['100', '1250.00', 'K', 'Q', '1250.00', '', '', 'STC: PAPER CUPS']],
};

describe('Phase 2 official HAWB layouts', () => {
  it('exposes exactly five layouts matching governance + catalogue', () => {
    expect(HAWB_OFFICIAL_LAYOUTS).toHaveLength(5);
    expect(hawbOfficialLayoutCodesMatchGovernance()).toBe(true);
    expect(HAWB_FORMAT_CATALOG).toHaveLength(5);
    expect(OFFICIAL_HAWB_FORMAT_CODES).toHaveLength(5);
    const variants = new Set(HAWB_OFFICIAL_LAYOUTS.map((l) => l.variant));
    expect(variants.size).toBe(5);
  });

  it('keeps five layouts structurally distinct (not one shell)', () => {
    const signatures = HAWB_OFFICIAL_LAYOUTS.map((l) =>
      [
        l.variant,
        l.titleMode,
        l.showNotify,
        l.preprinted,
        l.sparseOverlay,
        l.showJobNoInHeader,
        l.showAccountNumberLabels,
        l.showIataAgentCells,
        Math.round(l.page.widthPt),
        Math.round(l.page.heightPt),
        l.copyBanners.length,
      ].join('|'),
    );
    expect(new Set(signatures).size).toBe(5);
  });

  it('does not fabricate shipment values when entity-bound / missing optional fields', () => {
    const model = mapToHawbOfficialModel('HAWB_DRAFT_REPORT_FORMAT', {
      entityBound: true,
      companyName: 'Org Only',
    });
    expect(model.hawbNo).toBe('');
    expect(model.mawbNo).toBe('');
    expect(model.pieces).toBe('');
    expect(model.natureOfGoods).toBe('');
    expect(model.shipperLines).toEqual([]);
    expect(model.declaredCarriage).toBe('');
    expect(model.companyName).toBe('Org Only');
  });

  it('fills catalogue preview fixture when unbound (never Fresa identity)', async () => {
    const { mergeHawbCatalogPreviewFixture } = await import('./hawbOfficialCatalogFixture');
    const merged = mergeHawbCatalogPreviewFixture({
      companyName: 'KingFisher Wings Logistics',
      logoUrl: '',
    });
    expect(merged.entityBound).toBeFalsy();
    expect(merged.shipperLines?.[0]).toBeTruthy();
    expect(merged.hawbNo).toBeTruthy();
    expect(merged.pieces).toBe('100');
    const blob = JSON.stringify(merged).toLowerCase();
    expect(blob).not.toMatch(/fresa/);
    expect(blob).not.toMatch(/babu sector/);
    expect(blob).not.toMatch(/al naser/);
    const model = mapToHawbOfficialModel('HAWB_DRAFT_REPORT_FORMAT_2', merged);
    expect(model.shipperLines[0]).toContain('GLOBAL EXPORT');
    expect(model.companyName).toBe('KingFisher Wings Logistics');
    expect(model.hawbNo).toBe('MAA/DXB/1900014');
  });

  it('does not use bill-to as shipper', () => {
    const model = mapToHawbOfficialModel('HAWB_DRAFT_REPORT_FORMAT', {
      entityBound: true,
      billToName: 'BILL TO ONLY',
      companyName: 'Org',
    });
    expect(model.shipperLines).toEqual([]);
  });

  it('maps live shipment fields without inventing MAWB/carrier defaults', () => {
    const model = mapToHawbOfficialModel('HAWB_DRAFT_REPORT_FORMAT_1', boundFixture);
    expect(model.hawbNo).toBe('MAA/DXB/260014');
    expect(model.jobNo).toBe('JOB-260014');
    expect(model.notifyLines[0]).toBe('NOTIFY PARTNER');
    expect(model.toCode).toBe('DXB');
    expect(model.mawbNo).toBe('');
    expect(model.carrier).toBe('');
    // Job stays on jobNo — Accounting no longer duplicates JOB NO. (overlap fix).
    expect(model.jobNo).toBe('JOB-260014');
    expect(model.accounting).toBe('');
    expect(model.agentLines[0]).toBe('KingFisher Wings Logistics');
  });

  it('maps bare job port codes into departure / To / destination', () => {
    const model = mapToHawbOfficialModel('HAWB_DRAFT_REPORT_FORMAT', {
      entityBound: true,
      companyName: 'Zoyan Logistics',
      companyAddress: 'Dubai',
      shipperLines: ['Usman Ahmed', 'Faisalabad'],
      consigneeLines: ['Usman Ahmed', 'Faisalabad'],
      pol: 'AEAUH',
      pod: 'AUABP',
      pieces: '10',
      grossWeight: '100',
      commodity: 'General merchandise',
      hawbNo: '176-MAA23456882',
      jobNumber: 'JOB-1',
      invoiceDate: '06-NOV-2026',
    });
    expect(model.departure).toBe('AEAUH');
    expect(model.destination).toBe('AUABP');
    expect(model.toCode).toBe('AUABP');
    expect(model.agentLines[0]).toBe('Zoyan Logistics');
    expect(model.jobNo).toBe('JOB-1');
    expect(model.accounting).toBe('');
    expect(model.pieces).toBe('10');
    expect(model.chargeableWeight).toBe('100');
  });

  it('preserves historical HAWB resolution for non-official codes', () => {
    expect(getHawbFormatSpec('HAWB_DRAFT_REPORT_FORMAT_15')?.sampleIsFallback).toBe(true);
    expect(getHawbOfficialLayout('HAWB_DRAFT_REPORT_FORMAT_15')).toBeUndefined();
  });

  it('branding contract remains org-profile only', () => {
    expect(REPORT_BRANDING_RULES.allowFresaIdentity).toBe(false);
  });

  it.each(HAWB_OFFICIAL_LAYOUTS.map((l) => [l.code, l] as const))(
    '%s evidence PDF matches reference MediaBox / orientation / page intent',
    async (code, layout) => {
      const { blob } = createHawbOfficialEvidencePdf(code, boundFixture);
      const outPath = join(FIXTURE_DIR, `${layout.variant}-evidence.pdf`);
      await writeBlob(outPath, blob);

      const inspected = await inspectPdfBlob(blob);
      expect(pagesMatchGeometry(inspected, layout.page, 2)).toBe(true);
      expect(inspected.pages[0]?.orientation).toBe('portrait');

      if (layout.copyBanners.length > 0) {
        expect(inspected.pageCount).toBe(layout.copyBanners.length);
        expect(inspected.pageCount).toBe(layout.referencePageCount);
      } else {
        expect(inspected.pageCount).toBe(1);
      }

      const ref = await inspectRef(layout.referenceFile);
      expect(Math.round(ref.widthPt)).toBe(Math.round(layout.page.widthPt));
      expect(Math.round(ref.heightPt)).toBe(Math.round(layout.page.heightPt));
      expect(ref.pageCount).toBe(layout.referencePageCount);
    },
  );

  it('preview and download share identical evidence blob bytes', async () => {
    const { blob } = createHawbOfficialEvidencePdf('HAWB_DRAFT_REPORT_FORMAT', boundFixture);
    const { identical, previewBlob, downloadBlob } =
      await hawbOfficialPreviewDownloadSameBlob(blob);
    expect(identical).toBe(true);
    expect(previewBlob).toBe(downloadBlob);
  });

  it('long text stays in model without fabricating fillers', () => {
    const long =
      'VERY LONG COMMODITY DESCRIPTION '.repeat(20) +
      'WITH DIMENSIONS 40x30x20 CM AND MARKS ABC-123';
    const model = mapToHawbOfficialModel('HAWB_DRAFT_REPORT_FORMAT_2', {
      ...boundFixture,
      commodity: long,
    });
    expect(model.natureOfGoods).toBe(long);
    expect(model.natureOfGoods.includes('AS ARRANGED')).toBe(false);
  });

  it('writes side-by-side comparison manifest for the report', async () => {
    ensureDir(FIXTURE_DIR);
    const rows = [];
    for (const layout of HAWB_OFFICIAL_LAYOUTS) {
      const { blob } = createHawbOfficialEvidencePdf(layout.code, boundFixture);
      const file = `${layout.variant}-evidence.pdf`;
      await writeBlob(join(FIXTURE_DIR, file), blob);
      const inspected = await inspectPdfBlob(blob);
      const ref = await inspectRef(layout.referenceFile);
      rows.push({
        code: layout.code,
        variant: layout.variant,
        titleMode: layout.titleMode,
        showNotify: layout.showNotify,
        sparseOverlay: layout.sparseOverlay,
        preprinted: layout.preprinted,
        generated: {
          file,
          pageCount: inspected.pageCount,
          widthPt: Math.round(inspected.pages[0]!.widthPt),
          heightPt: Math.round(inspected.pages[0]!.heightPt),
        },
        reference: {
          file: layout.referenceFile,
          pageCount: ref.pageCount,
          widthPt: Math.round(ref.widthPt),
          heightPt: Math.round(ref.heightPt),
        },
        mediaBoxMatch:
          Math.round(inspected.pages[0]!.widthPt) === Math.round(ref.widthPt) &&
          Math.round(inspected.pages[0]!.heightPt) === Math.round(ref.heightPt),
        pageCountMatch: inspected.pageCount === ref.pageCount,
      });
    }
    writeFileSync(
      join(FIXTURE_DIR, 'comparison-manifest.json'),
      JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2),
    );
    expect(rows.every((r) => r.mediaBoxMatch)).toBe(true);
    expect(rows.every((r) => r.pageCountMatch)).toBe(true);
  });
});
