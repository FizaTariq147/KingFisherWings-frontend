import { getServerErrorMessage } from '@/lib/validation';

export function getErrorMessage(error: unknown): string {
  return getServerErrorMessage(error);
}
