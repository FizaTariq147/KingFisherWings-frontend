import type { AxiosInstance } from 'axios';
import { PortalApiError } from '@/lib/portalApiClient';
import { VendorApiError } from '@/lib/vendorApiClient';

function appendFields(form: FormData, fields: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === '') continue;
    form.append(key, value);
  }
}

/** Nest FileInterceptor field names commonly used for payment proofs. */
export const PAYMENT_PROOF_FILE_FIELDS = [
  'file',
  'attachment',
  'proof',
  'document',
  'payment_proof',
] as const;

/** Build multipart body for portal/vendor payment proof upload. */
export function buildPaymentProofFormData(
  file: File,
  fields: Record<string, string | undefined>,
  fileField: string = 'file',
): FormData {
  const form = new FormData();
  appendFields(form, fields);
  form.append(fileField, file, file.name);
  return form;
}

function statusOf(error: unknown): number {
  if (error instanceof PortalApiError || error instanceof VendorApiError) return error.status;
  const axiosLike = error as { response?: { status?: number }; status?: number };
  return axiosLike.response?.status ?? axiosLike.status ?? 0;
}

function shouldRetryAlternateFileField(status: number): boolean {
  return status === 400 || status === 422;
}

function resolveApiBaseUrl(): string {
  const raw =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    '/backend';
  return String(raw).replace(/\/$/, '');
}

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const text = await res.text();
    if (!text.trim()) return fallback;
    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      const message = json.message;
      if (typeof message === 'string' && message.trim()) return message.trim();
      if (Array.isArray(message)) return message.map(String).join('; ');
      if (typeof json.error === 'string' && json.error.trim()) return json.error.trim();
    } catch {
      if (text.length < 400) return text;
    }
  } catch {
    /* keep fallback */
  }
  return fallback;
}

/**
 * Browser fetch multipart — avoids Axios Content-Type / transform quirks with FormData.
 * Retries alternate Nest file field names on 400/422 only.
 */
export async function postPaymentProofMultipartFetch(options: {
  path: string;
  file: File;
  fields: Record<string, string | undefined>;
  accessToken?: string | null;
  errorFactory?: (message: string, status: number) => Error;
}): Promise<unknown> {
  const base = resolveApiBaseUrl();
  const url = `${base}${options.path.startsWith('/') ? options.path : `/${options.path}`}`;
  const makeError =
    options.errorFactory ??
    ((message: string, status: number) => new PortalApiError(message, status));

  let lastError: unknown;

  for (let i = 0; i < PAYMENT_PROOF_FILE_FIELDS.length; i++) {
    const field = PAYMENT_PROOF_FILE_FIELDS[i];
    const form = buildPaymentProofFormData(options.file, options.fields, field);
    try {
      const headers: Record<string, string> = {};
      if (options.accessToken) {
        headers.Authorization = `Bearer ${options.accessToken}`;
      }
      // Do NOT set Content-Type — browser sets multipart boundary.

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: form,
        credentials: 'omit',
      });

      if (res.ok) {
        const text = await res.text();
        if (!text.trim()) return {};
        try {
          return JSON.parse(text) as unknown;
        } catch {
          return { raw: text };
        }
      }

      const message = await parseErrorMessage(
        res,
        res.status >= 500 ? 'Internal server error' : 'Upload failed.',
      );
      const err = makeError(message, res.status);
      lastError = err;
      const hasMore = i < PAYMENT_PROOF_FILE_FIELDS.length - 1;
      if (hasMore && shouldRetryAlternateFileField(res.status)) continue;
      throw err;
    } catch (err) {
      lastError = err;
      if (err instanceof PortalApiError || err instanceof VendorApiError) {
        const hasMore = i < PAYMENT_PROOF_FILE_FIELDS.length - 1;
        if (hasMore && shouldRetryAlternateFileField(err.status)) continue;
      }
      throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Upload failed.');
}

/**
 * Axios multipart fallback (vendor). Prefer fetch for portal.
 */
export async function postPaymentProofMultipart(
  client: AxiosInstance,
  url: string,
  file: File,
  fields: Record<string, string | undefined>,
): Promise<unknown> {
  let lastError: unknown;

  for (let i = 0; i < PAYMENT_PROOF_FILE_FIELDS.length; i++) {
    const field = PAYMENT_PROOF_FILE_FIELDS[i];
    const form = buildPaymentProofFormData(file, fields, field);
    try {
      const res = await client.post<unknown>(url, form, {
        transformRequest: [
          (data, headers) => {
            if (headers && typeof headers === 'object' && data instanceof FormData) {
              const h = headers as Record<string, unknown>;
              delete h['Content-Type'];
              delete h['content-type'];
              if (typeof (headers as { delete?: (k: string) => void }).delete === 'function') {
                (headers as { delete: (k: string) => void }).delete('Content-Type');
                (headers as { delete: (k: string) => void }).delete('content-type');
              }
            }
            return data;
          },
        ],
      });
      return res.data;
    } catch (err) {
      lastError = err;
      const status = statusOf(err);
      const hasMore = i < PAYMENT_PROOF_FILE_FIELDS.length - 1;
      if (hasMore && shouldRetryAlternateFileField(status)) continue;
      throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Upload failed.');
}

export function formatPaymentProofUploadError(error: unknown): Error {
  if (error instanceof PortalApiError || error instanceof VendorApiError) {
    const msg = error.message?.trim() || 'Upload failed.';
    if (error.status >= 500 || /internal server/i.test(msg)) {
      return new Error(
        `${msg} — Backend crash on POST /portal/invoices/{id}/payment-proofs (any file). ` +
          `Not caused by the file type. Ask backend for Render logs of PortalInvoicesController_uploadPaymentProof.`,
      );
    }
    return error;
  }
  if (error instanceof Error) return error;
  return new Error('Upload failed.');
}
