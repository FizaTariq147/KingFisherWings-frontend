import axios from 'axios';

export function getPublicTrackErrorMessage(error: unknown, fallback = 'Request failed.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object') {
      const message = (data as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) return message.trim();
      if (Array.isArray(message)) {
        const joined = message.filter((item) => typeof item === 'string').join(', ').trim();
        if (joined) return joined;
      }
    }
    if (error.response?.status === 404) return 'Shipment not found for that reference.';
  }
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  if (typeof error === 'string' && error.trim()) return error.trim();
  return fallback;
}
