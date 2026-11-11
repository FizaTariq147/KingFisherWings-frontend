import { isUuid } from '@/lib/isUuid';
import type {
  JobInvoiceFormLineDto,
  JobInvoiceFormSaveDto,
} from '../types/job.types';

type InvoiceFormKind = 'sale' | 'purchase';

function uuidOrUndef(value: unknown): string | undefined {
  const s = String(value ?? '').trim();
  return isUuid(s) ? s : undefined;
}

function cleanLine(
  line: JobInvoiceFormLineDto,
  kind: InvoiceFormKind,
): JobInvoiceFormLineDto {
  const defaultDrCr = kind === 'purchase' ? 'DR' : 'CR';
  const drCr =
    line.dr_cr === 'DR' || line.dr_cr === 'CR' ? line.dr_cr : defaultDrCr;
  const ppCc = line.pp_cc === 'PP' || line.pp_cc === 'CC' ? line.pp_cc : undefined;
  const out: JobInvoiceFormLineDto = {
    description: String(line.description ?? '').trim() || undefined,
    shipment_no: String(line.shipment_no ?? '').trim() || undefined,
    unit: String(line.unit ?? '').trim() || undefined,
    quantity: Number(line.quantity ?? 1) || 1,
    currency_code: String(line.currency_code ?? 'AED')
      .trim()
      .toUpperCase()
      .slice(0, 3) || 'AED',
    exchange_rate: Number(line.exchange_rate ?? 1) || 1,
    dr_cr: drCr,
    amount: Number(line.amount ?? 0) || 0,
  };
  const jobChargeId = uuidOrUndef(line.job_charge_id);
  const chargeCodeId = uuidOrUndef(line.charge_code_id);
  const taxRateId = uuidOrUndef(line.tax_rate_id);
  if (jobChargeId) out.job_charge_id = jobChargeId;
  if (chargeCodeId) out.charge_code_id = chargeCodeId;
  if (taxRateId) out.tax_rate_id = taxRateId;
  if (ppCc) out.pp_cc = ppCc;
  if (line.fcy_amount != null && Number.isFinite(Number(line.fcy_amount))) {
    out.fcy_amount = Number(line.fcy_amount);
  }
  return out;
}

/**
 * Normalize sale/purchase invoice form POST body so UUID/enum fields
 * match OpenAPI JobInvoiceFormSaveDto (avoids BE 500s on bad prefill).
 */
export function prepareJobInvoiceFormSave(
  form: JobInvoiceFormSaveDto,
  kind: InvoiceFormKind,
  saleSource?: 'job' | 'quotation' | 'auto',
): JobInvoiceFormSaveDto {
  const lines = (form.lines ?? [])
    .filter((l) => Number(l.amount) >= 0)
    .map((l) => cleanLine(l, kind));

  const dto: JobInvoiceFormSaveDto = {
    voucher_type:
      String(form.voucher_type ?? '').trim() ||
      (kind === 'sale' ? 'SALES_INVOICE' : 'PURCHASE_INVOICE'),
    v_date: String(form.v_date ?? '').slice(0, 10) || undefined,
    gl_date: String(form.gl_date ?? '').slice(0, 10) || undefined,
    exchange_rate: Number(form.exchange_rate ?? 1) || 1,
    bill_amount:
      form.bill_amount != null
        ? Number(form.bill_amount) || 0
        : lines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0),
    remarks: form.remarks != null ? String(form.remarks) : undefined,
    books: form.books != null ? String(form.books) : undefined,
    address: form.address != null ? String(form.address) : undefined,
    currency_code: String(form.currency_code ?? 'AED')
      .trim()
      .toUpperCase()
      .slice(0, 3) || 'AED',
    narration: form.narration != null ? String(form.narration) : undefined,
    ref_no: form.ref_no != null ? String(form.ref_no) : undefined,
    lines,
  };

  const branchId = uuidOrUndef(form.branch_id);
  const companyId = uuidOrUndef(form.company_id);
  const vendorQuoteId = uuidOrUndef(form.vendor_quote_id);
  if (branchId) dto.branch_id = branchId;
  if (companyId) dto.company_id = companyId;
  if (vendorQuoteId) dto.vendor_quote_id = vendorQuoteId;

  if (kind === 'purchase') {
    const vendorId = uuidOrUndef(form.cost_party_id || form.party_id);
    if (vendorId) {
      dto.party_id = vendorId;
      dto.cost_party_id = vendorId;
    }
    // Prefer explicit form lines; charge_ids is legacy when lines are omitted.
    if (lines.length === 0) {
      const chargeIds = (form.charge_ids ?? [])
        .map((id) => String(id).trim())
        .filter((id) => isUuid(id));
      if (chargeIds.length) dto.charge_ids = chargeIds;
    }
    return dto;
  }

  const partyId = uuidOrUndef(form.party_id);
  const orgId = uuidOrUndef(form.organization_id);
  if (partyId) dto.party_id = partyId;
  if (orgId) dto.organization_id = orgId;
  if (saleSource) dto.source = saleSource;
  if (lines.length === 0) {
    const chargeIds = (form.charge_ids ?? [])
      .map((id) => String(id).trim())
      .filter((id) => isUuid(id));
    if (chargeIds.length) dto.charge_ids = chargeIds;
  }
  return dto;
}
