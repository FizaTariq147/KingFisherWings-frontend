import type { SavedReport } from '../types/savedReport.types';
import { SAVED_REPORT_TYPES, type SavedReportType } from '../constants/savedReport.constants';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s || undefined;
}

function bool(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 0 || value === '0') return false;
  return undefined;
}

function asReportType(value: unknown): SavedReportType | undefined {
  const s = str(value)?.toUpperCase();
  if (!s) return undefined;
  return (SAVED_REPORT_TYPES as readonly string[]).includes(s) ? (s as SavedReportType) : undefined;
}

export function normalizeSavedReport(raw: unknown): SavedReport | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = str(r.id) || (typeof r.id === 'number' ? String(r.id) : undefined);
  const name = str(r.name);
  const report_type = asReportType(r.report_type);
  if (!id || !name || !report_type) return null;

  const filtersRaw = r.filters;
  const filters =
    filtersRaw && typeof filtersRaw === 'object' && !Array.isArray(filtersRaw)
      ? (filtersRaw as Record<string, unknown>)
      : undefined;

  return {
    id,
    name,
    report_type,
    description: str(r.description),
    filters,
    company_id: str(r.company_id),
    is_shared: bool(r.is_shared),
    created_by: str(r.created_by),
    created_at: str(r.created_at),
    updated_at: str(r.updated_at),
    deleted_at: str(r.deleted_at) ?? null,
  };
}

export function normalizeSavedReports(raw: unknown): SavedReport[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeSavedReport).filter((x): x is SavedReport => Boolean(x));
}
