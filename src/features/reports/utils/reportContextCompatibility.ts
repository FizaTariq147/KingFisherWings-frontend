import type { ReportContext, ReportTemplate, ReportTemplateMeta } from '../types/reportCatalog.types';
import type { ReportContextIds } from './reportParameterUtils';
import { hasReportEntityContext } from './reportParameterUtils';

type ContextCarrier = Pick<ReportTemplate, 'contexts'> | Pick<ReportTemplateMeta, 'contexts'>;

/**
 * Map deep-link entity ids → report context enums that may appear on a template.
 */
export function contextsImpliedByEntityIds(context?: ReportContextIds | null): ReportContext[] {
  if (!context || !hasReportEntityContext(context)) return [];
  const out: ReportContext[] = [];
  if (context.invoice_id) out.push('invoice');
  if (context.quotation_id) out.push('quotation');
  if (context.job_id || context.shipment_id) out.push('job');
  if (context.party_id) out.push('party');
  // List formats remain available from entity pages (ops status lists, etc.).
  out.push('list');
  return out;
}

/**
 * When entity-bound, only show formats whose `contexts` intersect the open record.
 * Templates with empty contexts stay visible (legacy / universal).
 */
export function templateCompatibleWithEntityContext(
  template: ContextCarrier,
  entity?: ReportContextIds | null,
): boolean {
  if (!hasReportEntityContext(entity)) return true;
  const implied = contextsImpliedByEntityIds(entity);
  if (!implied.length) return true;
  const declared = template.contexts ?? [];
  if (!declared.length) return true;
  return declared.some((c) => implied.includes(c));
}

/** Prefer formats that match the primary entity (invoice > quotation > job). */
export function primaryEntityContext(entity?: ReportContextIds | null): ReportContext | null {
  if (!entity) return null;
  if (entity.invoice_id) return 'invoice';
  if (entity.quotation_id) return 'quotation';
  if (entity.job_id || entity.shipment_id) return 'job';
  if (entity.party_id) return 'party';
  return null;
}
