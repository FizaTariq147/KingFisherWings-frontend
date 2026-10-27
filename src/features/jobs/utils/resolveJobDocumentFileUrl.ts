import { FILES_API } from '@/features/files/api/files.api';
import { isStoredFileUrl } from '@/features/files/utils/parseFilesApiUrl';
import { isApiOriginUrl, isSafeHttpUrl } from '@/lib/safeHttpUrl';

type JobDocumentFileRef = {
  file_url?: string;
  fileUrl?: string;
  s3_key?: string;
  s3Key?: string;
  file_name?: string;
  fileName?: string;
  download_url?: string;
  downloadUrl?: string;
  /** Relative API download path from enriched booking-form documents. */
  download_path?: string;
  downloadPath?: string;
};

function isUsableFileUrl(value: string): boolean {
  return isStoredFileUrl(value) || isSafeHttpUrl(value) || value.startsWith('/files/');
}

function fromS3Key(key: string, tenantId?: string | null): string | null {
  const trimmed = key.trim();
  if (!trimmed) return null;
  if (isUsableFileUrl(trimmed)) return trimmed;
  if (trimmed.startsWith('/files/')) return trimmed;

  const parts = trimmed.split('/').filter(Boolean);
  // Require tenant/filename shape — do not invent `/files/{tenant}/{displayName}`
  // from a bare file name (breaks Download; prefer document UUID API instead).
  if (parts.length >= 2) {
    const filename = parts.slice(1).join('/');
    return FILES_API.download(parts[0], filename);
  }
  void tenantId;
  return null;
}

function pushUnique(out: string[], value: string | null | undefined, opts?: { allowRelativeApi?: boolean }) {
  const trimmed = (value || '').trim();
  if (!trimmed) return;
  const okRelative =
    opts?.allowRelativeApi && trimmed.startsWith('/') && !trimmed.startsWith('//');
  if (!okRelative && !isUsableFileUrl(trimmed)) return;
  if (!out.includes(trimmed)) out.push(trimmed);
}

/**
 * Ordered download candidates for a job document.
 * Prefer stable API `/files/{tenant}/{filename}` (from `s3_key`) over temporary
 * R2/S3 `file_url` / `download_url` so Bearer JWT works; keep presigned URLs as
 * fallbacks when `/files` is unavailable.
 */
/** Recover s3_key from stored file URLs when the key column is empty. */
function s3KeyFromStoredUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  // /files/{tenant}/{filename…}
  const filesMatch = trimmed.match(/\/files\/([^/?#]+)\/(.+?)(?:\?|#|$)/i);
  if (filesMatch?.[1] && filesMatch[2]) {
    return `${filesMatch[1]}/${decodeURIComponent(filesMatch[2])}`;
  }
  // Path-style S3 / R2: …/{bucket}/{tenant}/{filename}
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const path = new URL(trimmed).pathname.replace(/^\/+/, '');
      const parts = path.split('/').filter(Boolean);
      if (parts.length >= 2) {
        // Drop first segment when it looks like a bucket, keep tenant/file
        const maybeKey = parts.length >= 3 ? parts.slice(1).join('/') : parts.join('/');
        if (maybeKey.includes('/')) return decodeURIComponent(maybeKey);
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function resolveJobDocumentFileUrlCandidates(
  doc: JobDocumentFileRef,
  tenantId?: string | null,
): string[] {
  const out: string[] = [];

  let key = (doc.s3_key || doc.s3Key || '').trim();
  if (!key) {
    for (const raw of [
      doc.file_url,
      doc.fileUrl,
      doc.download_url,
      doc.downloadUrl,
      doc.download_path,
      doc.downloadPath,
    ]) {
      const recovered = s3KeyFromStoredUrl(String(raw || ''));
      if (recovered) {
        key = recovered;
        break;
      }
    }
  }
  if (key) {
    pushUnique(out, fromS3Key(key, tenantId));
  }

  const urls = [
    doc.download_path,
    doc.downloadPath,
    doc.file_url,
    doc.fileUrl,
    doc.download_url,
    doc.downloadUrl,
  ];
  // API-origin /files first among explicit URLs, then external/presigned.
  const apiOrigin: string[] = [];
  const external: string[] = [];
  for (const raw of urls) {
    const url = (raw || '').trim();
    if (!url) continue;
    // Relative API paths (e.g. /jobs/:id/documents/:id/download) are usable via axios.
    if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/files/')) {
      pushUnique(out, url, { allowRelativeApi: true });
      continue;
    }
    if (!isUsableFileUrl(url)) continue;
    if (isApiOriginUrl(url) || isStoredFileUrl(url) || url.startsWith('/files/')) {
      apiOrigin.push(url);
    } else {
      external.push(url);
    }
  }
  for (const url of apiOrigin) pushUnique(out, url);
  for (const url of external) pushUnique(out, url);

  // Do not invent `/files/{tenant}/{file_name}` from a display name alone — that path
  // is almost never valid for job documents and breaks Download (prefer document id API).

  return out;
}

/**
 * Resolve a downloadable URL for a job document record from API fields.
 * Prefer `s3_key` → `/files/{tenant}/{filename}` (API-origin, Bearer JWT) over
 * temporary external `file_url` (e.g. Cloudflare R2 presigned URLs).
 */
export function resolveJobDocumentFileUrl(
  doc: JobDocumentFileRef,
  tenantId?: string | null,
): string | null {
  return resolveJobDocumentFileUrlCandidates(doc, tenantId)[0] ?? null;
}
