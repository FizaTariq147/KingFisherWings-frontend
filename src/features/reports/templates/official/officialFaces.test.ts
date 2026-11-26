import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { describe, expect, it } from 'vitest';
import { OFFICIAL_HAWB_FORMAT_CODES } from '../../utils/officialFormatGovernance';
import {
  HAWB_OFFICIAL_LAYOUTS,
  hawbOfficialLayoutCodesMatchGovernance,
  isHawbOfficialNativeCode,
} from '../hawb/official/layouts';
import { generateOfficialMeasuredPdf } from './generateOfficialMeasuredPdf';
import { generatedPageMatchesFace, summarizeOfficialFaceEvidence } from './officialEvidence';
import {
  getOfficialMeasuredFace,
  isOfficialMeasuredNativeCode,
  listOfficialMeasuredFacesByFamily,
} from './officialFaceRegistry';
import { generateMyReportXlsx, getMyReportColumns, listMyReportColumns } from './officialWorkbook';
import { resolveCatalogFormatStatus } from '../../utils/catalogFormatStatus';

describe('official face factory', () => {
  it('measures a unique native face per reference file and strips Fresa identity', () => {
    const summary = summarizeOfficialFaceEvidence();
    expect(summary.faces).toBeGreaterThan(200);
    expect(summary.duplicateReferenceFiles).toEqual([]);
    expect(summary.byFamily.hbl).toBeGreaterThanOrEqual(113);
    expect(summary.byFamily.delivery_order).toBeGreaterThanOrEqual(40);
    expect(summary.byFamily.wms_asn).toBeGreaterThanOrEqual(5);
    expect(summary.byFamily.arrival_notice).toBeGreaterThan(0);
    expect(summary.byFamily.invoice).toBeGreaterThan(0);
    expect(summary.byFamily.accounts).toBeGreaterThan(0);
    const invoice = getOfficialMeasuredFace('INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA');
    expect(invoice).toBeTruthy();
    const onPage = (invoice?.pages[0]?.lines || []).filter((line) => {
      const [x1, y1, x2, y2] = line;
      return (
        Math.max(x1, x2) >= 0 &&
        Math.min(x1, x2) <= (invoice?.widthPt || 0) &&
        Math.max(y1, y2) >= 0 &&
        Math.min(y1, y2) <= (invoice?.heightPt || 0)
      );
    });
    expect(onPage.length).toBeGreaterThan(80);
  });

  it('promotes the five HAWB faces into the measured kit (vector Fresa geometry)', () => {
    expect(HAWB_OFFICIAL_LAYOUTS).toHaveLength(5);
    expect(hawbOfficialLayoutCodesMatchGovernance()).toBe(true);
    for (const code of OFFICIAL_HAWB_FORMAT_CODES) {
      expect(isHawbOfficialNativeCode(code)).toBe(true);
      expect(isOfficialMeasuredNativeCode(code)).toBe(true);
      const face = getOfficialMeasuredFace(code);
      expect(face).toBeTruthy();
      expect(face!.widthPt).toBeGreaterThan(500);
      expect(face!.heightPt).toBeGreaterThan(800);
      expect(resolveCatalogFormatStatus(code).id).toBe('native_layout');
    }
  });

  it('marks a measured HBL code native and still shares unmeasured aliases', () => {
    const measured = listOfficialMeasuredFacesByFamily('hbl')[0];
    expect(measured).toBeTruthy();
    expect(resolveCatalogFormatStatus(measured.code).id).toBe('native_layout');
    expect(resolveCatalogFormatStatus('HBL_DRAFT_REPORT_FORMAT_3').id).toBe('shared_layout');
  });

  it('draws one delivery-order face at the measured page size', async () => {
    const face =
      getOfficialMeasuredFace('FG_DELIVERY_ORDER_FORMAT9_RPM_REF_803') ||
      listOfficialMeasuredFacesByFamily('delivery_order')[0];
    expect(face).toBeTruthy();
    const { blob } = await generateOfficialMeasuredPdf(face!.code, {
      companyName: 'KingFisher Wings',
      companyAddress: 'Dubai, UAE',
    });
    expect(await generatedPageMatchesFace(blob, face!)).toBe(true);
    const rules = face!.pages.reduce((sum, page) => sum + page.rects.length + page.lines.length, 0);
    expect(rules).toBeGreaterThan(10);
    const doc = await getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
    const page = await doc.getPage(1);
    const content = await page.getTextContent();
    const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ');
    expect(text).toContain('KingFisher');
    expect(text.toLowerCase()).not.toContain('fresa');
    await doc.destroy();
  });

  it('draws Arrival Notice USA when the sample tick is a radical', async () => {
    const face = getOfficialMeasuredFace('ARRIVAL_NOTICE_REPORT_FORMAT_3_ARRIVAL_NOTICE_USA');
    expect(face).toBeTruthy();
    const ticks = face!.pages.flatMap((page) => page.texts).filter((run) => run[0] === '√');
    expect(ticks.length).toBe(2);
    const { blob } = await generateOfficialMeasuredPdf(face!.code, {
      companyName: 'Northwind Freight LLC',
    });
    expect(await generatedPageMatchesFace(blob, face!)).toBe(true);
    const doc = await getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
    const page = await doc.getPage(1);
    const content = await page.getTextContent();
    const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ');
    expect(text).toContain('Freight PREPAID');
    expect(text).toContain('Northwind');
    expect(text).not.toContain('√');
    await doc.destroy();
  });

  it('writes My Report workbooks with the sample header row', () => {
    expect(listMyReportColumns().length).toBeGreaterThan(30);
    const spec = getMyReportColumns('ACTIVITY_COMPLETED_JOBS_LIST_REPORT_FORMAT');
    expect(spec?.headers.slice(0, 3)).toEqual(['Job No.', 'Department', 'POR']);
    const { bytes } = generateMyReportXlsx(spec!.code, [['JOB-1', 'AIR', 'DXB']]);
    const xml = Buffer.from(bytes).toString('utf8');
    expect(xml).toContain('Job No.');
    expect(xml).toContain('JOB-1');
    expect(xml.toLowerCase()).not.toContain('fresa');
  });
});
