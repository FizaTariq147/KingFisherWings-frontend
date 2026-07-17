import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { localeService } from '@/features/locale/services/locale.service';
import type { LocaleSettings } from '@/features/locale/types/locale.types';

export interface LocaleState {
  defaults: LocaleSettings | null;
  profile: LocaleSettings | null;
  profileCountryCode: string | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
}

const initialState: LocaleState = {
  defaults: null,
  profile: null,
  profileCountryCode: null,
  status: 'idle',
  error: null,
};

export const loadLocaleSession = createAsyncThunk<
  {
    defaults: LocaleSettings;
    profile: LocaleSettings | null;
    profileCountryCode: string | null;
  },
  string | null | undefined,
  { rejectValue: string }
>('locale/loadSession', async (preferredCountryCode, { rejectWithValue }) => {
  try {
    const cc = String(preferredCountryCode ?? '').trim().toUpperCase();
    const [defaults, profile] = await Promise.all([
      localeService.getDefaults(),
      cc ? localeService.getProfile(cc) : Promise.resolve(null),
    ]);
    return { defaults, profile, profileCountryCode: cc || null };
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to load locale settings');
  }
});

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    resetLocale() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLocaleSession.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadLocaleSession.fulfilled, (state, action) => {
        state.defaults = action.payload.defaults;
        state.profile = action.payload.profile;
        state.profileCountryCode = action.payload.profileCountryCode;
        state.status = 'ready';
        state.error = null;
      })
      .addCase(loadLocaleSession.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? action.error.message ?? 'Failed to load locale settings';
      });
  },
});

export const { resetLocale } = localeSlice.actions;
export const localeReducer = localeSlice.reducer;

export type LocaleRootState = { locale: LocaleState };

export const selectLocaleDefaults = (state: LocaleRootState) => state.locale.defaults;
export const selectLocaleProfile = (state: LocaleRootState) => state.locale.profile;
export const selectLocaleProfileCountryCode = (state: LocaleRootState) =>
  state.locale.profileCountryCode;
export const selectLocaleStatus = (state: LocaleRootState) => state.locale.status;
export const selectLocaleError = (state: LocaleRootState) => state.locale.error;

/** Profile overrides defaults for user-facing formatting; neither forces hard-coded AE. */
export function selectEffectiveLocaleSettings(state: LocaleRootState): LocaleSettings | null {
  return state.locale.profile ?? state.locale.defaults;
}

export function pickPreferredCountryCode(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';
  const record = raw as Record<string, unknown>;
  const value = record.preferred_country_code ?? record.preferredCountryCode;
  return value == null ? '' : String(value).trim().toUpperCase();
}
