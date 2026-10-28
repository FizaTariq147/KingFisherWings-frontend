import { createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { asRecord, pickString } from '@/features/portal-shared/normalize';
import { resolveCatalogContextPdfData } from '@/features/reports/utils/resolveCatalogContextPdfData';
import { sanitizeHtml2CanvasClone } from '@/features/reports/utils/html2canvasSafeColors';
import { shouldAppendCustomerTermsPage } from '@/features/reports/utils/shouldAppendCustomerTermsPage';
import { appendOfficialCustomerTermsPdf } from '@/features/reports/utils/appendOfficialCustomerTermsPdf';
import {
  AwbDraftClassicDocument,
  type AwbDraftClassicModel,
} from './AwbDraftClassicDocument';
import { bookingFormToAwbDraftPreview } from './loadAwbDraftSource';

export const HAWB_DRAFT_FORMAT_CODE = 'HAWB_DRAFT_REPORT_FORMAT_1';
export const MAWB_DRAFT_FORMAT_CODE = 'MAWB_DRAFT_REPORT_FORMAT';

function strList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === 'string' ? v.trim() : pickString(asRecord(v)?.line, asRecord(v)?.name)))
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

function formatAwbNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return raw.trim();
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => window.setTimeout(r, ms));
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = [...root.querySelectorAll('img')];
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        }),
    ),
  );
}

export function previewToAwbClassicModel(
  previewRaw: unknown,
  kind: 'hawb' | 'mawb',
  context?: Awaited<ReturnType<typeof resolveCatalogContextPdfData>>,
): AwbDraftClassicModel {
  const preview = bookingFormToAwbDraftPreview(previewRaw);
  const ctx = context ?? {};
  const hawb = pickString(preview.hawb_number, ctx.hawbNumber);
  const mawb = pickString(preview.mawb_number, ctx.mawbNumber);
  const awbNumber = kind === 'mawb' ? mawb || hawb : hawb || mawb;
  const origin = pickString(
    preview.origin_airport_code,
    preview.pol,
    ctx.originAirport,
    ctx.pol,
  );
  const dest = pickString(preview.dest_airport_code, preview.pod, ctx.destAirport, ctx.pod);
  const flight = pickString(preview.flight_number);
  const flightDate = pickString(preview.flight_date, preview.etd, ctx.etd);
  const freight = pickString(preview.freight_type, preview.freight_terms, ctx.freightType).toUpperCase();
  const prepaid = !freight || freight.includes('PRE');
  const pieces = pickString(preview.pieces, ctx.pieces);
  const gross = pickString(preview.gross_weight, preview.gross_weight_kg, ctx.grossWeight);
  const chg = pickString(
    preview.chargeable_weight,
    preview.chargeable_weight_kg,
    ctx.chargeableWeight,
  );
  const volume = pickString(preview.volume_cbm, ctx.volumeCbm);
  const commodity = pickString(preview.commodity, ctx.commodity);
  const currency = pickString(preview.currency_code, ctx.currencyCode) || 'AED';

  const shipperLines = strList(preview.shipper_lines);
  const consigneeLines = strList(preview.consignee_lines);
  const agentLines = strList(preview.notify_lines);
  const issuedBy =
    pickString(preview.agent_at_origin, preview.agentAtOrigin) ||
    shipperLines[0] ||
    'Issuing Carrier';

  const natureParts = [
    commodity,
    volume ? `VOL ${volume} CBM` : '',
    pieces ? `${pieces} PCS` : '',
    gross ? `G.W. ${gross} KG` : '',
  ].filter(Boolean);

  return {
    kind,
    awbNumber: awbNumber || '',
    awbNumberDisplay: awbNumber ? formatAwbNumber(awbNumber) : '—',
    issuedBy,
    issuedByLines: issuedBy ? [issuedBy] : [],
    shipperAccount: '',
    shipperLines: shipperLines.length ? shipperLines : strList(ctx.shipperLines),
    consigneeAccount: '',
    consigneeLines: consigneeLines.length ? consigneeLines : strList(ctx.consigneeLines),
    agentName: agentLines[0] || pickString(preview.agent_at_origin) || '',
    agentCity: agentLines[1] || '',
    agentIataCode: '',
    agentAccount: '',
    accountingInfo: freight ? `MODE OF PAYMENT: ${freight}` : '',
    airportOfDeparture: origin || '',
    to1: dest.slice(0, 3).toUpperCase() || '',
    byFirstCarrier: flight ? flight.slice(0, 2).toUpperCase() : '',
    to2: '',
    by2: '',
    to3: '',
    by3: '',
    currency,
    chgsCode: prepaid ? 'PP' : 'CC',
    wtValPpd: prepaid ? 'X' : '',
    wtValColl: prepaid ? '' : 'X',
    otherPpd: prepaid ? 'X' : '',
    otherColl: prepaid ? '' : 'X',
    declaredValueCarriage: 'NVD',
    declaredValueCustoms: 'NCV',
    airportOfDestination: dest || '',
    requestedFlightDate: [flight, flightDate].filter(Boolean).join('/') || '',
    amountOfInsurance: 'XXX',
    handlingInformation: pickString(preview.delivery_address, preview.deliveryAddress) || '',
    sci: '',
    pieces: pieces || '',
    grossWeight: gross || '',
    weightUnit: 'K',
    rateClass: '',
    commodityItemNo: '',
    chargeableWeight: chg || '',
    rateCharge: '',
    totalCharge: '',
    natureAndQuantity: natureParts.join('\n') || '',
    otherCharges: '',
    weightChargePrepaid: prepaid ? '' : '',
    weightChargeCollect: '',
    valuationCharge: '',
    tax: '',
    totalOtherDueAgent: '',
    totalOtherDueCarrier: '',
    totalPrepaid: '',
    totalCollect: '',
    shipperSignature: '',
    executedOn: flightDate || '',
    executedAt: origin || '',
    carrierSignature: '',
  };
}

async function renderClassicAwbDraftPdf(model: AwbDraftClassicModel): Promise<Blob> {
  const cssWidth = 794;
  const host = document.createElement('div');
  host.setAttribute('data-awb-draft-pdf-capture', 'true');
  host.style.cssText = [
    'position:fixed',
    'left:-12000px',
    'top:0',
    `width:${cssWidth}px`,
    'background:#ffffff',
    'z-index:-1',
    'pointer-events:none',
  ].join(';');
  const mount = document.createElement('div');
  mount.style.cssText = 'width:100%;background:#ffffff;';
  host.appendChild(mount);
  document.body.appendChild(host);

  let root: Root | null = null;
  try {
    root = createRoot(mount);
    root.render(createElement(AwbDraftClassicDocument, { model }) as ReactNode);
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    await waitForImages(mount);
    await wait(80);

    const sheet =
      (mount.querySelector('[data-awb-draft-sheet]') as HTMLElement) || mount;
    sanitizeHtml2CanvasClone(document, sheet);
    const canvas = await html2canvas(sheet, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: cssWidth,
      foreignObjectRendering: false,
      onclone: (clonedDoc, clonedElement) => {
        sanitizeHtml2CanvasClone(clonedDoc, clonedElement);
      },
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true,
    });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const usableW = pageW - margin * 2;
    const usableH = pageH - margin * 2;
    const scale = Math.min(usableW / canvas.width, usableH / canvas.height);
    const drawW = canvas.width * scale;
    const drawH = canvas.height * scale;
    const x = margin + (usableW - drawW) / 2;
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', x, margin, drawW, drawH);
    const layoutBlob = pdf.output('blob');

    const formatCode =
      model.kind === 'mawb' ? MAWB_DRAFT_FORMAT_CODE : HAWB_DRAFT_FORMAT_CODE;
    if (!shouldAppendCustomerTermsPage(formatCode)) return layoutBlob;
    return appendOfficialCustomerTermsPdf(layoutBlob);
  } finally {
    try {
      root?.unmount();
    } catch {
      /* ignore */
    }
    host.remove();
  }
}

/**
 * Client AWB draft PDF matching IATA laser AWB face (sample 176-10621623 mawb.pdf).
 * No KingFisher logo on the face; T&C appended as original PDF fonts.
 */
export async function generateAwbDraftPdf(opts: {
  jobId?: string;
  shipmentId?: string;
  quotationId?: string;
  preview?: unknown;
  documentKind?: 'hawb' | 'mawb';
  fileNameHint?: string;
}): Promise<{ blob: Blob; fileName: string; model: AwbDraftClassicModel }> {
  const kind = opts.documentKind ?? 'hawb';
  const context = await resolveCatalogContextPdfData({
    job_id: opts.jobId,
    shipment_id: opts.shipmentId,
    quotation_id: opts.quotationId,
  });
  const model = previewToAwbClassicModel(opts.preview ?? {}, kind, context);
  const blob = await renderClassicAwbDraftPdf(model);
  const base =
    opts.fileNameHint ||
    `${kind.toUpperCase()}-draft-${(model.awbNumber || opts.jobId || 'doc').slice(0, 12)}`;
  return {
    blob,
    fileName: formatPdfFilename(base),
    model,
  };
}
