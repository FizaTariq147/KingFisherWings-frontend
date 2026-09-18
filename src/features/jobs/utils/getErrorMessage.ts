import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

/** Prefer Nest/API body over Axios' generic "Request failed with status code NNN". */
export function getErrorMessage(error: unknown): string {
  const detail = extractAxiosErrorDetail(error);
  if (detail && !/^HTTP \d+: Request failed with status code \d+$/i.test(detail)) {
    return detail.replace(/^HTTP \d+:\s*/i, '');
  }
  if (error instanceof Error && error.message) {
    if (!/^Request failed with status code \d+$/i.test(error.message)) {
      return error.message;
    }
  }
  return detail || 'Request failed';
}
