import type { ReportTemplateParamField } from '../types/reportCatalog.types';

export type ReportContextIds = {
  job_id?: string;
  quotation_id?: string;
  invoice_id?: string;
  party_id?: string;
};

const CONTEXT_KEYS = ['job_id', 'quotation_id', 'invoice_id', 'party_id'] as const;

/**
 * Prefer schema defaults, then overlay launcher context IDs so invoice/job deep-links
 * always pre-fill generate parameters (even when schema omits a context field).
 */
export function buildInitialReportParams(
  fields: ReportTemplateParamField[] | undefined,
  context?: ReportContextIds,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const field of fields ?? []) {
    if (field.default != null && field.default !== '') {
      out[field.name] = String(field.default);
    }
  }
  if (context?.job_id) out.job_id = context.job_id;
  if (context?.quotation_id) out.quotation_id = context.quotation_id;
  if (context?.invoice_id) out.invoice_id = context.invoice_id;
  if (context?.party_id) out.party_id = context.party_id;
  return out;
}

/**
 * Coerce string form values using the dynamic parameter schema.
 * Unknown keys are omitted except explicit context IDs.
 */
export function coerceReportParameters(
  fields: ReportTemplateParamField[],
  values: Record<string, string>,
): { parameters: Record<string, unknown>; error?: string } {
  const parameters: Record<string, unknown> = {};
  const byName = new Map(fields.map((f) => [f.name, f]));

  for (const field of fields) {
    const raw = String(values[field.name] ?? '').trim();
    if (!raw) {
      if (field.required) {
        return { parameters: {}, error: `Required: ${field.label}` };
      }
      continue;
    }
    if (field.type === 'number') {
      const n = Number(raw);
      if (!Number.isFinite(n)) {
        return { parameters: {}, error: `${field.label} must be a number.` };
      }
      parameters[field.name] = n;
      continue;
    }
    if (field.type === 'boolean') {
      parameters[field.name] = raw === 'true' || raw === '1' || raw.toLowerCase() === 'yes';
      continue;
    }
    parameters[field.name] = raw;
  }

  for (const key of CONTEXT_KEYS) {
    if (parameters[key] !== undefined) continue;
    const raw = String(values[key] ?? '').trim();
    if (!raw) continue;
    // Prefer schema typing when the field is declared.
    const field = byName.get(key);
    if (field?.type === 'number') {
      const n = Number(raw);
      if (Number.isFinite(n)) parameters[key] = n;
    } else {
      parameters[key] = raw;
    }
  }

  return { parameters };
}

export function downloadExtensionForFormat(format?: string): string {
  const f = String(format ?? 'pdf').toLowerCase();
  if (f === 'xlsx') return 'xlsx';
  if (f === 'csv') return 'csv';
  return 'pdf';
}
