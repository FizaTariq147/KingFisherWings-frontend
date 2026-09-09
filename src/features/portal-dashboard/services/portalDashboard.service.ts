import { portalApiClient, PortalApiError } from '@/lib/portalApiClient';
import type { ApiPeriodQuery } from '@/lib/apiPeriod';
import { periodQueryParams } from '@/lib/apiPeriod';
import { PORTAL_DASHBOARD_API } from '../api/portalDashboard.api';
import type { PortalDashboardWidgets, PortalTaskItem } from '../types/portalDashboard.types';
import { normalizePortalDashboard, normalizePortalTasks } from '../utils/normalizePortalDashboard';

export const portalDashboardService = {
  async get(period?: ApiPeriodQuery): Promise<PortalDashboardWidgets> {
    const res = await portalApiClient.get(PORTAL_DASHBOARD_API.dashboard, {
      params: periodQueryParams(period),
    });
    return normalizePortalDashboard(res.data);
  },

  async tasks(period?: ApiPeriodQuery & { include_done?: boolean }): Promise<PortalTaskItem[]> {
    try {
      const params = {
        ...periodQueryParams(period),
        ...(period?.include_done ? { include_done: 'true' } : {}),
      };
      const res = await portalApiClient.get(PORTAL_DASHBOARD_API.tasks, { params });
      return normalizePortalTasks(res.data);
    } catch (err) {
      if (err instanceof PortalApiError && (err.status === 404 || err.status === 501)) {
        return [];
      }
      throw err;
    }
  },
};
