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

/** IATA / job port codes — supports bare codes (AEAUH) and "(DXB)" forms. */
function airportCode(text: string): string {
  const t = trim(text);
  if (!t) return '';
  const paren = t.match(/\(([A-Z0-9]{3,5})\)/i);
  if (paren?.[1]) return paren[1].toUpperCase();
  if (/^[A-Z0-9]{3,5}$/i.test(t)) return t.toUpperCase();
  const bare = t.match(/\b([A-Z]{3})\b/);
  return bare?.[1] ? bare[1].toUpperCase() : '';
}

/**
 * Map catalogue/shipment PDF data → official HAWB model.
 * Never fabricates demo shipment values when entity-bound.
 * Catalogue (!entityBound) may already carry pin-density preview cargo via
 * mergeHawbCatalogPreviewFixture — still never Fresa identity strings.
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

  const pieces =
    (data.tableRows?.[0]?.[0] ? trim(data.tableRows[0][0]) : '') || trim(data.pieces);
  const gross =
    (data.tableRows?.[0]?.[1] ? trim(data.tableRows[0][1]) : '') || trim(data.grossWeight);
  const chargeable =
    (data.tableRows?.[0]?.[4] ? trim(data.tableRows[0][4]) : '') || trim(data.measurement);
  const rate = data.tableRows?.[0]?.[5] ? trim(data.tableRows[0][5]) : '';
  const totalCell = data.tableRows?.[0]?.[6] ? trim(data.tableRows[0][6]) : trim(data.total);

  // Shipper is the shipment party — never fall back to bill-to / org as shipper.
  const shipperLines = linesOf(data.shipperLines);
  const consigneeLines = linesOf(data.consigneeLines);
  // Draft-1 Notify defaults to consignee when the job has no separate notify party.
  const notifyLines = linesOf(data.notifyLines).length
    ? linesOf(data.notifyLines)
    : layout.showNotify
      ? consigneeLines
      : [];
  const agentLines = linesOf(
    data.companyName ? [data.companyName] : undefined,
    data.companyAddress ? [data.companyAddress] : undefined,
    data.companyPhone ? [`PHONE: ${trim(data.companyPhone)}`] : undefined,
  );

  const flightDate = trim(data.vesselFlight);
  // Carrier only from explicit field — faces use flightDate for By first Carrier when needed.
  const carrier = trim(data.carrier);

  const handling = trim(data.handling) || trim(data.incoterm);
  // Prefer explicit accounting / freight terms. Do not copy JOB NO into Accounting —
  // Draft-1 has a dedicated JOB NO. slot; parking the job there caused overlap.
  const accounting = trim(data.accounting) || handling;

  const customs =
    trim(data.declaredCustoms) ||
    (!entityBound ? layout.customsDefaultWhenEmpty : '');

  const toCode = airportCode(destination);
  const chargeableWeight = chargeable || gross;

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
    flightDate,
    toCode,
    carrier,
    currency: trim(data.currencyCode),
    declaredCarriage: trim(data.declaredCarriage),
    declaredCustoms: customs,
    insurance: trim(data.insurance),
    pieces,
    grossWeight: gross,
    chargeableWeight,
    rateCharge: rate,
    total: totalCell,
    natureOfGoods: nature,
    handling,
    accounting,
    executedOn: trim(data.invoiceDate),
    executedAt:
      trim(data.executedAt) || departure.split('(')[0]?.trim().split(',')[0]?.trim() || '',
    otherCharges: trim(data.otherCharges),
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
        ? [
            [
              pieces,
              gross,
              pieces || gross ? 'K' : '',
              nature ? 'S' : '',
              chargeableWeight,
              rate,
              totalCell,
              nature,
            ],
          ]
        : [],
  };
}
