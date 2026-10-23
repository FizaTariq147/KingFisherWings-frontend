import type { AxiosInstance } from 'axios';
import { openVerificationGateIfNeeded } from '@/features/party-verification/utils/openVerificationGate';
import { isVerificationGateMessage } from '@/features/party-verification/utils/normalizePartyVerification';
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
 * Normalize claimed amount for multipart — OpenAPI example "100.00".
 * Avoids locale commas / trailing junk that fail Nest number-string validation.
 */
export function formatAmountClaimed(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount claimed must be a positive number.');
  }
  // Cap to 2 dp (money); strip trailing float noise before fixed.
  const rounded = Math.round(amount * 100) / 100;
  return rounded.toFixed(2);
}

/**
 * Multipart text fields for payment proof upload.
 * Portal/staff (strict): amount_claimed + payment_date; optional reference_number + notes.
 * Never send currency_code — purchase/vendor proof DTOs reject it.
 */
export function buildPaymentProofUploadFields(
  dto: UploadPaymentProofDto,
  mode: PaymentProofUploadFieldMode = 'portal',
): Record<string, string | undefined> {
  const fields: Record<string, string | undefined> = {};
  if (dto.amount != null && Number.isFinite(dto.amount)) {
    fields.amount_claimed = formatAmountClaimed(Number(dto.amount));
  }
  const paymentDate = dto.payment_date?.trim();
  if (paymentDate) {
    // Accept ISO datetime from date inputs; send YYYY-MM-DD only.
    fields.payment_date = paymentDate.slice(0, 10);
  }
  if (mode === 'extended') {
    if (dto.reference?.trim()) fields.reference_number = dto.reference.trim();
    if (dto.notes?.trim()) fields.notes = dto.notes.trim();
  }
  return fields;
}

/** Assert required multipart text fields before POST (matches OpenAPI required[]). */
export function assertPaymentProofUploadFields(
  fields: Record<string, string | undefined>,
): asserts fields is Record<string, string | undefined> & {
  amount_claimed: string;
  payment_date: string;
} {
  const amount = fields.amount_claimed?.trim();
  const date = fields.payment_date?.trim();
  if (!amount || !/^\d+(\.\d{1,2})?$/.test(amount)) {
    throw new Error('Amount claimed is required (e.g. 100.00).');
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Payment date is required (YYYY-MM-DD).');
  }
}

/** Build multipart body for portal/vendor/staff payment proof upload. */
export function buildPaymentProofFormData(
  file: File | null | undefined,
  fields: Record<string, string | undefined>,
  fileField: string = 'file',
): FormData {
  const form = new FormData();
  // Text fields first, then file — Nest FileInterceptor + @Body() DTO expects this.
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

function snippetBody(text: string, max = 280): string {
  const stripped = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!stripped) return '';
  return stripped.length > max ? `${stripped.slice(0, max)}…` : stripped;
}

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  const statusSuffix = `(HTTP ${res.status})`;
  try {
    const text = await res.text();
    if (!text.trim()) {
      return `${fallback} ${statusSuffix}`;
    }
    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      const message = json.message;
      if (typeof message === 'string' && message.trim()) {
        return `${message.trim()} ${statusSuffix}`;
      }
      if (Array.isArray(message) && message.length > 0) {
        return `${message.map(String).join('; ')} ${statusSuffix}`;
      }
      if (typeof json.error === 'string' && json.error.trim()) {
        return `${json.error.trim()} ${statusSuffix}`;
      }
      if (typeof json.detail === 'string' && json.detail.trim()) {
        return `${json.detail.trim()} ${statusSuffix}`;
      }
      const blob = snippetBody(JSON.stringify(json));
      if (blob) return `${fallback} ${statusSuffix}: ${blob}`;
    } catch {
      const stripped = snippetBody(text);
      if (stripped) return `${fallback} ${statusSuffix}: ${stripped}`;
    }
  } catch {
    /* keep fallback */
  }
  return `${fallback} ${statusSuffix}`;
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

  // Fetch bypasses portal/vendor axios interceptors — open KYC modal here.
  if (res.status === 403 && isVerificationGateMessage(message)) {
    const audience = options.path.includes('/vendor/') ? 'vendor' : 'portal';
    openVerificationGateIfNeeded(message, audience);
  }

  throw makeError(message, res.status);
}

/** Strip Content-Type so the browser/XHR sets multipart boundary (Multer requires it). */
function stripFormDataContentType(data: unknown, headers: unknown): unknown {
  if (!(data instanceof FormData) || !headers || typeof headers !== 'object') {
    return data;
  }
  const h = headers as Record<string, unknown> & {
    delete?: (key: string) => void;
    set?: (key: string, value: unknown) => void;
    setContentType?: (value: false | string) => void;
  };
  // Axios 1.x AxiosHeaders — false prevents default application/json.
  if (typeof h.setContentType === 'function') {
    h.setContentType(false);
  } else if (typeof h.set === 'function') {
    h.set('Content-Type', false);
  }
  h.delete?.('Content-Type');
  h.delete?.('content-type');
  delete h['Content-Type'];
  delete h['content-type'];
  return data;
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
    // Never set a bare multipart/form-data header — missing boundary → empty body fields.
    transformRequest: [stripFormDataContentType],
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  return res.data;
}

function extractUploadErrorMessage(error: unknown): { message: string; status?: number } {
  if (error instanceof PortalApiError || error instanceof VendorApiError) {
    return { message: error.message?.trim() || 'Upload failed.', status: error.status };
  }
  const axiosErr = error as {
    response?: {
      status?: number;
      data?:
        | { message?: string | string[]; error?: string }
        | string
        | Blob;
    };
    message?: string;
  };
  const data = axiosErr.response?.data;
  if (typeof data === 'string' && data.trim()) {
    return { message: data.trim().slice(0, 400), status: axiosErr.response?.status };
  }
  if (data && typeof data === 'object' && !(data instanceof Blob)) {
    const raw = data.message;
    const message = Array.isArray(raw)
      ? raw.map(String).join('; ')
      : typeof raw === 'string' && raw.trim()
        ? raw.trim()
        : typeof data.error === 'string' && data.error.trim()
          ? data.error.trim()
          : axiosErr.message?.trim() || 'Upload failed.';
    return { message, status: axiosErr.response?.status };
  }
  return {
    message: axiosErr.message?.trim() || 'Upload failed.',
    status: axiosErr.response?.status,
  };
}

export function formatPaymentProofUploadError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) {
    if (isVerificationGateMessage(error.message)) {
      const audience =
        error instanceof VendorApiError || /vendor portal/i.test(error.message)
          ? 'vendor'
          : 'portal';
      openVerificationGateIfNeeded(error, audience);
      return error;
    }
    if (/unexpected field/i.test(error.message)) {
      return new Error('Upload rejected: unexpected form field. Try again with only the proof file, amount, and payment date.');
    }
    if (error instanceof PortalApiError || error instanceof VendorApiError) {
      /* fall through with status */
    } else {
      return error;
    }
  }

  const { message: msg, status } = extractUploadErrorMessage(error);
  if (status === 403 && isVerificationGateMessage(msg)) {
    const audience =
      error instanceof VendorApiError || /vendor portal/i.test(msg)
        ? 'vendor'
        : 'portal';
    openVerificationGateIfNeeded(msg, audience);
    return new Error(msg);
  }
  if (/unexpected field/i.test(msg)) {
    return new Error(
      'Upload rejected: unexpected form field. Try again with only the proof file, amount, and payment date.',
    );
  }
  if (status === 400 || /amount_claimed|payment_date|could not save payment proof/i.test(msg)) {
    if (msg && !/^request failed with status code/i.test(msg)) {
      return new Error(msg);
    }
    return new Error(
      `Could not save payment proof (HTTP ${status ?? 400}). Check file, amount, and payment date.`,
    );
  }
  if (status === 503) {
    return new Error(`${msg} Payment proof storage is temporarily unavailable — retry shortly.`);
  }
  if ((status != null && status >= 500) || /^request failed with status code\s*5/i.test(msg)) {
    if (msg && !/^request failed with status code/i.test(msg) && !/^internal server error$/i.test(msg)) {
      return new Error(`${msg}${status != null && !/HTTP\s*5/i.test(msg) ? ` (HTTP ${status})` : ''}`);
    }
    return new Error(
      `Payment proof upload failed (HTTP ${status ?? 500}). ` +
        'If a SUBMITTED proof already appears below, open it and use Approve & apply (select bank account). ' +
        'Otherwise backend file storage or DTO handling failed — check server logs.',
    );
  }
  return new Error(msg);
}
