import { isUuid } from '@/lib/isUuid';

const ALLOWED = new Set([
  'party_id',
  'amount',
  'currency_code',
  'invoice_id',
  'job_id',
  'due_date',
  'remarks',
]);

const UUID_FIELDS = new Set(['party_id', 'invoice_id', 'job_id']);

export function preparePaymentRequestPayload(
  dto: Record<string, unknown>,
  options?: { requireCreateFields?: boolean },
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (!ALLOWED.has(key)) continue;
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (typeof value === 'number' && Number.isNaN(value)) continue;

    if (UUID_FIELDS.has(key)) {
      const id = String(value).trim();
      if (!isUuid(id)) continue;
      out[key] = id;
      continue;
    }
    if (key === 'currency_code' && typeof value === 'string') {
      out[key] = value.trim().toUpperCase().slice(0, 3);
      continue;
    }
    if (key === 'amount') {
      const n = Number(value);
      if (!Number.isFinite(n) || n < 0.01) continue;
      out[key] = n;
      continue;
    }
    if (typeof value === 'string') {
      out[key] = value.trim();
      continue;
    }
    out[key] = value;
  }

  if (options?.requireCreateFields) {
    if (!out.party_id || !isUuid(String(out.party_id))) {
      throw new Error('Party is required (valid UUID).');
    }
    if (typeof out.amount !== 'number' || out.amount < 0.01) {
      throw new Error('Amount must be at least 0.01.');
    }
    if (typeof out.currency_code !== 'string' || out.currency_code.length !== 3) {
      throw new Error('Currency must be a 3-letter code (e.g. AED).');
    }
  }

  return out;
}

export function prepareRejectPayload(dto: Record<string, unknown>): Record<string, unknown> {
  const reason = typeof dto.rejected_reason === 'string' ? dto.rejected_reason.trim() : '';
  return { rejected_reason: reason.slice(0, 500) };
}
