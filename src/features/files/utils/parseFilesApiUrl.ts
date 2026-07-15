import type { ParsedFilesApiUrl } from '../types/files.types';

const FILES_PATH_RE = /\/files\/([^/]+)\/(.+)$/i;

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

/**
 * Detect KingFisher stored-file paths such as `/files/{tenantId}/{filename}`.
 * Accepts absolute API URLs and app-relative paths (including `/backend/files/...`).
 * `tenantId` may be a UUID or slug depending on how the API stored the file.
 */
export function parseFilesApiUrl(input: string | undefined | null): ParsedFilesApiUrl | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  let pathname = stripQueryAndHash(trimmed);
  if (/^https?:\/\//i.test(pathname)) {
    try {
      pathname = new URL(pathname).pathname;
    } catch {
      return null;
    }
  }

  const match = pathname.match(FILES_PATH_RE);
  if (!match) return null;

  const tenantId = decodePathSegment(match[1]);
  const filename = decodePathSegment(match[2]);
  if (!tenantId || !filename) return null;

  return { tenantId, filename, source: trimmed };
}

export function isStoredFileUrl(url: string | undefined | null): boolean {
  return parseFilesApiUrl(url) != null;
}
