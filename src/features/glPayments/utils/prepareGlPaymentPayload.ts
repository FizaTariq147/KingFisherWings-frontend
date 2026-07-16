const HEADER_ALLOWED = new Set([
  'direction',
  'payment_method',
  'party_id',
  'amount',
  'currency_code',
  'exchange_rate',
  'payment_date',
  'company_id',
  'branch_id',
  'bank_account_id',
  'gl_account_id',
  'reference_number',
  'narration',
  'allocations',
  'cheque_number',
  'cheque_date',
  'cheque_due_date',
  'cheque_bank_name',
  'is_pdc',
]);

const ALLOCATION_ALLOWED = new Set(['invoice_id', 'amount']);

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

function prepareAllocation(dto: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (!ALLOCATION_ALLOWED.has(key)) continue;
    const cleaned = cleanScalar(key, value);
    if (cleaned === undefined) continue;
    out[key] = cleaned;
  }
  if (!out.invoice_id || typeof out.invoice_id !== 'string') {
    throw new Error('Invoice is required for allocation.');
  }
  if (typeof out.amount !== 'number' || !(out.amount >= 0.0001)) {
    throw new Error('Allocation amount must be at least 0.0001.');
  }
  return out;
}

export function prepareGlPaymentPayload<T extends Record<string, unknown>>(dto: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (!HEADER_ALLOWED.has(key)) continue;
    if (key === 'allocations') {
      if (!Array.isArray(value) || value.length === 0) continue;
      out.allocations = value.map((row) =>
        prepareAllocation({ ...(row as Record<string, unknown>) }),
      );
      continue;
    }
    const cleaned = cleanScalar(key, value);
    if (cleaned === undefined) continue;
    out[key] = cleaned;
  }
  if (!out.direction) throw new Error('Direction is required.');
  if (!out.party_id) throw new Error('Party is required.');
  if (typeof out.amount !== 'number' || !(out.amount >= 0.0001)) {
    throw new Error('Amount must be at least 0.0001.');
  }
  if (!out.currency_code) throw new Error('Currency is required.');
  return out as T;
}

export function prepareGlPaymentUpdatePayload<T extends Record<string, unknown>>(dto: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (!HEADER_ALLOWED.has(key)) continue;
    if (key === 'allocations') continue;
    const cleaned = cleanScalar(key, value);
    if (cleaned === undefined) continue;
    out[key] = cleaned;
  }
  return out as T;
}

export function preparePaymentAllocationPayload<T extends Record<string, unknown>>(dto: T): T {
  return prepareAllocation({ ...dto }) as T;
}
