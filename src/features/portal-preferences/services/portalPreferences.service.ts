import { portalApiClient } from '@/lib/portalApiClient';
import { PORTAL_PREFERENCES_API } from '../api/portalPreferences.api';
import type { PortalPreferences, UpdatePortalPreferencesDto } from '../types/portalPreferences.types';
import { normalizePortalPreferences } from '../utils/normalizePortalPreferences';

export const portalPreferencesService = {
  async get(): Promise<PortalPreferences> {
    const res = await portalApiClient.get(PORTAL_PREFERENCES_API.preferences);
    return normalizePortalPreferences(res.data);
  },

  async update(dto: UpdatePortalPreferencesDto): Promise<PortalPreferences> {
    const res = await portalApiClient.put(PORTAL_PREFERENCES_API.preferences, dto);
    return normalizePortalPreferences(res.data);
  },
};
