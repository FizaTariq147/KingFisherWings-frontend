import type { InvoiceFormatPdfData } from '../../../utils/invoiceFormatToInvoicePdfModel';
import type { HawbOfficialLayoutConfig, HawbOfficialModel } from './hawbOfficial.types';
import { getHawbOfficialLayout } from './layouts';

function trim(value: string | null | undefined): string {
  return String(value ?? '').trim();
}

function linesOf(...groups: Array<string[] | undefined>): string[] {
  return groups
    .flatMap((g) => g ?? [])
    .map((l) => trim(l))
    .filter(Boolean);
}

function airportCode(text: string): string {
  const m = text.match(/\(([A-Z]{3})\)/);
  if (m?.[1]) return m[1];
  const bare = text.match(/\b([A-Z]{3})\b/);
  return bare?.[1] || '';
}

/**
 * Map catalogue/shipment PDF data → official HAWB model.
 * Never fabricates demo shipment values. Optional empties stay empty.
 * When showPlaceholders && !entityBound, UI may show light guides — still no Fresa demo cargo.
 */
export function mapToHawbOfficialModel(
  code: string,
  data: InvoiceFormatPdfData = {},
  options: { showPlaceholders?: boolean; copyBanner?: string; copyIndex?: number; copyTotal?: number } = {},
): HawbOfficialModel {
  const layout = getHawbOfficialLayout(code);
  if (!layout) {
    throw new Error(`Not an official HAWB native code: ${code}`);
  }
  return mapWithLayout(layout, data, options);
}

export function mapWithLayout(
  layout: HawbOfficialLayoutConfig,
  data: InvoiceFormatPdfData = {},
  options: { showPlaceholders?: boolean; copyBanner?: string; copyIndex?: number; copyTotal?: number } = {},
): HawbOfficialModel {
  const entityBound = Boolean(data.entityBound);
  const departure = trim(data.pol);
  const destination = trim(data.pod);
  const nature =
    trim(data.commodity) ||
    (data.tableRows?.[0]?.[7] ? trim(data.tableRows[0][7]) : '') ||
    (data.tableRows?.[0]?.[3] ? trim(data.tableRows[0][3]) : '');

  const pieces = data.tableRows?.[0]?.[0] ? trim(data.tableRows[0][0]) : '';
  const gross = data.tableRows?.[0]?.[1] ? trim(data.tableRows[0][1]) : '';
  const chargeable = data.tableRows?.[0]?.[4] ? trim(data.tableRows[0][4]) : '';
  const rate = data.tableRows?.[0]?.[5] ? trim(data.tableRows[0][5]) : '';
  const totalCell = data.tableRows?.[0]?.[6] ? trim(data.tableRows[0][6]) : trim(data.total);

  const shipperLines = linesOf(data.shipperLines, data.billToName ? [data.billToName] : undefined);
  const consigneeLines = linesOf(data.consigneeLines);
  const notifyLines = linesOf(data.notifyLines);
  const agentLines = linesOf(
    data.companyName ? [data.companyName] : undefined,
    data.companyAddress ? [data.companyAddress] : undefined,
  );

  return {
    formatCode: layout.code,
    formatName: layout.name,
    variant: layout.variant,
    entityBound,
    showPlaceholders: Boolean(options.showPlaceholders) && !entityBound,
    copyBanner: options.copyBanner,
    copyIndex: options.copyIndex,
    copyTotal: options.copyTotal,
    companyName: trim(data.companyName),
    companyAddress: trim(data.companyAddress),
    companyPhone: trim(data.companyPhone),
    companyEmail: trim(data.companyEmail),
    logoUrl: trim(data.logoUrl),
    shipperLines,
    consigneeLines,
    notifyLines,
    agentLines,
    hawbNo: trim(data.hawbNo) || trim(data.referenceNo) || trim(data.shipmentNumber),
    mawbNo: trim(data.mawbNo),
    jobNo: trim(data.jobNumber),
    departure,
    destination,
    flightDate: trim(data.vesselFlight),
    toCode: airportCode(destination),
    carrier: '',
    currency: trim(data.currencyCode),
    declaredCarriage: '',
    declaredCustoms: '',
    insurance: '',
    pieces,
    grossWeight: gross,
    chargeableWeight: chargeable,
    rateCharge: rate,
    total: totalCell,
    natureOfGoods: nature,
    handling: '',
    accounting: trim(data.jobNumber) ? `JOB NO.: ${trim(data.jobNumber)}` : '',
    executedOn: trim(data.invoiceDate),
    executedAt: departure.split('(')[0]?.trim() || '',
    otherCharges: '',
    tableHeaders: data.tableHeaders?.length
      ? data.tableHeaders
      : [
          'No. of Pieces',
          'Gross Weight',
          'kg',
          'Rate Class',
          'Chargeable Weight',
          'Rate / Charge',
          'Total',
          'Nature and Quantity of Goods',
        ],
    tableRows: data.tableRows?.length
      ? data.tableRows
      : pieces || gross || nature
        ? [[pieces, gross, 'K', '', chargeable, rate, totalCell, nature]]
        : [],
  };
}
