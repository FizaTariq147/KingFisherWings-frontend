import { getConfiguredApiBase } from '@/lib/safeHttpUrl';
import type { ParsedFilesApiUrl } from '../types/files.types';

const FILES_PATH_RE = /\/files\/([^/]+)\/(.+)$/i;
/** R2/S3 object keys: /{bucket}/{tenantUuid}/{filename} (presigned query ignored). */
const OBJECT_STORE_TENANT_FILE_RE =
  /\/([^/]+)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/(.+)$/i;
const TENANT_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function stripQueryAndHash(value: string): string {
  return value.split(/[?#]/)[0] ?? value;
}

function decodePathSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function pathnameFromInput(input: string): string | null {
  let pathname = stripQueryAndHash(input.trim());
  if (!pathname) return null;
  if (/^https?:\/\//i.test(pathname)) {
    try {
      pathname = new URL(pathname).pathname;
    } catch {
      return null;
    }
  }
  return pathname;
}

/**
 * Detect KingFisher stored-file paths such as `/files/{tenantId}/{filename}`.
 * Also accepts Cloudflare R2 / S3 object URLs shaped like:
 * `https://….r2.cloudflarestorage.com/{bucket}/{tenantUuid}/{filename}?X-Amz-…`
 * Presigned query params are stripped — use the durable `/files/…` API path instead.
 */
export function parseFilesApiUrl(input: string | undefined | null): ParsedFilesApiUrl | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const pathname = pathnameFromInput(trimmed);
  if (!pathname) return null;

  const filesMatch = pathname.match(FILES_PATH_RE);
  if (filesMatch) {
    const tenantId = decodePathSegment(filesMatch[1]);
    const filename = decodePathSegment(filesMatch[2]);
    if (!tenantId || !filename) return null;
    return { tenantId, filename, source: trimmed };
  }

  // Object-store URL (R2/S3): /bucket/tenantUuid/nested/file.jpg
  const objectMatch = pathname.match(OBJECT_STORE_TENANT_FILE_RE);
  if (objectMatch) {
    const tenantId = decodePathSegment(objectMatch[2]);
    const filename = decodePathSegment(objectMatch[3]);
    if (!TENANT_UUID_RE.test(tenantId) || !filename) return null;
    return { tenantId, filename, source: trimmed };
  }

  return null;
}

export function isStoredFileUrl(url: string | undefined | null): boolean {
  return parseFilesApiUrl(url) != null;
}

/**
 * Durable app path for PDF/sidebar auth fetch. Never keep expiring `X-Amz-*` query strings.
 */
export function toDurableFilesApiPath(input: string | undefined | null): string {
  const parsed = parseFilesApiUrl(input);
  if (!parsed) return '';
  const encodedName = parsed.filename
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `/files/${encodeURIComponent(parsed.tenantId)}/${encodedName}`;
}

/**
 * True for URLs Nest/class-validator `@IsUrl()` typically accepts
 * (public host with a TLD — not localhost / relative paths).
 */
export function isBackendAcceptableLogoUrl(value: string): boolean {
  try {
    const u = new URL(value);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    if (!host || host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      return false;
    }
    // Default class-validator require_tld: true
    if (!host.includes('.')) return false;
    return true;
  } catch {
    return false;
  }
}

/** Strip ?X-Amz-* (and any other query) from an absolute URL. */
export function stripUrlQuery(input: string): string {
  const trimmed = input.trim();
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;
  try {
    const u = new URL(trimmed);
    u.search = '';
    u.hash = '';
    return u.toString();
  } catch {
    return stripQueryAndHash(trimmed);
  }
}

/**
 * Absolute http(s) URL for PATCH /organization/profile.
 * Backend returns `logo_url must be a URL address` for `/files/…` and localhost URLs.
 *
 * Prefer the cleaned R2/CDN https URL (no presign query). Only rewrite to
 * `{apiBase}/files/…` when `apiBase` is itself a public https host.
 */
export function toPersistableLogoUrl(input: string | undefined | null): string {
  const trimmed = String(input ?? '').trim();
  if (!trimmed || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return '';
  }

  // Absolute https/http first — drop expiring signatures, keep the public host.
  if (/^https?:\/\//i.test(trimmed)) {
    const cleaned = stripUrlQuery(trimmed);
    if (isBackendAcceptableLogoUrl(cleaned)) return cleaned;
  }

  // Relative /files/… only when API base is a real public URL (not /backend).
  const durablePath =
    toDurableFilesApiPath(trimmed) ||
    (trimmed.startsWith('/files/') ? trimmed.split(/[?#]/)[0] : '');
  if (durablePath.startsWith('/files/')) {
    const apiBase = getConfiguredApiBase();
    if (apiBase.startsWith('http')) {
      const absolute = `${apiBase.replace(/\/$/, '')}${durablePath}`;
      if (isBackendAcceptableLogoUrl(absolute)) return absolute;
    }
  }

  if (isBackendAcceptableLogoUrl(trimmed)) return trimmed;
  return '';
}
