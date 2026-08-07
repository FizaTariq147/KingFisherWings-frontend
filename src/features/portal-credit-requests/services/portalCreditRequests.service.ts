import { portalApiClient } from '@/lib/portalApiClient';
import { PORTAL_CREDIT_REQUESTS_API } from '../api/portalCreditRequests.api';
import type { PortalCreditLimitRequest, PortalCreditLimitRequestDto } from '../types/portalCreditRequests.types';
import { normalizeCreditLimitRequest, normalizeCreditLimitRequests } from '../utils/normalizePortalCreditRequests';

export const portalCreditRequestsService = {
  async list(): Promise<PortalCreditLimitRequest[]> {
    const res = await portalApiClient.get(PORTAL_CREDIT_REQUESTS_API.list);
    return normalizeCreditLimitRequests(res.data);
  },
  async create(dto: PortalCreditLimitRequestDto): Promise<PortalCreditLimitRequest> {
    const res = await portalApiClient.post(PORTAL_CREDIT_REQUESTS_API.create, dto);
    const item = normalizeCreditLimitRequest(res.data?.data ?? res.data);
    if (!item) throw new Error('Could not create credit limit request.');
    return item;
  },
};
