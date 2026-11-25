import { invoiceService } from '@/features/invoices/services/invoice.service';
import { jobService } from '@/features/jobs/services/job.service';
import type { JobCharge } from '@/features/jobs/types/job.types';
import { organizationService } from '@/features/organization/services/organization.service';
import { partyService } from '@/features/parties/services/party.service';
import type { ReportContextIds } from '../utils/reportParameterUtils';
import type { InvoiceFlowRecord } from './renderInvoiceFlowPdf';

function isEntityId(value: string | undefined | null): value is string {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}

/** Sale charges only. Missing description stays blank. */
export function jobChargesToFlowLines(charges: JobCharge[]): Array<Record<string, unknown>> {
  return charges
    .filter((charge) => !charge.is_cost)
    .map((charge) => ({
      description: charge.description || charge.charge_code_name || charge.charge_code || '',
      quantity: charge.quantity,
      unit_price: charge.unit_price,
      currency_code: charge.currency_code,
      exchange_rate: charge.exchange_rate,
      line_total: charge.line_total ?? charge.sale_amount,
      tax_amount: charge.sale_tax_amount,
      taxable_amount: charge.sale_amount,
    }));
}

/**
 * Record for the browser flow renderer. Uses the open invoice, job, party, and
 * organization. Missing pieces stay empty.
 */
export async function loadInvoiceFlowRecord(context: ReportContextIds): Promise<InvoiceFlowRecord> {
  const record: InvoiceFlowRecord = {};

  try {
    record.organization = (await organizationService.getProfile()) as unknown as Record<string, unknown>;
  } catch {
    /* company block stays empty */
  }

  try {
    const listed = await organizationService.listBankAccounts({ limit: 20, is_active: true });
    const bank = listed.accounts.find((account) => account.is_default) || listed.accounts[0];
    if (bank) record.bank = bank as unknown as Record<string, unknown>;
  } catch {
    /* bank block stays empty */
  }

  let job: Record<string, unknown> | null = null;
  if (isEntityId(context.job_id)) {
    try {
      job = (await jobService.getById(context.job_id)) as unknown as Record<string, unknown>;
      record.job = job;
    } catch {
      job = null;
    }
  }

  let invoice: Record<string, unknown> | null = null;
  if (isEntityId(context.invoice_id)) {
    try {
      invoice = (await invoiceService.getById(context.invoice_id)) as unknown as Record<string, unknown>;
    } catch {
      invoice = null;
    }
  }

  const invoiceBody: Record<string, unknown> = invoice ? { ...invoice } : {};
  if (job && !invoiceBody.job_number) invoiceBody.job_number = job.job_number;
  const existingLines = Array.isArray(invoiceBody.lines) ? invoiceBody.lines : [];
  if (!existingLines.length && job && typeof job.id === 'string' && isEntityId(job.id)) {
    try {
      const lines = jobChargesToFlowLines(await jobService.listJobCharges(job.id));
      if (lines.length) invoiceBody.lines = lines;
    } catch {
      /* charges stay empty */
    }
  }
  if (Object.keys(invoiceBody).length) record.invoice = invoiceBody;

  const partyId = [invoiceBody.party_id, job?.billing_party_id, job?.shipper_id].find(
    (value): value is string => typeof value === 'string' && isEntityId(value),
  );
  if (partyId) {
    try {
      record.party = (await partyService.getById(partyId)) as unknown as Record<string, unknown>;
    } catch {
      /* party block stays empty */
    }
  }

  return record;
}
