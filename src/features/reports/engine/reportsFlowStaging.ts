import { reportsCatalogueGate } from './reportsEngine';

/**
 * Admin flag for staging-only flow catalogue entries (credit/debit note flow).
 * Soft gate alone is not enough — both must be on.
 */
export function reportsFlowStagingAdminFlag(raw?: string): boolean {
  const value = String(raw ?? import.meta.env?.VITE_REPORTS_FLOW_STAGING ?? '').trim();
  return value === '1' || value.toLowerCase() === 'true';
}

/** Soft catalogue gate AND admin staging flag. */
export function reportsFlowStagingCatalogAllowed(input?: {
  gate?: ReturnType<typeof reportsCatalogueGate>;
  stagingFlag?: string;
}): boolean {
  const gate = input?.gate ?? reportsCatalogueGate();
  if (gate !== 'soft') return false;
  return reportsFlowStagingAdminFlag(input?.stagingFlag);
}
