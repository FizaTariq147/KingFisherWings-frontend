import type { AxiosError } from 'axios';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';
import { toast } from '@/store/toastStore';

const SILENT_PATH_SNIPPETS = [
  '/health',
  '/auth/refresh',
  '/portal/auth/refresh',
  '/vendor/auth/refresh',
  '/super-admin/auth/refresh',
  '/auth/me',
] as const;

function isSilentUrl(url?: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return SILENT_PATH_SNIPPETS.some((snippet) => lower.includes(snippet));
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

    const url = axiosErr.config?.url;
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

    toast.error(message, { title, dedupeMs: 3000 });
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
