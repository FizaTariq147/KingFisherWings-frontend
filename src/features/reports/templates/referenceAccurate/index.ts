import type { InvoiceFormatPreview } from '../../types/invoiceFormatPreview.types';
import type { InvoiceFormatPdfData } from '../../utils/invoiceFormatToInvoicePdfModel';
import { getOfficialMeasuredFace } from '../official/officialFaceRegistry';
import { getReportEnrichment } from '../../registry';
import { drawReferenceFormPdf, stackLines, type PlacedText } from './drawReferenceForm';
import { isFresaIdentityText } from '../official/officialBranding';
import {
  ARRIVAL_JASPER_REFERENCE_CODE,
  arrivalJasperFields,
  keepArrivalJasperLabel,
} from './arrivalNoticeJasperReference';
import {
  FCL_QUOTATION_REFERENCE_CODE,
  fclQuotationFields,
  keepFclQuotationLabel,
} from './fclQuotationReference';
import {
  HBL_JASPER_REFERENCE_CODE,
  hblJasperFields,
  keepHblJasperLabel,
} from './hblJasperReference';
import {
  INVOICE_INDIA_REFERENCE_CODE,
  invoiceIndiaFields,
  keepInvoiceIndiaLabel,
} from './invoiceIndiaReference';
import { ACTIVITY_COMPLETED_JOBS_CODE } from './activityCompletedJobsWorkbook';
import { HAWB_DRAFT2_LAYOUT } from '../hawb/official/layouts/hawbDraft2.layout';

export const REFERENCE_ACCURATE_PDF_CODES = [
  HBL_JASPER_REFERENCE_CODE,
  INVOICE_INDIA_REFERENCE_CODE,
  FCL_QUOTATION_REFERENCE_CODE,
  ARRIVAL_JASPER_REFERENCE_CODE,
] as const;

const BUILDERS = {
  [HBL_JASPER_REFERENCE_CODE]: { keepLabel: keepHblJasperLabel, fields: hblJasperFields },
  [INVOICE_INDIA_REFERENCE_CODE]: { keepLabel: keepInvoiceIndiaLabel, fields: invoiceIndiaFields },
  [FCL_QUOTATION_REFERENCE_CODE]: { keepLabel: keepFclQuotationLabel, fields: fclQuotationFields },
  [ARRIVAL_JASPER_REFERENCE_CODE]: { keepLabel: keepArrivalJasperLabel, fields: arrivalJasperFields },
} as const;

export function isReferenceAccuratePdfCode(code: string): boolean {
  return Object.prototype.hasOwnProperty.call(BUILDERS, code.trim().toUpperCase());
}

/**
 * Six-template status. Visual acceptance stays open until a raster compare
 * matches the reference. Generating a PDF does not flip that flag.
 */
export const REFERENCE_ACCURATE_STATUS = [
  {
    code: HAWB_DRAFT2_LAYOUT.code,
    referenceFile: HAWB_DRAFT2_LAYOUT.referenceFile,
    page: '595×845 pt portrait',
    implementation: 'independent_hawb_face',
    visualValidation: 'compared_not_accepted',
    note: 'Existing Draft 2 face, printed by the local Playwright route when the dev server is running. The html2canvas capture remains for the other four HAWB codes and when that route is absent.',
  },
  {
    code: HBL_JASPER_REFERENCE_CODE,
    referenceFile: 'hbl-draft-report-fomat-jasper.pdf',
    page: '595×842 pt portrait',
    implementation: 'independent_reference_form',
    visualValidation: 'not_accepted',
    note: 'Boxes and labels from the reference. Sample parties and cargo are not copied. Legal lines are still clipped by the measured text cap.',
  },
  {
    code: INVOICE_INDIA_REFERENCE_CODE,
    referenceFile: 'invoice-report-format-1-tax-invoice-india.pdf',
    page: '594×841.9 pt portrait',
    implementation: 'independent_reference_form',
    visualValidation: 'not_accepted',
    note: 'GST grid and terms kept. Sample invoice amounts and bank account numbers are omitted.',
  },
  {
    code: FCL_QUOTATION_REFERENCE_CODE,
    referenceFile: 'fcl-quotation-report-format.pdf',
    page: '594×841.9 pt portrait',
    implementation: 'independent_reference_form',
    visualValidation: 'not_accepted',
    note: 'Quotation sections kept. Sample quote number, rates and the Fresa footer are omitted.',
  },
  {
    code: ARRIVAL_JASPER_REFERENCE_CODE,
    referenceFile: 'arrival-notice-report-format-1-cargo-arrival-notice-jasper.pdf',
    page: '595×842 pt portrait',
    implementation: 'independent_reference_form',
    visualValidation: 'not_accepted',
    note: 'Notice sections kept. The cheque line uses the organization name only when that name is present.',
  },
  {
    code: ACTIVITY_COMPLETED_JOBS_CODE,
    referenceFile: 'activity-completed-jobs-list-report-format.xlsx',
    page: 'sheet Activity Completed Jobs List_LI',
    implementation: 'independent_workbook',
    visualValidation: 'headers_matched_rows_not_sample',
    note: 'Header order matches the reference. Cell values come only from the caller. Sample job numbers are not copied.',
  },
] as const;

function letterheadFor(code: string, data: InvoiceFormatPdfData): PlacedText[] {
  const name = (data.companyName || '').trim();
  if (!name || isFresaIdentityText(name)) return [];
  if (code === INVOICE_INDIA_REFERENCE_CODE || code === FCL_QUOTATION_REFERENCE_CODE) {
    return [
      { text: name, x: 400, y: 812, size: 8, bold: true },
      ...stackLines(
        data.companyAddress ? [data.companyAddress] : [],
        400,
        800,
        7.5,
        9,
        2,
      ),
    ];
  }
  if (code === HBL_JASPER_REFERENCE_CODE) {
    return [{ text: name, x: 330, y: 77.7, size: 8, bold: true }];
  }
  return [{ text: name, x: 360, y: 760, size: 9, bold: true }];
}

const LOGO_BOX = {
  [INVOICE_INDIA_REFERENCE_CODE]: { x: 500, y: 812, maxWidth: 78, maxHeight: 22 },
  [FCL_QUOTATION_REFERENCE_CODE]: { x: 500, y: 812, maxWidth: 78, maxHeight: 22 },
  [HBL_JASPER_REFERENCE_CODE]: { x: 430, y: 808, maxWidth: 90, maxHeight: 24 },
  [ARRIVAL_JASPER_REFERENCE_CODE]: { x: 430, y: 800, maxWidth: 90, maxHeight: 24 },
} as const;

function previewFor(code: string): InvoiceFormatPreview {
  const enrichment = getReportEnrichment(code);
  return {
    code,
    formatNumber: 0,
    name: enrichment?.templateType || code,
    samplePdfUrl: enrichment?.reference?.samplePdfUrl || null,
    layoutKind: 'generic',
    paper: enrichment?.page.size || 'A4',
    orientation: enrichment?.page.orientation,
    appendCustomerTerms: false,
    rtl: false,
    sections: [],
  };
}

export async function generateReferenceAccuratePdf(
  code: string,
  data: InvoiceFormatPdfData = {},
): Promise<{ blob: Blob; preview: InvoiceFormatPreview }> {
  const key = code.trim().toUpperCase() as keyof typeof BUILDERS;
  const builder = BUILDERS[key];
  if (!builder) throw new Error(`${code} is not one of the reference-accurate PDF templates`);
  const face = getOfficialMeasuredFace(key);
  if (!face) throw new Error(`${code} has no measured reference geometry`);
  const bytes = await drawReferenceFormPdf({
    face,
    data,
    keepLabel: builder.keepLabel,
    fields: builder.fields(data),
    letterhead: letterheadFor(key, data),
    logoUrl: data.logoUrl,
    logoBox: LOGO_BOX[key],
  });
  const blob = new Blob([bytes], { type: 'application/pdf' });
  return { blob, preview: previewFor(key) };
}
