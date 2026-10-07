import type { AxiosInstance } from 'axios';
import { PortalApiError } from '@/lib/portalApiClient';
import { VendorApiError } from '@/lib/vendorApiClient';
import type { UploadPaymentProofDto } from '../types/paymentProof.types';

function appendFields(form: FormData, fields: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === '') continue;
    form.append(key, value);
  }
}

/** Nest FileInterceptor field — backend portal fix documents only `file`. */
export const PAYMENT_PROOF_FILE_FIELD = 'file' as const;

/** @deprecated Prefer PAYMENT_PROOF_FILE_FIELD — alternate names cause Multer "Unexpected field". */
export const PAYMENT_PROOF_FILE_FIELDS = [PAYMENT_PROOF_FILE_FIELD] as const;

export type PaymentProofUploadFieldMode = 'portal' | 'extended';

/**
 * Multipart text fields for payment proof upload.
 * Portal/staff (strict): amount_claimed + payment_date; optional reference_number + notes.
 * Never send currency_code — purchase/vendor proof DTOs reject it.
 */
export function buildPaymentProofUploadFields(
  dto: UploadPaymentProofDto,
  mode: PaymentProofUploadFieldMode = 'portal',
): Record<string, string | undefined> {
  const fields: Record<string, string | undefined> = {
    ...(dto.amount != null && Number.isFinite(dto.amount)
      ? // OpenAPI example is "100.00" — always send two decimal places.
        { amount_claimed: Number(dto.amount).toFixed(2) }
      : {}),
    ...(dto.payment_date?.trim()
      ? { payment_date: dto.payment_date.trim() }
      : {}),
  };
  if (mode === 'extended') {
    if (dto.reference?.trim()) fields.reference_number = dto.reference.trim();
    if (dto.notes?.trim()) fields.notes = dto.notes.trim();
  }
  return fields;
}

/** Build multipart body for portal/vendor payment proof upload. */
export function buildPaymentProofFormData(
  file: File | null | undefined,
  fields: Record<string, string | undefined>,
  fileField: string = 'file',
): FormData {
  const form = new FormData();
  appendFields(form, fields);
  if (file) form.append(fileField, file, file.name);
  return form;
}

/** Multipart fields for POST /portal/invoices/:id/payments. */
export function buildPortalInvoicePaymentFields(dto: {
  amount: number;
  payment_date: string;
  reference?: string;
  notes?: string;
}): Record<string, string | undefined> {
  return {
    amount: String(dto.amount),
    payment_date: dto.payment_date,
    ...(dto.reference?.trim() ? { reference_number: dto.reference.trim() } : {}),
    ...(dto.notes?.trim() ? { notes: dto.notes.trim() } : {}),
  };
}

function resolveApiBaseUrl(): string {
  // Match axiosInstance (`VITE_API_URL`) so staff uploads hit the same host/proxy.
  const raw = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/backend';
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
 * Browser fetch multipart — single Nest file field `file` only.
 * Do not retry alternate file names (Multer returns "Unexpected field").
 */
export async function postPaymentProofMultipartFetch(options: {
  path: string;
  file?: File | null;
  fields: Record<string, string | undefined>;
  accessToken?: string | null;
  errorFactory?: (message: string, status: number) => Error;
  /** Fallback when response has no message (portal payments vs proof upload). */
  failureFallback?: string;
  /** Staff ERP uses cookies + Bearer; portal/vendor use Bearer only. */
  credentials?: RequestCredentials;
}): Promise<unknown> {
  const base = resolveApiBaseUrl();
  const url = `${base}${options.path.startsWith('/') ? options.path : `/${options.path}`}`;
  const makeError =
    options.errorFactory ??
    ((message: string, status: number) => new PortalApiError(message, status));

  const form = buildPaymentProofFormData(options.file, options.fields, PAYMENT_PROOF_FILE_FIELD);
  const headers: Record<string, string> = {};
  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: form,
    // Do not set Content-Type — browser adds multipart boundary so Nest/Multer sees fields.
    credentials: options.credentials ?? 'omit',
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
    options.failureFallback ??
      (res.status === 503
        ? 'Payment proof storage temporarily unavailable.'
        : res.status >= 500
          ? 'Internal server error'
          : 'Upload failed.'),
  );
  throw makeError(message, res.status);
}

/** Axios multipart — file field `file` only (no alternate-name retries). */
export async function postPaymentProofMultipart(
  client: AxiosInstance,
  url: string,
  file: File,
  fields: Record<string, string | undefined>,
): Promise<unknown> {
  const form = buildPaymentProofFormData(file, fields, PAYMENT_PROOF_FILE_FIELD);
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
}

function extractUploadErrorMessage(error: unknown): { message: string; status?: number } {
  if (error instanceof PortalApiError || error instanceof VendorApiError) {
    return { message: error.message?.trim() || 'Upload failed.', status: error.status };
  }
  const axiosErr = error as {
    response?: { status?: number; data?: { message?: string | string[]; error?: string } };
    message?: string;
  };
  const data = axiosErr.response?.data;
  const raw = data?.message;
  const message = Array.isArray(raw)
    ? raw.map(String).join('; ')
    : typeof raw === 'string' && raw.trim()
      ? raw.trim()
      : typeof data?.error === 'string' && data.error.trim()
        ? data.error.trim()
        : axiosErr.message?.trim() || 'Upload failed.';
  return { message, status: axiosErr.response?.status };
}

export function formatPaymentProofUploadError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) {
    if (/unexpected field/i.test(error.message)) {
      return new Error(
        'Unexpected field — send only multipart file (field name "file"), amount_claimed, and payment_date.',
      );
    }
    if (error instanceof PortalApiError || error instanceof VendorApiError) {
      /* fall through with status */
    } else {
      return error;
    }
  }

  const { message: msg, status } = extractUploadErrorMessage(error);
  if (/unexpected field/i.test(msg)) {
    return new Error(
      'Unexpected field — send only multipart file (field name "file"), amount_claimed, and payment_date. Extra fields are rejected by Multer.',
    );
  }
  if (status === 400 || /amount_claimed|payment_date|could not save payment proof/i.test(msg)) {
    return new Error(
      msg ||
        'Invalid payment proof. Use file (PDF/JPEG/PNG/WebP), amount_claimed, and payment_date (YYYY-MM-DD).',
    );
  }
  if (status === 503) {
    return new Error(`${msg} Payment proof storage is temporarily unavailable — retry shortly.`);
  }
  if (status != null && status >= 500) {
    return new Error(
      `${msg} — If this persists after the backend redeploy, confirm multipart uses file + amount_claimed + payment_date.`,
    );
  }
  return new Error(msg);
}
