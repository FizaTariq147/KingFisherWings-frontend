export function getErrorMessage(error: unknown): string {
  if (!error) return 'Something went wrong.';
  if (typeof error === 'string') return error;
  if (error instanceof Error && error.message) return error.message;
  const axiosErr = error as {
    response?: { data?: { message?: string | string[]; error?: string } };
    message?: string;
  };
  const message = axiosErr.response?.data?.message;
  if (Array.isArray(message)) return message.map(String).join('; ');
  if (typeof message === 'string' && message.trim()) return message;
  if (typeof axiosErr.response?.data?.error === 'string') {
    return axiosErr.response.data.error;
  }
  return axiosErr.message || 'Request failed';
}
