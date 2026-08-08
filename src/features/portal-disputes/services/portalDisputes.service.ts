import { portalApiClient } from '@/lib/portalApiClient';
import { filenameFromContentDisposition } from '@/features/portal-shared/normalize';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { PORTAL_DISPUTES_API } from '../api/portalDisputes.api';
import type {
  PortalDispute,
  PortalDisputeCreateDto,
  PortalDisputeListParams,
  PortalDisputeListResult,
} from '../types/portalDisputes.types';
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
  async downloadAttachment(id: string, fallbackName = 'dispute-attachment'): Promise<void> {
    const res = await portalApiClient.get(PORTAL_DISPUTES_API.attachment(id), {
      responseType: 'blob',
    });
    const filename =
      filenameFromContentDisposition(
        typeof res.headers['content-disposition'] === 'string'
          ? res.headers['content-disposition']
          : undefined,
      ) || fallbackName;
    triggerBlobDownload(res.data as Blob, filename);
  },
};
