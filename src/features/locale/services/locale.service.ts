import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { LOCALE_API } from '../api/locale.api';
import type { LocaleSettings } from '../types/locale.types';
import { normalizeLocaleSettings } from '../utils/normalizeLocale';

function formatAxiosError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) {
    return error;
  }
  const axiosErr = error as {
    response?: { data?: { message?: string | string[]; error?: string }; status?: number };
    message?: string;
  };
  const data = axiosErr.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) return new Error(message);
  if (typeof data?.error === 'string' && data.error.trim()) return new Error(data.error);
  return new Error(axiosErr.message || 'Locale request failed');
}

/**
 * LocaleController_getDefaults — global defaults when country is omitted;
 * pass country for form suggestions (same shape as profile).
 */
async function getDefaults(country?: string | null): Promise<LocaleSettings> {
  try {
    const cc = String(country ?? '').trim().toUpperCase();
    const res = await withGatewayRetry(() =>
      axiosInstance.get<unknown>(LOCALE_API.defaults, {
        params: cc ? { country: cc } : undefined,
      }),
    );
    return normalizeLocaleSettings(res.data);
  } catch (error) {
    throw formatAxiosError(error);
  }
}

/** LocaleController_getProfile — country-specific locale suggestions. */
async function getProfile(countryCode: string): Promise<LocaleSettings> {
  const cc = String(countryCode ?? '').trim().toUpperCase();
  if (!cc) throw new Error('Country code is required for locale profile.');
  try {
    const res = await withGatewayRetry(() =>
      axiosInstance.get<unknown>(LOCALE_API.profile(cc)),
    );
    return normalizeLocaleSettings(res.data);
  } catch (error) {
    throw formatAxiosError(error);
  }
}

export const localeService = {
  getDefaults,
  getProfile,
};
