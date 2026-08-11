import { vendorApiClient, VendorApiError } from '@/lib/vendorApiClient';
import { unwrapData } from '@/features/vendor-shared/normalize';
import { postVendorWithOptionalFile } from '@/features/vendor-shared/vendorMultipart';
import { VENDOR_DISPUTES_API } from '../api/vendorDisputes.api';
import type {
  VendorDispute,
  VendorDisputeCreateDto,
  VendorDisputeListParams,
  VendorDisputeListResult,
} from '../types/vendorDisputes.types';
import { normalizeVendorDispute, normalizeVendorDisputeList } from '../utils/normalizeVendorDisputes';

export const vendorDisputesService = {
  async list(params: VendorDisputeListParams = {}): Promise<VendorDisputeListResult> {
    const res = await vendorApiClient.get(VENDOR_DISPUTES_API.list, { params });
    return normalizeVendorDisputeList(res.data, params);
  },

  async getById(id: string): Promise<VendorDispute> {
    const res = await vendorApiClient.get(VENDOR_DISPUTES_API.detail(id));
    const item = normalizeVendorDispute(res.data);
    if (!item) throw new VendorApiError('Dispute not found.', 404);
    return item;
  },

  async create(dto: VendorDisputeCreateDto): Promise<VendorDispute> {
    const res = await postVendorWithOptionalFile(
      VENDOR_DISPUTES_API.create,
      {
        invoice_id: dto.invoice_id,
        reason: dto.reason,
        description: dto.description,
      },
      dto.file,
    );
    const item = normalizeVendorDispute(unwrapData(res.data) ?? res.data);
    if (!item) throw new VendorApiError('Could not raise dispute.', 400);
    return item;
  },
};
