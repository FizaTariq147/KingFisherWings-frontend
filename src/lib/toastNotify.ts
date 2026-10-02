import type { AxiosError } from 'axios';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';
import { toast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';

const SILENT_PATH_SNIPPETS = [
  '/health',
  '/auth/refresh',
  '/portal/auth/refresh',
  '/vendor/auth/refresh',
  '/super-admin/auth/refresh',
  '/auth/me',
  // Background unread polls — badge updates quietly; failures must not spam toasts.
  '/notifications/unread-count',
  '/portal/notifications/unread-count',
  '/vendor/notifications/unread-count',
  // Live API: route missing (404) or consistently 500 — callers soft-fail / use calculate.
  '/wms/warehouses',
  '/wms/storage/charges',
] as const;

function isSilentUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return SILENT_PATH_SNIPPETS.some((snippet) => lower.includes(snippet));
}

/** Soft-fail job-type ACL probes (e.g. ROAD_FREIGHT list) — callers recover via unfiltered list. */
function isSoftJobTypeAccessDenied(message: string, status?: number): boolean {
  if (status !== 403 && status !== 401) return false;
  return /do not have access to .+ jobs/i.test(message);
}

function isCancel(error: AxiosError): boolean {
  return (
    error.code === 'ERR_CANCELED' ||
    (typeof error.message === 'string' && /canceled|cancelled/i.test(error.message))
  );
}

type ToastableError = AxiosError & {
  status?: number;
  config?: AxiosError['config'] & { skipErrorToast?: boolean };
  /** Optional original Axios error when callers wrap as PortalApiError / VendorApiError. */
  cause?: unknown;
  originalError?: unknown;
};

function asAxiosCandidate(error: unknown): ToastableError | null {
  if (!error || typeof error !== 'object') return null;
  return error as ToastableError;
}

function resolveConfig(error: ToastableError): ToastableError['config'] | undefined {
  if (error.config) return error.config;
  const cause = asAxiosCandidate(error.cause) || asAxiosCandidate(error.originalError);
  return cause?.config;
}

function resolveStatus(error: ToastableError): number | undefined {
  if (typeof error.response?.status === 'number') return error.response.status;
  if (typeof error.status === 'number') return error.status;
  const cause = asAxiosCandidate(error.cause) || asAxiosCandidate(error.originalError);
  if (typeof cause?.response?.status === 'number') return cause.response.status;
  if (typeof cause?.status === 'number') return cause.status;
  return undefined;
}

function resolveUrl(error: ToastableError): string | undefined {
  const cfg = resolveConfig(error);
  if (cfg?.url) return cfg.url;
  const cause = asAxiosCandidate(error.cause) || asAxiosCandidate(error.originalError);
  return cause?.config?.url;
}

/**
 * Surface an API failure as a bottom-right popup.
 * Safe to call from interceptors — never throws and never alters the error.
 * Prefer passing the original Axios error (keeps skipErrorToast / silent URLs).
 */
export function notifyAxiosError(error: unknown, opts?: { title?: string }): void {
  try {
    const axiosErr = asAxiosCandidate(error);
    if (!axiosErr) return;
    if (isCancel(axiosErr)) return;

    const cfg = resolveConfig(axiosErr);
    if (cfg?.skipErrorToast) return;

    const url = resolveUrl(axiosErr);
    if (isSilentUrl(url)) return;

    const status = resolveStatus(axiosErr);

    const message =
      typeof axiosErr.message === 'string' &&
      axiosErr.message.trim() &&
      !axiosErr.message.startsWith('Request failed with status code')
        ? axiosErr.message.trim()
        : extractAxiosErrorDetail(error);

    if (!message) return;
    if (isSoftJobTypeAccessDenied(String(message), status)) return;

    // Session refresh / idle modal already owns UX — don't toast every 401.
    if (status === 401 && useAuthStore.getState().sessionExpired) return;

    const title =
      opts?.title ??
      (status && status >= 500
        ? 'Server error'
        : status === 403
          ? 'Access denied'
          : status === 404
            ? 'Not found'
            : status === 401
              ? 'Session'
              : status && status >= 400
                ? 'Request failed'
                : 'Warning');

    const variant = status && status >= 400 ? 'error' : 'warning';
    if (variant === 'warning') {
      toast.warning(message, { title, dedupeMs: 5000 });
    } else {
      toast.error(message, {
        title,
        dedupeMs: status === 401 || status === 403 ? 8000 : 5000,
      });
    }
  } catch {
    /* never break request pipeline */
  }
}

/**
 * Show a frontend toast for an arbitrary warning/error string (e.g. soft failures).
 * Prefer {@link notifyAxiosError} for Axios failures.
 */
export function notifyFrontendIssue(
  message: string,
  opts?: { title?: string; variant?: 'warning' | 'error' | 'info' },
): void {
  const text = String(message ?? '').trim();
  if (!text) return;
  const variant = opts?.variant ?? 'warning';
  const title = opts?.title ?? (variant === 'error' ? 'Error' : 'Warning');
  if (variant === 'error') toast.error(text, { title, dedupeMs: 5000 });
  else if (variant === 'info') toast.info(text, { title, dedupeMs: 4000 });
  else toast.warning(text, { title, dedupeMs: 5000 });
}

/** Route browser `alert()` into the toast stack (keeps call sites unchanged). */
export function installAlertToastBridge(): void {
  if (typeof window === 'undefined') return;
  const w = window as Window & { __kfAlertToastBridged?: boolean };
  if (w.__kfAlertToastBridged) return;
  w.__kfAlertToastBridged = true;

  window.alert = (message?: unknown) => {
    const text = message == null ? '' : String(message);
    if (!text.trim()) return;
    toast.info(text, { title: 'Alert', dedupeMs: 1500 });
  };
}
