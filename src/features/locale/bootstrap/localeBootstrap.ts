import { store } from '@/store';
import { loadLocaleSession, resetLocale } from '@/store/locale/localeSlice';

/** Load global defaults + optional country profile into Redux. Best-effort — never throws. */
export function bootstrapLocaleSession(preferredCountryCode?: string | null): void {
  void store.dispatch(loadLocaleSession(preferredCountryCode));
}

export function clearLocaleSession(): void {
  store.dispatch(resetLocale());
}
