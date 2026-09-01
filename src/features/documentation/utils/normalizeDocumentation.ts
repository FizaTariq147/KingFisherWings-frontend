import { asRecord } from './documentationUnwrap';
import type { DocumentationRecord } from '../types/documentation.types';

export function str(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

export function normalizeDocumentationRecord(raw: unknown): DocumentationRecord | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = str(record.id) ?? str(record.job_id) ?? str(record.boe_id) ?? str(record.submission_id);
  if (!id) return null;
  return { id, ...record };
}

export function normalizeMany<T>(
  items: unknown[],
  normalizer: (raw: unknown) => T | null,
): T[] {
  return items.map(normalizer).filter((item): item is T => item != null);
}

export function displayRecordValue(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function columnsFromRecords(rows: DocumentationRecord[], preferred: string[] = []): string[] {
  if (rows.length === 0) return preferred;
  const keys = new Set<string>();
  preferred.forEach((k) => keys.add(k));
  Object.keys(rows[0] ?? {}).forEach((k) => {
    if (k !== 'id' && !k.endsWith('_id')) keys.add(k);
  });
  rows.forEach((row) => Object.keys(row).forEach((k) => keys.add(k)));
  const ordered = preferred.filter((k) => keys.has(k));
  const rest = [...keys].filter((k) => !ordered.includes(k) && k !== 'tenant_id' && k !== 'company_id');
  return [...ordered, ...rest].slice(0, 12);
}

export function formatColumnLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export {
  columnsFromRows,
  extractReportMetrics,
  extractReportRows,
  formatReportCell,
  formatReportLabel,
} from '@/features/quotations/utils/normalizeQuotationReports';
