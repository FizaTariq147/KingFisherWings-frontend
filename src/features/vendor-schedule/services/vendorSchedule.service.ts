import { vendorApiClient } from '@/lib/vendorApiClient';
import { VENDOR_SCHEDULE_API } from '../api/vendorSchedule.api';
import type { VendorScheduleResult } from '../types/vendorSchedule.types';
import { normalizeSchedule } from '../utils/normalizeVendorSchedule';

export const vendorScheduleService = {
  async get(): Promise<VendorScheduleResult> {
    const res = await vendorApiClient.get(VENDOR_SCHEDULE_API.list);
    return normalizeSchedule(res.data);
  },
};
