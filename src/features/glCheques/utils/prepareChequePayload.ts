const CREATE_ALLOWED = new Set([
  'cheque_number',
  'cheque_type',
  'party_id',
  'amount',
  'currency_code',
  'cheque_date',
  'due_date',
  'is_pdc',
  'company_id',
  'bank_account_id',
  'bank_name',
  'remarks',
]);

const UPDATE_ALLOWED = CREATE_ALLOWED;

function cleanScalar(key: string, value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') {
    const t = value.trim();
    if (!t) return undefined;
    if (key === 'currency_code') return t.toUpperCase();
    return t;
  }
  if (typeof value === 'number' && Number.isNaN(value)) return undefined;
  if (typeof value === 'boolean') return value;
  return value;
}

function pickAllowed<T extends Record<string, unknown>>(
  dto: T,
  allowed: Set<string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (!allowed.has(key)) continue;
    const cleaned = cleanScalar(key, value);
    if (cleaned === undefined) continue;
    out[key] = cleaned;
  }
  return out;
}

/** Swagger `CreateChequeDto` — only documented fields. */
export function prepareCreateChequePayload<T extends Record<string, unknown>>(dto: T): T {
  const out = pickAllowed(dto, CREATE_ALLOWED);
  if (!out.cheque_number) throw new Error('Cheque number is required.');
  if (!out.cheque_type) throw new Error('Cheque type is required.');
  if (!out.party_id) throw new Error('Party is required.');
  if (typeof out.amount !== 'number' || !(out.amount >= 0.0001)) {
    throw new Error('Amount must be at least 0.0001.');
  }
  if (!out.currency_code) throw new Error('Currency is required.');
  if (!out.cheque_date) throw new Error('Cheque date is required.');
  return out as T;
}

/** Swagger `UpdateChequeDto` — only documented fields. */
export function prepareUpdateChequePayload<T extends Record<string, unknown>>(dto: T): T {
  return pickAllowed(dto, UPDATE_ALLOWED) as T;
}

/** Swagger `BounceChequeDto`. */
export function prepareBounceChequePayload<T extends Record<string, unknown>>(dto: T): T {
  const out: Record<string, unknown> = {};
  const reason = cleanScalar('reason', dto.reason);
  if (reason !== undefined) out.reason = reason;
  return out as T;
}
