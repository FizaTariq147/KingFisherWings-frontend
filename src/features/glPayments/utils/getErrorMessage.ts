import { formatGlPaymentPermissionError } from './paymentPermissions';

export function getErrorMessage(error: unknown): string {
  if (!error) return 'Request failed';
  if (error instanceof Error) {
    return formatGlPaymentPermissionError(error.message || 'Request failed');
  }
  if (typeof error !== 'object') return 'Request failed';
  const record = error as Record<string, unknown>;
  const message = record.message;
  if (typeof message === 'string' && message.trim()) {
    return formatGlPaymentPermissionError(message);
  }
  if (Array.isArray(message)) {
    return formatGlPaymentPermissionError(message.map(String).join('; '));
  }
  if (typeof record.error === 'string' && record.error.trim()) {
    return formatGlPaymentPermissionError(record.error);
  }
  return 'Request failed';
}
