import { axiosInstance } from '@/lib/axios';
import { isApiOriginUrl, isSafeHttpUrl } from '@/lib/safeHttpUrl';
import { filesService } from '@/features/files/services/files.service';
import { parseFilesApiUrl } from '@/features/files/utils/parseFilesApiUrl';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';

async function asPdfBlob(blob: Blob): Promise<Blob | null> {
  return (await blobLooksLikePdf(blob)) ? blob : null;
}

/**
 * Load the backend PDF bytes without generic quotation/invoice branding stamp.
 * Supports:
 * - `/files/{tenant}/{filename}` via filesService (Bearer)
 * - API-origin absolute/relative URLs via axios (Bearer)
 * - Presigned object-storage URLs (R2/S3) via anonymous fetch (no Bearer)
 */
export async function fetchRawJobDocumentPdf(
  fileUrl: string,
  tenantId?: string,
): Promise<Blob | null> {
  const url = fileUrl.trim();
  if (!url) return null;

  const parsed = parseFilesApiUrl(url);
  if (parsed) {
    try {
      const blob = await filesService.downloadBlob({
        tenantId: parsed.tenantId || tenantId || '',
        filename: parsed.filename,
      });
      return asPdfBlob(blob);
    } catch {
      return null;
    }
  }

  // Same-origin / configured API base — use authenticated axios.
  if (isApiOriginUrl(url)) {
    try {
      const res = await axiosInstance.get<Blob>(url, { responseType: 'blob' });
      const blob =
        res.data instanceof Blob
          ? res.data
          : new Blob([res.data], { type: 'application/pdf' });
      return asPdfBlob(blob);
    } catch {
      return null;
    }
  }

  // External presigned URLs (Cloudflare R2 / S3) — must not send Bearer.
  if (isSafeHttpUrl(url)) {
    try {
      const res = await fetch(url, { method: 'GET', credentials: 'omit' });
      if (!res.ok) return null;
      const blob = await res.blob();
      return asPdfBlob(blob);
    } catch {
      return null;
    }
  }

  return null;
}
