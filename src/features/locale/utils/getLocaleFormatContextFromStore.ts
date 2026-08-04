import { store } from '@/store';
import { buildLocaleFormatContext } from '@/lib/locale/format';
import type { LocaleFormatContext } from '@/features/locale/types/locale.types';
import { selectEffectiveLocaleSettings } from '@/store/locale/localeSlice';

/** Read current locale formatting context outside React components. */
export function getLocaleFormatContextFromStore(): LocaleFormatContext {
  return buildLocaleFormatContext(selectEffectiveLocaleSettings(store.getState()));
}
