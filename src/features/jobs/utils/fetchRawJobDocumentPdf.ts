import { axiosInstance } from '@/lib/axios';
import { isApiOriginUrl, isSafeHttpUrl } from '@/lib/safeHttpUrl';
import { filesService } from '@/features/files/services/files.service';
import { parseFilesApiUrl } from '@/features/files/utils/parseFilesApiUrl';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';

/**
 * Load the backend PDF bytes without generic quotation/invoice branding stamp.
 */
export async function fetchRawJobDocumentPdf(
  fileUrl: string,
  tenantId?: string,
): Promise<Blob | null> {
  const url = fileUrl.trim();
  if (!url) return null;

  const parsed = parseFilesApiUrl(url);
  if (parsed) {
    const blob = await filesService.downloadBlob({
      tenantId: parsed.tenantId || tenantId || '',
      filename: parsed.filename,
    });
    return (await blobLooksLikePdf(blob)) ? blob : null;
  }

  if (!isSafeHttpUrl(url) || !isApiOriginUrl(url)) return null;

  const res = await axiosInstance.get<Blob>(url, { responseType: 'blob' });
  const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: 'application/pdf' });
  return (await blobLooksLikePdf(blob)) ? blob : null;
}
