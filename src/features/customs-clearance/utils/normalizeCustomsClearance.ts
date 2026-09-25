import { isUuid } from '@/lib/isUuid';
import type {
  CcChecklistItem,
  CcDashboardStats,
  CcDeclaration,
  CcDetails,
  CcFiling,
  CcFinancialSummary,
  CcLine,
  CcLinkFreight,
  CcQuery,
  CcQueueItem,
  CcQueueResult,
  CcStatus,
  HsValidateResult,
} from '../types/customsClearance.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function unwrapEntity(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (!envelope || !('data' in envelope)) return raw;
  const nested = asRecord(envelope.data);
  if (nested && 'data' in nested && Object.keys(nested).length <= 2) return nested.data;
  return envelope.data;
}

export function unwrapList(raw: unknown, keys: string[] = []): unknown[] {
  if (Array.isArray(raw)) return raw;
  const envelope = asRecord(raw);
  if (!envelope) return [];
  if (Array.isArray(envelope.data)) return envelope.data;
  const nested = asRecord(envelope.data) ?? envelope;
  for (const key of ['items', 'results', 'lines', 'queries', 'checklist', ...keys]) {
    if (Array.isArray(nested[key])) return nested[key] as unknown[];
  }
  return [];
}

function str(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

function num(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function bool(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 0 || value === '0') return false;
  return undefined;
}

function idOf(r: Record<string, unknown>): string {
  return str(r.id) ?? str(r.uuid) ?? '';
}

export function normalizeCcDashboard(raw: unknown): CcDashboardStats {
  const r = asRecord(unwrapEntity(raw)) ?? asRecord(raw) ?? {};
  const byStage = asRecord(r.by_stage ?? r.byStage ?? r.stages) ?? undefined;
  return {
    total: num(r.total ?? r.total_jobs),
    open: num(r.open ?? r.opened),
    docs_pending: num(r.docs_pending ?? r.docsPending),
    in_assessment: num(r.in_assessment ?? r.assessment),
    duty_pending: num(r.duty_pending ?? r.dutyPending),
    cleared: num(r.cleared),
    closed: num(r.closed ?? r.completed),
    by_stage: byStage
      ? Object.fromEntries(
          Object.entries(byStage).map(([k, v]) => [k, Number(v) || 0]),
        )
      : undefined,
    raw: r,
  };
}

export function normalizeCcQueueItem(raw: unknown): CcQueueItem | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = idOf(r) || str(r.job_id) || '';
  if (!id) return null;
  return {
    id,
    job_id: str(r.job_id) ?? (isUuid(id) ? id : undefined),
    job_number: str(r.job_number ?? r.jobNumber),
    stage: str(r.stage ?? r.cc_stage ?? r.status),
    status: str(r.status),
    customer_name: str(r.customer_name ?? r.party_name ?? r.shipper_name),
    shipper_id: str(r.shipper_id ?? r.customer_id),
    updated_at: str(r.updated_at ?? r.updatedAt),
    raw: r,
  };
}

export function normalizeCcQueue(raw: unknown): CcQueueResult {
  const items = unwrapList(raw, ['queue', 'jobs'])
    .map(normalizeCcQueueItem)
    .filter((x): x is CcQueueItem => Boolean(x));
  const envelope = asRecord(raw);
  const metaRec = asRecord(envelope?.meta) ?? asRecord(asRecord(envelope?.data)?.meta);
  return {
    items,
    meta: metaRec
      ? {
          page: num(metaRec.page),
          limit: num(metaRec.limit),
          total: num(metaRec.total ?? metaRec.total_count) ?? items.length,
        }
      : { total: items.length },
  };
}

export function normalizeCcDetails(raw: unknown, jobId?: string): CcDetails {
  const r = asRecord(unwrapEntity(raw)) ?? asRecord(raw) ?? {};
  return {
    job_id: str(r.job_id) ?? jobId ?? '',
    direction: str(r.direction ?? r.cc_direction),
    cha_party_id: str(r.cha_party_id ?? r.chaPartyId ?? r.broker_party_id),
    border_or_port: str(
      r.border_or_port ?? r.borderOrPort ?? r.customs_office ?? r.port_name ?? r.port_id,
    ),
    remarks: str(r.remarks ?? r.notes),
    raw: r,
  };
}

export function normalizeCcStatus(raw: unknown, jobId?: string): CcStatus {
  const r = asRecord(unwrapEntity(raw)) ?? asRecord(raw) ?? {};
  return {
    job_id: str(r.job_id) ?? jobId ?? '',
    stage: str(r.stage ?? r.cc_stage ?? r.current_stage),
    status: str(r.status),
    opened_at: str(r.opened_at ?? r.openedAt),
    docs_complete_at: str(r.docs_complete_at ?? r.docsCompleteAt),
    classified_at: str(r.classified_at ?? r.classifiedAt),
    filed_at: str(r.filed_at ?? r.filedAt),
    assessed_at: str(r.assessed_at ?? r.assessedAt),
    duty_paid_at: str(r.duty_paid_at ?? r.dutyPaidAt),
    cleared_at: str(r.cleared_at ?? r.clearedAt),
    released_at: str(r.released_at ?? r.releasedAt),
    invoice_ready_at: str(r.invoice_ready_at ?? r.invoiceReadyAt),
    closed_at: str(r.closed_at ?? r.closedAt),
    raw: r,
  };
}

export function normalizeCcLine(raw: unknown): CcLine | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = idOf(r);
  if (!id) return null;
  return {
    id,
    job_id: str(r.job_id),
    description: str(r.description),
    hs_code: str(r.hs_code ?? r.hsCode),
    quantity: num(r.quantity),
    unit: str(r.unit),
    value_amount: num(r.value_amount ?? r.valueAmount ?? r.unit_value ?? r.value),
    currency_code: str(r.currency_code ?? r.currencyCode),
    country_of_origin: str(r.country_of_origin ?? r.countryOfOrigin),
    classified: bool(r.classified ?? r.is_classified),
    permit_notes: str(r.permit_notes ?? r.permitNotes ?? r.notes),
    raw: r,
  };
}

export function normalizeCcLines(raw: unknown): CcLine[] {
  return unwrapList(raw, ['lines'])
    .map(normalizeCcLine)
    .filter((x): x is CcLine => Boolean(x));
}

export function normalizeCcChecklistItem(raw: unknown): CcChecklistItem | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = idOf(r);
  if (!id) return null;
  const received = bool(r.received ?? r.is_received);
  const verified = bool(r.verified ?? r.is_verified);
  const completed =
    bool(r.completed ?? r.is_complete ?? r.done) ??
    (verified === true || received === true ? verified || received : undefined);
  return {
    id,
    job_id: str(r.job_id),
    code: str(r.code ?? r.item_code ?? r.doc_code),
    label: str(r.label ?? r.name ?? r.title ?? r.description),
    required: bool(r.required ?? r.is_required),
    status: str(r.status),
    received,
    verified,
    completed,
    job_document_id: str(r.job_document_id ?? r.jobDocumentId ?? r.document_id),
    raw: r,
  };
}

export function normalizeCcChecklist(raw: unknown): CcChecklistItem[] {
  return unwrapList(raw, ['checklist', 'items'])
    .map(normalizeCcChecklistItem)
    .filter((x): x is CcChecklistItem => Boolean(x));
}

export function normalizeCcFiling(raw: unknown, jobId?: string): CcFiling {
  const r = asRecord(unwrapEntity(raw)) ?? asRecord(raw) ?? {};
  return {
    job_id: str(r.job_id) ?? jobId,
    entry_type: str(r.entry_type ?? r.entryType ?? r.filing_type),
    entry_number: str(r.entry_number ?? r.entryNumber ?? r.boe_number),
    shipping_bill_number: str(r.shipping_bill_number ?? r.shippingBillNumber),
    filing_date: str(r.filing_date ?? r.filingDate ?? r.filed_at),
    assessed_duty: num(r.assessed_duty ?? r.assessedDuty),
    assessed_tax: num(r.assessed_tax ?? r.assessedTax),
    duty_currency: str(r.duty_currency ?? r.dutyCurrency ?? r.currency_code),
    raw: r,
  };
}

export function normalizeCcQuery(raw: unknown): CcQuery | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = idOf(r);
  if (!id) return null;
  return {
    id,
    job_id: str(r.job_id),
    query_text: str(r.query_text ?? r.queryText ?? r.subject ?? r.body ?? r.message),
    response_text: str(r.response_text ?? r.responseText ?? r.response ?? r.reply),
    status: str(r.status),
    raised_at: str(r.raised_at ?? r.created_at),
    closed_at: str(r.closed_at ?? r.closedAt),
    raw: r,
  };
}

export function normalizeCcQueries(raw: unknown): CcQuery[] {
  return unwrapList(raw, ['queries'])
    .map(normalizeCcQuery)
    .filter((x): x is CcQuery => Boolean(x));
}

export function normalizeCcFinancialSummary(
  raw: unknown,
  jobId?: string,
): CcFinancialSummary {
  const r = asRecord(unwrapEntity(raw)) ?? asRecord(raw) ?? {};
  return {
    job_id: str(r.job_id) ?? jobId,
    duty_amount: num(r.duty_amount ?? r.dutyAmount ?? r.duty),
    tax_amount: num(r.tax_amount ?? r.taxAmount ?? r.tax),
    fees_amount: num(r.fees_amount ?? r.feesAmount ?? r.fees),
    total_amount: num(r.total_amount ?? r.totalAmount ?? r.total),
    currency_code: str(r.currency_code ?? r.currencyCode),
    duty_paid: bool(r.duty_paid ?? r.dutyPaid),
    invoice_id: str(r.invoice_id ?? r.invoiceId),
    raw: r,
  };
}

export function normalizeCcLinkFreight(raw: unknown, jobId?: string): CcLinkFreight | null {
  const r = asRecord(unwrapEntity(raw)) ?? asRecord(raw);
  if (!r) return null;
  const freightId = str(r.freight_job_id ?? r.freightJobId ?? r.linked_job_id);
  if (!freightId && !str(r.job_id)) return null;
  return {
    job_id: str(r.job_id) ?? jobId,
    freight_job_id: freightId,
    freight_job_number: str(r.freight_job_number ?? r.freightJobNumber),
    linked_at: str(r.linked_at ?? r.linkedAt),
    raw: r,
  };
}

export function normalizeCcDeclaration(raw: unknown, jobId?: string): CcDeclaration {
  const r = asRecord(unwrapEntity(raw)) ?? asRecord(raw) ?? {};
  const declaration =
    asRecord(r.declaration) ?? asRecord(r.payload) ?? (Object.keys(r).length ? r : {});
  const errorsRaw = r.validation_errors ?? r.validationErrors ?? r.errors;
  const validation_errors = Array.isArray(errorsRaw)
    ? errorsRaw.map((e) => String(e))
    : undefined;
  return {
    job_id: str(r.job_id) ?? jobId,
    declaration,
    payload: declaration,
    validated: bool(r.validated ?? r.is_valid),
    submitted_locally: bool(r.submitted_locally ?? r.submittedLocally),
    validation_errors,
    raw: r,
  };
}

export function normalizeHsValidate(raw: unknown): HsValidateResult {
  const r = asRecord(unwrapEntity(raw)) ?? asRecord(raw) ?? {};
  return {
    hs_code: str(r.hs_code ?? r.hsCode ?? r.code),
    valid: bool(r.valid ?? r.is_valid) ?? true,
    description: str(r.description ?? r.name),
    is_prohibited: bool(r.is_prohibited ?? r.isProhibited),
    is_restricted: bool(r.is_restricted ?? r.isRestricted),
    dg_class: str(r.dg_class ?? r.dgClass),
    message: str(r.message ?? r.detail),
    raw: r,
  };
}

export function prepareCcPayload(dto: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(dto).filter(
      ([, value]) => value !== '' && value !== undefined && value !== null,
    ),
  );
}
