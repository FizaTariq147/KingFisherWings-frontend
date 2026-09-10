import { vendorApiClient } from '@/lib/vendorApiClient';
import type { ApiPeriodQuery } from '@/lib/apiPeriod';
import { periodQueryParams } from '@/lib/apiPeriod';
import { VENDOR_DASHBOARD_API } from '../api/vendorDashboard.api';
import type { VendorDashboardWidgets, VendorTaskItem } from '../types/vendorDashboard.types';
import { normalizeVendorDashboard, normalizeVendorTasks } from '../utils/normalizeVendorDashboard';

export const vendorDashboardService = {
  async get(period?: ApiPeriodQuery): Promise<VendorDashboardWidgets> {
    const res = await vendorApiClient.get(VENDOR_DASHBOARD_API.dashboard, {
      params: periodQueryParams(period),
    });
    return normalizeVendorDashboard(res.data);
  },

  async tasks(period?: ApiPeriodQuery & { include_done?: boolean }): Promise<VendorTaskItem[]> {
    const params = {
      ...periodQueryParams(period),
      ...(period?.include_done ? { include_done: 'true' } : {}),
    };
    const res = await vendorApiClient.get(VENDOR_DASHBOARD_API.tasks, { params });
    return normalizeVendorTasks(res.data);
  },
};
