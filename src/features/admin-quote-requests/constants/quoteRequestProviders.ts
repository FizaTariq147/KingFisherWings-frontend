import type { QuoteRequestProvider } from '../types/adminQuoteRequests.types';

export const KFQA_DEFAULT_BASE_URL =
  'https://kingfisherwingsgroup.com/wp-json/kfqa/v1';
export const KFPP_DEFAULT_BASE_URL =
  'https://kingfisherwingsgroup.com/wp-json/kfpp/v1';

export const KFQA_AUTH_HEADER = 'X-API-Key';
export const KFPP_AUTH_HEADER = 'X-KFPP-Api-Key';

export function providerLabel(provider: QuoteRequestProvider | string): string {
  switch (provider) {
    case 'KFQA_WP':
      return 'WordPress KFQA (General Trading)';
    case 'GENERIC_REST':
      return 'Generic REST';
    case 'KFPP_WP':
    default:
      return 'WordPress KFPP';
  }
}

export function defaultsForProvider(provider: QuoteRequestProvider): {
  base_url: string;
  auth_header_name: string;
} {
  if (provider === 'KFQA_WP') {
    return { base_url: KFQA_DEFAULT_BASE_URL, auth_header_name: KFQA_AUTH_HEADER };
  }
  if (provider === 'GENERIC_REST') {
    return { base_url: '', auth_header_name: 'Authorization' };
  }
  return { base_url: KFPP_DEFAULT_BASE_URL, auth_header_name: KFPP_AUTH_HEADER };
}

export function normalizeProvider(
  value: string | null | undefined,
): QuoteRequestProvider {
  if (value === 'KFQA_WP' || value === 'GENERIC_REST' || value === 'KFPP_WP') {
    return value;
  }
  return 'KFPP_WP';
}

/** Strip trailing /quotes (and trailing slash) so we store the API root. */
export function normalizeQuoteRequestBaseUrl(url: string): string {
  let next = url.trim().replace(/\/+$/, '');
  if (/\/quotes$/i.test(next)) {
    next = next.replace(/\/quotes$/i, '');
  }
  return next.replace(/\/+$/, '');
}

export function isKnownDefaultBaseUrl(url: string): boolean {
  const normalized = normalizeQuoteRequestBaseUrl(url).toLowerCase();
  return (
    !normalized ||
    normalized === KFQA_DEFAULT_BASE_URL.toLowerCase() ||
    normalized === KFPP_DEFAULT_BASE_URL.toLowerCase()
  );
}
