import type { Job } from '@/features/jobs/types/job.types';
import type { Party } from '@/features/parties/types/party.types';
import type { PortalShipmentDetail } from '@/features/portal-shipments/types/portalShipments.types';
import type { Invoice, InvoiceLine } from '../types/invoice.types';
import { invoiceDisplayNumber } from './normalizeInvoice';
import type {
  InvoicePdfChargeLine,
  InvoicePdfCompany,
  InvoicePdfModel,
  InvoicePdfShipment,
} from './generateInvoicePdf';

export type InvoicePdfEnrichment = {
  party?: Party | null;
  job?: Job | null;
  company?: InvoicePdfCompany;
  /** Override Bill To contact from primary party contact when present. */
  attn?: string;
  shipment?: InvoicePdfShipment | null;
};

function primaryContact(party?: Party | null) {
  if (!party?.contacts?.length) return undefined;
  return party.contacts.find((c) => c.is_primary) ?? party.contacts[0];
}

function lineAmount(line: InvoiceLine): number {
  if (line.line_total != null && Number.isFinite(line.line_total)) return line.line_total;
  const qty = line.quantity ?? 0;
  const price = line.unit_price ?? 0;
  const tax = line.tax_amount ?? 0;
  return qty * price + tax;
}

function inferUnit(line: InvoiceLine): string {
  const code = (line.charge_code || '').toUpperCase();
  if (code.includes('FREIGHT') || code.includes('OCEAN') || code.includes('AIR')) return 'Shipment';
  if ((line.quantity ?? 0) === 1) return 'Lot';
  return 'Unit';
}

function fmtShipDate(raw?: string): string {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw).slice(0, 10);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function portLabel(job: Job, side: 'origin' | 'dest'): string {
  if (side === 'origin') {
    return (
      [job.origin_port_code].filter(Boolean).join(' ') ||
      job.land_details?.origin_city_country ||
      ''
    );
  }
  return (
    [job.dest_port_code].filter(Boolean).join(' ') ||
    job.land_details?.destination_city_country ||
    ''
  );
}

function hasShipmentValues(ship?: InvoicePdfShipment | null): boolean {
  if (!ship) return false;
  return Object.values(ship).some((v) => Boolean(String(v || '').trim()));
}

/** Build shipment block dynamically from a linked job (+ containers / enrichments). */
export function shipmentFromJob(job?: Job | null): InvoicePdfShipment | undefined {
  if (!job) return undefined;
  const air = job.air_details;
  const fcl = job.sea_fcl_details;
  const lcl = job.sea_lcl_details;
  const land = job.land_details;
  const courier = job.courier_details;

  const blAwb =
    air?.mawb_number ||
    air?.hawb_number ||
    fcl?.mbl_number ||
    fcl?.hbl_number ||
    lcl?.mbl_number ||
    lcl?.hbl_number ||
    courier?.tracking_number ||
    '';

  const vesselFlight =
    air?.flight_number ||
    fcl?.vessel_name ||
    lcl?.vessel_name ||
    (fcl?.voyage_number ? `Voy ${fcl.voyage_number}` : '') ||
    (lcl?.voyage_number ? `Voy ${lcl.voyage_number}` : '') ||
    land?.vehicle_number ||
    '';

  const containerNo =
    job.containers
      ?.map((c) => c.container_number)
      .filter(Boolean)
      .join(', ') || '';

  const etd = job.etd || fcl?.etd || lcl?.etd || land?.etd || air?.flight_date;
  const eta = job.eta || fcl?.eta || lcl?.eta || land?.eta;
  const etdEta = [etd, eta]
    .filter(Boolean)
    .map((d) => fmtShipDate(String(d)))
    .filter(Boolean)
    .join(' / ');

  const wt =
    job.gross_weight != null
      ? `${job.gross_weight.toLocaleString('en-US', { maximumFractionDigits: 3 })} kg`
      : '';
  const cbm =
    job.volume_cbm != null
      ? `${job.volume_cbm.toLocaleString('en-US', { maximumFractionDigits: 3 })} CBM`
      : '';
  const grossWtCbm = [wt, cbm].filter(Boolean).join(' / ');

  const shipment: InvoicePdfShipment = {
    blAwb: blAwb || undefined,
    vesselFlight: vesselFlight || undefined,
    pol: portLabel(job, 'origin') || undefined,
    pod: portLabel(job, 'dest') || undefined,
    containerNo: containerNo || undefined,
    etdEta: etdEta || undefined,
    commodity: job.commodity || land?.border_commodity || undefined,
    grossWtCbm: grossWtCbm || undefined,
  };

  return hasShipmentValues(shipment) ? shipment : undefined;
}

/** Map portal shipment detail (and raw payload extras) into invoice PDF shipment fields. */
export function shipmentFromPortalShipment(
  detail?: PortalShipmentDetail | null,
): InvoicePdfShipment | undefined {
  if (!detail) return undefined;
  const raw = (detail.raw ?? {}) as Record<string, unknown>;
  const pick = (...keys: string[]) => {
    for (const key of keys) {
      const v = raw[key];
      if (v != null && String(v).trim()) return String(v).trim();
    }
    return '';
  };

  const blAwb =
    pick(
      'mawb_number',
      'mawbNumber',
      'hawb_number',
      'hawbNumber',
      'mbl_number',
      'mblNumber',
      'hbl_number',
      'hblNumber',
      'bl_number',
      'blNumber',
      'awb_number',
      'awbNumber',
      'tracking_number',
      'trackingNumber',
    ) || detail.reference || '';

  const vesselFlight = pick(
    'flight_number',
    'flightNumber',
    'vessel_name',
    'vesselName',
    'voyage_number',
    'voyageNumber',
    'vehicle_number',
    'vehicleNumber',
  );

  const containerNo = pick(
    'container_number',
    'containerNumber',
    'container_no',
    'containerNo',
    'containers',
  );

  const etdEta = [detail.etd, detail.eta]
    .filter(Boolean)
    .map((d) => fmtShipDate(String(d)))
    .join(' / ');

  const wt =
    detail.grossWeight != null
      ? `${detail.grossWeight.toLocaleString('en-US', { maximumFractionDigits: 3 })} kg`
      : '';
  const cbm =
    detail.volumeCbm != null
      ? `${detail.volumeCbm.toLocaleString('en-US', { maximumFractionDigits: 3 })} CBM`
      : '';

  const shipment: InvoicePdfShipment = {
    blAwb: blAwb || undefined,
    vesselFlight: vesselFlight || undefined,
    pol: detail.origin || undefined,
    pod: detail.destination || undefined,
    containerNo: containerNo || undefined,
    etdEta: etdEta || undefined,
    commodity: detail.cargoSummary || pick('commodity') || undefined,
    grossWtCbm: [wt, cbm].filter(Boolean).join(' / ') || undefined,
  };

  return hasShipmentValues(shipment) ? shipment : undefined;
}

function chargeLines(invoice: Invoice, job?: Job | null): InvoicePdfChargeLine[] {
  const route =
    job && (job.origin_port_code || job.dest_port_code)
      ? [job.origin_port_code, job.dest_port_code].filter(Boolean).join(' -> ')
      : undefined;

  return (invoice.lines ?? []).map((line) => ({
    description: line.description || line.charge_code || 'Charge',
    detail: route,
    qty: line.quantity,
    unit: inferUnit(line),
    rate: line.unit_price,
    amount: lineAmount(line),
  }));
}

/** Map staff invoice (+ optional party/job) into KingFisher tax-invoice PDF model. */
export function invoiceToPdfModel(
  invoice: Invoice,
  enrichment: InvoicePdfEnrichment = {},
): InvoicePdfModel {
  const { party, job, company, attn, shipment: shipmentOverride } = enrichment;
  const contact = primaryContact(party);
  const vatRate = invoice.vat_rate != null ? Number(invoice.vat_rate) : 5;
  const subtotal = invoice.subtotal ?? 0;
  const vatAmount = invoice.tax_total ?? 0;
  const grand = invoice.total_amount ?? subtotal + vatAmount;
  const advance = invoice.paid_amount ?? 0;
  const balance =
    invoice.outstanding_balance != null ? invoice.outstanding_balance : Math.max(0, grand - advance);

  return {
    invoiceNumber: invoiceDisplayNumber(invoice),
    invoiceDate: invoice.invoice_date,
    dueDate: invoice.due_date,
    jobRef: job?.job_number || invoice.job_id || invoice.lpo_number,
    currencyCode: invoice.currency_code || 'AED',
    vatRate,
    copyLabel: 'ORIGINAL',
    billTo: {
      client: party?.name || invoice.party_name || '—',
      attn: attn || contact?.name || undefined,
      phone: party?.phone || contact?.phone || contact?.mobile || undefined,
      email: party?.email || contact?.email || undefined,
      vatNumber: party?.vat_number,
      addressLines: party?.address
        ? [party.address]
        : party?.addresses?.[0]
          ? ([
              party.addresses[0].address_line1,
              party.addresses[0].address_line2,
              [party.addresses[0].city, party.addresses[0].country_code].filter(Boolean).join(', '),
            ].filter(Boolean) as string[])
          : undefined,
    },
    shipment: shipmentOverride ?? shipmentFromJob(job),
    lines: chargeLines(invoice, job),
    subtotal,
    discount: 0,
    taxableAmount: subtotal,
    vatAmount,
    otherCharges: 0,
    grandTotal: grand,
    advanceReceived: advance,
    balanceDue: balance,
    remarks: invoice.remarks,
    company,
  };
}

/** Shared portal/vendor invoice detail → KingFisher tax-invoice PDF model (dynamic from API data). */
export function portalInvoiceToPdfModel(
  detail: {
    number?: string;
    invoiceDate?: string;
    dueDate?: string;
    currencyCode?: string;
    jobId?: string;
    /** Vendor invoices often expose a free-text reference instead of job id. */
    reference?: string;
    subtotal?: number;
    taxTotal?: number;
    totalAmount?: number;
    paidAmount?: number;
    outstandingBalance?: number;
    remarks?: string;
    vatRate?: number;
    lines?: Array<{
      description?: string;
      quantity?: number;
      unitPrice?: number;
      lineTotal?: number;
    }>;
  },
  enrichment: {
    clientName?: string;
    attn?: string;
    phone?: string;
    email?: string;
    company?: InvoicePdfCompany;
    copyLabel?: string;
    documentTitle?: string;
    documentSubtitle?: string;
    detailsSectionTitle?: string;
    numberLabel?: string;
    dateLabel?: string;
    shipment?: InvoicePdfShipment | null;
  } = {},
): InvoicePdfModel {
  const subtotal = detail.subtotal ?? 0;
  const vatAmount = detail.taxTotal ?? 0;
  const grand = detail.totalAmount ?? subtotal + vatAmount;
  const advance = detail.paidAmount ?? 0;
  const balance =
    detail.outstandingBalance != null
      ? detail.outstandingBalance
      : Math.max(0, grand - advance);
  const vatRate =
    detail.vatRate != null && Number.isFinite(detail.vatRate)
      ? Number(detail.vatRate)
      : subtotal > 0 && vatAmount > 0
        ? Math.round((vatAmount / subtotal) * 1000) / 10
        : 5;

  return {
    invoiceNumber: detail.number,
    invoiceDate: detail.invoiceDate,
    dueDate: detail.dueDate,
    jobRef: detail.reference || detail.jobId,
    currencyCode: detail.currencyCode || 'AED',
    vatRate,
    copyLabel: enrichment.copyLabel || 'ORIGINAL',
    documentTitle: enrichment.documentTitle,
    documentSubtitle: enrichment.documentSubtitle,
    detailsSectionTitle: enrichment.detailsSectionTitle,
    numberLabel: enrichment.numberLabel,
    dateLabel: enrichment.dateLabel,
    billTo: {
      client: enrichment.clientName || '—',
      attn: enrichment.attn,
      phone: enrichment.phone,
      email: enrichment.email,
    },
    shipment: enrichment.shipment ?? undefined,
    lines: (detail.lines ?? []).map((line) => ({
      description: line.description || 'Charge',
      qty: line.quantity,
      unit: (line.quantity ?? 0) === 1 ? 'Lot' : 'Unit',
      rate: line.unitPrice,
      amount:
        line.lineTotal != null
          ? line.lineTotal
          : (line.quantity ?? 0) * (line.unitPrice ?? 0),
    })),
    subtotal,
    discount: 0,
    taxableAmount: subtotal,
    vatAmount,
    otherCharges: 0,
    grandTotal: grand,
    advanceReceived: advance,
    balanceDue: balance,
    remarks: detail.remarks,
    company: enrichment.company,
  };
}
