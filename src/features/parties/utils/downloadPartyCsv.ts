import { axiosInstance } from '@/lib/axios';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { withGatewayRetry } from '@/lib/wakeApi';
import { normalizePartyImportCsv } from './normalizePartyImportCsv';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function errorFromJson(parsed: unknown, fallback: string): Error {
  const record = asRecord(parsed) ?? {};
  const message = record.message;
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) return new Error(message.trim());
  if (typeof record.error === 'string' && record.error.trim()) {
    return new Error(record.error.trim());
  }
  return new Error(fallback);
}

async function messageFromAxiosBlobError(error: unknown, fallback: string): Promise<Error> {
  if (error instanceof Error && !(error as { response?: unknown }).response) {
    return error;
  }
  const axiosErr = error as {
    response?: { data?: unknown; status?: number };
    message?: string;
  };
  const data = axiosErr.response?.data;
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    const text = await data.text();
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return errorFromJson(JSON.parse(trimmed), fallback);
      } catch {
        /* fall through */
      }
    }
    if (trimmed) return new Error(trimmed.slice(0, 280));
  }
  if (data && typeof data === 'object' && !(typeof Blob !== 'undefined' && data instanceof Blob)) {
    return errorFromJson(data, fallback);
  }
  const status = axiosErr.response?.status;
  if (status) return new Error(`${fallback} (HTTP ${status}).`);
  return new Error(axiosErr.message || fallback);
}

/** Live API returns JSON: `{ content_type, filename, csv }` (not a raw CSV stream). */
function extractCsvEnvelope(parsed: unknown): { csv: string; filename?: string } | null {
  const root = asRecord(parsed);
  if (!root) return null;

  const nested = asRecord(root.data);
  const candidates = [root, nested].filter(Boolean) as Record<string, unknown>[];

  for (const record of candidates) {
    const csv =
      (typeof record.csv === 'string' && record.csv) ||
      (typeof record.content === 'string' && record.content) ||
      (typeof record.data === 'string' && record.data) ||
      '';
    if (!csv.trim()) continue;
    const filename =
      (typeof record.filename === 'string' && record.filename.trim()) ||
      (typeof record.file_name === 'string' && record.file_name.trim()) ||
      undefined;
    return { csv, filename };
  }
  return null;
}

function safeCsvFilename(name: string | undefined, fallback: string): string {
  const raw = (name || fallback).trim() || fallback;
  const base = raw.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_');
  return /\.csv$/i.test(base) ? base : `${base}.csv`;
}

/**
 * GET /parties/export
 * Backend responds with JSON wrapping CSV text (application/json), not a CSV blob.
 */
export async function downloadPartyCsvExport(
  path: string,
  params: Record<string, string | number>,
  filename: string,
): Promise<void> {
  const filterParams: Record<string, string | number> = { ...params };
  // Export payload is the full filtered set; page/limit are accepted but not required.
  delete filterParams.page;
  delete filterParams.limit;

  try {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(path, {
        params: { ...filterParams, order: filterParams.order ?? 'asc' },
        responseType: 'blob',
        headers: { Accept: 'application/json, text/csv, */*' },
      }),
    );

    const blob = res.data as Blob;
    const headerType =
      typeof res.headers?.['content-type'] === 'string' ? res.headers['content-type'] : '';
    const text = await blob.text();
    const trimmed = text.trim();

    if (!trimmed) {
      throw new Error('Export returned an empty file.');
    }

    if (/html/i.test(headerType) || /^<!doctype html/i.test(trimmed) || /^<html/i.test(trimmed)) {
      throw new Error('Export returned a web page instead of CSV. Check the API base URL / proxy.');
    }

    if (trimmed.startsWith('{') || trimmed.startsWith('[') || /json/i.test(headerType || blob.type || '')) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        throw new Error('Export returned invalid JSON.');
      }

      const envelope = extractCsvEnvelope(parsed);
      if (!envelope) {
        throw errorFromJson(parsed, 'Export failed.');
      }

      let csvText = envelope.csv;
      try {
        csvText = normalizePartyImportCsv(envelope.csv);
      } catch {
        // Keep original if export payload is unexpected; import will still normalize.
      }

      triggerBlobDownload(
        new Blob([csvText], { type: 'text/csv;charset=utf-8' }),
        safeCsvFilename(envelope.filename, filename),
      );
      return;
    }

    // Raw CSV stream fallback
    let csvText = text;
    try {
      csvText = normalizePartyImportCsv(text);
    } catch {
      /* keep original */
    }
    triggerBlobDownload(
      new Blob([csvText], { type: 'text/csv;charset=utf-8' }),
      safeCsvFilename(filename, 'parties.csv'),
    );
  } catch (error) {
    throw await messageFromAxiosBlobError(error, 'Export failed');
  }
}
