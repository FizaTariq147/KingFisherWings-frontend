import { formatPermissionError } from './coaPermissions';

export function getErrorMessage(error: unknown): string {
  if (!error) return 'Request failed';
  if (error instanceof Error) return formatPermissionError(error.message || 'Request failed');
  if (typeof error !== 'object') return 'Request failed';
  const record = error as Record<string, unknown>;
  const message = record.message;
  if (typeof message === 'string' && message.trim()) return formatPermissionError(message);
  if (Array.isArray(message)) {
    return formatPermissionError(message.map(String).join('; '));
  }
  if (typeof record.error === 'string' && record.error.trim()) {
    return formatPermissionError(record.error);
  }
  return 'Request failed';
}
