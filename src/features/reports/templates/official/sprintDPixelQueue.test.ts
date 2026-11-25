import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { generateOfficialMeasuredPdf } from './generateOfficialMeasuredPdf';
import { getReportBrandingSlots } from './brandingSlots';
import { isOfficialMeasuredNativeCode } from './officialFaceRegistry';

/**
 * Sprint D priority queue: generate org-branded measured PDFs for Invoice 1–4,
 * HBL MAGIC, and the two measured MAWB faces. Not acceptance — harness + sign-off
 * still required per MASTER_PROMPT.
 */
const PRIORITY = [
  'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA',
  'INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE',
  'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE',
  'FG_HBL_MAGICLOGISYS',
  'MAWB_DRAFT_REPORT_FORMAT',
  'MAWB_ORIGINAL_PREPRINTED_KC_REPORT_FORMAT',
] as const;

describe('Sprint D priority measured generate', () => {
  it(
    'writes org-branded PDFs for invoice 1–4, MAGIC, MAWB',
    async () => {
      const logoBytes = readFileSync('public/kingfisher-logo.png');
      const logoUrl = `data:image/png;base64,${logoBytes.toString('base64')}`;
      mkdirSync('tools/tmp-sprint-d', { recursive: true });

      for (const code of PRIORITY) {
        if (!isOfficialMeasuredNativeCode(code)) {
          // Format-3 may be JSON-only; skip generate here but record the gap.
          writeFileSync(
            `tools/tmp-sprint-d/${code}.SKIP.txt`,
            'No measured face — use JSON/native path outside this queue.\n',
          );
          continue;
        }
        const slots = getReportBrandingSlots(code);
        if (slots?.logo) {
          expect(slots.logo.width, `${code} logo w`).toBeGreaterThan(12);
          expect(slots.logo.height, `${code} logo h`).toBeGreaterThan(8);
        }
        const result = await generateOfficialMeasuredPdf(code, {
          companyName: 'Zoyan Logistics',
          companyAddress: 'Dubai, UAE',
          companyPhone: '+971 50 000 0000',
          companyEmail: 'ops@zoyan.example',
          logoUrl,
          printedBy: 'ops@zoyan.example',
          entityBound: true,
          invoiceNumber: 'INV-LIVE-1001',
          jobNumber: 'JOB-LIVE-42',
          hblNo: 'HBL-LIVE-9001',
          mawbNo: 'MAWB-LIVE-55',
          billToLines: ['LIVE BILLTO LLC', 'Dubai, UAE'],
          shipperLines: ['LIVE SHIPPER CO', 'Chennai, India'],
          consigneeLines: ['LIVE CONSIGNEE LLC', 'Sharjah, UAE'],
        });
        expect(result.blob.size, code).toBeGreaterThan(2000);
        writeFileSync(
          `tools/tmp-sprint-d/${code}.pdf`,
          Buffer.from(await result.blob.arrayBuffer()),
        );
      }
    },
    180_000,
  );
});
