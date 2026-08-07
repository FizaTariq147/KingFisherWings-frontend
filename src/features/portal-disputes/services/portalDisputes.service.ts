import { portalApiClient } from '@/lib/portalApiClient';
import { PORTAL_DISPUTES_API } from '../api/portalDisputes.api';
import type { PortalDispute, PortalDisputeCreateDto, PortalDisputeListParams, PortalDisputeListResult } from '../types/portalDisputes.types';
import { normalizePortalDispute, normalizePortalDisputeList } from '../utils/normalizePortalDisputes';

export const portalDisputesService = {
  async list(params: PortalDisputeListParams = {}): Promise<PortalDisputeListResult> {
    const res = await portalApiClient.get(PORTAL_DISPUTES_API.list, { params });
    return normalizePortalDisputeList(res.data, params);
  },
  async create(dto: PortalDisputeCreateDto): Promise<PortalDispute> {
    const res = await portalApiClient.post(PORTAL_DISPUTES_API.create, dto);
    const item = normalizePortalDispute(res.data?.data ?? res.data);
    if (!item) throw new Error('Could not raise dispute.');
    return item;
  },
};
