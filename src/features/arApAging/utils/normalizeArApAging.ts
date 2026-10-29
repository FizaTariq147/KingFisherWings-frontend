import type { AgingLine, StatementLine } from '../types/arApAging.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s || undefined;
}

function num(value: unknown): number {
  if (value == null || value === '') return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function pickBucket(r: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    if (key in r) return num(r[key]);
  }
  return 0;
}

const AGING_BUCKET_KEYS = [
  'current',
  'days_1_30',
  'days_31_60',
  'days_61_90',
  'days_over_90',
] as const;

function labelToBucketKey(label: string): (typeof AGING_BUCKET_KEYS)[number] | null {
  const normalized = label.toLowerCase().replace(/\s+/g, '');
  if (/^current|notdue|0/.test(normalized)) return 'current';
  if (/1.?30|1–30|1-30/.test(normalized)) return 'days_1_30';
  if (/31.?60|31–60|31-60/.test(normalized)) return 'days_31_60';
  if (/61.?90|61–90|61-90/.test(normalized)) return 'days_61_90';
  if (/90|over/.test(normalized)) return 'days_over_90';
  return null;
}

const EMPTY_AGING_TOTALS: AgingLine = {
  current: 0,
  days_1_30: 0,
  days_31_60: 0,
  days_61_90: 0,
  days_over_90: 0,
  total: 0,
};

function agingLineFromBucketsArray(raw: unknown): AgingLine | null {
  if (!Array.isArray(raw) || !raw.length) return null;
  const line: AgingLine = { ...EMPTY_AGING_TOTALS };
  for (const item of raw) {
    const r = asRecord(item);
    if (!r) continue;
    const amount = num(r.amount) || num(r.balance) || num(r.total) || num(r.value);
    const key =
      (str(r.key) as (typeof AGING_BUCKET_KEYS)[number] | undefined) ??
      labelToBucketKey(str(r.label) ?? str(r.bucket) ?? str(r.name) ?? '');
    if (key && AGING_BUCKET_KEYS.includes(key)) {
      line[key] += amount;
    }
  }
  const bucketSum = AGING_BUCKET_KEYS.reduce((sum, key) => sum + line[key], 0);
  if (bucketSum <= 0) return null;
  line.total = bucketSum;
  return line;
}

function agingLineFromRecord(r: Record<string, unknown>): AgingLine | null {
  const bucketsArray = Array.isArray(r.buckets)
    ? agingLineFromBucketsArray(r.buckets)
    : Array.isArray(r.aging)
      ? agingLineFromBucketsArray(r.aging)
      : null;
  const nestedAmounts = asRecord(r.amounts);
  const nestedLine =
    bucketsArray ?? (nestedAmounts ? agingLineFromRecord(nestedAmounts) : null);

  const party_id = str(r.party_id) ?? str(r.id);
  const party_name = str(r.party_name) ?? str(r.name);
  const current = pickBucket(r, [
    'current',
    'bucket_current',
    'not_due',
    'days_0',
    'current_amount',
    'amount_current',
  ]);
  const days_1_30 = pickBucket(r, [
    'days_1_30',
    'days1_30',
    'bucket_1_30',
    'age_1_30',
    '1_30',
    'amount_1_30',
  ]);
  const days_31_60 = pickBucket(r, [
    'days_31_60',
    'days31_60',
    'bucket_31_60',
    'age_31_60',
    '31_60',
    'amount_31_60',
  ]);
  const days_61_90 = pickBucket(r, [
    'days_61_90',
    'days61_90',
    'bucket_61_90',
    'age_61_90',
    '61_90',
    'amount_61_90',
  ]);
  const days_over_90 = pickBucket(r, [
    'days_over_90',
    'days90_plus',
    'over_90',
    'bucket_over_90',
    'age_over_90',
    '90_plus',
    'days_90_plus',
    'amount_over_90',
  ]);
  const bucketSum =
    (nestedLine?.current ?? current) +
    (nestedLine?.days_1_30 ?? days_1_30) +
    (nestedLine?.days_31_60 ?? days_31_60) +
    (nestedLine?.days_61_90 ?? days_61_90) +
    (nestedLine?.days_over_90 ?? days_over_90);
  const total =
    num(r.total) ||
    num(r.total_outstanding) ||
    num(r.outstanding) ||
    num(r.balance) ||
    nestedLine?.total ||
    bucketSum;

  if (!party_id && !party_name && total === 0 && bucketSum === 0) return null;

  return {
    party_id,
    party_name,
    party_code: str(r.party_code) ?? str(r.code),
    currency_code: str(r.currency_code)?.toUpperCase(),
    current: nestedLine?.current ?? current,
    days_1_30: nestedLine?.days_1_30 ?? days_1_30,
    days_31_60: nestedLine?.days_31_60 ?? days_31_60,
    days_61_90: nestedLine?.days_61_90 ?? days_61_90,
    days_over_90: nestedLine?.days_over_90 ?? days_over_90,
    total,
  };
}

export function normalizeAgingLine(raw: unknown): AgingLine | null {
  const r = asRecord(raw);
  if (!r) return null;
  return agingLineFromRecord(r);
}

/** Sum bucket totals from API totals row or party lines. */
export function computeAgingTotals(
  report?: Pick<{ lines: AgingLine[]; totals?: AgingLine }, 'lines' | 'totals'>,
): AgingLine {
  if (!report) return { ...EMPTY_AGING_TOTALS };

  const fromLines = report.lines.length
    ? report.lines.reduce(
        (acc, line) => ({
          current: acc.current + line.current,
          days_1_30: acc.days_1_30 + line.days_1_30,
          days_31_60: acc.days_31_60 + line.days_31_60,
          days_61_90: acc.days_61_90 + line.days_61_90,
          days_over_90: acc.days_over_90 + line.days_over_90,
          total: acc.total + (line.total || 0),
        }),
        { ...EMPTY_AGING_TOTALS },
      )
    : null;

  const lineBucketSum = fromLines
    ? fromLines.current +
      fromLines.days_1_30 +
      fromLines.days_31_60 +
      fromLines.days_61_90 +
      fromLines.days_over_90
    : 0;

  if (fromLines && lineBucketSum > 0) {
    const headerTotal = report.totals?.total ?? 0;
    return {
      ...fromLines,
      total: Math.max(fromLines.total, headerTotal, lineBucketSum),
      currency_code:
        report.totals?.currency_code ??
        report.lines.find((line) => line.currency_code)?.currency_code,
    };
  }

  if (report.totals) {
    const t = report.totals;
    const bucketSum =
      t.current + t.days_1_30 + t.days_31_60 + t.days_61_90 + t.days_over_90;
    return {
      ...t,
      total: t.total || bucketSum,
    };
  }

  if (fromLines) return fromLines;

  return { ...EMPTY_AGING_TOTALS };
}

/** Bucket values for charts; falls back to a single segment when only total exists. */
export function resolveAgingBucketValues(totals: AgingLine): number[] {
  const values = AGING_BUCKET_KEYS.map((key) => Number(totals[key] ?? 0));
  const bucketSum = values.reduce((sum, value) => sum + value, 0);
  const total = totals.total || bucketSum;
  if (bucketSum <= 0 && total > 0) return [total, 0, 0, 0, 0];
  return values;
}

function unwrapAgingPayload(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (!envelope) return raw;
  const nested = asRecord(envelope.data);
  if (
    nested &&
    (nested.lines ||
      nested.rows ||
      nested.parties ||
      nested.totals ||
      nested.summary ||
      nested.current != null ||
      nested.total_outstanding != null ||
      Array.isArray(nested.buckets))
  ) {
    return {
      ...nested,
      as_of: nested.as_of ?? envelope.as_of,
    };
  }
  return raw;
}

function bucketOnlyTotals(raw: unknown): AgingLine | undefined {
  const line = normalizeAgingLine(raw);
  if (!line) return undefined;
  const bucketSum =
    line.current + line.days_1_30 + line.days_31_60 + line.days_61_90 + line.days_over_90;
  if (bucketSum <= 0 && line.total <= 0) return undefined;
  return line;
}

function unwrapAgingRows(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const envelope = asRecord(raw);
  if (!envelope) return [];
  const named =
    (Array.isArray(envelope.rows) && envelope.rows) ||
    (Array.isArray(envelope.items) && envelope.items) ||
    (Array.isArray(envelope.parties) && envelope.parties) ||
    (Array.isArray(envelope.lines) && envelope.lines) ||
    (Array.isArray(envelope.customers) && envelope.customers) ||
    (Array.isArray(envelope.data) && envelope.data) ||
    (Array.isArray(envelope.results) && envelope.results);
  if (named) return named;
  const nested = asRecord(envelope.data);
  if (nested) {
    return (
      (Array.isArray(nested.rows) && nested.rows) ||
      (Array.isArray(nested.items) && nested.items) ||
      (Array.isArray(nested.parties) && nested.parties) ||
      (Array.isArray(nested.customers) && nested.customers) ||
      (Array.isArray(nested.lines) && nested.lines) ||
      []
    );
  }
  return [];
}

export function normalizeAgingReport(raw: unknown): {
  as_of?: string;
  lines: AgingLine[];
  totals?: AgingLine;
} {
  const payload = unwrapAgingPayload(raw);
  const envelope = asRecord(payload);
  const as_of = str(envelope?.as_of) ?? str(envelope?.as_of_date) ?? str(envelope?.date);
  const rows = unwrapAgingRows(payload);
  const lines = rows.map(normalizeAgingLine).filter((l): l is AgingLine => Boolean(l));

  const totalsRaw =
    envelope?.totals ?? envelope?.summary ?? envelope?.total_row ?? envelope?.grand_total;
  let totals = totalsRaw ? normalizeAgingLine(totalsRaw) ?? undefined : undefined;

  if (!totals) {
    totals =
      agingLineFromBucketsArray(envelope?.buckets) ??
      agingLineFromBucketsArray(envelope?.aging) ??
      bucketOnlyTotals(envelope) ??
      bucketOnlyTotals(asRecord(envelope?.data)) ??
      undefined;
  }

  if (!totals && lines.length) {
    totals = computeAgingTotals({ lines });
    totals.party_name = 'Totals';
  }

  return { as_of, lines, totals: totals ?? undefined };
}

function firstStr(r: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = str(r[key]);
    if (value) return value;
  }
  return undefined;
}

function humanizeToken(value?: string): string | undefined {
  if (!value) return undefined;
  return value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim() || undefined;
}

function formatStatusLabel(status?: string): string | undefined {
  const label = humanizeToken(status);
  return label ? `Status ${label}` : undefined;
}

function isLikelyUuid(value?: string): boolean {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      ),
  );
}

function looksLikeBareStatus(value?: string): boolean {
  if (!value) return false;
  return /^(draft|posted|paid|partial(?:ly)?(?:\s*paid)?|unpaid|cancelled|canceled|void|open|closed|pending|approved|received|allocated)$/i.test(
    value.trim().replace(/[_-]+/g, ' '),
  );
}

function pickNarrative(r: Record<string, unknown>): string | undefined {
  for (const key of [
    'description',
    'narration',
    'remarks',
    'memo',
    'particulars',
    'particular',
    'notes',
    'note',
    'details',
    'comment',
    'line_description',
    'transaction_description',
    'statement_description',
  ]) {
    const value = str(r[key]);
    // Skip when API stuffed status into description (e.g. "POSTED").
    if (value && !looksLikeBareStatus(value)) return value;
  }
  return undefined;
}

function isCreditNoteType(type?: string): boolean {
  if (!type) return false;
  return /credit.?note|cn\b/i.test(type);
}

function docKindLabel(type?: string, side: 'AR' | 'AP' = 'AR'): string | undefined {
  if (!type) return undefined;
  if (isCreditNoteType(type)) return 'Credit note';
  if (/debit.?note/i.test(type)) return 'Debit note';
  if (/receipt/i.test(type)) return 'Receipt';
  if (/payment|allocation|receipt/i.test(type)) return side === 'AR' ? 'Receipt' : 'Payment';
  if (/invoice|sales|purchase/i.test(type)) {
    return side === 'AP' ? 'Purchase invoice' : 'Sales invoice';
  }
  return humanizeToken(type);
}

function allocationReferences(r: Record<string, unknown>): string | undefined {
  const single = firstStr(r, [
    'invoice_number',
    'against_invoice',
    'against_reference',
    'allocated_to',
    'allocation_reference',
    'document_number',
  ]);
  if (single) return single;

  const lists = [r.allocations, r.applied_to, r.applications, r.invoices];
  const numbers: string[] = [];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const row = asRecord(item);
      if (!row) continue;
      const ref = firstStr(row, [
        'invoice_number',
        'number',
        'document_number',
        'reference',
        'payment_number',
      ]);
      if (ref && !numbers.includes(ref)) numbers.push(ref);
    }
  }
  return numbers.length ? numbers.join(', ') : undefined;
}

/**
 * Build a human Description for statement rows from whatever fields the API sent.
 * Prefers narration/remarks; otherwise composes type + job/LPO/due/method/status.
 */
function buildStatementDescription(
  r: Record<string, unknown>,
  opts: { side?: 'AR' | 'AP'; kind?: 'invoice' | 'payment' | 'line' } = {},
): string | undefined {
  const side = opts.side ?? 'AR';
  const type =
    firstStr(r, ['type', 'document_type', 'invoice_type', 'payment_type']) ??
    (opts.kind === 'payment' ? 'PAYMENT' : opts.kind === 'invoice' ? 'INVOICE' : undefined);
  const narrative = pickNarrative(r);

  const kind =
    opts.kind ??
    (type && /payment|receipt|allocation/i.test(type)
      ? 'payment'
      : type && /invoice|credit.?note|debit.?note|sales|purchase/i.test(type)
        ? 'invoice'
        : 'line');

  const parts: string[] = [];
  if (narrative) {
    parts.push(narrative);
  } else {
    const label =
      docKindLabel(type, side) ??
      (kind === 'payment' ? (side === 'AR' ? 'Receipt' : 'Payment') : undefined);
    if (label) parts.push(label);
  }

  const lpo = firstStr(r, ['lpo_number', 'lpoNumber', 'lpo', 'po_number', 'purchase_order']);
  if (lpo) parts.push(`LPO ${lpo}`);

  const job = firstStr(r, [
    'job_number',
    'jobNumber',
    'job_no',
    'job_ref',
    'job_reference',
    'hawb',
    'mawb',
    'bl_number',
  ]);
  if (job) parts.push(`Job ${job}`);
  else {
    const jobId = firstStr(r, ['job_id', 'jobId']);
    if (jobId && !isLikelyUuid(jobId)) parts.push(`Job ${jobId}`);
  }

  if (kind === 'invoice' || kind === 'line') {
    const due = firstStr(r, ['due_date', 'dueDate']);
    if (due) parts.push(`Due ${due}`);

    const total = num(r.total_amount) || num(r.totalAmount) || num(r.amount);
    const paid =
      num(r.paid_amount) || num(r.amount_paid) || num(r.paidAmount) || num(r.paid);
    const remaining =
      num(r.balance_due) ||
      num(r.outstanding_balance) ||
      num(r.outstandingBalance) ||
      (total > 0 && paid >= 0 ? Math.max(0, total - paid) : 0);
    if (paid > 0) parts.push(`Paid ${paid}`);
    if (remaining > 0) parts.push(`Remaining ${remaining}`);
  }

  if (kind === 'payment' || kind === 'line') {
    const method = humanizeToken(
      firstStr(r, [
        'payment_method',
        'paymentMethod',
        'method',
        'mode',
        'payment_mode',
        'instrument',
      ]),
    );
    if (method) parts.push(method);

    const bank = firstStr(r, ['bank_name', 'bankName', 'bank', 'account_name']);
    if (bank) parts.push(bank);

    const cheque = firstStr(r, [
      'cheque_number',
      'check_number',
      'cheque_no',
      'instrument_number',
    ]);
    if (cheque) parts.push(`Cheque ${cheque}`);

    const against = allocationReferences(r);
    if (against) parts.push(`Against ${against}`);
  }

  // Status only when we have no narrative (avoid "POSTED" as the whole description).
  if (!narrative) {
    const statusPart = formatStatusLabel(firstStr(r, ['status']));
    if (statusPart) parts.push(statusPart);
  }

  // Deduplicate while preserving order
  const seen = new Set<string>();
  const unique = parts.filter((part) => {
    const key = part.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return unique.length ? unique.join(' · ') : undefined;
}

export function normalizeStatementLine(
  raw: unknown,
  side: 'AR' | 'AP' = 'AR',
): StatementLine | null {
  const r = asRecord(raw);
  if (!r) return null;
  return {
    ...r,
    id: str(r.id),
    date:
      str(r.date) ??
      str(r.transaction_date) ??
      str(r.doc_date) ??
      str(r.invoice_date) ??
      str(r.payment_date),
    type:
      str(r.type) ??
      str(r.document_type) ??
      str(r.invoice_type) ??
      str(r.payment_type),
    reference:
      str(r.reference) ??
      str(r.reference_number) ??
      str(r.number) ??
      str(r.invoice_number) ??
      str(r.payment_number),
    description: buildStatementDescription(r, { side, kind: 'line' }),
    debit: num(r.debit) || num(r.debit_amount),
    credit: num(r.credit) || num(r.credit_amount),
    balance: num(r.balance) || num(r.running_balance),
    document_id: str(r.document_id) ?? str(r.invoice_id) ?? str(r.payment_id) ?? str(r.id),
    document_number: str(r.document_number) ?? str(r.invoice_number) ?? str(r.payment_number),
  };
}

/**
 * Live API shape: { party, as_of, side, invoices[], payments[], summary }.
 * Build debit/credit statement lines with a running balance.
 * AR: invoice → debit, credit note / receipt → credit.
 * AP: purchase invoice → credit (we owe), payment / debit note → debit.
 */
function linesFromInvoicesAndPayments(
  root: Record<string, unknown>,
  side: 'AR' | 'AP',
): StatementLine[] {
  const invoices = Array.isArray(root.invoices) ? root.invoices : [];
  const payments = Array.isArray(root.payments) ? root.payments : [];
  const events: StatementLine[] = [];

  for (const inv of invoices) {
    const r = asRecord(inv);
    if (!r) continue;
    const type = str(r.invoice_type) ?? str(r.type) ?? 'INVOICE';
    const amount = num(r.total_amount) || num(r.balance_due) || num(r.amount);
    const creditNote = isCreditNoteType(type);
    let debit = 0;
    let credit = 0;
    if (side === 'AR') {
      if (creditNote) credit = amount;
      else debit = amount;
    } else {
      if (creditNote || /debit.?note/i.test(type)) debit = amount;
      else credit = amount;
    }
    events.push({
      id: str(r.id) ?? str(r.invoice_id),
      date: str(r.invoice_date) ?? str(r.date),
      type,
      reference: str(r.invoice_number) ?? str(r.number),
      description: buildStatementDescription(
        { ...r, type, invoice_type: type },
        { side, kind: 'invoice' },
      ),
      debit,
      credit,
      document_id: str(r.id) ?? str(r.invoice_id),
      document_number: str(r.invoice_number),
      currency_code: str(r.currency_code),
    });
  }

  for (const pay of payments) {
    const r = asRecord(pay);
    if (!r) continue;
    const amount =
      num(r.amount) ||
      num(r.total_amount) ||
      num(r.allocated_amount) ||
      num(r.payment_amount);
    const type = str(r.payment_type) ?? str(r.type) ?? (side === 'AR' ? 'RECEIPT' : 'PAYMENT');
    events.push({
      id: str(r.id) ?? str(r.payment_id),
      date: str(r.payment_date) ?? str(r.date) ?? str(r.paid_at),
      type,
      reference: str(r.payment_number) ?? str(r.number) ?? str(r.reference),
      description: buildStatementDescription(
        { ...r, type, payment_type: type },
        { side, kind: 'payment' },
      ),
      debit: side === 'AP' ? amount : 0,
      credit: side === 'AR' ? amount : 0,
      document_id: str(r.id) ?? str(r.payment_id),
      document_number: str(r.payment_number) ?? str(r.number),
      currency_code: str(r.currency_code),
    });
  }

  events.sort((a, b) => String(a.date ?? '').localeCompare(String(b.date ?? '')));

  let running = 0;
  return events.map((line) => {
    running += (line.debit ?? 0) - (line.credit ?? 0);
    return { ...line, balance: running };
  });
}

function unwrapStatementLines(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const envelope = asRecord(raw);
  if (!envelope) return [];
  const named =
    (Array.isArray(envelope.lines) && envelope.lines) ||
    (Array.isArray(envelope.items) && envelope.items) ||
    (Array.isArray(envelope.transactions) && envelope.transactions) ||
    (Array.isArray(envelope.entries) && envelope.entries) ||
    (Array.isArray(envelope.data) && envelope.data);
  if (named) return named;
  const nested = asRecord(envelope.data);
  if (nested) {
    return (
      (Array.isArray(nested.lines) && nested.lines) ||
      (Array.isArray(nested.items) && nested.items) ||
      (Array.isArray(nested.transactions) && nested.transactions) ||
      []
    );
  }
  return [];
}

export function normalizeStatementReport(raw: unknown, partyId?: string) {
  const envelope = asRecord(raw);
  const nested = asRecord(envelope?.data);
  const root = nested ?? envelope ?? {};
  const party = asRecord(root.party) ?? asRecord(root.customer) ?? asRecord(root.vendor);
  const summary = asRecord(root.summary);
  const sideRaw = (str(root.side) ?? 'AR').toUpperCase();
  const side: 'AR' | 'AP' = sideRaw === 'AP' ? 'AP' : 'AR';

  let lines = unwrapStatementLines(raw)
    .map((line) => normalizeStatementLine(line, side))
    .filter((l): l is StatementLine => Boolean(l));

  if (!lines.length && (Array.isArray(root.invoices) || Array.isArray(root.payments))) {
    lines = linesFromInvoicesAndPayments(root, side);
  }

  const currencyFromLines = lines
    .map((l) => str(l.currency_code) ?? str(l.currencyCode))
    .find(Boolean);

  return {
    party_id: str(root.party_id) ?? str(party?.id) ?? partyId,
    party_name: str(root.party_name) ?? str(party?.name) ?? str(root.name),
    as_of: str(root.as_of) ?? str(root.as_of_date),
    opening_balance: num(root.opening_balance),
    closing_balance:
      num(root.closing_balance) ||
      num(summary?.open_balance) ||
      num(root.balance) ||
      (lines.length ? num(lines[lines.length - 1]?.balance) : 0),
    currency_code: (
      str(root.currency_code) ??
      str(party?.currency_code) ??
      currencyFromLines
    )?.toUpperCase(),
    lines,
    raw,
  };
}

function normalizeOpenItemLine(raw: unknown): import('../types/arApAging.types').OpenItemLine | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = str(r.id) ?? str(r.invoice_id) ?? str(r.document_id);
  if (!id) return null;
  const party = asRecord(r.party) ?? asRecord(r.customer) ?? asRecord(r.vendor);
  return {
    id,
    number:
      str(r.invoice_number) ??
      str(r.number) ??
      str(r.document_number) ??
      str(r.ref) ??
      id,
    partyId: str(r.party_id) ?? str(r.partyId) ?? str(party?.id),
    partyName:
      str(r.party_name) ??
      str(r.partyName) ??
      str(r.customer_name) ??
      str(r.vendor_name) ??
      str(party?.name),
    invoiceDate: str(r.invoice_date) ?? str(r.invoiceDate) ?? str(r.date),
    dueDate: str(r.due_date) ?? str(r.dueDate),
    currencyCode: (str(r.currency_code) ?? str(r.currencyCode) ?? str(r.currency))?.toUpperCase(),
    status: str(r.status),
    totalAmount:
      num(r.total_amount) ||
      num(r.totalAmount) ||
      num(r.total) ||
      undefined,
    paidAmount:
      num(r.amount_paid) ||
      num(r.paid_amount) ||
      num(r.paidAmount) ||
      num(r.paid) ||
      undefined,
    balanceDue:
      num(r.balance_due) ||
      num(r.balanceDue) ||
      num(r.outstanding_balance) ||
      num(r.outstandingBalance) ||
      num(r.balance) ||
      num(r.pending) ||
      undefined,
    raw: r,
  };
}

export function normalizeOpenItemsReport(
  raw: unknown,
  partyId?: string,
): import('../types/arApAging.types').OpenItemsResult {
  const envelope = asRecord(raw);
  const nested = asRecord(envelope?.data);
  const meta = asRecord(envelope?.meta) ?? asRecord(nested?.meta);
  const root = nested ?? envelope ?? {};
  const list =
    (Array.isArray(root.items) && root.items) ||
    (Array.isArray(root.open_items) && root.open_items) ||
    (Array.isArray(root.invoices) && root.invoices) ||
    (Array.isArray(root.results) && root.results) ||
    (Array.isArray(raw) && raw) ||
    (Array.isArray(envelope?.data) && (envelope.data as unknown[])) ||
    [];

  const items = (list as unknown[])
    .map(normalizeOpenItemLine)
    .filter((x): x is import('../types/arApAging.types').OpenItemLine => Boolean(x));

  const totalOutstanding =
    num(meta?.total_outstanding) ||
    num(root.total_outstanding) ||
    num(root.outstanding) ||
    items.reduce((s, i) => s + (i.balanceDue ?? 0), 0) ||
    undefined;
  const totalPaid =
    num(meta?.total_paid) ||
    num(root.total_paid) ||
    num(root.paid) ||
    items.reduce((s, i) => s + (i.paidAmount ?? 0), 0) ||
    undefined;

  const first = items[0];
  return {
    items,
    partyId: str(root.party_id) ?? first?.partyId ?? partyId,
    partyName: str(root.party_name) ?? str(root.name) ?? first?.partyName,
    currencyCode: (
      str(root.currency_code) ??
      str(root.currencyCode) ??
      first?.currencyCode
    )?.toUpperCase(),
    totalOutstanding: totalOutstanding || undefined,
    totalPaid: totalPaid || undefined,
    raw,
  };
}
