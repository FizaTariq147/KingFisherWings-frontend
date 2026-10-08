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
  if (parts.length >= 2) {
    const filename = parts.slice(1).join('/');
    return FILES_API.download(parts[0], filename);
  }
  if (tenantId && parts.length === 1) {
    return FILES_API.download(tenantId, parts[0]);
  }
  return null;
}

function pushUnique(out: string[], value: string | null | undefined) {
  const trimmed = (value || '').trim();
  if (!trimmed || !isUsableFileUrl(trimmed)) return;
  if (!out.includes(trimmed)) out.push(trimmed);
}

/**
 * Ordered download candidates for a job document.
 * Prefer stable API `/files/{tenant}/{filename}` (from `s3_key`) over temporary
 * R2/S3 `file_url` / `download_url` so Bearer JWT works; keep presigned URLs as
 * fallbacks when `/files` is unavailable.
 */
export function resolveJobDocumentFileUrlCandidates(
  doc: JobDocumentFileRef,
  tenantId?: string | null,
): string[] {
  const out: string[] = [];

  const key = (doc.s3_key || doc.s3Key || '').trim();
  if (key) {
    pushUnique(out, fromS3Key(key, tenantId));
  }

  const urls = [
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
    if (!url || !isUsableFileUrl(url)) continue;
    if (isApiOriginUrl(url) || isStoredFileUrl(url) || url.startsWith('/files/')) {
      apiOrigin.push(url);
    } else {
      external.push(url);
    }
  }
  for (const url of apiOrigin) pushUnique(out, url);
  for (const url of external) pushUnique(out, url);

  const name = (doc.file_name || doc.fileName || '').trim();
  if (name && tenantId && !name.includes('/')) {
    pushUnique(out, FILES_API.download(tenantId, name));
  }

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
