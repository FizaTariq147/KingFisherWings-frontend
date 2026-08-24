import { resolvePdfUrl } from '@/features/invoices/utils/normalizeInvoicePdf';
import type { LetterGenerateResult, LetterPdfInfo, LetterRecord } from '../types/hr.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function isLetterApiPath(url: string): boolean {
  return /(^|\/)hr\/letters(\/|$)/i.test(url);
}

function pickLetterFileUrl(record: Record<string, unknown>): string | undefined {
  for (const key of [
    'pdf_url',
    'file_url',
    'file_path',
    'storage_path',
    'storage_key',
    'filename',
    'path',
    'download_url',
  ]) {
    const value = pickString(record[key]);
    if (value && !isLetterApiPath(value)) {
      const resolved = resolvePdfUrl(value);
      if (resolved) return resolved;
    }
  }
  for (const key of ['file', 'document', 'pdf', 'storage']) {
    const nested = asRecord(record[key]);
    if (nested) {
      const url = pickLetterFileUrl(nested);
      if (url) return url;
    }
  }
  return undefined;
}

export function normalizeLetterPdfInfo(raw: unknown): LetterPdfInfo {
  const root = asRecord(raw) ?? {};
  const data = asRecord(root.data) ?? root;

  let pdf_url = pickLetterFileUrl(data);
  if (!pdf_url) {
    const candidate = pickString(
      data.pdf_url,
      data.file_url,
      data.file_path,
      data.download_url,
    );
    if (candidate && !isLetterApiPath(candidate)) {
      pdf_url = resolvePdfUrl(candidate);
    }
  }

  const letter_id = pickString(data.letter_id, data.id);

  return {
    ...data,
    pdf_url,
    letter_id,
    status: pdf_url ? 'READY' : pickString(data.status) || 'PENDING',
  };
}

export function letterPdfInfoFromGenerateResult(result: LetterGenerateResult): LetterPdfInfo {
  const letter = result.letter ?? undefined;
  const pdfBlob = result.pdfBlob;
  let pdf_url = result.pdfUrl || letter?.pdf_url;

  if (pdfBlob) {
    pdf_url = URL.createObjectURL(pdfBlob);
  }

  return {
    pdf_url,
    pdfBlob,
    letter_id: letter?.id,
    letter,
    status: pdf_url || pdfBlob ? 'READY' : letter?.id ? 'PENDING' : 'NOT_FOUND',
  };
}

export function letterPdfReference(letter: LetterRecord): string {
  const type = letter.letter_type.replace(/_/g, '-');
  const date = letter.generated_at || new Date().toISOString().slice(0, 10);
  return `HR-${type}-${date}`.slice(0, 180);
}
