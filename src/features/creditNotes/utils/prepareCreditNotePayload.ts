import { isUuid } from '@/lib/isUuid';

const ALLOWED_HEADER_FIELDS = new Set(['credited_invoice_id', 'remarks']);

const UUID_FIELDS = new Set(['credited_invoice_id', 'charge_code_id', 'tax_rate_id']);

const ALLOWED_LINE_FIELDS = new Set([
  'description',
  'quantity',
  'unit_price',
  'charge_code_id',
  'tax_rate_id',
  'is_taxable',
  'sort_order',
]);

function prepareFields(
  dto: Record<string, unknown>,
  allowed: Set<string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(dto)) {
    if (!allowed.has(key)) continue;
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (typeof value === 'number' && Number.isNaN(value)) continue;

    if (UUID_FIELDS.has(key)) {
      const id = String(value).trim();
      if (!isUuid(id)) continue;
      out[key] = id;
      continue;
    }
    if (typeof value === 'string') {
      out[key] = value.trim();
      continue;
    }
    out[key] = value;
  }
  return out;
}

export function prepareCreditNoteLinePayload(
  dto: Record<string, unknown>,
): Record<string, unknown> {
  return prepareFields(dto, ALLOWED_LINE_FIELDS);
}

export function prepareCreditNotePayload(
  dto: Record<string, unknown>,
): Record<string, unknown> {
  const out = prepareFields(dto, ALLOWED_HEADER_FIELDS);
  if (Array.isArray(dto.lines)) {
    const lines: Record<string, unknown>[] = [];
    for (const line of dto.lines) {
      if (!line || typeof line !== 'object') continue;
      const prepared = prepareCreditNoteLinePayload(line as Record<string, unknown>);
      if (prepared.description) lines.push(prepared);
    }
    if (lines.length) out.lines = lines;
  }
  return out;
}
