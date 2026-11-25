/**
 * Reports engine / catalogue gate.
 *
 * Prefer the runtime config loaded at app start (`/reports-config.json`).
 * Build-time `VITE_REPORTS_*` values are defaults only when the runtime file
 * omits a field. A failed fetch forces engine `legacy` (see reportsRuntimeConfig).
 */
import {
  buildTimeReportsEngine,
  buildTimeReportsGate,
  getReportsRuntimeConfig,
} from './reportsRuntimeConfig';

export type ReportsEngine = 'legacy' | 'v2';
export type ReportsCatalogueGate = 'soft' | 'hard';

export function reportsEngine(): ReportsEngine {
  const runtime = getReportsRuntimeConfig();
  if (runtime.source === 'build-default') return buildTimeReportsEngine();
  return runtime.engine;
}

/** Catalogue gating. Soft is the default when runtime/build omit gate. */
export function reportsCatalogueGate(raw?: string): ReportsCatalogueGate {
  if (raw != null && String(raw).trim() !== '') {
    const value = String(raw).trim().toLowerCase();
    return value === 'hard' ? 'hard' : 'soft';
  }
  const runtime = getReportsRuntimeConfig();
  if (runtime.source === 'build-default') return buildTimeReportsGate();
  return runtime.gate;
}

/**
 * Organization and company records in this frontend have no defaultPdfStyle.
 * A missing value is classic. This reads the property only when a payload
 * already carries it. It does not create a stored field.
 */
export function readDefaultPdfStyle(source: unknown): string {
  if (!source || typeof source !== 'object') return 'classic';
  const value = (source as { defaultPdfStyle?: unknown }).defaultPdfStyle;
  if (typeof value !== 'string') return 'classic';
  const text = value.trim();
  return text || 'classic';
}
