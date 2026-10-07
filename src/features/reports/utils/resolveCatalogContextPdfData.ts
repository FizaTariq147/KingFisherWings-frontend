import { invoiceService } from '@/features/invoices/services/invoice.service';
import { jobService } from '@/features/jobs/services/job.service';
import { partyService } from '@/features/parties/services/party.service';
import { quotationService } from '@/features/quotations/services/quotation.service';
import { fetchTenantCompanyOptions } from '@/features/users/hooks/useTenantCompanies';
import type { ReportContextIds } from './reportParameterUtils';
import {
  invoiceRecordToFormatPdfData,
  quotationRecordToFormatPdfData,
  type InvoiceFormatPdfData,
} from './generateInvoiceFormatLayoutPdf';
import { formatReportLayoutDate } from './formatReportLayoutDate';
import { partyToFormatPdfLines } from './partyToFormatPdfLines';

/** Accept UUID v1–v8 (lib isUuid is v1–v5 only and skips modern v7 ids). */
function isEntityId(value: string | undefined | null): value is string {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

function money(n: number | null | undefined): string | undefined {
  if (n == null || Number.isNaN(Number(n))) return undefined;
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Map a staff job into layout PDF fields (best-effort). */
export function jobRecordToFormatPdfData(job: {
  job_number?: string | null;
  barcode?: string | null;
  barcode_value?: string | null;
  created_at?: string | null;
  etd?: string | null;
  eta?: string | null;
  shipper_id?: string | null;
  shipper_name?: string | null;
  consignee_id?: string | null;
  consignee_name?: string | null;
  origin_port_code?: string | null;
  dest_port_code?: string | null;
  commodity?: string | null;
  currency_code?: string | null;
  carrier_name?: string | null;
}): InvoiceFormatPdfData {
  const origin = job.origin_port_code || undefined;
  const dest = job.dest_port_code || undefined;
  const route = origin || dest ? [origin, dest].filter(Boolean).join(' → ') : undefined;
  const jobNo = job.job_number || undefined;
  const shipperLines = job.shipper_name?.trim() ? [job.shipper_name.trim()] : undefined;
  const consigneeLines = job.consignee_name?.trim()
    ? [job.consignee_name.trim()]
    : undefined;
  return {
    invoiceNumber: jobNo,
    jobNumber: jobNo,
    shipmentNumber: job.barcode || job.barcode_value || undefined,
    invoiceDate: formatReportLayoutDate(job.created_at?.slice(0, 10)),
    etd: formatReportLayoutDate(job.etd),
    eta: formatReportLayoutDate(job.eta),
    billToName: job.consignee_name || job.shipper_name || undefined,
    billToAddress: [route, job.commodity].filter(Boolean).join(' · ') || undefined,
    shipperLines,
    consigneeLines,
    pol: origin,
    pod: dest,
    commodity: job.commodity || undefined,
    vesselFlight: job.carrier_name || undefined,
    currencyCode: job.currency_code || undefined,
  };
}

async function enrichPdfDataFromJobId(
  jobId: string | undefined | null,
  data: InvoiceFormatPdfData,
): Promise<InvoiceFormatPdfData> {
  if (!isEntityId(jobId?.trim())) return data;
  try {
    const job = await jobService.getById(jobId.trim());
    let next = mergePdfData(data, jobRecordToFormatPdfData(job));
    if (isEntityId(job.shipper_id)) {
      try {
        const shipper = await partyService.getById(job.shipper_id);
        const lines = partyToFormatPdfLines(shipper);
        if (lines.length) next = mergePdfData(next, { shipperLines: lines });
      } catch {
        /* keep name-only */
      }
    }
    if (isEntityId(job.consignee_id)) {
      try {
        const consignee = await partyService.getById(job.consignee_id);
        const lines = partyToFormatPdfLines(consignee);
        if (lines.length) {
          next = mergePdfData(next, {
            consigneeLines: lines,
            billToName: consignee.name || next.billToName,
            billToAddress: lines.slice(1).join(', ') || next.billToAddress,
            billToPhone: consignee.phone || next.billToPhone,
            billToEmail: consignee.email || next.billToEmail,
          });
        }
      } catch {
        /* keep name-only */
      }
    }
    return next;
  } catch {
    return data;
  }
}

async function enrichFromPartyId(
  partyId: string | undefined | null,
  role: 'shipper' | 'consignee' | 'billTo',
  data: InvoiceFormatPdfData,
): Promise<InvoiceFormatPdfData> {
  if (!isEntityId(partyId?.trim())) return data;
  try {
    const party = await partyService.getById(partyId.trim());
    const lines = partyToFormatPdfLines(party);
    if (!lines.length) return data;
    if (role === 'shipper') return mergePdfData(data, { shipperLines: lines });
    if (role === 'consignee') {
      return mergePdfData(data, {
        consigneeLines: lines,
        billToName: party.name || data.billToName,
        billToAddress: lines.slice(1).join(', ') || data.billToAddress,
        billToPhone: party.phone || data.billToPhone,
        billToEmail: party.email || data.billToEmail,
      });
    }
    return mergePdfData(data, {
      billToName: party.name || data.billToName,
      billToAddress: lines.slice(1).join(', ') || data.billToAddress,
      billToPhone: party.phone || data.billToPhone,
      billToEmail: party.email || data.billToEmail,
      consigneeLines: data.consigneeLines?.length ? data.consigneeLines : lines,
    });
  } catch {
    return data;
  }
}

/** Freight-forwarder company as Shipper when job shipper is not on the quote/invoice. */
async function enrichShipperFromCompanyId(
  companyId: string | undefined | null,
  data: InvoiceFormatPdfData,
): Promise<InvoiceFormatPdfData> {
  if (data.shipperLines?.length) return data;
  try {
    const companies = await fetchTenantCompanyOptions();
    const match =
      (companyId && isEntityId(companyId)
        ? companies.find((c) => c.id === companyId.trim())
        : undefined) || companies[0];
    const name = match?.name?.trim();
    if (!name) return data;
    return mergePdfData(data, { shipperLines: [name] });
  } catch {
    return data;
  }
}

/** Normalize optional backend format-payload keys onto layout PDF data. */
function normalizeFormatPayload(raw: Record<string, unknown>): InvoiceFormatPdfData {
  const str = (k: string) => {
    const v = raw[k];
    return typeof v === 'string' && v.trim() ? v.trim() : undefined;
  };
  return {
    invoiceNumber: str('invoiceNumber') || str('invoice_number') || str('number'),
    quotationNumber: str('quotationNumber') || str('quotation_number') || str('quote_no'),
    jobNumber: str('jobNumber') || str('job_number') || str('jobRef') || str('job_ref'),
    shipmentNumber: str('shipmentNumber') || str('shipment_number') || str('shipment_no'),
    referenceNo: str('referenceNo') || str('reference_no') || str('lpo_number'),
    invoiceDate: formatReportLayoutDate(str('invoiceDate') || str('invoice_date')),
    dueDate: formatReportLayoutDate(str('dueDate') || str('due_date')),
    validUntil: formatReportLayoutDate(str('validUntil') || str('valid_until')),
    etd: formatReportLayoutDate(str('etd')),
    eta: formatReportLayoutDate(str('eta')),
    billToName: str('billToName') || str('party_name') || str('customer_name'),
    billToAddress: str('billToAddress') || str('bill_to_address'),
    currencyCode: str('currencyCode') || str('currency_code'),
    subtotal: str('subtotal'),
    tax: str('tax') || str('tax_total'),
    total: str('total') || str('total_amount'),
  };
}

/** Map a party master into layout PDF fields (best-effort). */
export function partyRecordToFormatPdfData(party: {
  code?: string | null;
  name?: string | null;
  address?: string | null;
  city?: string | null;
  country_code?: string | null;
  currency_code?: string | null;
  email?: string | null;
  phone?: string | null;
}): InvoiceFormatPdfData {
  const address = [party.address, party.city, party.country_code].filter(Boolean).join(', ');
  return {
    invoiceNumber: party.code || undefined,
    billToName: party.name || undefined,
    billToAddress:
      [address, party.email, party.phone].filter(Boolean).join(' · ') || undefined,
    currencyCode: party.currency_code || undefined,
  };
}

function mergePdfData(
  base: InvoiceFormatPdfData,
  overlay: InvoiceFormatPdfData,
): InvoiceFormatPdfData {
  return {
    ...base,
    ...Object.fromEntries(
      Object.entries(overlay).filter(([, v]) => {
        if (v == null || v === '') return false;
        if (Array.isArray(v) && v.length === 0) return false;
        return true;
      }),
    ),
    entityBound: base.entityBound || overlay.entityBound || undefined,
    lines: overlay.lines?.length ? overlay.lines : base.lines,
    shipperLines: overlay.shipperLines?.length ? overlay.shipperLines : base.shipperLines,
    consigneeLines: overlay.consigneeLines?.length
      ? overlay.consigneeLines
      : base.consigneeLines,
    notifyLines: overlay.notifyLines?.length ? overlay.notifyLines : base.notifyLines,
  };
}

export function catalogContextCacheKey(context?: ReportContextIds | null): string {
  if (!context) return '';
  return [
    context.invoice_id || '',
    context.quotation_id || '',
    context.job_id || '',
    context.party_id || '',
  ].join('|');
}

/**
 * Load live entity fields for catalogue layout PDFs from deep-link context.
 * Prefer invoice → quotation → job → party. Failures are ignored (demo layout remains).
 * Optional formatCode enables invoice format-payload enrich when invoice_id is set.
 */
export async function resolveCatalogContextPdfData(
  context?: ReportContextIds | null,
  opts?: { formatCode?: string },
): Promise<InvoiceFormatPdfData> {
  if (!context) return {};

  let data: InvoiceFormatPdfData = {};
  const errors: string[] = [];
  const partyId = context.party_id?.trim();
  const hasEntityContext =
    isEntityId(context.invoice_id?.trim()) ||
    isEntityId(context.quotation_id?.trim()) ||
    isEntityId(context.job_id?.trim()) ||
    isEntityId(partyId);

  if (hasEntityContext) {
    data.entityBound = true;
  }

  if (isEntityId(partyId)) {
    try {
      const party = await partyService.getById(partyId);
      const lines = partyToFormatPdfLines(party);
      data = mergePdfData(data, {
        ...partyRecordToFormatPdfData(party),
        billToPhone: party.phone || undefined,
        billToEmail: party.email || undefined,
        consigneeLines: lines.length ? lines : undefined,
      });
    } catch (err) {
      errors.push(err instanceof Error ? err.message : 'party');
    }
  }

  const jobId = context.job_id?.trim();
  if (isEntityId(jobId)) {
    const before = data.jobNumber || data.invoiceNumber;
    data = await enrichPdfDataFromJobId(jobId, data);
    if (!before && !data.jobNumber && !data.invoiceNumber && !data.shipperLines?.length) {
      errors.push('job');
    }
  }

  const quotationId = context.quotation_id?.trim();
  let linkedJobId: string | undefined;
  let linkedCustomerId: string | undefined;
  let linkedInvoicePartyId: string | undefined;
  let linkedCompanyId: string | undefined;
  if (isEntityId(quotationId)) {
    try {
      const quotation = await quotationService.getById(quotationId);
      data = mergePdfData(data, quotationRecordToFormatPdfData(quotation));
      linkedJobId = quotation.job_id?.trim() || linkedJobId;
      linkedCustomerId = quotation.customer_id?.trim() || linkedCustomerId;
      linkedCompanyId = quotation.company_id?.trim() || linkedCompanyId;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : 'quotation');
    }
  }

  const invoiceId = context.invoice_id?.trim();
  if (isEntityId(invoiceId)) {
    try {
      const invoice = await invoiceService.getById(invoiceId);
      data = mergePdfData(data, invoiceRecordToFormatPdfData(invoice));
      linkedJobId = invoice.job_id?.trim() || linkedJobId;
      linkedInvoicePartyId = invoice.party_id?.trim() || linkedInvoicePartyId;
      linkedCompanyId = invoice.company_id?.trim() || linkedCompanyId;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : 'invoice');
    }
    if (opts?.formatCode) {
      try {
        const payload = await invoiceService.getFormatPayload(invoiceId, opts.formatCode);
        if (payload && typeof payload === 'object') {
          data = mergePdfData(
            data,
            normalizeFormatPayload(payload as Record<string, unknown>),
          );
        }
      } catch {
        /* optional enrich */
      }
    }
  }

  // Bill-to / Consignee / To from party masters on the selected quotation or invoice.
  if (linkedInvoicePartyId) {
    data = await enrichFromPartyId(linkedInvoicePartyId, 'billTo', data);
  } else if (linkedCustomerId) {
    data = await enrichFromPartyId(linkedCustomerId, 'consignee', data);
  }

  if (linkedJobId && linkedJobId !== jobId) {
    data = await enrichPdfDataFromJobId(linkedJobId, data);
  }

  // Shipper: prefer job shipper; otherwise tenant company on the quote/invoice.
  if (!data.shipperLines?.length) {
    data = await enrichShipperFromCompanyId(linkedCompanyId, data);
  }

  if (data.subtotal != null && typeof data.subtotal !== 'string') {
    data.subtotal = money(Number(data.subtotal));
  }
  if (data.tax != null && typeof data.tax !== 'string') {
    data.tax = money(Number(data.tax));
  }
  if (data.total != null && typeof data.total !== 'string') {
    data.total = money(Number(data.total));
  }

  // Entity-bound: keep N/A placeholders even when some fetches fail (no demo fill-in).
  if (hasEntityContext) {
    data.entityBound = true;
  } else if (
    !data.invoiceNumber &&
    !data.billToName &&
    !data.lines?.length &&
    errors.length
  ) {
    data.billToAddress = `Could not load live data (${errors[0]}). Showing layout demo.`;
  }

  return data;
}
