import type {
  ReportExportFormat,
  ReportTemplateParamField,
} from '../types/reportCatalog.types';

/** File extension for a report export format (PDF / XLSX / CSV). */
export function downloadExtensionForFormat(format?: string | null): string {
  const key = String(format || 'PDF')
    .trim()
    .toUpperCase() as ReportExportFormat | string;
  if (key === 'XLSX' || key === 'XLS') return 'xlsx';
  if (key === 'CSV') return 'csv';
  return 'pdf';
}

export type ReportContextIds = {
  job_id?: string;
  quotation_id?: string;
  invoice_id?: string;
  party_id?: string;
  /** Live shipment — not an OpenAPI report context enum; used for PDF hydration. */
  shipment_id?: string;
};

const CONTEXT_KEYS = [
  'job_id',
  'quotation_id',
  'invoice_id',
  'party_id',
  'shipment_id',
] as const;

/**
 * Merge deep-link / launcher context with form parameter values.
 * Form values win when non-empty so Generate uses what the user typed.
 */
export function mergeReportContextIds(
  context?: ReportContextIds | null,
  params?: Record<string, string> | null,
): ReportContextIds {
  const pick = (key: (typeof CONTEXT_KEYS)[number]): string | undefined => {
    const fromParams = String(params?.[key] ?? '').trim();
    if (fromParams) return fromParams;
    const fromContext = String(context?.[key] ?? '').trim();
    return fromContext || undefined;
  };
  return {
    job_id: pick('job_id'),
    quotation_id: pick('quotation_id'),
    invoice_id: pick('invoice_id'),
    party_id: pick('party_id'),
    shipment_id: pick('shipment_id'),
  };
}

export function hasReportEntityContext(context?: ReportContextIds | null): boolean {
  if (!context) return false;
  return Boolean(
    context.job_id ||
      context.quotation_id ||
      context.invoice_id ||
      context.party_id ||
      context.shipment_id,
  );
}

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
  if (context?.shipment_id) out.shipment_id = context.shipment_id;
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

    switch (field.type) {
      case 'number': {
        const n = Number(raw);
        if (!Number.isFinite(n)) {
          return { parameters: {}, error: `Invalid number: ${field.label}` };
        }
        parameters[field.name] = n;
        break;
      }
      case 'boolean':
        parameters[field.name] = raw === 'true' || raw === '1' || raw.toLowerCase() === 'yes';
        break;
      case 'uuid':
      case 'date':
      case 'string':
      case 'select':
      default:
        parameters[field.name] = raw;
        break;
    }
  }

  // Always pass through known context ids even when schema omits them.
  for (const key of CONTEXT_KEYS) {
    if (byName.has(key)) continue;
    const raw = String(values[key] ?? '').trim();
    if (raw) parameters[key] = raw;
  }

  return { parameters };
}
