import { asRecord, pickString } from '@/features/portal-shared/normalize';
import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import { formatReportLayoutDate } from '@/features/reports/utils/formatReportLayoutDate';

function strList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === 'string' ? v.trim() : pickString(asRecord(v)?.line)))
      .filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  }
  return [];
}

/** Map AWB draft preview → catalog layout PDF data (no demo hardcoding). */
export function awbDraftPreviewToFormatPdfData(
  preview: Record<string, unknown>,
  opts?: { documentKind?: 'hawb' | 'mawb' | 'awb' },
): InvoiceFormatPdfData {
  const kind = opts?.documentKind ?? 'hawb';
  const hawb = pickString(preview.hawb_number, preview.hawbNumber);
  const mawb = pickString(preview.mawb_number, preview.mawbNumber);
  const docNo = kind === 'mawb' ? mawb || hawb : hawb || mawb;
  const origin = pickString(
    preview.origin_airport_code,
    preview.pol,
    preview.origin_port_code,
  );
  const dest = pickString(preview.dest_airport_code, preview.pod, preview.dest_port_code);
  const vesselFlight = pickString(
    preview.vessel_flight,
    [pickString(preview.flight_number), pickString(preview.flight_date)]
      .filter(Boolean)
      .join(' / '),
  );
  const pieces = pickString(preview.pieces);
  const gross = pickString(preview.gross_weight, preview.gross_weight_kg);
  const chargeable = pickString(
    preview.chargeable_weight,
    preview.chargeable_weight_kg,
  );
  const volume = pickString(preview.volume_cbm);
  const commodity = pickString(preview.commodity);
  const freight = pickString(preview.freight_type, preview.freight_terms);
  const jobNo = pickString(preview.job_number, preview.jobNumber);

  const shipperLines = strList(preview.shipper_lines);
  const consigneeLines = strList(preview.consignee_lines);
  const notifyLines = strList(preview.notify_lines);

  const tableRows: string[][] = [];
  if (pieces || gross || chargeable || volume || commodity) {
    tableRows.push([
      commodity || 'Air cargo',
      pieces || '',
      gross || '',
      chargeable || '',
      volume || '',
    ]);
  }

  return {
    entityBound: true,
    invoiceNumber: docNo || undefined,
    referenceNo: kind === 'hawb' ? mawb || undefined : hawb || undefined,
    jobNumber: jobNo || undefined,
    shipmentNumber: docNo || undefined,
    etd: formatReportLayoutDate(pickString(preview.etd, preview.flight_date)),
    eta: formatReportLayoutDate(pickString(preview.eta)),
    shipperLines: shipperLines.length ? shipperLines : undefined,
    consigneeLines: consigneeLines.length ? consigneeLines : undefined,
    notifyLines: notifyLines.length ? notifyLines : undefined,
    billToName: consigneeLines[0] || shipperLines[0] || undefined,
    pol: origin || undefined,
    pod: dest || undefined,
    originAirport: origin || undefined,
    destAirport: dest || undefined,
    vesselFlight: vesselFlight || undefined,
    commodity: commodity || undefined,
    hawbNumber: hawb || undefined,
    mawbNumber: mawb || undefined,
    pieces: pieces || undefined,
    grossWeight: gross || undefined,
    chargeableWeight: chargeable || undefined,
    volumeCbm: volume || undefined,
    freightType: freight || undefined,
    currencyCode: pickString(preview.currency_code) || undefined,
    incoterm: freight || undefined,
    tableHeaders: tableRows.length
      ? ['Nature and quantity of goods', 'Pieces', 'Gross wt', 'Chg wt', 'Volume']
      : undefined,
    tableRows: tableRows.length ? tableRows : undefined,
  };
}
