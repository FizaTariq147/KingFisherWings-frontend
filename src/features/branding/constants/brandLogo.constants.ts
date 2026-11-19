import defaultLogo from '@/assets/kingfisher-technologies-logo.webp';

/** Static KingFisher TECHNOLOGIES mark — login / chrome fallback (not commercial PDF logo). */
export const DEFAULT_BRAND_LOGO_URL =
  typeof defaultLogo === 'string' ? defaultLogo : '/kingfisher-logo.png';

export const BRAND_LOGO_ACCEPT = 'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml';
export const BRAND_LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
