import { portalApiClient } from '@/lib/portalApiClient';
import { downloadPortalBlob } from '@/features/portal-shared/downloadPortalBlob';
import { postPortalWithOptionalFile } from '@/features/portal-shared/portalMultipart';
import { safeDownloadFilename } from '@/features/portal-shared/normalize';
import { PORTAL_DISPUTES_API } from '../api/portalDisputes.api';
import type {
  PortalDispute,
  PortalDisputeCreateDto,
  PortalDisputeListParams,
  PortalDisputeListResult,
} from '../types/portalDisputes.types';
import { unwrapData } from '@/features/portal-shared/normalize';
import { normalizePortalDispute, normalizePortalDisputeList } from '../utils/normalizePortalDisputes';

export const portalDisputesService = {
  async list(params: PortalDisputeListParams = {}): Promise<PortalDisputeListResult> {
    const res = await portalApiClient.get(PORTAL_DISPUTES_API.list, { params });
    return normalizePortalDisputeList(res.data, params);
  },
  async getById(id: string): Promise<PortalDispute> {
    const res = await portalApiClient.get(PORTAL_DISPUTES_API.detail(id));
    const item = normalizePortalDispute(res.data?.data ?? res.data);
    if (!item) throw new Error('Dispute not found.');
    return item;
  },
  async create(dto: PortalDisputeCreateDto): Promise<PortalDispute> {
    const res = await postPortalWithOptionalFile(
      PORTAL_DISPUTES_API.create,
      {
        invoice_id: dto.invoice_id,
        reason: dto.reason,
        description: dto.description,
      },
      dto.file,
    );
    const item = normalizePortalDispute(unwrapData(res.data) ?? res.data);
    if (!item) throw new Error('Could not raise dispute.');
    return item;
  },
  async downloadAttachment(id: string, fallbackName = 'dispute-attachment'): Promise<void> {
    await downloadPortalBlob(
      PORTAL_DISPUTES_API.attachment(id),
      safeDownloadFilename(fallbackName, 'dispute-attachment'),
      { accept: 'application/octet-stream, */*' },
    );
  },
};
