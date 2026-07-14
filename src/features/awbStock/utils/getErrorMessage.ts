export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  const ax = error as {
    response?: { data?: { message?: string | string[]; error?: string } };
    message?: string;
  };
  const msg = ax.response?.data?.message;
  if (Array.isArray(msg)) return msg.map(String).join('; ');
  if (typeof msg === 'string' && msg.trim()) return msg;
  if (typeof ax.response?.data?.error === 'string') return ax.response.data.error;
  return 'Request failed';
}
