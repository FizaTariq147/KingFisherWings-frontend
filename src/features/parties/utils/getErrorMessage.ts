export function getErrorMessage(error: unknown): string {
  if (!error) return 'Request failed';

  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>;
    const response = record.response as
      | { status?: number; data?: { message?: string | string[]; error?: string } }
      | undefined;
    const data = response?.data;

    const rawMessage = (() => {
      if (!data) return '';
      if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();
      if (Array.isArray(data.message)) return data.message.map(String).join('; ');
      if (typeof data.error === 'string' && data.error.trim()) return data.error.trim();
      return '';
    })();

    if (/portal\.manage_users/i.test(rawMessage)) {
      return (
        'Missing permission: portal.manage_users. A Super Admin must open this tenant and click Sync permissions, ' +
        'then you must sign out and sign back in as Tenant Admin.'
      );
    }

    if (rawMessage) return rawMessage;

    if (response?.status === 403) {
      return 'You do not have permission to perform this action. Sign in as Tenant Admin.';
    }
    if (response?.status === 401) {
      return 'Your session expired. Please sign in again.';
    }
    if (typeof record.message === 'string' && record.message.trim()) return record.message;
    if (Array.isArray(record.message)) return record.message.map(String).join('; ');
    if (typeof record.error === 'string' && record.error.trim()) return record.error;
  }

  if (error instanceof Error) {
    if (/portal\.manage_users/i.test(error.message)) {
      return (
        'Missing permission: portal.manage_users. A Super Admin must open this tenant and click Sync permissions, ' +
        'then you must sign out and sign back in as Tenant Admin.'
      );
    }
    return error.message || 'Request failed';
  }
  return 'Request failed';
}
