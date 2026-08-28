/** Pull the most useful message from an Axios-style error (incl. Nest 500 bodies). */
export function extractAxiosErrorDetail(error: unknown): string {
  if (!(error && typeof error === 'object')) {
    return error instanceof Error ? error.message : String(error ?? 'Request failed');
  }

  const axiosErr = error as {
    message?: string;
    response?: {
      status?: number;
      data?: unknown;
    };
  };

  const chunks: string[] = [];
  const data = axiosErr.response?.data;

  const push = (value: unknown) => {
    if (typeof value === 'string' && value.trim()) chunks.push(value.trim());
    else if (Array.isArray(value)) {
      for (const item of value) push(item);
    } else if (value && typeof value === 'object') {
      const rec = value as Record<string, unknown>;
      push(rec.message);
      push(rec.error);
      push(rec.detail);
      push(rec.details);
    }
  };

  push(data);
  if (chunks.length === 0) push(axiosErr.message);

  const unique = [...new Set(chunks.filter(Boolean))];
  const status = axiosErr.response?.status;
  const base = unique.join(' — ') || 'Request failed';
  return status ? `HTTP ${status}: ${base}` : base;
}
