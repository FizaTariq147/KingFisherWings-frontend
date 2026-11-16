import { describe, expect, it } from 'vitest';
import {
  allowsFresaSamplePdf,
  resolveReportPdfWorkflow,
  REPORT_PDF_WORKFLOW,
  FRESA_REFERENCE_SAMPLE_LABEL,
} from '../utils/reportPdfWorkflow';
import { hasFreightnestGeneratePath } from '../utils/generateCatalogLayoutPdf';
import {
  shouldPreferOfficialSamplePdf,
  hasOfficialSamplePdf,
} from '../utils/preferOfficialSamplePdf';
import { resolveReportLogoUrl } from '../constants/reportBranding.constants';
import { REPORT_BRANDING_RULES } from '../engines/pdf/documentBrandingContract';
import { hawbOfficialPreviewDownloadSameBlob } from '../templates/hawb/official/generateHawbOfficialPdf';
import { createHawbOfficialEvidencePdf } from '../templates/hawb/official/createHawbOfficialEvidencePdf';
import { HAWB_FORMAT_CATALOG } from '../constants/hawbFormatCatalog';
import { isHblJasperPilotCode } from '../templates/hbl/jasperPilot';
import { resolveCatalogFormatStatus } from '../utils/catalogFormatStatus';
import {
  applyReportCompanyBrandingToPdfData,
  type ReportCompanyBranding,
} from '../utils/resolveReportCompanyBranding';

const SAMPLE_CODES = [
  'HAWB_DRAFT_REPORT_FORMAT',
  'HAWB_DRAFT_REPORT_FORMAT_1',
  'HAWB_DRAFT_REPORT_FORMAT_2',
  'DELIVERY_ORDER_REPORT_FORMAT_17',
  'ADVANCE_SHIPPING_NOTE',
] as const;

describe('Phase 3 branding separation', () => {
  it('browse may use Fresa samples; generate and entity-bound may not', () => {
    expect(resolveReportPdfWorkflow({ purpose: 'browse' })).toBe(
      REPORT_PDF_WORKFLOW.REFERENCE_BROWSE,
    );
    expect(allowsFresaSamplePdf(REPORT_PDF_WORKFLOW.REFERENCE_BROWSE)).toBe(true);

    expect(resolveReportPdfWorkflow({ purpose: 'generate' })).toBe(
      REPORT_PDF_WORKFLOW.FREIGHTNEST_GENERATE,
    );
    expect(allowsFresaSamplePdf(REPORT_PDF_WORKFLOW.FREIGHTNEST_GENERATE)).toBe(false);

    expect(resolveReportPdfWorkflow({ entityBound: true, purpose: 'browse' })).toBe(
      REPORT_PDF_WORKFLOW.FREIGHTNEST_GENERATE,
    );
    expect(resolveReportPdfWorkflow({})).toBe(REPORT_PDF_WORKFLOW.FREIGHTNEST_GENERATE);
  });

  it('browse mode can display Fresa reference PDFs (preference gate)', () => {
    for (const code of SAMPLE_CODES) {
      expect(hasOfficialSamplePdf(code)).toBe(true);
      expect(
        shouldPreferOfficialSamplePdf({ code, format: 'PDF', purpose: 'browse' }),
      ).toBe(true);
    }
    expect(FRESA_REFERENCE_SAMPLE_LABEL.toLowerCase()).toContain('reference');
    expect(FRESA_REFERENCE_SAMPLE_LABEL.toLowerCase()).toContain('not a freightnest');
  });

  it('generated PDFs never prefer Fresa sample as final source', () => {
    for (const row of HAWB_FORMAT_CATALOG) {
      expect(
        shouldPreferOfficialSamplePdf({
          code: row.code,
          format: 'PDF',
          purpose: 'generate',
        }),
      ).toBe(false);
      expect(hasFreightnestGeneratePath(row.code)).toBe(true);
    }
    for (const code of SAMPLE_CODES) {
      expect(
        shouldPreferOfficialSamplePdf({ code, format: 'PDF', purpose: 'generate' }),
      ).toBe(false);
    }
    expect(
      shouldPreferOfficialSamplePdf({
        code: 'HBL_DRAFT_REPORT_FORMAT_JASPER',
        format: 'PDF',
        purpose: 'generate',
      }),
    ).toBe(false);
  });

  it('generated reports use organization branding fields when present', () => {
    const branding: ReportCompanyBranding = {
      companyName: 'Acme Freight LLC',
      companyAddress: '1 Dock Rd',
      companyWeb: 'https://acme.example',
      companyPhone: '+1-555-0100',
      companyEmail: 'ops@acme.example',
      logoUrl: 'https://cdn.example.com/acme.png',
      profileLoaded: true,
      legalName: 'Acme Freight LLC',
      tradeName: 'Acme',
      vatNumber: 'VAT-1',
    };
    const merged = applyReportCompanyBrandingToPdfData({ entityBound: true }, branding);
    expect(merged.companyName).toBe('Acme Freight LLC');
    expect(merged.logoUrl).toBe('https://cdn.example.com/acme.png');
    expect(merged.companyAddress).toBe('1 Dock Rd');
    expect(String(merged.logoUrl || '')).not.toMatch(/fresa/i);
  });

  it('missing organization logo does not fall back to Fresa', () => {
    expect(REPORT_BRANDING_RULES.allowFresaIdentity).toBe(false);
    expect(resolveReportLogoUrl(undefined)).toBeUndefined();
    expect(resolveReportLogoUrl('')).toBeUndefined();
    expect(resolveReportLogoUrl(null)).toBeUndefined();
    expect(resolveReportLogoUrl('https://cdn.example.com/org.png')).toBe(
      'https://cdn.example.com/org.png',
    );
    const branding: ReportCompanyBranding = {
      companyName: 'Org Without Logo',
      companyAddress: '',
      companyWeb: '',
      companyPhone: '',
      companyEmail: '',
      logoUrl: '',
      profileLoaded: true,
      legalName: 'Org Without Logo',
      tradeName: '',
      vatNumber: '',
    };
    const merged = applyReportCompanyBrandingToPdfData({ entityBound: true }, branding);
    expect(merged.logoUrl).toBe('');
    expect(resolveReportLogoUrl(merged.logoUrl)).toBeUndefined();
  });

  it('preview and download share the same HAWB PDF blob', async () => {
    const { blob } = createHawbOfficialEvidencePdf('HAWB_DRAFT_REPORT_FORMAT', {
      entityBound: true,
      companyName: 'Org Co',
      logoUrl: '',
    });
    const { identical, previewBlob, downloadBlob } =
      await hawbOfficialPreviewDownloadSameBlob(blob);
    expect(identical).toBe(true);
    expect(previewBlob).toBe(downloadBlob);
  });

  it('preserves five official HAWB formats and HBL Jasper pilot', () => {
    expect(HAWB_FORMAT_CATALOG).toHaveLength(5);
    expect(isHblJasperPilotCode('HBL_DRAFT_REPORT_FORMAT_JASPER')).toBe(true);
    expect(resolveCatalogFormatStatus('HAWB_DRAFT_REPORT_FORMAT').id).toBe('native_layout');
  });

  it('official-sample catalogue status marks reference-only (never Generate from Fresa sample)', () => {
    const st = resolveCatalogFormatStatus('DELIVERY_ORDER_REPORT_FORMAT_17');
    expect(st.id).toBe('official_sample');
    expect(st.detail.toLowerCase()).toMatch(/reference/);
    expect(st.detail.toLowerCase()).toMatch(/never/);
  });
});
