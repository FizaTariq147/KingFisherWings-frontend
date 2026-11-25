import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import { mapToHblJasperPilotModel } from '@/features/reports/templates/hbl/jasperPilot/mapToHblJasperPilotModel';
import { HBL_JASPER_PILOT_CONFIG } from '@/features/reports/templates/hbl/jasperPilot/hblJasperPilot.config';
import { isFresaIdentityText } from '@/features/reports/templates/official/officialBranding';
import { escapeHtml, escapeLines } from '../_shared/escapeHtml';
import { wrapHtmlPilotDocument } from '../_shared/wrapDocument';

export const HBL_HTML_PILOT_CODE = 'HBL_DRAFT_REPORT_FORMAT_JASPER' as const;

const PAGE = {
  widthMm: 210,
  heightMm: 297,
};

function partyBlock(label: string, lines: string[]): string {
  return `<div class="party">
  <div class="label">${escapeHtml(label)}</div>
  <div class="value">${escapeLines(lines) || '&nbsp;'}</div>
</div>`;
}

/**
 * HTML/CSS face for HBL Jasper. Reuses mapToHblJasperPilotModel.
 * Missing fields stay blank. Not accepted.
 */
export function buildHblJasperHtmlPilot(data: InvoiceFormatPdfData = {}): string {
  for (const bit of [data.companyName, data.companyAddress, data.companyPhone, data.companyEmail]) {
    if (bit && isFresaIdentityText(bit)) {
      throw new Error('HTML pilot refuses Fresa organization identity');
    }
  }
  const model = mapToHblJasperPilotModel(data, { showPlaceholders: false });
  if (/fresa/i.test(model.companyName || '')) {
    throw new Error('HTML pilot refuses Fresa company name');
  }

  const rows = (model.containerRows || [])
    .map(
      (row) => `<tr>
  <td>${escapeHtml(row.marks)}</td>
  <td>${escapeHtml(row.packages)}</td>
  <td>${escapeHtml(row.description)}</td>
  <td>${escapeHtml(row.weight)}</td>
  <td>${escapeHtml(row.measurement)}</td>
</tr>`,
    )
    .join('');

  const logo = model.logoUrl?.trim()
    ? `<img class="logo" src="${escapeHtml(model.logoUrl)}" alt="" />`
    : '';

  const companyMeta = [data.companyAddress, data.companyPhone, data.companyEmail]
    .map((v) => String(v || '').trim())
    .filter(Boolean);

  const body = `
<header class="header">
  ${logo}
  <div class="company">
    <div class="company-name">${escapeHtml(model.companyName)}</div>
    <div class="company-meta">${escapeLines(companyMeta)}</div>
  </div>
  <div class="title-block">
    <div class="title">${escapeHtml(HBL_JASPER_PILOT_CONFIG.name)}</div>
    <div class="bl">${escapeHtml(model.blNumber)}</div>
  </div>
</header>
<section class="parties">
  ${partyBlock('Shipper', model.shipperLines)}
  ${partyBlock('Consignee', model.consigneeLines)}
  ${partyBlock('Notify', model.notifyLines)}
</section>
<section class="routing">
  <div><span class="label">Place of Receipt</span><div>${escapeHtml(model.placeOfReceipt)}</div></div>
  <div><span class="label">Port of Loading</span><div>${escapeHtml(model.portOfLoading)}</div></div>
  <div><span class="label">Job No.</span><div>${escapeHtml(model.jobRef)}</div></div>
  <div><span class="label">Pre-Carriage</span><div>${escapeHtml(model.preCarriage)}</div></div>
  <div><span class="label">Vessel / Voyage</span><div>${escapeHtml(model.vesselVoyage)}</div></div>
  <div><span class="label">Port of Discharge</span><div>${escapeHtml(model.portOfDischarge)}</div></div>
  <div><span class="label">Place of Delivery</span><div>${escapeHtml(model.placeOfDelivery)}</div></div>
  <div><span class="label">No. of B/Ls</span><div>${escapeHtml(model.numberOfBls)}</div></div>
</section>
<table class="cargo">
  <thead>
    <tr>
      <th>Marks</th><th>Packages</th><th>Description</th><th>Gross Weight</th><th>Measurement</th>
    </tr>
  </thead>
  <tbody>${rows || '<tr><td colspan="5">&nbsp;</td></tr>'}</tbody>
</table>
<section class="freight no-break">
  <div class="label">Freight details</div>
  <div>${escapeHtml(model.freightDetails)}</div>
</section>
<footer class="footer">
  <div>${escapeHtml(model.placeAndDateOfIssue)}</div>
  <div>${escapeHtml(model.onboardDate)}</div>
  <div>${escapeHtml(model.carrierName)}</div>
</footer>`;

  return wrapHtmlPilotDocument(body, {
    ...PAGE,
    styles: `
.header { display: grid; grid-template-columns: 72px 1fr 160px; gap: 8px; padding: 10mm 9mm 4mm; border-bottom: 0.5pt solid #222; }
.logo { max-width: 70px; max-height: 48px; object-fit: contain; }
.company-name { font-size: 11pt; font-weight: 700; }
.company-meta { font-size: 8pt; line-height: 1.3; }
.title { font-size: 10pt; font-weight: 700; text-align: right; }
.bl { font-size: 13pt; font-weight: 700; text-align: right; margin-top: 4px; }
.parties { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; padding: 0 9mm; }
.party { border: 0.5pt solid #222; border-top: 0; min-height: 28mm; padding: 2mm; }
.label { font-size: 7pt; color: #333; text-transform: uppercase; margin-bottom: 1mm; }
.value { font-size: 9pt; line-height: 1.25; min-height: 12mm; }
.routing { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin: 0 9mm; border: 0.5pt solid #222; border-top: 0; }
.routing > div { border-right: 0.5pt solid #222; padding: 2mm; font-size: 9pt; min-height: 14mm; }
.routing > div:nth-child(4n) { border-right: 0; }
.cargo { margin: 0 9mm; border: 0.5pt solid #222; border-top: 0; }
.cargo th, .cargo td { border: 0.5pt solid #222; padding: 1.5mm; font-size: 8pt; }
.cargo th { background: #f3f3f3; font-size: 7pt; text-transform: uppercase; }
.freight { margin: 0 9mm; border: 0.5pt solid #222; border-top: 0; padding: 2mm; min-height: 18mm; font-size: 9pt; }
.footer { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4mm; padding: 4mm 9mm 10mm; font-size: 8pt; }
`,
  });
}
