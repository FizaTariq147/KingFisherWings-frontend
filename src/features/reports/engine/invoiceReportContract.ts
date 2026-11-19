import type { Invoice, InvoiceLine } from '@/features/invoices/types/invoice.types';
import type { Job } from '@/features/jobs/types/job.types';
import type { OrganizationProfile } from '@/features/organization/types/organization.types';
import type { Party } from '@/features/parties/types/party.types';

/** Values the invoice spec renderer may read. Missing fields stay empty strings. */
export interface InvoiceReportSources {
  invoice?: Invoice | null;
  job?: Job | null;
  party?: Party | null;
  organization?: Pick<
    OrganizationProfile,
    'name' | 'display_name' | 'address' | 'city' | 'country_code' | 'phone' | 'email' | 'website' | 'logo_url'
  > | null;
}

export interface InvoiceReportValues {
  company: { name: string; address: string; phone: string; email: string; website: string; logoUrl: string };
  party: { billTo: string; shipper: string; consignee: string; notify: string };
  job: { number: string };
  invoice: {
    number: string;
    date: string;
    currency: string;
    amount: string;
    tax: string;
    total: string;
  };
  shipment: {
    mawb: string;
    hawb: string;
    hbl: string;
    mbl: string;
    pol: string;
    pod: string;
    placeOfReceipt: string;
    placeOfDelivery: string;
    finalDestination: string;
    vessel: string;
    voyage: string;
    etd: string;
    eta: string;
    carrier: string;
    freightTerms: string;
    serviceType: string;
  };
  cargo: {
    description: string;
    marks: string;
    pieces: string;
    grossWeight: string;
    netWeight: string;
    measurement: string;
    containerNo: string;
    containerType: string;
    sealNo: string;
  };
  lines: Array<{ description: string; quantity: string; rate: string; amount: string }>;
}

function text(value: unknown): string {
  if (value == null) return '';
  const rendered = String(value).trim();
  return rendered;
}

function numberText(value: unknown): string {
  if (value == null || value === '') return '';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : '';
}

function joinAddress(parts: Array<string | undefined>): string {
  return parts.map((part) => text(part)).filter(Boolean).join(', ');
}

export function invoiceReportValues(sources: InvoiceReportSources): InvoiceReportValues {
  const invoice = sources.invoice;
  const job = sources.job;
  const party = sources.party;
  const organization = sources.organization;
  const seaFcl = job?.sea_fcl_details;
  const seaLcl = job?.sea_lcl_details;
  const sea = seaFcl || seaLcl;
  const air = job?.air_details;
  const container = job?.containers?.[0];
  const cargo = job?.cargo?.[0];
  const lines = (invoice?.lines || []).map((line: InvoiceLine) => ({
    description: text(line.description),
    quantity: numberText(line.quantity),
    rate: numberText(line.unit_price),
    amount: numberText(line.line_total),
  }));

  return {
    company: {
      name: text(organization?.display_name) || text(organization?.name),
      address: joinAddress([organization?.address, organization?.city, organization?.country_code]),
      phone: text(organization?.phone),
      email: text(organization?.email),
      website: text(organization?.website),
      logoUrl: text(organization?.logo_url),
    },
    party: {
      billTo: joinAddress([text(invoice?.party_name) || text(party?.name), party?.address, party?.city, party?.country_code]),
      shipper: text(job?.shipper_name),
      consignee: text(job?.consignee_name),
      notify: '',
    },
    job: { number: text(invoice?.job_number) || text(job?.job_number) },
    invoice: {
      number: text(invoice?.invoice_number),
      date: text(invoice?.invoice_date),
      currency: text(invoice?.currency_code),
      amount: numberText(invoice?.subtotal),
      tax: numberText(invoice?.tax_total),
      total: numberText(invoice?.total_amount),
    },
    shipment: {
      mawb: text(air?.mawb_number),
      hawb: text(air?.hawb_number),
      hbl: text(sea?.hbl_number),
      mbl: text(sea?.mbl_number),
      pol: text(job?.origin_port_code),
      pod: text(job?.dest_port_code),
      placeOfReceipt: text(sea?.place_of_receipt),
      placeOfDelivery: text(sea?.place_of_delivery),
      finalDestination: text(job?.dest_door_address),
      vessel: text(job?.vessel_name) || text(sea?.vessel_name),
      voyage: text(job?.voyage_number) || text(sea?.voyage_number),
      etd: text(job?.etd) || text(sea?.etd),
      eta: text(job?.eta) || text(sea?.eta),
      carrier: text(seaFcl?.shipping_line_name),
      freightTerms: text(sea?.freight_terms),
      serviceType: text(job?.service_scope),
    },
    cargo: {
      description: text(job?.commodity_description) || text(cargo?.description) || text(job?.commodity),
      marks: text(cargo?.marks_numbers),
      pieces: numberText(job?.pieces),
      grossWeight: numberText(job?.gross_weight),
      netWeight: '',
      measurement: numberText(job?.volume_cbm),
      containerNo: text(job?.primary_container_number) || text(container?.container_number),
      containerType: text(container?.container_type_code),
      sealNo: text(container?.seal_number),
    },
    lines,
  };
}

const PATHS: Record<string, (values: InvoiceReportValues) => string> = {
  'company.name': (values) => values.company.name,
  'company.address': (values) => values.company.address,
  'company.phone': (values) => values.company.phone,
  'company.email': (values) => values.company.email,
  'party.billTo': (values) => values.party.billTo,
  'party.shipper': (values) => values.party.shipper,
  'party.consignee': (values) => values.party.consignee,
  'party.notify': (values) => values.party.notify,
  'job.number': (values) => values.job.number,
  'invoice.number': (values) => values.invoice.number,
  'invoice.date': (values) => values.invoice.date,
  'invoice.currency': (values) => values.invoice.currency,
  'invoice.amount': (values) => values.invoice.amount,
  'invoice.tax': (values) => values.invoice.tax,
  'invoice.total': (values) => values.invoice.total,
  'shipment.mawb': (values) => values.shipment.mawb,
  'shipment.hawb': (values) => values.shipment.hawb,
  'shipment.hbl': (values) => values.shipment.hbl,
  'shipment.mbl': (values) => values.shipment.mbl,
  'shipment.pol': (values) => values.shipment.pol,
  'shipment.pod': (values) => values.shipment.pod,
  'shipment.placeOfReceipt': (values) => values.shipment.placeOfReceipt,
  'shipment.placeOfDelivery': (values) => values.shipment.placeOfDelivery,
  'shipment.finalDestination': (values) => values.shipment.finalDestination,
  'shipment.vessel': (values) => values.shipment.vessel,
  'shipment.voyage': (values) => values.shipment.voyage,
  'shipment.etd': (values) => values.shipment.etd,
  'shipment.eta': (values) => values.shipment.eta,
  'shipment.carrier': (values) => values.shipment.carrier,
  'shipment.freightTerms': (values) => values.shipment.freightTerms,
  'shipment.serviceType': (values) => values.shipment.serviceType,
  'cargo.description': (values) => values.cargo.description,
  'cargo.marks': (values) => values.cargo.marks,
  'cargo.pieces': (values) => values.cargo.pieces,
  'cargo.grossWeight': (values) => values.cargo.grossWeight,
  'cargo.netWeight': (values) => values.cargo.netWeight,
  'cargo.measurement': (values) => values.cargo.measurement,
  'cargo.containerNo': (values) => values.cargo.containerNo,
  'cargo.containerType': (values) => values.cargo.containerType,
  'cargo.sealNo': (values) => values.cargo.sealNo,
};

/** Bound paths whose current models have no column. The value stays blank. */
export const invoiceBindingsWithoutSource = ['party.notify', 'cargo.netWeight'] as const;

export function valueForInvoiceBinding(path: string, sources: InvoiceReportSources): string {
  const read = PATHS[path];
  if (!read) return '';
  return read(invoiceReportValues(sources));
}
