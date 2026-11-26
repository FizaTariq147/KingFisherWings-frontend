import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import type { OfficialFaceData } from '../../official/officialFace.types';
import { getHawbOfficialLayout } from './layouts';
import { mergeHawbCatalogPreviewFixture } from './hawbOfficialCatalogFixture';
import { mapToHawbOfficialModel } from './mapToHawbOfficialModel';
import { hawbFirstFlightCode, hawbIsPrepaid } from './hawbOfficialStyles';

/** Word-wrap party lines into ≤maxLines × maxChars for measured shipper/consignee slots. */
function wrapPartyLines(rows: string[], maxLines = 3, maxChars = 52): string[] {
  const cleaned = rows
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^https?:/i.test(l))
    .filter((l) => !/@/.test(l)); // emails belong in CRM, not AWB face
  const out: string[] = [];
  for (const row of cleaned) {
    if (out.length >= maxLines) break;
    // Keep phones on their own line only when space remains.
    if (/^\+?\d[\d\s\-()]{6,}$/.test(row)) {
      if (out.length < maxLines) out.push(row);
      continue;
    }
    let left = row;
    while (left.length && out.length < maxLines) {
      if (left.length <= maxChars) {
        out.push(left);
        break;
      }
      let cut = left.lastIndexOf(' ', maxChars);
      if (cut < Math.floor(maxChars * 0.4)) cut = maxChars;
      out.push(left.slice(0, cut).trim());
      left = left.slice(cut).trim();
    }
  }
  return out.slice(0, maxLines);
}

/**
 * Map catalogue/job HAWB data → measured face stamp payload.
 * Draft-1 prefixes match Fresa pin strings (MAWB NO. / HAWB NO. / JOB NO. / PHONE:).
 */
export function mapHawbToOfficialFaceData(
  code: string,
  data: InvoiceFormatPdfData = {},
): OfficialFaceData {
  const pdfData = mergeHawbCatalogPreviewFixture(data);
  const layout = getHawbOfficialLayout(code);
  const model = mapToHawbOfficialModel(code, pdfData, {
    showPlaceholders: !pdfData.entityBound,
  });
  const isDraft1 = /DRAFT_REPORT_FORMAT_1$/i.test(code);
  const prepaid = hawbIsPrepaid(model.handling, model.accounting);
  const byCarrier = hawbFirstFlightCode(model.flightDate, model.carrier);
  const arranged = model.pieces || model.grossWeight ? 'AS ARRANGED' : '';
  const nature = (model.natureOfGoods || '')
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^DIMS\b/i.test(l))
    .slice(0, 2)
    .join('\n');

  const shipperLines = wrapPartyLines(model.shipperLines);
  const consigneeLines = wrapPartyLines(model.consigneeLines);
  const notifySource = model.notifyLines.length ? model.notifyLines : model.consigneeLines;
  const notifyLines = wrapPartyLines(notifySource);

  // Customs default from layout when catalogue preview / empty live customs.
  const customs =
    model.declaredCustoms ||
    (!model.entityBound ? layout?.customsDefaultWhenEmpty || '' : '');

  return {
    entityBound: model.entityBound,
    companyName: model.companyName,
    companyAddress: model.companyAddress,
    companyPhone: model.companyPhone
      ? isDraft1
        ? `PHONE: ${model.companyPhone}`
        : model.companyPhone
      : '',
    companyEmail: model.companyEmail,
    logoUrl: model.logoUrl,
    shipperLines,
    consigneeLines,
    notifyLines,
    jobNumber: model.jobNo
      ? isDraft1
        ? `JOB NO.: ${model.jobNo}`
        : model.jobNo
      : '',
    hawbNo: model.hawbNo
      ? isDraft1
        ? `HAWB NO. ${model.hawbNo}`
        : model.hawbNo
      : '',
    mawbNo: model.mawbNo
      ? isDraft1
        ? `MAWB NO. ${model.mawbNo}`
        : model.mawbNo
      : '',
    pieces: model.pieces,
    grossWeight: model.grossWeight,
    chargeableWeight: model.chargeableWeight,
    nature,
    handling: model.handling,
    accounting: /^JOB\s*NO/i.test(model.accounting)
      ? prepaid
        ? 'FREIGHT PREPAID'
        : ''
      : model.accounting || (prepaid ? 'FREIGHT PREPAID' : ''),
    packagesLine: model.pieces ? `TOTAL : (${model.pieces}) PACKAGES ONLY` : '',
    departure: model.departure,
    destination: model.destination,
    flightDate: model.flightDate,
    toCode: model.toCode,
    currency: model.currency,
    declaredCarriage: model.declaredCarriage,
    declaredCustoms: customs,
    insurance: model.insurance,
    carrier: model.carrier,
    byCarrier,
    executedOn: model.executedOn,
    executedAt: model.executedAt,
    total: isDraft1 ? arranged || model.total : model.total || (model.pieces ? '0.00' : ''),
    rateCharge: isDraft1 ? arranged || model.rateCharge : model.rateCharge,
    prepaidMark: prepaid ? 'PP' : '',
    carrierSign: model.carrier
      ? `AS AGENT FOR THE CARRIER,\n${model.carrier}`
      : model.companyName,
  };
}
