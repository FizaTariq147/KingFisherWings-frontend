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

/**
 * Surface an API failure as a bottom-right popup.
 * Safe to call from interceptors — never throws and never alters the error.
 */
export function notifyAxiosError(error: unknown, opts?: { title?: string }): void {
  try {
    if (!error || typeof error !== 'object') return;

    const axiosErr = error as AxiosError & { status?: number };
    if (isCancel(axiosErr)) return;

    const cfg = axiosErr.config as (AxiosError['config'] & { skipErrorToast?: boolean }) | undefined;
    if (cfg?.skipErrorToast) return;

    const url = cfg?.url;
    if (isSilentUrl(url)) return;

    const status =
      axiosErr.response?.status ??
      (typeof axiosErr.status === 'number' ? axiosErr.status : undefined);

    const message =
      typeof (error as Error).message === 'string' &&
      (error as Error).message.trim() &&
      !(error as Error).message.startsWith('Request failed with status code')
        ? (error as Error).message.trim()
        : extractAxiosErrorDetail(error);

    if (isSoftJobTypeAccessDenied(String(message ?? ''), status)) return;

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
              : 'Request failed');

    toast.error(message, { title, dedupeMs: status === 401 || status === 403 ? 8000 : 5000 });
  } catch {
    /* never break request pipeline */
  }
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
