import type { AxiosInstance } from 'axios';
import { SHARE_EMAIL_TIMEOUT_MS } from './shareEmailTimeout';

const stripFormContentType = [
  (data: unknown, headers?: Record<string, unknown> & { delete?: (key: string) => void }) => {
    if (headers && typeof headers === 'object' && data instanceof FormData) {
      delete headers['Content-Type'];
      delete headers['content-type'];
      headers.delete?.('Content-Type');
      headers.delete?.('content-type');
    }
    return data;
  },
];

export async function blobToPdfBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function appendTextFields(form: FormData, fields: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === '') continue;
    form.append(key, value);
  }
}

/**
 * Staff quotation/invoice SMTP send.
 * Live OpenAPI: multipart file and/or JSON pdf_base64 attach the client KingFisher PDF;
 * otherwise the API uses a stored/generated PDF.
 */
export async function postStaffEmailWithPdf(
  client: AxiosInstance,
  url: string,
  fields: Record<string, string | undefined>,
  opts?: { pdfBlob?: Blob; fileName?: string; timeoutMs?: number },
): Promise<unknown> {
  const timeout = opts?.timeoutMs ?? SHARE_EMAIL_TIMEOUT_MS;
  const cleanFields: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === '') continue;
    cleanFields[key] = value;
  }

  if (opts?.pdfBlob) {
    const fileName = (opts.fileName || 'document.pdf').replace(/[^\w.\- ()[\]]+/g, '_');
    const file = new File([opts.pdfBlob], fileName, { type: 'application/pdf' });

    try {
      const form = new FormData();
      form.append('file', file);
      appendTextFields(form, cleanFields);
      const res = await client.post<unknown>(url, form, {
        timeout,
        transformRequest: stripFormContentType,
      });
      return res.data;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      // SMTP/auth failures already reached the send path — do not retry with base64.
      if (status === 401 || status === 403 || status === 500 || status === 503) {
        throw error;
      }
      /* 400/415/etc — try JSON pdf_base64 next */
    }

    const pdfBase64 = await blobToPdfBase64(opts.pdfBlob);
    const res = await client.post<unknown>(
      url,
      { ...cleanFields, pdf_base64: pdfBase64 },
      {
        timeout,
        headers: { 'Content-Type': 'application/json' },
      },
    );
    return res.data;
  }

  const res = await client.post<unknown>(url, cleanFields, {
    timeout,
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}
