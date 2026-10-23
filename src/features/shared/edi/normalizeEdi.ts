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
  // Prefer official CSDP manifest TXT as the demo primary picker default.
  const preferred = out.findIndex((t) => t.code === 'MANIFEST_CSDP');
  if (preferred > 0) {
    const [row] = out.splice(preferred, 1);
    out.unshift(row);
  }
  return out;
}

/** Pull submission id from generate EDI response for immediate download. */
export function pickEdiSubmissionId(raw: unknown): string | null {
  if (typeof raw === 'string' && raw.trim()) {
    const s = raw.trim();
    return s.length >= 8 ? s : null;
  }
  const rec = asRecord(raw);
  if (!rec) return null;
  for (const key of [
    'id',
    'submission_id',
    'submissionId',
    'edi_submission_id',
    'ediSubmissionId',
  ]) {
    const v = String(rec[key] ?? '').trim();
    if (v) return v;
  }
  const nested =
    asRecord(rec.submission) ??
    asRecord(rec.data) ??
    asRecord(rec.result) ??
    asRecord(rec.edi_submission) ??
    asRecord(rec.ediSubmission);
  if (nested) return pickEdiSubmissionId(nested);
  return null;
}

export function pickEdiFileNameFromGenerate(
  raw: unknown,
  ediType: string,
): string | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const name = String(
    rec.file_name ?? rec.fileName ?? rec.filename ?? rec.name ?? '',
  ).trim();
  if (name) return name;
  const nested =
    asRecord(rec.submission) ?? asRecord(rec.data) ?? asRecord(rec.result);
  if (nested) {
    const nestedName = String(
      nested.file_name ?? nested.fileName ?? nested.filename ?? '',
    ).trim();
    if (nestedName) return nestedName;
  }
  if (/MANIFEST_CSDP|CSDP/i.test(ediType)) {
    return 'MENIFIEST.txt';
  }
  return null;
}

export function normalizeEdiSubmissions(raw: unknown): JobEdiSubmission[] {
  const out: JobEdiSubmission[] = [];
  for (const row of unwrapList(raw)) {
    const rec = asRecord(row);
    if (!rec) continue;
    const id = String(rec.id ?? rec.submission_id ?? '').trim();
    if (!id) continue;
    const mime =
      String(rec.mime_type ?? rec.mimeType ?? rec.content_type ?? '').trim() ||
      undefined;
    const ediType =
      String(rec.edi_type ?? rec.type ?? rec.code ?? '').trim() || undefined;
    let fileName =
      String(rec.file_name ?? rec.fileName ?? rec.filename ?? '').trim() ||
      undefined;
    const isTxt =
      mime?.includes('text/plain') ||
      /\.txt$/i.test(fileName || '') ||
      /MANIFEST_CSDP|CSDP/i.test(ediType || '');
    if (fileName && isTxt && !/\.txt$/i.test(fileName)) {
      fileName = `${fileName.replace(/\.[^.]+$/, '')}.txt`;
    } else if (fileName && mime?.includes('pdf') && !/\.pdf$/i.test(fileName) && !isTxt) {
      fileName = `${fileName.replace(/\.[^.]+$/, '')}.pdf`;
    }
    out.push({
      id,
      edi_type: ediType,
      status: String(rec.status ?? '').trim() || undefined,
      file_name: fileName,
      mime_type: mime || (isTxt ? 'text/plain' : 'application/pdf'),
      download:
        String(rec.download ?? rec.download_path ?? rec.downloadPath ?? '').trim() ||
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
  if (/\.(pdf|xml|edi|txt|json)$/i.test(name)) return name;
  return `${name.replace(/\.[^.]+$/, '') || 'edi-submission'}.pdf`;
}

function ensureDownloadName(name: string, blob: Blob): string {
  const type = (blob.type || '').toLowerCase();
  const base = name.replace(/\.[^.]+$/, '') || 'edi-submission';
  if (type.includes('text/plain') || /\.txt$/i.test(name)) {
    return /\.txt$/i.test(name) ? name : `${base}.txt`;
  }
  if (type.includes('pdf') || /\.pdf$/i.test(name)) {
    return /\.pdf$/i.test(name) ? name : `${base}.pdf`;
  }
  if (/\.(xml|edi|txt|json|pdf)$/i.test(name)) return name;
  if (type.includes('json')) return `${base}.json`;
  if (type.includes('xml')) return `${base}.xml`;
  if (type.includes('text')) return `${base}.txt`;
  // Legacy printable EDI is PDF; MANIFEST_CSDP streams text/plain.
  return `${base}.pdf`;
}

function blobLooksLikePdf(blob: Blob): boolean {
  const type = (blob.type || '').toLowerCase();
  return type.includes('pdf');
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

/**
 * Fetch EDI only via authenticated API paths (Bearer). Never anonymous S3/R2 —
 * those caused CORS; download endpoints now stream application/pdf.
 */
async function blobFromAuthenticatedEdiUrl(url: string, hops = 0): Promise<Blob> {
  if (hops > 2) {
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
  if (!authUrl) {
    throw new Error(
      'EDI download must use the API submission download path (Bearer PDF), not an external file URL.',
    );
  }

  const res = await withGatewayRetry(() =>
    axiosInstance.get(authUrl, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf, application/json, */*',
      },
    }),
  );
  const blob = res.data as Blob;
  const contentType = String(
    res.headers?.['content-type'] ?? blob.type ?? '',
  ).toLowerCase();

  if (contentType.includes('pdf') || blobLooksLikePdf(blob)) {
    return blob.type?.includes('pdf')
      ? blob
      : new Blob([blob], { type: 'application/pdf' });
  }

  // Small JSON error / legacy envelope — do not chase external S3 URLs.
  if (
    blob instanceof Blob &&
    blob.size > 0 &&
    blob.size < 16_384 &&
    (contentType.includes('json') || contentType.includes('text/plain') || !contentType)
  ) {
    const text = await blob.text();
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        const errRec = asRecord(parsed);
        const message = errRec
          ? String(
              Array.isArray(errRec.message)
                ? errRec.message.join('; ')
                : errRec.message ?? errRec.error ?? '',
            ).trim()
          : '';
        if (message) throw new Error(message);

        const nestedUrl = pickEdiDownloadUrl(parsed);
        const nestedAuth = nestedUrl
          ? toAuthenticatedEdiRequestUrl(nestedUrl)
          : null;
        if (
          nestedAuth &&
          nestedAuth !== authUrl &&
          /\/edi\/submissions\//i.test(nestedAuth)
        ) {
          return blobFromAuthenticatedEdiUrl(nestedAuth, hops + 1);
        }
        if (nestedUrl && !nestedAuth) {
          throw new Error(
            'EDI download returned an external file URL. Use GET …/edi/submissions/:id/download (PDF stream).',
          );
        }
      } catch (err) {
        if (err instanceof Error) throw err;
      }
      return new Blob([text], { type: contentType || 'application/json' });
    }
    if (trimmed.startsWith('%PDF')) {
      return new Blob([trimmed], { type: 'application/pdf' });
    }
  }

  return blob;
}

/**
 * Normalize a download endpoint response into a Blob.
 * API streams application/pdf with Content-Disposition: attachment —
 * do not chase JSON download_url / S3 links.
 */
export async function resolveEdiDownloadPayload(
  blob: Blob,
  contentTypeHeader?: string,
): Promise<Blob | unknown> {
  const contentType = String(
    contentTypeHeader ?? blob.type ?? '',
  ).toLowerCase();

  if (contentType.includes('pdf') || blobLooksLikePdf(blob)) {
    return blob.type?.includes('pdf')
      ? blob
      : new Blob([blob], { type: 'application/pdf' });
  }

  // Official CSDP manifest and other text EDI.
  if (contentType.includes('text/plain') || contentType.includes('charset=utf-8')) {
    return blob.type?.includes('text')
      ? blob
      : new Blob([blob], { type: 'text/plain; charset=utf-8' });
  }

  // Only probe small payloads for JSON errors / legacy envelopes.
  if (
    blob.size > 0 &&
    blob.size < 16_384 &&
    (contentType.includes('json') ||
      contentType.includes('text/plain') ||
      contentType.includes('octet-stream') ||
      !contentType)
  ) {
    try {
      const text = await blob.text();
      const trimmed = text.trim();
      if (trimmed.startsWith('%PDF')) {
        return new Blob([trimmed], { type: 'application/pdf' });
      }
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return JSON.parse(trimmed) as unknown;
      }
      if (trimmed.startsWith('<')) {
        return new Blob([trimmed], { type: 'application/xml' });
      }
      // VOY/BOL/CTR/CON/END style lines
      if (/^"?VOY"?[,:]/im.test(trimmed) || /CSDPAEDI/i.test(trimmed)) {
        return new Blob([text], { type: 'text/plain; charset=utf-8' });
      }
      return new Blob([text], {
        type: contentType || 'application/octet-stream',
      });
    } catch {
      /* fall through */
    }
  }

  if (contentType.includes('xml')) {
    return blob;
  }
  if (contentType.includes('text')) {
    return blob.type?.includes('text')
      ? blob
      : new Blob([blob], { type: 'text/plain; charset=utf-8' });
  }

  return blob;
}

/**
 * Save EDI download as a file. Prefer PDF streamed from
 * GET …/edi/submissions/:id/download (Bearer). Never open in a tab.
 */
export async function saveEdiDownload(
  raw: unknown,
  fallbackName = 'edi-submission.pdf',
): Promise<void> {
  if (raw instanceof Blob) {
    // Error JSON sometimes arrives as a small application/json blob.
    if (raw.size > 0 && raw.size < 4096) {
      const type = (raw.type || '').toLowerCase();
      if (type.includes('json') || (!type && !blobLooksLikePdf(raw))) {
        try {
          const text = await raw.text();
          const trimmed = text.trim();
          if (trimmed.startsWith('%PDF')) {
            const pdfBlob = new Blob([trimmed], { type: 'application/pdf' });
            triggerBlobDownload(
              pdfBlob,
              ensureDownloadName(pickEdiFileName(null, fallbackName), pdfBlob),
            );
            return;
          }
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
    const fileBlob =
      blobLooksLikePdf(raw as Blob) && !(raw as Blob).type?.includes('pdf')
        ? new Blob([raw as Blob], { type: 'application/pdf' })
        : (raw as Blob);
    triggerBlobDownload(
      fileBlob,
      ensureDownloadName(pickEdiFileName(null, fallbackName), fileBlob),
    );
    return;
  }

  const url = pickEdiDownloadUrl(raw);
  if (url) {
    // Only authenticated API download paths — never S3/R2 (CORS).
    const blob = await blobFromAuthenticatedEdiUrl(url);
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
    const looksEdiMessage =
      rec &&
      ('JobNumber' in rec ||
        'EdiMessage' in rec ||
        'edi_type' in rec ||
        'MblNumber' in rec);
    if (looksEdiMessage) {
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
      pickEdiFileName(raw, fallbackName).replace(/\.(xml|pdf)$/i, '.json'),
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
