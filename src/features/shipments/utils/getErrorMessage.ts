function flattenApiMessage(message: unknown): string | null {
  if (typeof message === 'string' && message.trim()) return message.trim();
  if (Array.isArray(message)) {
    const parts = message
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const row = item as Record<string, unknown>;
          if (Array.isArray(row.constraints)) {
            return row.constraints.map(String).join('; ');
          }
          if (row.constraints && typeof row.constraints === 'object') {
            return Object.values(row.constraints as Record<string, unknown>)
              .map(String)
              .join('; ');
          }
          if (typeof row.message === 'string') return row.message;
        }
        return String(item ?? '');
      })
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length ? parts.join('; ') : null;
  }
  return null;
}

/** Prefer API `message` / `error` from axios (or Error thrown by shipmentService). */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'Something went wrong.';
  if (typeof error === 'string') return error;
  const axiosErr = error as {
    response?: {
      data?: {
        message?: unknown;
        error?: string;
        detail?: string;
      };
    };
    message?: string;
  };
  const data = axiosErr.response?.data;
  const fromMessage = flattenApiMessage(data?.message);
  if (fromMessage) return fromMessage;
  if (typeof data?.error === 'string' && data.error.trim()) return data.error.trim();
  if (typeof data?.detail === 'string' && data.detail.trim()) return data.detail.trim();
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  return axiosErr.message || 'Request failed';
}
