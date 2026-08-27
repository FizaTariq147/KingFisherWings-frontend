import { axiosInstance } from '@/lib/axios';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { WMS_API } from '../api/wms.api';
import type {
  AdjustStockDto,
  CalculateStorageDto,
  CreateAsnDto,
  CreateGdoDto,
  CreateGrnDto,
  CreateTransferDto,
  CreateWmsItemDto,
  InvoiceStorageDto,
  StockMovementsParams,
  StockOnHandParams,
  StorageChargesParams,
  UpdateWmsItemDto,
  UpsertWmsSettingsDto,
  WmsItemListParams,
  WmsItemListResult,
  WmsSettings,
} from '../types/wms.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import {
  normalizePaginationMeta,
  normalizeStockRows,
  normalizeWmsDocument,
  normalizeWmsDocuments,
  normalizeWmsItem,
  normalizeWmsItems,
  normalizeWmsSettings,
  unwrapEntity,
  unwrapList,
} from '../utils/normalizeWms';
import type { WmsDocument, WmsItem, WmsStockRow } from '../types/wms.types';

function assertId(id: string, label = 'id'): void {
  if (!id || !isUuid(id)) throw new Error(`Invalid ${label}.`);
}

function buildItemQuery(params: WmsItemListParams): Record<string, string | number | boolean> {
  const limit = Math.min(Math.max(Number(params.limit ?? 20) || 20, 1), 100);
  const query: Record<string, string | number | boolean> = {
    page: Math.max(Number(params.page ?? 1) || 1, 1),
    limit,
  };
  if (params.search?.trim()) query.search = params.search.trim();
  if (typeof params.is_active === 'boolean') query.is_active = params.is_active;
  return query;
}

async function request<T>(fn: () => Promise<{ data: unknown }>, normalize?: (raw: unknown) => T | null): Promise<T> {
  try {
    const res = await withGatewayRetry(fn);
    const raw = unwrapEntity(res.data);
    if (normalize) {
      const item = normalize(raw);
      if (item == null) throw new Error('No data returned.');
      return item;
    }
    return raw as T;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

async function requestList(raw: unknown): Promise<unknown[]> {
  const { items } = unwrapList(raw);
  return items;
}

export const wmsService = {
  async getSettings(): Promise<WmsSettings | null> {
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(WMS_API.settings));
      return normalizeWmsSettings(res.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async upsertSettings(dto: UpsertWmsSettingsDto): Promise<WmsSettings> {
    return request(() => axiosInstance.put(WMS_API.settings, dto), normalizeWmsSettings) as Promise<WmsSettings>;
  },

  async listItems(params: WmsItemListParams = {}): Promise<WmsItemListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(WMS_API.items, { params: buildItemQuery(params) }),
      );
      const { items, meta } = unwrapList(res.data);
      const normalized = normalizeWmsItems(items);
      return {
        items: normalized,
        meta: normalizePaginationMeta(meta, normalized.length, params),
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getItem(id: string): Promise<WmsItem> {
    assertId(id, 'item id');
    return request(() => axiosInstance.get(WMS_API.item(id)), normalizeWmsItem) as Promise<WmsItem>;
  },

  async createItem(dto: CreateWmsItemDto): Promise<WmsItem> {
    return request(() => axiosInstance.post(WMS_API.items, dto), normalizeWmsItem) as Promise<WmsItem>;
  },

  async updateItem(id: string, dto: UpdateWmsItemDto): Promise<WmsItem> {
    assertId(id, 'item id');
    return request(() => axiosInstance.patch(WMS_API.item(id), dto), normalizeWmsItem) as Promise<WmsItem>;
  },

  async deleteItem(id: string): Promise<void> {
    assertId(id, 'item id');
    try {
      await withGatewayRetry(() => axiosInstance.delete(WMS_API.item(id)));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async listAsns(): Promise<WmsDocument[]> {
    const res = await withGatewayRetry(() => axiosInstance.get(WMS_API.asns));
    return normalizeWmsDocuments(await requestList(res.data));
  },

  async getAsn(id: string): Promise<WmsDocument> {
    assertId(id, 'ASN id');
    return request(() => axiosInstance.get(WMS_API.asn(id)), normalizeWmsDocument) as Promise<WmsDocument>;
  },

  async createAsn(dto: CreateAsnDto): Promise<WmsDocument> {
    return request(() => axiosInstance.post(WMS_API.asns, dto), normalizeWmsDocument) as Promise<WmsDocument>;
  },

  async confirmAsn(id: string): Promise<WmsDocument> {
    assertId(id, 'ASN id');
    return request(() => axiosInstance.post(WMS_API.asnConfirm(id)), normalizeWmsDocument) as Promise<WmsDocument>;
  },

  async cancelAsn(id: string): Promise<WmsDocument> {
    assertId(id, 'ASN id');
    return request(() => axiosInstance.post(WMS_API.asnCancel(id)), normalizeWmsDocument) as Promise<WmsDocument>;
  },

  async listGrns(): Promise<WmsDocument[]> {
    const res = await withGatewayRetry(() => axiosInstance.get(WMS_API.grns));
    return normalizeWmsDocuments(await requestList(res.data));
  },

  async getGrn(id: string): Promise<WmsDocument> {
    assertId(id, 'GRN id');
    return request(() => axiosInstance.get(WMS_API.grn(id)), normalizeWmsDocument) as Promise<WmsDocument>;
  },

  async createGrn(dto: CreateGrnDto): Promise<WmsDocument> {
    return request(() => axiosInstance.post(WMS_API.grns, dto), normalizeWmsDocument) as Promise<WmsDocument>;
  },

  async postGrn(id: string): Promise<WmsDocument> {
    assertId(id, 'GRN id');
    return request(() => axiosInstance.post(WMS_API.grnPost(id)), normalizeWmsDocument) as Promise<WmsDocument>;
  },

  async cancelGrn(id: string): Promise<WmsDocument> {
    assertId(id, 'GRN id');
    return request(() => axiosInstance.post(WMS_API.grnCancel(id)), normalizeWmsDocument) as Promise<WmsDocument>;
  },

  async listGdos(): Promise<WmsDocument[]> {
    const res = await withGatewayRetry(() => axiosInstance.get(WMS_API.gdos));
    return normalizeWmsDocuments(await requestList(res.data));
  },

  async getGdo(id: string): Promise<WmsDocument> {
    assertId(id, 'GDO id');
    return request(() => axiosInstance.get(WMS_API.gdo(id)), normalizeWmsDocument) as Promise<WmsDocument>;
  },

  async createGdo(dto: CreateGdoDto): Promise<WmsDocument> {
    return request(() => axiosInstance.post(WMS_API.gdos, dto), normalizeWmsDocument) as Promise<WmsDocument>;
  },

  async postGdo(id: string): Promise<WmsDocument> {
    assertId(id, 'GDO id');
    return request(() => axiosInstance.post(WMS_API.gdoPost(id)), normalizeWmsDocument) as Promise<WmsDocument>;
  },

  async cancelGdo(id: string): Promise<WmsDocument> {
    assertId(id, 'GDO id');
    return request(() => axiosInstance.post(WMS_API.gdoCancel(id)), normalizeWmsDocument) as Promise<WmsDocument>;
  },

  async stockOnHand(params: StockOnHandParams = {}): Promise<WmsStockRow[]> {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(WMS_API.stockOnHand, { params }),
    );
    return normalizeStockRows(await requestList(res.data));
  },

  async stockMovements(params: StockMovementsParams = {}): Promise<WmsStockRow[]> {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(WMS_API.stockMovements, { params }),
    );
    return normalizeStockRows(await requestList(res.data));
  },

  async stockLowStock(params: StockOnHandParams = {}): Promise<WmsStockRow[]> {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(WMS_API.stockLowStock, { params }),
    );
    return normalizeStockRows(await requestList(res.data));
  },

  async stockLotAging(params: StockOnHandParams = {}): Promise<WmsStockRow[]> {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(WMS_API.stockLotAging, { params }),
    );
    return normalizeStockRows(await requestList(res.data));
  },

  async adjustStock(dto: AdjustStockDto): Promise<unknown> {
    return request(() => axiosInstance.post(WMS_API.stockAdjust, dto));
  },

  async listTransfers(): Promise<WmsDocument[]> {
    const res = await withGatewayRetry(() => axiosInstance.get(WMS_API.transfers));
    return normalizeWmsDocuments(await requestList(res.data));
  },

  async getTransfer(id: string): Promise<WmsDocument> {
    assertId(id, 'transfer id');
    return request(() => axiosInstance.get(WMS_API.transfer(id)), normalizeWmsDocument) as Promise<WmsDocument>;
  },

  async createTransfer(dto: CreateTransferDto): Promise<WmsDocument> {
    return request(() => axiosInstance.post(WMS_API.transfers, dto), normalizeWmsDocument) as Promise<WmsDocument>;
  },

  async postTransfer(id: string): Promise<WmsDocument> {
    assertId(id, 'transfer id');
    return request(
      () => axiosInstance.post(WMS_API.transferPost(id)),
      normalizeWmsDocument,
    ) as Promise<WmsDocument>;
  },

  async calculateStorage(dto: CalculateStorageDto): Promise<unknown> {
    return request(() => axiosInstance.post(WMS_API.storageCalculate, dto));
  },

  async listStorageCharges(params: StorageChargesParams): Promise<unknown[]> {
    const query: Record<string, string> = {
      party_id: params.party_id,
      status: params.status,
    };
    const res = await withGatewayRetry(() =>
      axiosInstance.get(WMS_API.storageCharges, { params: query }),
    );
    return requestList(res.data);
  },

  async invoiceStorage(dto: InvoiceStorageDto): Promise<unknown> {
    return request(() => axiosInstance.post(WMS_API.storageInvoice, dto));
  },
};
