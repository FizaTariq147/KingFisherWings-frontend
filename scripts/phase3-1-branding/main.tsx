import { generateHawbOfficialPdf } from '@/features/reports/templates/hawb/official/generateHawbOfficialPdf';
import { generateHblJasperPilotPdf } from '@/features/reports/templates/hbl/jasperPilot/generateHblJasperPilotPdf';
import { generateCatalogLayoutPdf } from '@/features/reports/utils/generateCatalogLayoutPdf';
import { generateHawbSamplePdf } from '@/features/reports/utils/generateHawbSamplePdf';
import { generateHblSamplePdf } from '@/features/reports/utils/generateHblSamplePdf';
import { resolveCatalogFormatStatus } from '@/features/reports/utils/catalogFormatStatus';
import { HAWB_FORMAT_CATALOG } from '@/features/reports/constants/hawbFormatCatalog';
import { REPORT_PDF_WORKFLOW } from '@/features/reports/utils/reportPdfWorkflow';
import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';

type PdfResult = {
  ok: boolean;
  code: string;
  mode: string;
  source: string;
  base64?: string;
  fileName?: string;
  catalogStatusId?: string;
  catalogStatusLabel?: string;
  /** Org fields actually passed into the production generator (raster PDFs lack a text layer). */
  brandingProof?: {
    companyName: string;
    companyAddress: string;
    logoUrlProvided: boolean;
    entityBound: boolean;
  };
  error?: string;
};

declare global {
  interface Window {
    __P31_READY?: boolean;
    __P31?: {
      inventory: () => Array<{
        code: string;
        family: string;
        advertisedImplemented: boolean;
        catalogStatusId: string;
        catalogStatusLabel: string;
      }>;
      generate: (opts: {
        code: string;
        mode: 'generate' | 'browse' | 'generate_no_logo';
        familyHint?: string;
      }) => Promise<PdfResult>;
    };
  }
}

/** Distinctive registered org — must appear in generated PDFs. */
const ORG_NAME = 'Phase31 Audit Org LLC';
const ORG_ADDRESS = '100 Audit Pier, Dubai, UAE';
const ORG_PHONE = '+971-4-311-0000';
const ORG_EMAIL = 'audit@phase31.example';

/** Tiny green PNG — unique bytes for logo-present runs. */
const ORG_LOGO_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6aAAAAAElFTkSuQmCC';

const BOUND: InvoiceFormatPdfData = {
  entityBound: true,
  companyName: ORG_NAME,
  companyAddress: ORG_ADDRESS,
  companyPhone: ORG_PHONE,
  companyEmail: ORG_EMAIL,
  logoUrl: ORG_LOGO_DATA_URL,
  shipperLines: ['ACME EXPORTERS LTD', 'CHENNAI, INDIA'],
  consigneeLines: ['BETA IMPORTS LLC', 'SHARJAH, UAE'],
  notifyLines: ['NOTIFY PARTNER', 'DUBAI'],
  billToName: 'BETA IMPORTS LLC',
  billToAddress: 'SHARJAH, UAE',
  pol: 'CHENNAI (MAA)',
  pod: 'DUBAI INTERNATIONAL AIRPORT (DXB)',
  vesselFlight: 'EK9876 / 20-FEB-26',
  referenceNo: 'MAA/DXB/260014',
  jobNumber: 'JOB-260014',
  shipmentNumber: 'SHP-260014',
  invoiceNumber: 'INV-P31-001',
  invoiceDate: '18-FEB-26',
  commodity: 'STC: PAPER CUPS',
  currencyCode: 'AED',
  lines: [{ description: 'Freight', qty: '1', rate: '100.00', amount: '100.00' }],
  tableRows: [['100', '1250.00', 'K', 'Q', '1250.00', '', '', 'STC: PAPER CUPS']],
  total: '100.00',
};

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

function statusOf(code: string) {
  const st = resolveCatalogFormatStatus(code);
  return { catalogStatusId: st.id, catalogStatusLabel: st.label };
}

const REPRESENTATIVE = [
  { code: 'HAWB_DRAFT_REPORT_FORMAT', family: 'hawb' },
  { code: 'HAWB_DRAFT_REPORT_FORMAT_1', family: 'hawb' },
  { code: 'HAWB_DRAFT_REPORT_FORMAT_2', family: 'hawb' },
  { code: 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1', family: 'hawb' },
  { code: 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2', family: 'hawb' },
  { code: 'HBL_DRAFT_REPORT_FORMAT_JASPER', family: 'hbl_jasper' },
  { code: 'HBL_DRAFT_REPORT_FORMAT_11', family: 'hbl' },
  { code: 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA', family: 'invoice' },
  { code: 'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER', family: 'arrival_notice' },
  { code: 'ARRIVAL_NOTICE_REPORT_FORMAT_11', family: 'arrival_notice_shared' },
  { code: 'DELIVERY_ORDER_REPORT_FORMAT_17', family: 'delivery_order' },
  { code: 'ADVANCE_SHIPPING_NOTE', family: 'wms_asn' },
] as const;

window.__P31 = {
  inventory() {
    const advertised = new Set(HAWB_FORMAT_CATALOG.map((r) => r.code));
    advertised.add('HBL_DRAFT_REPORT_FORMAT_JASPER');
    return REPRESENTATIVE.map((row) => {
      const st = statusOf(row.code);
      return {
        code: row.code,
        family: row.family,
        advertisedImplemented: advertised.has(row.code) && st.catalogStatusId === 'native_layout',
        ...st,
      };
    });
  },

  async generate({ code, mode }): Promise<PdfResult> {
    const st = statusOf(code);
    try {
      const data: InvoiceFormatPdfData = {
        ...BOUND,
        logoUrl: mode === 'generate_no_logo' ? '' : ORG_LOGO_DATA_URL,
        entityBound: mode !== 'browse',
      };

      const brandingProof = {
        companyName: String(data.companyName || ''),
        companyAddress: String(data.companyAddress || ''),
        logoUrlProvided: Boolean(String(data.logoUrl || '').trim()),
        entityBound: Boolean(data.entityBound),
      };

      if (mode === 'browse') {
        if (/^HAWB_/i.test(code)) {
          const { blob } = await generateHawbSamplePdf(code, {
            skipOrgStamp: true,
            appendCustomerTerms: false,
          });
          return {
            ok: true,
            code,
            mode,
            source: 'fresa_cdn_sample_hawb',
            base64: await blobToBase64(blob),
            brandingProof: {
              companyName: '',
              companyAddress: '',
              logoUrlProvided: false,
              entityBound: false,
            },
            ...st,
          };
        }
        if (/^HBL_/i.test(code)) {
          const { blob } = await generateHblSamplePdf(code, {
            skipOrgStamp: true,
            appendCustomerTerms: false,
          });
          return {
            ok: true,
            code,
            mode,
            source: 'fresa_cdn_sample_hbl',
            base64: await blobToBase64(blob),
            brandingProof: {
              companyName: '',
              companyAddress: '',
              logoUrlProvided: false,
              entityBound: false,
            },
            ...st,
          };
        }
        const generated = await generateCatalogLayoutPdf(code, { entityBound: false }, {
          purpose: 'browse',
          workflow: REPORT_PDF_WORKFLOW.REFERENCE_BROWSE,
        });
        if (!generated) throw new Error('No browse sample for ' + code);
        return {
          ok: true,
          code,
          mode,
          source: 'fresa_cdn_sample_catalog',
          base64: await blobToBase64(generated.blob),
          brandingProof: {
            companyName: '',
            companyAddress: '',
            logoUrlProvided: false,
            entityBound: false,
          },
          ...st,
        };
      }

      // Freightnest generate
      if (/^HAWB_/i.test(code) && st.catalogStatusId === 'native_layout') {
        const { blob, fileName } = await generateHawbOfficialPdf(code, data, {
          appendCustomerTerms: false,
          showPlaceholders: false,
        });
        return {
          ok: true,
          code,
          mode,
          source: 'generateHawbOfficialPdf',
          fileName,
          base64: await blobToBase64(blob),
          brandingProof,
          ...st,
        };
      }

      if (code === 'HBL_DRAFT_REPORT_FORMAT_JASPER') {
        const { blob, fileName } = await generateHblJasperPilotPdf(data, {
          appendCustomerTerms: false,
          showPlaceholders: false,
        });
        return {
          ok: true,
          code,
          mode,
          source: 'generateHblJasperPilotPdf',
          fileName,
          base64: await blobToBase64(blob),
          brandingProof,
          ...st,
        };
      }

      const generated = await generateCatalogLayoutPdf(code, data, {
        purpose: 'generate',
        workflow: REPORT_PDF_WORKFLOW.FREIGHTNEST_GENERATE,
        preferTemplateV2: true,
        logoUrl: data.logoUrl,
        hblMode: 'classic',
      });
      if (!generated) throw new Error('No Freightnest generate path for ' + code);
      return {
        ok: true,
        code,
        mode,
        source: 'generateCatalogLayoutPdf:' + (generated.preview.layoutKind || 'layout'),
        base64: await blobToBase64(generated.blob),
        brandingProof,
        ...st,
      };
    } catch (err) {
      return {
        ok: false,
        code,
        mode,
        source: 'error',
        error: err instanceof Error ? err.message : String(err),
        ...st,
      };
    }
  },
};

window.__P31_READY = true;
document.getElementById('root')!.textContent =
  'Phase 3.1 branding harness ready — ' + REPRESENTATIVE.length + ' formats';
