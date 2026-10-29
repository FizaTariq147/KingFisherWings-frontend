import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { asRecord, pickString } from '@/features/portal-shared/normalize';
import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import { resolveCatalogContextPdfData } from '@/features/reports/utils/resolveCatalogContextPdfData';
import { sanitizeHtml2CanvasClone } from '@/features/reports/utils/html2canvasSafeColors';
import { shouldAppendCustomerTermsPage } from '@/features/reports/utils/shouldAppendCustomerTermsPage';
import { appendOfficialCustomerTermsPdf } from '@/features/reports/utils/appendOfficialCustomerTermsPdf';
import {
  BlDraftClassicDocument,
  type BlDraftClassicModel,
} from './BlDraftClassicDocument';

/** Fresa sample `fg_hbl_hkg_rpm_ref_245.pdf` format code. */
export const BL_DRAFT_FORMAT_CODE = 'FG_HBL_HKG';

function linesFromParty(raw: unknown): string[] {
  const rec = asRecord(raw);
  if (!rec) {
    if (typeof raw === 'string' && raw.trim()) {
      return raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
    }
    return [];
  }
  const name = pickString(rec.name, rec.party_name, rec.partyName, rec.company_name, rec.companyName);
  const address = pickString(
    rec.address,
    rec.full_address,
    rec.fullAddress,
    rec.address_line1,
    rec.addressLine1,
  );
  const city = pickString(rec.city, rec.city_name, rec.cityName);
  const country = pickString(rec.country, rec.country_name, rec.countryName, rec.country_code);
  const lines = [
    name,
    address,
    pickString(rec.address_line2, rec.addressLine2),
    [city, pickString(rec.state, rec.state_name), pickString(rec.postal_code, rec.postalCode)]
      .filter(Boolean)
      .join(' '),
    country,
  ]
    .map((l) => String(l || '').trim())
    .filter(Boolean);
  if (lines.length) return lines;
  const nested = asRecord(rec.party) ?? asRecord(rec.organization);
  return nested ? linesFromParty(nested) : [];
}

function partyBlock(preview: Record<string, unknown>, keys: string[]): string[] {
  for (const key of keys) {
    const lines = linesFromParty(preview[key]);
    if (lines.length) return lines;
  }
  return [];
}

function strList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === 'string' ? v : pickString(asRecord(v)?.name, asRecord(v)?.line)))
      .map((s) => String(s || '').trim())
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

function firstNonEmpty(...lists: string[][]): string[] {
  for (const list of lists) {
    if (list.length) return list;
  }
  return [];
}

function containerRowsFromPreview(
  preview: Record<string, unknown>,
  commodity: string,
  freight: string,
): BlDraftClassicModel['containerRows'] {
  const raw =
    preview.containers ??
    preview.container_list ??
    preview.containerList ??
    preview.cargo_containers ??
    preview.units;
  const list = Array.isArray(raw) ? raw : [];
  if (!list.length) return [];

  return list.map((item) => {
    const c = asRecord(item) ?? {};
    const number = pickString(c.container_no, c.containerNo, c.container_number, c.number, c.no);
    const seal = pickString(c.seal_no, c.sealNo, c.seal_number, c.seal);
    const type = pickString(c.container_type, c.containerType, c.type, c.size) || "20' DC";
    const pkgs = pickString(
      c.packages,
      c.pkgs,
      c.no_of_packages,
      c.pieces,
      c.package_count,
      preview.pieces,
      preview.packages,
    );
    const weight = pickString(
      c.gross_weight,
      c.grossWeight,
      c.weight,
      c.gross_weight_kg,
      preview.gross_weight,
      preview.gross_weight_kg,
    );
    const cbm = pickString(
      c.measurement,
      c.volume_cbm,
      c.volumeCbm,
      c.cbm,
      preview.volume_cbm,
      preview.measurement,
    );
    const marks = pickString(c.marks, c.marks_numbers, c.marksNumbers) || 'NIL MARKS';
    return {
      marks: [number || '—', seal ? `SEAL NO. : ${seal}` : '', type ? `${type} X 1` : '', marks]
        .filter(Boolean)
        .join(' / '),
      packages: pkgs ? `${pkgs} PACKAGES` : '—',
      description: [
        commodity ? `FCL STC: ${commodity}` : 'FCL STC: AS PER BOOKING FORM',
        `FREIGHT ${freight}`.toUpperCase(),
        "ALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
      ].join('\n'),
      weight: weight ? `${weight} KGS` : '—',
      measurement: cbm ? `${cbm} CBM` : '—',
    };
  });
}

function containersInWords(rows: BlDraftClassicModel['containerRows']): string {
  if (!rows.length) return '—';
  if (rows.length === 1) {
    const typeMatch = rows[0].marks.match(/(\d+'\s*[A-Z]+)/i);
    const type = typeMatch?.[1] || 'CONTAINER';
    return `ONE(1X${type}) CONTAINER ONLY`;
  }
  return `${rows.length} CONTAINERS ONLY`;
}

/** Map BL-draft preview + job/shipment context onto classic HBL form fields. */
export function buildBlDraftClassicModel(
  previewRaw: unknown,
  contextData: InvoiceFormatPdfData = {},
): BlDraftClassicModel {
  const preview = asRecord(previewRaw) ?? asRecord(asRecord(previewRaw)?.data) ?? {};
  const shipperLines = firstNonEmpty(
    partyBlock(preview, ['shipper', 'shipper_party', 'shipperParty', 'exporterer', 'party_shipper']),
    strList(preview.shipper_name || preview.shipperName),
    contextData.shipperLines || [],
  );
  const consigneeLines = firstNonEmpty(
    partyBlock(preview, ['consignee', 'consignee_party', 'consigneeParty', 'party_consignee']),
    strList(preview.consignee_name || preview.consigneeName),
    contextData.consigneeLines || [],
  );
  const notifyLines = firstNonEmpty(
    partyBlock(preview, ['notify', 'notify_party', 'notifyParty', 'party_notify']),
    strList(preview.notify_name || preview.notifyName),
    contextData.notifyLines || [],
    consigneeLines,
  );

  const blNumber =
    pickString(
      preview.bl_number,
      preview.blNumber,
      preview.hbl_number,
      preview.hblNumber,
      preview.bill_of_lading_no,
      preview.document_number,
      contextData.referenceNo,
      contextData.shipmentNumber,
      contextData.jobNumber,
    ) || 'DRAFT';
  const jobRef =
    pickString(
      preview.job_number,
      preview.jobNumber,
      preview.job_ref,
      preview.jobRef,
      contextData.jobNumber,
    ) || '—';
  const pol =
    pickString(
      preview.place_of_receipt,
      preview.placeOfReceipt,
      preview.pol,
      preview.port_of_loading,
      preview.portOfLoading,
      contextData.pol,
    ) || '—';
  const pod =
    pickString(
      preview.place_of_delivery,
      preview.placeOfDelivery,
      preview.pod,
      preview.port_of_discharge,
      preview.portOfDischarge,
      contextData.pod,
    ) || '—';
  const vessel =
    pickString(
      preview.vessel_voyage,
      preview.vesselVoyage,
      [
        pickString(preview.vessel, preview.vessel_name, preview.vesselName),
        pickString(preview.voyage, preview.voyage_no, preview.voyageNo),
      ]
        .filter(Boolean)
        .join('/'),
      contextData.vesselFlight,
    ) || '—';
  const freight =
    pickString(preview.freight_terms, preview.freightTerms, preview.freight) || 'PREPAID';
  const payableAt = pickString(preview.payable_at, preview.payableAt, pol) || pol;
  const commodity =
    pickString(
      preview.commodity,
      preview.goods_description,
      preview.goodsDescription,
      preview.description_of_goods,
      contextData.commodity,
    ) || '';
  const onboard =
    pickString(preview.onboard_date, preview.onboardDate, preview.etd, contextData.etd) || '—';
  const issuePlace = pickString(preview.place_of_issue, preview.placeOfIssue, preview.issue_place, pol);
  const issueDate =
    pickString(
      preview.date_of_issue,
      preview.dateOfIssue,
      preview.issue_date,
      contextData.invoiceDate,
    ) || '—';
  const rows = containerRowsFromPreview(preview, commodity, freight);
  const companyName = contextData.companyName?.trim() || 'KingFisher Wings';
  const agentLines = [
    contextData.companyAddress,
    contextData.companyPhone ? `Tel: ${contextData.companyPhone}` : '',
    contextData.companyEmail ? `Email: ${contextData.companyEmail}` : '',
  ]
    .map((l) => String(l || '').trim())
    .filter(Boolean);

  return {
    blNumber,
    jobRef,
    agentName: companyName,
    agentLines,
    preparedBy: pickString(preview.prepared_by, preview.preparedBy, preview.created_by_name) || '—',
    shipperLines,
    consigneeLines,
    notifyLines,
    placeOfReceipt: pol,
    portOfLoading: pickString(preview.port_of_loading, preview.portOfLoading, preview.pol, pol) || pol,
    preCarriage: pickString(preview.pre_carriage, preview.preCarriage, preview.pre_carriage_by) || '—',
    vesselVoyage: vessel,
    portOfDischarge: pickString(preview.port_of_discharge, preview.portOfDischarge, preview.pod, pod) || pod,
    placeOfDelivery: pod,
    numberOfBls: pickString(preview.number_of_bls, preview.numberOfBls, preview.originals) || '1(ONE)',
    containerRows: rows,
    totalInWords: pickString(preview.total_in_words, preview.totalInWords) || containersInWords(rows),
    onboardDate: onboard,
    freightDetails: `FREIGHT ${freight.toUpperCase()} PAYABLE AT : ${payableAt} AS ARRANGED`,
    placeAndDateOfIssue: [issuePlace, issueDate].filter((x) => x && x !== '—').join(' ') || '—',
    carrierName:
      pickString(preview.carrier_name, preview.carrierName, preview.carrier, preview.shipping_line) ||
      '—',
    companyName,
  };
}

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'));
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

async function renderClassicBlDraftPdf(model: BlDraftClassicModel): Promise<Blob> {
  const cssWidth = 794;
  const host = document.createElement('div');
  host.setAttribute('data-bl-draft-pdf-capture', 'true');
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
    root.render(createElement(BlDraftClassicDocument, { model }));
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    await waitForImages(mount);
    await wait(80);

    const sheet =
      (mount.querySelector('[data-bl-draft-sheet]') as HTMLElement) || mount;
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
    const margin = 12;
    const usableW = pageW - margin * 2;
    const usableH = pageH - margin * 2;
    const scale = Math.min(usableW / canvas.width, usableH / canvas.height);
    const drawW = canvas.width * scale;
    const drawH = canvas.height * scale;
    const x = margin + (usableW - drawW) / 2;
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', x, margin, drawW, drawH);
    const layoutBlob = pdf.output('blob');

    if (!shouldAppendCustomerTermsPage(BL_DRAFT_FORMAT_CODE)) return layoutBlob;
    return appendOfficialCustomerTermsPdf(layoutBlob, {
      kind: 'bl',
      formatCode: BL_DRAFT_FORMAT_CODE,
    });
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
 * Client BL draft PDF matching Fresa `fg_hbl_hkg_rpm_ref_245.pdf` form layout
 * with KingFisher logo.
 */
export async function generateBlDraftPdf(opts: {
  jobId?: string;
  shipmentId?: string;
  quotationId?: string;
  preview?: unknown;
  fileNameHint?: string;
}): Promise<{ blob: Blob; fileName: string; model: BlDraftClassicModel }> {
  const context = await resolveCatalogContextPdfData({
    job_id: opts.jobId,
    shipment_id: opts.shipmentId,
    quotation_id: opts.quotationId,
  });
  const model = buildBlDraftClassicModel(opts.preview, context);
  const blob = await renderClassicBlDraftPdf(model);
  const fileName = formatPdfFilename(
    opts.fileNameHint || model.blNumber || model.jobRef || 'HBL-draft',
    'HBL-draft',
  );
  return { blob, fileName, model };
}
