import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  buildLocaleFormatContext,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatTime,
} from '@/lib/locale/format';
import type { LocaleFormatContext, LocaleSettings } from '@/features/locale/types/locale.types';
import {
  selectEffectiveLocaleSettings,
  selectLocaleDefaults,
  selectLocaleError,
  selectLocaleProfile,
  selectLocaleProfileCountryCode,
  selectLocaleStatus,
} from '@/store/locale/localeSlice';

export function useLocaleSettings(): LocaleSettings | null {
  return useAppSelector(selectEffectiveLocaleSettings);
}

export function useLocaleDefaults(): LocaleSettings | null {
  return useAppSelector(selectLocaleDefaults);
}

export function useLocaleProfile(): LocaleSettings | null {
  return useAppSelector(selectLocaleProfile);
}

export function useLocaleState() {
  const defaults = useAppSelector(selectLocaleDefaults);
  const profile = useAppSelector(selectLocaleProfile);
  const profileCountryCode = useAppSelector(selectLocaleProfileCountryCode);
  const effective = useAppSelector(selectEffectiveLocaleSettings);
  const status = useAppSelector(selectLocaleStatus);
  const error = useAppSelector(selectLocaleError);
  return { defaults, profile, profileCountryCode, effective, status, error };
}

export function useLocaleFormatContext(): LocaleFormatContext {
  const effective = useAppSelector(selectEffectiveLocaleSettings);
  return useMemo(() => buildLocaleFormatContext(effective), [effective]);
}

export function useLocaleFormatters() {
  const ctx = useLocaleFormatContext();
  return useMemo(
    () => ({
      context: ctx,
      formatCurrency: (amount: number, currencyCode?: string | null) =>
        formatCurrency(amount, ctx, currencyCode),
      formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
        formatNumber(value, ctx, options),
      formatDate: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
        formatDate(value, ctx, options),
      formatDateTime: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
        formatDateTime(value, ctx, options),
      formatTime: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
        formatTime(value, ctx, options),
    }),
    [ctx],
  );
}
