import { FILES_API } from '@/features/files/api/files.api';
import { isStoredFileUrl } from '@/features/files/utils/parseFilesApiUrl';
import { isSafeHttpUrl } from '@/lib/safeHttpUrl';

type JobDocumentFileRef = {
  file_url?: string;
  s3_key?: string;
  file_name?: string;
};

function isUsableFileUrl(value: string): boolean {
  return isStoredFileUrl(value) || isSafeHttpUrl(value);
}

/** Resolve a downloadable URL for a job document record from API fields. */
export function resolveJobDocumentFileUrl(
  doc: JobDocumentFileRef,
  tenantId?: string | null,
): string | null {
  const url = doc.file_url?.trim();
  if (url && isUsableFileUrl(url)) return url;

  const key = doc.s3_key?.trim();
  if (key) {
    if (isUsableFileUrl(key)) return key;
    if (key.startsWith('/files/')) return key;

    const parts = key.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const filename = parts.slice(1).join('/');
      return FILES_API.download(parts[0], filename);
    }
    if (tenantId && parts.length === 1) {
      return FILES_API.download(tenantId, parts[0]);
    }
  }

  const name = doc.file_name?.trim();
  if (name && tenantId && !name.includes('/')) {
    return FILES_API.download(tenantId, name);
  }

  return null;
}
