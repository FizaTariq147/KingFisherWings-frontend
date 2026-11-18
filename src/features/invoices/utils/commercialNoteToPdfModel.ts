import type { Job } from '@/features/jobs/types/job.types';
import type { Party } from '@/features/parties/types/party.types';
import type {
  InvoicePdfChargeLine,
  InvoicePdfCompany,
  InvoicePdfModel,
  InvoicePdfShipment,
} from './generateInvoicePdf';
import { shipmentFromJob } from './invoiceToPdfModel';

export type CommercialNoteKind = 'credit' | 'debit';

export type CommercialNotePdfSource = {
  id: string;
  invoice_number?: string;
  credit_note_number?: string;
  debit_note_number?: string;
  credited_invoice_id?: string;
  credited_invoice_number?: string;
  party_id?: string;
  party_name?: string;
  job_id?: string;
  currency_code?: string;
  vat_rate?: number;
  invoice_date?: string;
  due_date?: string;
  remarks?: string;
  subtotal?: number;
  tax_total?: number;
  total_amount?: number;
  paid_amount?: number;
  outstanding_balance?: number;
  lines?: Array<{
    description?: string;
    charge_code?: string;
    quantity?: number;
    unit_price?: number;
    tax_amount?: number;
    line_total?: number;
  }>;
};

export type CommercialNotePdfEnrichment = {
  party?: Party | null;
  job?: Job | null;
  company?: InvoicePdfCompany;
  attn?: string;
  shipment?: InvoicePdfShipment | null;
  displayNumber?: string;
};

function primaryContact(party?: Party | null) {
  if (!party?.contacts?.length) return undefined;
  return party.contacts.find((c) => c.is_primary) ?? party.contacts[0];
}

function lineAmount(line: NonNullable<CommercialNotePdfSource['lines']>[number]): number {
  if (line.line_total != null && Number.isFinite(line.line_total)) return line.line_total;
  const qty = line.quantity ?? 0;
  const price = line.unit_price ?? 0;
  const tax = line.tax_amount ?? 0;
  return qty * price + tax;
}

function chargeLines(
  note: CommercialNotePdfSource,
  job?: Job | null,
): InvoicePdfChargeLine[] {
  const route =
    job && (job.origin_port_code || job.dest_port_code)
      ? [job.origin_port_code, job.dest_port_code].filter(Boolean).join(' -> ')
      : undefined;

  return (note.lines ?? []).map((line) => ({
    description: line.description || line.charge_code || 'Charge',
    detail: route,
    qty: line.quantity,
    unit: (line.quantity ?? 0) === 1 ? 'Lot' : 'Unit',
    rate: line.unit_price,
    amount: lineAmount(line),
  }));
}

function labelsFor(kind: CommercialNoteKind) {
  if (kind === 'debit') {
    return {
      documentTitle: 'DEBIT NOTE',
      documentSubtitle: 'DEBIT NOTE / STATEMENT OF CHARGES',
      detailsSectionTitle: 'DEBIT NOTE DETAILS',
      numberLabel: 'Debit Note #',
      dateLabel: 'Debit Note Date',
      dueDateLabel: 'Due Date',
      jobRefLabel: 'P.O.#',
    };
  }
  return {
    documentTitle: 'CREDIT NOTE',
    documentSubtitle: 'CREDIT NOTE / STATEMENT OF CHARGES',
    detailsSectionTitle: 'CREDIT NOTE DETAILS',
    numberLabel: 'Credit Note #',
    dateLabel: 'Credit Note Date',
    dueDateLabel: 'Due Date',
    jobRefLabel: 'P.O.#',
  };
}

/**
 * Map staff credit/debit note → KingFisher commercial-note body
 * (invoice header/footer + CUSTOMER / SHIP TO / QTY table face).
 */
export function commercialNoteToPdfModel(
  note: CommercialNotePdfSource,
  kind: CommercialNoteKind,
  enrichment: CommercialNotePdfEnrichment = {},
): InvoicePdfModel {
  const { party, job, company, attn, shipment: shipmentOverride, displayNumber } = enrichment;
  const contact = primaryContact(party);
  const labels = labelsFor(kind);
  const vatRate = note.vat_rate != null ? Number(note.vat_rate) : 0;
  const subtotal = note.subtotal ?? 0;
  const vatAmount = note.tax_total ?? 0;
  const grand = note.total_amount ?? subtotal + vatAmount;
  const advance = note.paid_amount ?? 0;
  const balance =
    note.outstanding_balance != null
      ? note.outstanding_balance
      : Math.max(0, grand - advance);

  const number =
    displayNumber ||
    (kind === 'debit'
      ? note.debit_note_number || note.invoice_number
      : note.credit_note_number || note.invoice_number) ||
    note.id;

  const addressLines = party?.address
    ? [party.address]
    : party?.addresses?.[0]
      ? ([
          party.addresses[0].address_line1,
          party.addresses[0].address_line2,
          [party.addresses[0].city, party.addresses[0].country_code]
            .filter(Boolean)
            .join(', '),
        ].filter(Boolean) as string[])
      : undefined;

  const billTo = {
    client: party?.name || note.party_name || '—',
    attn: attn || contact?.name || undefined,
    phone: party?.phone || contact?.phone || contact?.mobile || undefined,
    email: party?.email || contact?.email || undefined,
    vatNumber: party?.vat_number,
    addressLines,
  };

  const shipment = shipmentOverride ?? shipmentFromJob(job);
  const shipToAddress = [
    shipment?.pod,
    shipment?.pol ? `From ${shipment.pol}` : '',
    shipment?.containerNo ? `Container ${shipment.containerNo}` : '',
  ].filter(Boolean) as string[];

  return {
    invoiceNumber: number,
    invoiceDate: note.invoice_date,
    dueDate: note.due_date,
    jobRef:
      note.credited_invoice_number ||
      job?.job_number ||
      note.credited_invoice_id ||
      note.job_id ||
      undefined,
    currencyCode: note.currency_code || 'AED',
    vatRate,
    copyLabel: 'ORIGINAL',
    layout: 'commercial_note',
    hideAdvanceBalance: true,
    ...labels,
    jobRefLabel:
      note.credited_invoice_number || note.credited_invoice_id
        ? 'Related Invoice'
        : labels.jobRefLabel,
    billTo,
    shipTo: {
      client: billTo.client,
      attn: billTo.attn,
      phone: billTo.phone,
      email: billTo.email,
      addressLines: shipToAddress.length ? shipToAddress : addressLines,
    },
    shipment,
    lines: chargeLines(note, job),
    subtotal,
    discount: 0,
    taxableAmount: subtotal,
    vatAmount,
    otherCharges: 0,
    grandTotal: grand,
    advanceReceived: advance,
    balanceDue: balance,
    remarks: note.remarks,
    company,
  };
}
