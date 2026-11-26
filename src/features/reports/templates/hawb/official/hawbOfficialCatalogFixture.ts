import type { InvoiceFormatPdfData } from '../../../utils/invoiceFormatToInvoicePdfModel';

/**
 * Catalogue / unbound HAWB preview cargo.
 *
 * Fresa sample PDFs are never returned as product output (MASTER_PROMPT).
 * When the formats catalogue opens without a job/shipment, the native face
 * would otherwise print an empty grid. This fixture fills the same *slots*
 * as the pinned Fresa HAWB samples (density + landmarks) using **neutral**
 * party names — never Fresa DEMO / BABU SECTOR / AL NASER branding.
 *
 * Org chrome (company, address, phone, logo) is merged from the caller and
 * always wins for Issued-by / agent bands.
 */
export const HAWB_CATALOG_PREVIEW_FIXTURE: InvoiceFormatPdfData = {
  entityBound: false,
  hawbNo: 'MAA/DXB/1900014',
  mawbNo: '176-23456882',
  jobNumber: 'JOB-190014',
  referenceNo: 'MAA/DXB/1900014',
  shipmentNumber: 'SHP-190014',
  invoiceDate: '18-FEB-19',
  currencyCode: 'INR',
  pol: 'CHENNAI, INDIA',
  pod: 'DUBAI INTERNATIONAL AIRPORT (DXB)',
  vesselFlight: 'EK9876EK9876 20-FEB-19',
  commodity: 'STC: PAPER CUPS\nDIMS IN CM',
  incoterm: 'FREIGHT PREPAID',
  pieces: '100',
  grossWeight: '1,250.00',
  measurement: '1,250.00',
  total: '0.00',
  shipperLines: [
    'GLOBAL EXPORT TRADING CO',
    '144/78B GKM TOWERS MUTHUSAMY STREET, NEAR A2B SIGNAL,',
    'NEELANKARAI CHENNAI TAMILNADU INDIA',
  ],
  consigneeLines: [
    'GULF IMPORT COMPANY LLC',
    '30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT',
    'AL NABHA SHARJAH UNITED ARAB EMIRATES',
  ],
  notifyLines: [
    'GULF IMPORT COMPANY LLC',
    '30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT',
    'AL NABHA SHARJAH UNITED ARAB EMIRATES',
  ],
  tableHeaders: [
    'No. of Pieces',
    'Gross Weight',
    'kg',
    'Rate Class',
    'Chargeable Weight',
    'Rate / Charge',
    'Total',
    'Nature and Quantity of Goods',
  ],
  tableRows: [['100', '1,250.00', 'K', 'S', '1,250.00', '', '0.00', 'STC: PAPER CUPS']],
  carrier: 'EMIRATES',
  declaredCarriage: 'N.V.D.',
  // Leave customs empty so each layout's customsDefaultWhenEmpty applies
  // (Draft/Draft-1/Orig-1 → AS PER INV; Draft-2/Orig-2 → N.C.V).
  declaredCustoms: '',
  insurance: 'NIL',
  handling: 'CTN 1-20',
  accounting: 'FREIGHT PREPAID',
  otherCharges: '',
  executedAt: 'CHENNAI',
};

/**
 * Merge catalogue preview fixture under live/org data.
 * Only used when `!entityBound`. Live values and org chrome always win.
 */
export function mergeHawbCatalogPreviewFixture(
  data: InvoiceFormatPdfData = {},
): InvoiceFormatPdfData {
  if (data.entityBound) return data;

  const f = HAWB_CATALOG_PREVIEW_FIXTURE;
  const pick = (live: string | undefined, fallback: string | undefined) => {
    const v = String(live ?? '').trim();
    return v || fallback;
  };

  return {
    ...f,
    ...data,
    entityBound: false,
    companyName: pick(data.companyName, f.companyName),
    companyAddress: pick(data.companyAddress, f.companyAddress),
    companyPhone: pick(data.companyPhone, f.companyPhone),
    companyEmail: pick(data.companyEmail, f.companyEmail),
    logoUrl: pick(data.logoUrl, f.logoUrl),
    shipperLines: data.shipperLines?.length ? data.shipperLines : f.shipperLines,
    consigneeLines: data.consigneeLines?.length ? data.consigneeLines : f.consigneeLines,
    notifyLines: data.notifyLines?.length ? data.notifyLines : f.notifyLines,
    hawbNo: pick(data.hawbNo, f.hawbNo),
    mawbNo: pick(data.mawbNo, f.mawbNo),
    jobNumber: pick(data.jobNumber, f.jobNumber),
    pol: pick(data.pol, f.pol),
    pod: pick(data.pod, f.pod),
    vesselFlight: pick(data.vesselFlight, f.vesselFlight),
    commodity: pick(data.commodity, f.commodity),
    currencyCode: pick(data.currencyCode, f.currencyCode),
    incoterm: pick(data.incoterm, f.incoterm),
    pieces: pick(data.pieces, f.pieces),
    grossWeight: pick(data.grossWeight, f.grossWeight),
    measurement: pick(data.measurement, f.measurement),
    total: pick(data.total, f.total),
    invoiceDate: pick(data.invoiceDate, f.invoiceDate),
    tableRows: data.tableRows?.length ? data.tableRows : f.tableRows,
    tableHeaders: data.tableHeaders?.length ? data.tableHeaders : f.tableHeaders,
    carrier: pick(data.carrier, f.carrier),
    declaredCarriage: pick(data.declaredCarriage, f.declaredCarriage),
    // Prefer live value; empty fixture lets layout.customsDefaultWhenEmpty win in the mapper.
    declaredCustoms: String(data.declaredCustoms ?? '').trim() || '',
    insurance: pick(data.insurance, f.insurance),
    handling: pick(data.handling, f.handling),
    accounting: pick(data.accounting, f.accounting),
    otherCharges: pick(data.otherCharges, f.otherCharges),
    executedAt: pick(data.executedAt, f.executedAt),
  };
}
