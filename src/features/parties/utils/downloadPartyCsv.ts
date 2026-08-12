import { axiosInstance } from '@/lib/axios';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { withGatewayRetry } from '@/lib/wakeApi';

function errorFromJsonBlob(text: string, fallback: string): Error {
  try {
    const parsed = JSON.parse(text) as { message?: string | string[]; error?: string };
    const message = parsed.message;
    if (Array.isArray(message)) return new Error(message.map(String).join('; '));
    if (typeof message === 'string' && message.trim()) return new Error(message.trim());
    if (typeof parsed.error === 'string' && parsed.error.trim()) return new Error(parsed.error.trim());
  } catch {
    /* not JSON */
  }
  return new Error(fallback);
}

/** GET /parties/export — same query params as list. */
export async function downloadPartyCsvExport(
  path: string,
  params: Record<string, string | number>,
  filename: string,
): Promise<void> {
  const res = await withGatewayRetry(() =>
    axiosInstance.get(path, { params, responseType: 'blob' }),
  );
  const blob = res.data as Blob;
  const headerType =
    typeof res.headers?.['content-type'] === 'string' ? res.headers['content-type'] : '';

  if (/json/i.test(headerType || blob.type || '') && blob.size < 4096) {
    const text = await blob.text();
    throw errorFromJsonBlob(text, 'Export failed.');
  }

  triggerBlobDownload(blob, filename);
}
