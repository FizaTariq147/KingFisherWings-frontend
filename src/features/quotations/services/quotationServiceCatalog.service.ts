import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { QUOTATION_API } from '../api/quotation.api';
import type {
  CreateServiceCatalogItemDto,
  ServiceCatalogItem,
  ServiceCatalogListParams,
  UpdateServiceCatalogItemDto,
} from '../types/quotationExtended.types';
import {
  normalizeServiceCatalogItem,
  normalizeServiceCatalogList,
} from '../utils/normalizeQuotationExtended';

function unwrapEntity(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: unknown }).data;
  }
  return raw;
}

export const quotationServiceCatalogService = {
  async list(params: ServiceCatalogListParams = {}): Promise<ServiceCatalogItem[]> {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(QUOTATION_API.serviceCatalog.list, { params }),
    );
    return normalizeServiceCatalogList(res.data);
  },

  async getById(id: string): Promise<ServiceCatalogItem> {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(QUOTATION_API.serviceCatalog.byId(id)),
    );
    const item = normalizeServiceCatalogItem(unwrapEntity(res.data));
    if (!item) throw new Error('Service catalog item not found.');
    return item;
  },

  async create(dto: CreateServiceCatalogItemDto): Promise<ServiceCatalogItem> {
    const res = await withGatewayRetry(() =>
      axiosInstance.post(QUOTATION_API.serviceCatalog.list, dto),
    );
    const item = normalizeServiceCatalogItem(unwrapEntity(res.data));
    if (!item) throw new Error('Could not create catalog item.');
    return item;
  },

  async update(id: string, dto: UpdateServiceCatalogItemDto): Promise<ServiceCatalogItem> {
    const res = await withGatewayRetry(() =>
      axiosInstance.patch(QUOTATION_API.serviceCatalog.byId(id), dto),
    );
    const item = normalizeServiceCatalogItem(unwrapEntity(res.data));
    if (!item) throw new Error('Could not update catalog item.');
    return item;
  },

  async remove(id: string): Promise<void> {
    await withGatewayRetry(() => axiosInstance.delete(QUOTATION_API.serviceCatalog.byId(id)));
  },
};
