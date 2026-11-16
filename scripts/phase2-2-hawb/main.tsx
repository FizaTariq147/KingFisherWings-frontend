import { generateHawbOfficialPdf } from '@/features/reports/templates/hawb/official/generateHawbOfficialPdf';
import { OFFICIAL_HAWB_FORMAT_CODES } from '@/features/reports/utils/officialFormatGovernance';
import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';

type GenerateResult = {
  ok: boolean;
  code?: string;
  base64?: string;
  fileName?: string;
  variant?: string;
  widthPt?: number;
  heightPt?: number;
  pageCountHint?: number;
  error?: string;
};

declare global {
  interface Window {
    __HAWB_P22_READY?: boolean;
    __HAWB_P22?: {
      codes: readonly string[];
      generate: (
        code: string,
        data?: InvoiceFormatPdfData,
        options?: { showUnderlay?: boolean },
      ) => Promise<GenerateResult>;
    };
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const i = dataUrl.indexOf(',');
      resolve(i >= 0 ? dataUrl.slice(i + 1) : dataUrl);
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

/** Bound fixture — no Fresa demo parties; org branding placeholders only. */
const BOUND: InvoiceFormatPdfData = {
  entityBound: true,
  companyName: 'KingFisher Wings Logistics',
  companyAddress: 'Dubai, UAE',
  companyPhone: '+971-4-000-0000',
  shipperLines: ['ACME EXPORTERS LTD', 'CHENNAI, INDIA'],
  consigneeLines: ['BETA IMPORTS LLC', 'SHARJAH, UAE'],
  notifyLines: ['NOTIFY PARTNER', 'DUBAI'],
  pol: 'CHENNAI (MAA)',
  pod: 'DUBAI INTERNATIONAL AIRPORT (DXB)',
  vesselFlight: 'EK9876 / 20-FEB-26',
  referenceNo: 'MAA/DXB/260014',
  jobNumber: 'JOB-260014',
  commodity: 'STC: PAPER CUPS\nTOTAL : (100) PACKAGES ONLY',
  currencyCode: 'INR',
  invoiceDate: '18-FEB-26',
  tableRows: [['100', '1250.00', 'K', 'Q', '1250.00', '', '', 'STC: PAPER CUPS']],
};

window.__HAWB_P22 = {
  codes: OFFICIAL_HAWB_FORMAT_CODES,
  async generate(code, data = BOUND, options = {}): Promise<GenerateResult> {
    try {
      const { blob, fileName, layout } = await generateHawbOfficialPdf(code, data, {
        appendCustomerTerms: false,
        showPlaceholders: false,
        showUnderlay: options.showUnderlay,
      });
      const base64 = await blobToBase64(blob);
      return {
        ok: true,
        code,
        base64,
        fileName,
        variant: layout.variant,
        widthPt: Math.round(layout.page.widthPt),
        heightPt: Math.round(layout.page.heightPt),
        pageCountHint: layout.copyBanners.length || 1,
      };
    } catch (err) {
      return {
        ok: false,
        code,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
};

window.__HAWB_P22_READY = true;
document.getElementById('root')!.textContent =
  'HAWB Phase 2.2 harness ready — ' + OFFICIAL_HAWB_FORMAT_CODES.length + ' codes';
