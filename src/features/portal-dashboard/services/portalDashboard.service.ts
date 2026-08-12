import { portalApiClient } from '@/lib/portalApiClient';
import { PORTAL_DASHBOARD_API } from '../api/portalDashboard.api';
import type { PortalDashboardWidgets } from '../types/portalDashboard.types';
import { normalizePortalDashboard } from '../utils/normalizePortalDashboard';

export const portalDashboardService = {
  async get(): Promise<PortalDashboardWidgets> {
    const res = await portalApiClient.get(PORTAL_DASHBOARD_API.dashboard);
    return normalizePortalDashboard(res.data);
  },
};
