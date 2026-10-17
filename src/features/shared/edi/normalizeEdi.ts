import { axiosInstance } from '@/lib/axios';
import { getConfiguredApiBase, isApiOriginUrl, isSafeHttpUrl } from '@/lib/safeHttpUrl';
import { withGatewayRetry } from '@/lib/wakeApi';
import { filesService } from '@/features/files/services/files.service';
import { parseFilesApiUrl } from '@/features/files/utils/parseFilesApiUrl';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import {
  JOB_EDI_TYPES,
  type JobEdiSubmission,
  type JobEdiTypeOption,
} from '@/features/jobs/types/job.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function unwrapList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const rec = asRecord(raw);
  if (!rec) return [];
  for (const key of [
    'items',
    'data',
    'results',
    'types',
    'edi_types',
    'submissions',
  ]) {
    const val = rec[key];
    if (Array.isArray(val)) return val;
    const nested = asRecord(val);
    if (nested) {
      for (const nk of ['items', 'data', 'results', 'types', 'submissions']) {
        if (Array.isArray(nested[nk])) return nested[nk] as unknown[];
      }
    }
  }
  return [];
}

export function normalizeEdiTypeOptions(raw: unknown): JobEdiTypeOption[] {
  const list = unwrapList(raw);
  const out: JobEdiTypeOption[] = [];
  const seen = new Set<string>();

  for (const row of list) {
    if (typeof row === 'string' && row.trim()) {
      const code = row.trim();
      if (seen.has(code)) continue;
      seen.add(code);
      out.push({ code, label: code.replaceAll('_', ' ') });
      continue;
    }
    const rec = asRecord(row);
    if (!rec) continue;
    const code = String(
      rec.edi_type ?? rec.code ?? rec.type ?? rec.value ?? rec.id ?? '',
    ).trim();
    if (!code || seen.has(code)) continue;
    seen.add(code);
    out.push({
      code,
      label:
        String(rec.label ?? rec.name ?? rec.description ?? code).trim() ||
        code.replaceAll('_', ' '),
      description:
        typeof rec.description === 'string' ? rec.description : undefined,
    });
  }

  if (!out.length) {
    return JOB_EDI_TYPES.map((code) => ({
      code,
      label: code.replaceAll('_', ' '),
    }));
  }
  return out;
}

export function normalizeEdiSubmissions(raw: unknown): JobEdiSubmission[] {
  const out: JobEdiSubmission[] = [];
  for (const row of unwrapList(raw)) {
    const rec = asRecord(row);
    if (!rec) continue;
    const id = String(rec.id ?? rec.submission_id ?? '').trim();
    if (!id) continue;
    out.push({
      id,
      edi_type: String(rec.edi_type ?? rec.type ?? rec.code ?? '').trim() || undefined,
      status: String(rec.status ?? '').trim() || undefined,
      file_name:
        String(rec.file_name ?? rec.fileName ?? rec.filename ?? '').trim() ||
        undefined,
      created_at:
        String(rec.created_at ?? rec.createdAt ?? rec.submitted_at ?? '').trim() ||
        undefined,
      raw: rec,
    });
  }
  return out;
}

/** Pull a usable download URL from EDI download-url responses. */
export function pickEdiDownloadUrl(raw: unknown): string | null {
  if (typeof raw === 'string' && /^https?:\/\//i.test(raw.trim())) {
    return raw.trim();
  }
  if (typeof raw === 'string' && raw.trim().startsWith('/')) {
    return raw.trim();
  }
  const rec = asRecord(raw);
  if (!rec) return null;
  for (const key of [
    'download_url',
    'downloadUrl',
    'url',
    'file_url',
    'fileUrl',
    'signed_url',
    'signedUrl',
    'href',
  ]) {
    const val = rec[key];
    if (typeof val === 'string' && val.trim()) return val.trim();
  }
  const nested = asRecord(rec.data);
  if (nested) return pickEdiDownloadUrl(nested);
  return null;
}

function pickEdiInlineContent(raw: unknown): string | null {
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (t.startsWith('<') || t.startsWith('{') || t.startsWith('[')) return t;
    return null;
  }
  const rec = asRecord(raw);
  if (!rec) return null;
  for (const key of [
    'content',
    'body',
    'xml',
    'payload',
    'edi_content',
    'ediContent',
    'message',
    'text',
  ]) {
    const val = rec[key];
    if (typeof val === 'string' && val.trim()) return val.trim();
  }
  const nested = asRecord(rec.data);
  if (nested) return pickEdiInlineContent(nested);
  return null;
}

function pickEdiFileName(raw: unknown, fallback: string): string {
  const rec = asRecord(raw);
  const fromRec = rec
    ? String(
        rec.file_name ?? rec.fileName ?? rec.filename ?? rec.name ?? '',
      ).trim()
    : '';
  const name = fromRec || fallback;
  if (/\.(xml|edi|txt|json)$/i.test(name)) return name;
  return `${name.replace(/\.[^.]+$/, '') || 'edi-submission'}.xml`;
}

function ensureDownloadName(name: string, blob: Blob): string {
  const type = (blob.type || '').toLowerCase();
  if (/\.(xml|edi|txt|json)$/i.test(name)) return name;
  if (type.includes('json')) return `${name}.json`;
  if (type.includes('xml') || type.includes('text')) return `${name}.xml`;
  return `${name}.xml`;
}

/**
 * Map an absolute backend file/EDI URL onto a path axios can call with Bearer
 * (works when VITE_API_URL is a relative proxy and isApiOriginUrl is false).
 */
export function toAuthenticatedEdiRequestUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  if (!isSafeHttpUrl(trimmed)) return null;

  if (isApiOriginUrl(trimmed)) return trimmed;

  try {
    const parsed = new URL(trimmed);
    let path = `${parsed.pathname}${parsed.search}`;
    const apiBase = getConfiguredApiBase();

    // Absolute URL to our API host while the app uses a relative proxy base.
    if (apiBase.startsWith('/')) {
      if (path.startsWith(`${apiBase}/`) || path === apiBase) {
        return path === apiBase ? '/' : path.slice(apiBase.length) || '/';
      }
      if (
        /\/(files|jobs|shipments|documentation)\//i.test(path) ||
        /\/edi\//i.test(path)
      ) {
        return path;
      }
    } else {
      const apiOrigin = new URL(apiBase, typeof window !== 'undefined' ? window.location.origin : 'https://local.invalid').origin;
      if (parsed.origin === apiOrigin) {
        if (path.startsWith('/backend/')) {
          path = path.slice('/backend'.length) || '/';
        }
        return path;
      }
      // Common Render / API absolute URLs that still serve EDI/files.
      if (
        /\/(files|jobs|shipments|documentation)\//i.test(path) ||
        /\/edi\//i.test(path)
      ) {
        return path;
      }
    }
  } catch {
    return null;
  }

  return null;
}

async function blobFromUrl(url: string, hops = 0): Promise<Blob> {
  if (hops > 3) {
    throw new Error('EDI download URL redirected too many times.');
  }
  if (!isSafeHttpUrl(url) && !url.startsWith('/')) {
    throw new Error('Unsafe EDI download URL.');
  }

  const filesParsed = parseFilesApiUrl(url);
  if (filesParsed) {
    return filesService.downloadBlob({
      tenantId: filesParsed.tenantId,
      filename: filesParsed.filename,
    });
  }

  const authUrl = toAuthenticatedEdiRequestUrl(url);
  if (authUrl) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(authUrl, { responseType: 'blob' }),
    );
    const blob = res.data as Blob;
    const contentType = String(
      res.headers?.['content-type'] ?? blob.type ?? '',
    ).toLowerCase();
    // Nested JSON URL envelope — unwrap a few levels max.
    if (
      blob instanceof Blob &&
      blob.size > 0 &&
      blob.size < 16_384 &&
      (contentType.includes('json') || contentType.includes('text/plain'))
    ) {
      const text = await blob.text();
      const trimmed = text.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed) as unknown;
          const nestedUrl = pickEdiDownloadUrl(parsed);
          const nestedAuth = nestedUrl
            ? toAuthenticatedEdiRequestUrl(nestedUrl)
            : null;
          if (
            nestedUrl &&
            nestedUrl !== url &&
            nestedAuth !== authUrl
          ) {
            return blobFromUrl(nestedUrl, hops + 1);
          }
          const inline = pickEdiInlineContent(parsed);
          if (inline) {
            const looksJson = inline.startsWith('{') || inline.startsWith('[');
            return new Blob([inline], {
              type: looksJson ? 'application/json' : 'application/xml',
            });
          }
        } catch {
          /* fall through */
        }
        return new Blob([text], { type: contentType || 'application/json' });
      }
      if (trimmed.startsWith('<')) {
        return new Blob([trimmed], { type: 'application/xml' });
      }
      return new Blob([text], { type: contentType || 'application/octet-stream' });
    }
    return blob;
  }

  // Presigned external URL (R2/S3) — anonymous fetch, no Bearer.
  try {
    const res = await fetch(url, { method: 'GET', credentials: 'omit' });
    if (!res.ok) throw new Error(`EDI download failed (${res.status}).`);
    return await res.blob();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'EDI download failed.';
    if (/failed to fetch|networkerror|cors/i.test(msg)) {
      throw new Error(
        'EDI file URL could not be fetched (network/CORS). Try again or ask support to stream the file from the API.',
      );
    }
    throw err instanceof Error ? err : new Error(msg);
  }
}

/**
 * Normalize a download endpoint response (blob or JSON) into Blob | URL envelope | inline content.
 * Used by job/shipment EDI download services.
 */
export async function resolveEdiDownloadPayload(
  blob: Blob,
  contentTypeHeader?: string,
): Promise<Blob | unknown> {
  const contentType = String(
    contentTypeHeader ?? blob.type ?? '',
  ).toLowerCase();

  if (
    contentType.includes('json') ||
    contentType.includes('text/plain') ||
    contentType.includes('octet-stream') ||
    !contentType
  ) {
    try {
      const text = await blob.text();
      const trimmed = text.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return JSON.parse(trimmed) as unknown;
      }
      if (trimmed.startsWith('<')) {
        return new Blob([trimmed], { type: 'application/xml' });
      }
      // Rebuild — blob was consumed.
      return new Blob([text], {
        type: contentType || 'application/octet-stream',
      });
    } catch {
      /* fall through — return original only if still usable */
    }
  }

  if (contentType.includes('xml') || contentType.includes('text')) {
    return blob;
  }

  return blob;
}

/**
 * Save EDI payload as a file download (never open XML in a browser tab —
 * that shows the “no style information” tree view).
 */
export async function saveEdiDownload(
  raw: unknown,
  fallbackName = 'edi-submission.xml',
): Promise<void> {
  if (raw instanceof Blob) {
    // Error JSON sometimes arrives as a small application/json blob.
    if (raw.size > 0 && raw.size < 4096) {
      const type = (raw.type || '').toLowerCase();
      if (type.includes('json') || !type) {
        try {
          const text = await raw.text();
          const trimmed = text.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            const parsed = JSON.parse(trimmed) as unknown;
            const errRec = asRecord(parsed);
            const message = errRec
              ? String(
                  Array.isArray(errRec.message)
                    ? errRec.message.join('; ')
                    : errRec.message ?? errRec.error ?? '',
                ).trim()
              : '';
            if (message && !pickEdiDownloadUrl(parsed) && !pickEdiInlineContent(parsed)) {
              throw new Error(message);
            }
            await saveEdiDownload(parsed, fallbackName);
            return;
          }
          if (trimmed.startsWith('<')) {
            const xmlBlob = new Blob([trimmed], { type: 'application/xml' });
            triggerBlobDownload(
              xmlBlob,
              ensureDownloadName(pickEdiFileName(null, fallbackName), xmlBlob),
            );
            return;
          }
          raw = new Blob([text], { type: type || 'application/octet-stream' });
        } catch (err) {
          if (err instanceof Error && !err.message.includes('JSON')) throw err;
        }
      }
    }
    triggerBlobDownload(
      raw as Blob,
      ensureDownloadName(pickEdiFileName(null, fallbackName), raw as Blob),
    );
    return;
  }

  const url = pickEdiDownloadUrl(raw);
  if (url) {
    const blob = await blobFromUrl(url);
    triggerBlobDownload(
      blob,
      ensureDownloadName(pickEdiFileName(raw, fallbackName), blob),
    );
    return;
  }

  const inline = pickEdiInlineContent(raw);
  if (inline) {
    const looksJson = inline.startsWith('{') || inline.startsWith('[');
    const blob = new Blob([inline], {
      type: looksJson ? 'application/json' : 'application/xml',
    });
    triggerBlobDownload(
      blob,
      ensureDownloadName(pickEdiFileName(raw, fallbackName), blob),
    );
    return;
  }

  // Last resort: object payloads (e.g. EdiMessage) as a downloadable file.
  if (raw && typeof raw === 'object') {
    const rec = asRecord(raw);
    // Prefer XML-looking serialization when keys look like EDI message fields.
    const looksEdiMessage =
      rec &&
      ('JobNumber' in rec ||
        'EdiMessage' in rec ||
        'edi_type' in rec ||
        'MblNumber' in rec);
    if (looksEdiMessage) {
      // Build simple XML if the API returned a parsed EdiMessage object.
      const xml = objectToSimpleXml(rec, 'EdiMessage');
      const blob = new Blob([xml], { type: 'application/xml' });
      triggerBlobDownload(
        blob,
        ensureDownloadName(pickEdiFileName(raw, fallbackName), blob),
      );
      return;
    }
    const blob = new Blob([JSON.stringify(raw, null, 2)], {
      type: 'application/json',
    });
    triggerBlobDownload(
      blob,
      pickEdiFileName(raw, fallbackName).replace(/\.xml$/i, '.json'),
    );
    return;
  }

  throw new Error('No downloadable EDI content returned for this submission.');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function objectToSimpleXml(
  rec: Record<string, unknown>,
  rootName: string,
): string {
  const typeAttr =
    typeof rec.type === 'string' && rec.type.trim()
      ? ` type="${escapeXml(rec.type.trim())}"`
      : '';
  const lines = [`<${rootName}${typeAttr}>`];
  for (const [key, value] of Object.entries(rec)) {
    if (key === 'type' || key === 'raw') continue;
    if (value == null) {
      lines.push(`<${key}/>`);
      continue;
    }
    if (typeof value === 'object') {
      lines.push(
        objectToSimpleXml(value as Record<string, unknown>, key).replace(
          /\n$/u,
          '',
        ),
      );
      continue;
    }
    lines.push(`<${key}>${escapeXml(String(value))}</${key}>`);
  }
  lines.push(`</${rootName}>`);
  return `${lines.join('\n')}\n`;
}

/** @deprecated Prefer saveEdiDownload — opens XML in-tab and confuses users. */
export function openEdiDownload(raw: unknown): void {
  void saveEdiDownload(raw);
}
