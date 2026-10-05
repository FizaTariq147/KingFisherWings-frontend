import type { AxiosError } from 'axios';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';
import { toast } from '@/store/toastStore';

/**
 * Toast policy: bottom-right popups are for **inbox notifications** only
 * (see NotificationToastWatcher). API / console / permission errors stay in
 * page UI, modals, and the browser console — they must not spam the toast stack.
 */

/** @deprecated Kept for call-site compatibility — no longer shows toasts. */
export function isPermissionRequiredMessage(message: string, _status?: number): boolean {
  const text = String(message ?? '');
  if (!text.trim()) return false;
  return (
    /missing required permission/i.test(text) ||
    /required permission[:\s]/i.test(text) ||
    /permission denied/i.test(text) ||
    /insufficient permissions?/i.test(text)
  );
}

/** @deprecated Kept for call-site compatibility — no longer shows toasts. */
export function isAccessDeniedMessage(message: string, status?: number): boolean {
  if (isPermissionRequiredMessage(message, status)) return true;
  const text = String(message ?? '');
  return (
    /platform admin tokens cannot access/i.test(text) ||
    /cannot access tenant erp/i.test(text) ||
    /access denied/i.test(text) ||
    status === 403
  );
}

/**
 * Previously surfaced API failures as toasts. Now a no-op so only notification
 * toasts appear. Call sites / interceptors can keep invoking this safely.
 */
export function notifyAxiosError(
  _error: unknown,
  _opts?: { title?: string; message?: string },
): void {
  /* inbox notifications only — see NotificationToastWatcher */
}

/**
 * Non-notification app messages: no longer pushed to the toast stack.
 * Prefer inline alerts / form errors. Use `toast.notification` for inbox items.
 */
export function notifyFrontendIssue(
  _message: string,
  _opts?: { title?: string; variant?: 'warning' | 'error' | 'info' },
): void {
  /* inbox notifications only */
}

/** Route browser `alert()` into a light info toast (not API errors). */
export function installAlertToastBridge(): void {
  if (typeof window === 'undefined') return;
  const w = window as Window & { __kfAlertToastBridged?: boolean };
  if (w.__kfAlertToastBridged) return;
  w.__kfAlertToastBridged = true;

  window.alert = (message?: unknown) => {
    const text = message == null ? '' : String(message).replace(/\s+/g, ' ').trim();
    if (!text) return;
    toast.info(text, { title: 'Alert', dedupeMs: 1500 });
  };
}

/**
 * Console bridge disabled — API/permission console noise must not become toasts.
 * Kept as a no-op installer so main.tsx can call it safely.
 */
export function installConsoleToastBridge(): void {
  /* intentionally empty */
}

/** Helper for pages that still want a readable API error string (not a toast). */
export function formatApiErrorForUi(error: unknown): string {
  const detail = extractAxiosErrorDetail(error)
    .replace(/^HTTP\s+\d{3}:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (detail) return detail;
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  const ax = error as AxiosError | undefined;
  if (typeof ax?.message === 'string' && ax.message.trim()) return ax.message.trim();
  return 'Request failed';
}
