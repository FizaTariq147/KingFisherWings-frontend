import { resolveLocaleCatalog } from '@/lib/locale/resolveLocale';
import type { LocaleFormatContext, LocaleSettings } from '@/features/locale/types/locale.types';

const FALLBACK_LOCALE = 'en';
const FALLBACK_CURRENCY = 'USD';
const FALLBACK_TIMEZONE = 'UTC';

function deriveLocaleTag(countryCode: string | null): string {
  if (!countryCode) return FALLBACK_LOCALE;
  const catalog = resolveLocaleCatalog(countryCode);
  if (!catalog?.language) return FALLBACK_LOCALE;
  if (catalog.language.includes('-')) return catalog.language;
  return `${catalog.language}-${countryCode}`;
}

/** Build Intl formatting context from normalized locale settings. */
export function buildLocaleFormatContext(
  settings: LocaleSettings | null | undefined,
): LocaleFormatContext {
  const countryCode = settings?.countryCode ?? null;
  return {
    locale: deriveLocaleTag(countryCode),
    currency: settings?.baseCurrency ?? FALLBACK_CURRENCY,
    timezone: settings?.timezone ?? FALLBACK_TIMEZONE,
    countryCode,
    dialCode: settings?.dialCode ?? null,
  };
}

export function formatCurrency(
  amount: number,
  ctx: LocaleFormatContext,
  currencyCode?: string | null,
): string {
  const currency = (currencyCode ?? ctx.currency).trim().toUpperCase() || ctx.currency;
  try {
    return new Intl.NumberFormat(ctx.locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${formatNumber(amount, ctx, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export function formatNumber(
  value: number,
  ctx: LocaleFormatContext,
  options?: Intl.NumberFormatOptions,
): string {
  try {
    return new Intl.NumberFormat(ctx.locale, options).format(value);
  } catch {
    return String(value);
  }
}

export function formatDate(
  value: Date | string | number,
  ctx: LocaleFormatContext,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  try {
    return new Intl.DateTimeFormat(ctx.locale, {
      timeZone: ctx.timezone,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      ...options,
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

export function formatDateTime(
  value: Date | string | number,
  ctx: LocaleFormatContext,
  options?: Intl.DateTimeFormatOptions,
): string {
  return formatDate(value, ctx, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

export function formatTime(
  value: Date | string | number,
  ctx: LocaleFormatContext,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  try {
    return new Intl.DateTimeFormat(ctx.locale, {
      timeZone: ctx.timezone,
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    }).format(date);
  } catch {
    return date.toISOString();
  }
}
