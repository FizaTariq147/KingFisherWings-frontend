import { useAuthStore } from '@/store/authStore';
import { techLogsService } from '../services/techLogs.service';
import type { ReportClientErrorDto } from '../types/techLogs.types';

const RECENT = new Map<string, number>();
const DEDUPE_MS = 30_000;
const MAX_REPORTS_PER_MINUTE = 8;
let reportsThisMinute = 0;
let minuteStartedAt = Date.now();

function shouldSkip(key: string): boolean {
  const now = Date.now();
  if (now - minuteStartedAt > 60_000) {
    minuteStartedAt = now;
    reportsThisMinute = 0;
  }
  if (reportsThisMinute >= MAX_REPORTS_PER_MINUTE) return true;
  const last = RECENT.get(key);
  if (last && now - last < DEDUPE_MS) return true;
  RECENT.set(key, now);
  reportsThisMinute += 1;
  return false;
}

/** Fire-and-forget client error → Super Admin Issues (staff session only). */
export function reportClientError(dto: ReportClientErrorDto): void {
  if (!useAuthStore.getState().isAuthenticated) return;
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/superadmin')) {
    return;
  }
  const path = dto.path || (typeof window !== 'undefined' ? window.location.pathname : '');
  if (path.includes('/super-admin/tech-logs/client-errors')) return;
  const key = `${dto.message}|${path}|${dto.screen || ''}`;
  if (shouldSkip(key)) return;
  void techLogsService.reportClientError({ ...dto, path }).catch(() => {
    // Swallow — never break the app for telemetry.
  });
}

let installed = false;

/** Install once from app bootstrap — window + unhandledrejection. */
export function installClientErrorReporter(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('error', (event) => {
    const message =
      event.message ||
      (event.error instanceof Error ? event.error.message : 'Unhandled window error');
    const stack =
      event.error instanceof Error
        ? event.error.stack
        : undefined;
    reportClientError({
      message: String(message).slice(0, 4000),
      stack,
      path: window.location.pathname,
      screen: window.location.pathname,
      severity: 'ERROR',
      metadata: {
        source: 'window.error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message =
      reason instanceof Error
        ? reason.message
        : typeof reason === 'string'
          ? reason
          : 'Unhandled promise rejection';
    const stack = reason instanceof Error ? reason.stack : undefined;
    reportClientError({
      message: String(message).slice(0, 4000),
      stack,
      path: window.location.pathname,
      screen: window.location.pathname,
      severity: 'ERROR',
      metadata: { source: 'unhandledrejection' },
    });
  });
}
