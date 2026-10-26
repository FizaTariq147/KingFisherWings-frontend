import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

export type FormatPaymentProofActionErrorOptions = {
  /** When true, bank already has Bank/Cash GL — empty 500 is unlikely a bank-link issue. */
  bankGlOk?: boolean;
};

/** Strip BE seed/debug hints (API paths, seed-defaults tips) from user-facing copy. */
function stripBackendDebugHints(text: string): string {
  return text
    .replace(/\s*\(seed COA via[^)]*\)\.?/gi, '')
    .replace(/\s*Seed starter accounts[^.]*\./gi, '')
    .replace(/\s*Seed COA defaults[^.]*\./gi, '')
    .replace(/\s*Open Chart of Accounts[^.]*\./gi, '')
    .replace(/\s*API:\s*POST\s*\/gl\/accounts\/seed-defaults\.?/gi, '')
    .replace(/\s*via POST\s*\/gl\/accounts\/seed-defaults\.?/gi, '')
    .replace(/\s*POST\s*\/gl\/accounts\/seed-defaults\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.]+$/, '');
}

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return extractAxiosErrorDetail(error);
}

/**
 * Human-readable message for payment-proof upload / approve / reject failures.
 * Avoids bare Axios "Request failed with status code 500" when the body is empty.
 */
export function formatPaymentProofActionError(
  error: unknown,
  fallback = 'Payment proof action failed.',
  options?: FormatPaymentProofActionErrorOptions,
): string {
  const detail = extractAxiosErrorDetail(error).trim();
  const status =
    error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { status?: number } }).response?.status
      : undefined;
  const rawMsg =
    error instanceof Error
      ? error.message.trim()
      : typeof error === 'string'
        ? error.trim()
        : '';

  const candidate = stripBackendDebugHints(detail || rawMsg || fallback);

  // Backend auto-creates missing control accounts (e.g. Trade Payables) on post;
  // if this still surfaces, ask the user to retry rather than seed/debug guidance.
  if (/Missing GL account for\s+\w+/i.test(candidate) || /TRADE_PAYABLE/i.test(candidate)) {
    return 'Could not post the AP payment because a required ledger account was missing. Retry Approve & apply — missing control accounts are created automatically. If it still fails, contact support.';
  }

  if (
    /^request failed with status code\s*500$/i.test(candidate) ||
    candidate === 'HTTP 500: Request failed' ||
    /^HTTP 500:\s*Internal server error$/i.test(candidate) ||
    /^Internal server error$/i.test(candidate) ||
    /^Approve failed \(HTTP 500\)/i.test(candidate)
  ) {
    if (options?.bankGlOk) {
      return (
        'Approve & apply failed while posting the AP payment. ' +
        'Retry once. If it keeps failing, contact support.'
      );
    }
    return (
      'Approve & apply failed while posting the payment. ' +
      'Confirm the purchase invoice is Posted and the bank account has a linked Bank/Cash GL, then retry.'
    );
  }
  if (/^request failed with status code\s*\d+$/i.test(candidate)) {
    return status != null
      ? `${fallback} (HTTP ${status}).`
      : `${fallback}. ${candidate}`;
  }
  if (status != null && status >= 500 && !/HTTP\s*5\d\d/i.test(candidate)) {
    return `${candidate} (HTTP ${status})`;
  }
  if (status != null && status >= 400 && !/^Backend:/i.test(candidate)) {
    return candidate;
  }
  return candidate || fallback;
}

/** True when approve already produced our HTTP 500 copy (service wraps Axios). */
export function isApproveHttp500Message(error: unknown): boolean {
  const msg = errorText(error);
  return /Approve failed \(HTTP 500\)/i.test(msg) || /HTTP 500.*GL payment/i.test(msg);
}
