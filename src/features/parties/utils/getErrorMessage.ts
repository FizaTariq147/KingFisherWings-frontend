const GENERIC_AXIOS_STATUS = /^Request failed with status code \d+$/i;

function permissionSyncHint(permissionKey: string): string {
  return (
    `Missing permission: ${permissionKey}. A Super Admin must open this tenant and click Sync permissions, ` +
    'then you must sign out and sign back in as Tenant Admin.'
  );
}

function mapPermissionMessage(rawMessage: string): string | null {
  if (/portal\.manage_users/i.test(rawMessage)) return permissionSyncHint('portal.manage_users');
  if (/portal\.manage_permissions/i.test(rawMessage)) {
    return permissionSyncHint('portal.manage_permissions');
  }
  if (/vendor\.manage_users/i.test(rawMessage)) return permissionSyncHint('vendor.manage_users');
  if (/vendor\.manage_permissions/i.test(rawMessage)) {
    return permissionSyncHint('vendor.manage_permissions');
  }
  if (/cannot use the vendor portal/i.test(rawMessage)) {
    return (
      `${rawMessage} The backend must allow vendor portal users on any party type without changing party_type.`
    );
  }
  if (/cannot use the (customer )?portal/i.test(rawMessage)) {
    return (
      `${rawMessage} The backend must allow customer portal users on any party type without changing party_type.`
    );
  }
  if (/party type/i.test(rawMessage) && /vendor|portal|customer|supplier/i.test(rawMessage)) {
    return `${rawMessage} Portal logins should not depend on party type — backend update required.`;
  }
  return null;
}

function statusFallback(status?: number): string | null {
  if (status === 403) {
    return (
      'You do not have permission to perform this action. Sign in as Tenant Admin and ask a Super Admin ' +
      'to Sync permissions if vendor or portal keys were recently added. Portal logins do not require a specific party type.'
    );
  }
  if (status === 401) return 'Your session expired. Please sign in again.';
  if (status === 500) {
    return 'Server error (500) on this API. Frontend request is correct — backend must fix the route.';
  }
  return null;
}

function extractApiMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  const record = data as { message?: string | string[]; error?: string };
  if (typeof record.message === 'string' && record.message.trim()) return record.message.trim();
  if (Array.isArray(record.message)) return record.message.map(String).join('; ');
  if (typeof record.error === 'string' && record.error.trim()) return record.error.trim();
  return '';
}

export function getErrorMessage(error: unknown): string {
  if (!error) return 'Request failed';

  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown> & {
      status?: number;
      response?: { status?: number; data?: unknown };
    };
    const response = record.response;
    const status = response?.status ?? record.status;
    const rawMessage = extractApiMessage(response?.data);

    const permissionMessage = rawMessage ? mapPermissionMessage(rawMessage) : null;
    if (permissionMessage) return permissionMessage;

    if (rawMessage) return rawMessage;

    const statusMessage = statusFallback(status);
    if (statusMessage) return statusMessage;

    if (typeof record.message === 'string' && record.message.trim()) {
      const axiosMessage = record.message.trim();
      if (GENERIC_AXIOS_STATUS.test(axiosMessage)) {
        return statusFallback(status) || axiosMessage;
      }
      const mapped = mapPermissionMessage(axiosMessage);
      if (mapped) return mapped;
      return axiosMessage;
    }
    if (Array.isArray(record.message)) return record.message.map(String).join('; ');
    if (typeof record.error === 'string' && record.error.trim()) return record.error;
  }

  if (error instanceof Error) {
    const mapped = mapPermissionMessage(error.message);
    if (mapped) return mapped;
    if (GENERIC_AXIOS_STATUS.test(error.message)) {
      const status = (error as { status?: number }).status;
      return statusFallback(status) || error.message;
    }
    return error.message || 'Request failed';
  }
  return 'Request failed';
}
