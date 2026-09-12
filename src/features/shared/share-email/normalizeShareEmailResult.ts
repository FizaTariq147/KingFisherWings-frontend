import type { ShareEmailResult } from './types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function unwrapData(raw: unknown): unknown {
  const root = asRecord(raw);
  if (!root) return raw;
  if ('data' in root && root.data != null && typeof root.data === 'object') {
    return root.data;
  }
  return raw;
}

/** Normalize send/share responses: `{ success, pdf_attached }` or envelopes. */
export function normalizeShareEmailResult(raw: unknown): ShareEmailResult {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!data) {
    return { success: true, raw };
  }

  const success =
    data.success === true ||
    data.ok === true ||
    data.sent === true ||
    (typeof data.status === 'string' && /^(ok|success|sent)$/i.test(data.status));

  const pdfAttached =
    data.pdf_attached === true ||
    data.pdfAttached === true ||
    data.attachment === true ||
    data.has_pdf === true;

  const message =
    (typeof data.message === 'string' && data.message.trim()) ||
    (typeof data.detail === 'string' && data.detail.trim()) ||
    undefined;

  // Empty/unknown success payloads still count as success (HTTP 2xx already verified).
  return {
    success: success || (!('success' in data) && !('ok' in data) && !('sent' in data)),
    ...(pdfAttached ? { pdf_attached: true } : {}),
    ...(message ? { message } : {}),
    raw,
  };
}
