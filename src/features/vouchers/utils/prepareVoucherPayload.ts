const HEADER_ALLOWED = new Set([
  'voucher_type',
  'currency_code',
  'exchange_rate',
  'voucher_date',
  'narration',
  'reference_number',
  'company_id',
  'branch_id',
  'party_id',
  'job_id',
  'invoice_id',
  'lines',
]);

const LINE_ALLOWED = new Set([
  'account_id',
  'debit_amount',
  'credit_amount',
  'currency_code',
  'exchange_rate',
  'narration',
  'party_id',
  'job_id',
  'cost_center',
]);

function cleanScalar(key: string, value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') {
    const t = value.trim();
    if (!t) return undefined;
    if (key === 'currency_code') return t.toUpperCase();
    return t;
  }
  if (typeof value === 'number' && Number.isNaN(value)) return undefined;
  return value;
}

function prepareLine(dto: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (!LINE_ALLOWED.has(key)) continue;
    const cleaned = cleanScalar(key, value);
    if (cleaned === undefined) continue;
    out[key] = cleaned;
  }
  if (!out.account_id || typeof out.account_id !== 'string') {
    throw new Error('Account is required on each voucher line.');
  }
  if (out.debit_amount == null) out.debit_amount = 0;
  if (out.credit_amount == null) out.credit_amount = 0;
  return out;
}

export function prepareVoucherPayload<T extends Record<string, unknown>>(dto: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (!HEADER_ALLOWED.has(key)) continue;
    if (key === 'lines') {
      if (!Array.isArray(value) || value.length === 0) continue;
      out.lines = value.map((line) => prepareLine({ ...(line as Record<string, unknown>) }));
      continue;
    }
    const cleaned = cleanScalar(key, value);
    if (cleaned === undefined) continue;
    out[key] = cleaned;
  }
  if (!out.voucher_type) throw new Error('Voucher type is required.');
  return out as T;
}

export function prepareVoucherUpdatePayload<T extends Record<string, unknown>>(dto: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (!HEADER_ALLOWED.has(key) || key === 'lines') continue;
    const cleaned = cleanScalar(key, value);
    if (cleaned === undefined) continue;
    out[key] = cleaned;
  }
  return out as T;
}

export function prepareVoucherLinePayload<T extends Record<string, unknown>>(dto: T): T {
  return prepareLine({ ...dto }) as T;
}

export function prepareVoucherLineUpdatePayload<T extends Record<string, unknown>>(dto: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (!LINE_ALLOWED.has(key)) continue;
    const cleaned = cleanScalar(key, value);
    if (cleaned === undefined) continue;
    out[key] = cleaned;
  }
  return out as T;
}
