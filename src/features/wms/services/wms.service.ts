import { axiosInstance } from '@/lib/axios';
import { clampApiListLimit } from '@/lib/apiListLimit';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { masterService } from '@/features/masters/services/master.service';
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
  WmsOpsBoard,
  WmsSettings,
  WmsWarehouseSummary,
} from '../types/wms.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import {
  normalizePaginationMeta,
  normalizeStockRows,
  normalizeWmsDocument,
  normalizeWmsDocuments,
  normalizeWmsItem,
  mergeWarehouseSummaries,
  normalizeWmsItems,
  normalizeWmsOpsBoard,
  normalizeWmsSettings,
  normalizeWmsWarehouses,
  warehouseSummaryFromRecord,
  unwrapEntity,
  unwrapList,
} from '../utils/normalizeWms';
import type { WmsDocument, WmsItem, WmsStockRow } from '../types/wms.types';

function assertId(id: string, label = 'id'): void {
  if (!id || !isUuid(id)) throw new Error(`Invalid ${label}.`);
}

async function tryListMasterWarehouses(): Promise<WmsWarehouseSummary[]> {
  try {
    const active = await masterService.listAll(
      MASTER_PATHS.warehouses,
      { is_active: true, order: 'asc' },
      100,
    );
    const fromActive = normalizeWmsWarehouses(active.items);
    if (fromActive.length) return fromActive;
  } catch {
    /* fall through */
  }

  try {
    const all = await masterService.listAll(MASTER_PATHS.warehouses, { order: 'asc' }, 100);
    return normalizeWmsWarehouses(all.items);
  } catch {
    return [];
  }
}

async function tryFetchWarehouseById(id: string): Promise<WmsWarehouseSummary | null> {
  if (!isUuid(id)) return null;
  try {
    const record = await masterService.getById(MASTER_PATHS.warehouses, id);
    return warehouseSummaryFromRecord(record);
  } catch {
    return null;
  }
}

function buildItemQuery(params: WmsItemListParams): Record<string, string | number | boolean> {
  const limit = clampApiListLimit(params.limit, 20);
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
  /**
   * Registered master warehouses for WMS forms.
   * Primary catalog: GET /masters/warehouses (Swagger — there is no /wms/warehouses route).
   * Avoid probing stock/ASN/GRN/GDO on every form open — those calls toast 500s from the
   * axios interceptor even when failures are ignored here.
   */
  async listWarehouses(preferredId?: string): Promise<WmsWarehouseSummary[]> {
    try {
      const groups: WmsWarehouseSummary[][] = [await tryListMasterWarehouses()];

      if (preferredId && isUuid(preferredId)) {
        const byId = await tryFetchWarehouseById(preferredId);
        if (byId) groups.push([byId]);
      }

      return mergeWarehouseSummaries(...groups);
    } catch {
      return [];
    }
  },

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

  /** POST /wms/asns/{id}/mark-picked — cargo collected / en route. */
  async markAsnPicked(id: string): Promise<WmsDocument> {
    assertId(id, 'ASN id');
    return request(
      () => axiosInstance.post(WMS_API.asnMarkPicked(id)),
      normalizeWmsDocument,
    ) as Promise<WmsDocument>;
  },

  /** POST /wms/asns/{id}/mark-unloading — arrived, unload in progress. */
  async markAsnUnloading(id: string): Promise<WmsDocument> {
    assertId(id, 'ASN id');
    return request(
      () => axiosInstance.post(WMS_API.asnMarkUnloading(id)),
      normalizeWmsDocument,
    ) as Promise<WmsDocument>;
  },

  /**
   * POST /wms/asns/{id}/mark-unloaded — requires party_id + job_id on the ASN.
   * Auto-creates/posts GRN, emails party + portal, attaches JobDocument GRN.
   */
  async markAsnUnloaded(id: string): Promise<WmsDocument> {
    assertId(id, 'ASN id');
    return request(
      () => axiosInstance.post(WMS_API.asnMarkUnloaded(id)),
      normalizeWmsDocument,
    ) as Promise<WmsDocument>;
  },

  /** POST /wms/asns/{id}/resend-grn — resend GRN email + republish portal document. */
  async resendAsnGrn(id: string): Promise<WmsDocument> {
    assertId(id, 'ASN id');
    return request(
      () => axiosInstance.post(WMS_API.asnResendGrn(id)),
      normalizeWmsDocument,
    ) as Promise<WmsDocument>;
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

  /** GET /wms/grns/{id}/pdf — on-demand Goods Received Note PDF. */
  async downloadGrnPdf(id: string): Promise<Blob> {
    assertId(id, 'GRN id');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(WMS_API.grnPdf(id), { responseType: 'blob' }),
      );
      return res.data as Blob;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
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

  /** POST /wms/gdos/{id}/resend-gdn — resend GDN email + republish portal document. */
  async resendGdoGdn(id: string): Promise<WmsDocument> {
    assertId(id, 'GDO id');
    return request(
      () => axiosInstance.post(WMS_API.gdoResendGdn(id)),
      normalizeWmsDocument,
    ) as Promise<WmsDocument>;
  },

  /** GET /wms/ops-board — ASN yard, GDO dispatch, OVERDUE / OVER_BILL labels. */
  async getOpsBoard(): Promise<WmsOpsBoard> {
    return request(() => axiosInstance.get(WMS_API.opsBoard), normalizeWmsOpsBoard) as Promise<WmsOpsBoard>;
  },

  /** GET /wms/gdos/{id}/pdf — on-demand GDO/GDN (Goods Dispatch) PDF. */
  async downloadGdoPdf(id: string): Promise<Blob> {
    assertId(id, 'GDO id');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(WMS_API.gdoPdf(id), { responseType: 'blob' }),
      );
      return res.data as Blob;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
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
    const body: CalculateStorageDto = {
      warehouse_id: dto.warehouse_id,
      party_id: dto.party_id,
      period_from: dto.period_from,
      period_to: dto.period_to,
    };
    if (dto.free_days != null && Number.isFinite(dto.free_days)) {
      body.free_days = dto.free_days;
    }
    if (dto.rate_per_day != null && Number.isFinite(dto.rate_per_day)) {
      body.rate_per_day = dto.rate_per_day;
    }
    if (dto.overdue_rate_per_day != null && Number.isFinite(dto.overdue_rate_per_day)) {
      body.overdue_rate_per_day = dto.overdue_rate_per_day;
    }
    if (dto.currency_code?.trim()) {
      body.currency_code = dto.currency_code.trim().toUpperCase();
    }
    try {
      return await request(() =>
        axiosInstance.post(WMS_API.storageCalculate, body, {
          // Form shows inline error; avoid duplicate global toast on known failures.
          skipErrorToast: true,
        }),
      );
    } catch (error) {
      const msg = getErrorMessage(error);
      if (/500|internal server error/i.test(msg)) {
        throw new Error(
          `${msg} — Storage calculate needs posted GRN lots with party_id for this warehouse in the period. Finish ASN unload (auto GRN) first, then retry.`,
        );
      }
      throw error instanceof Error ? error : new Error(msg);
    }
  },

  /**
   * GET /wms/storage/charges — currently returns HTTP 500 on live backend.
   * Soft-fails (no toast) so callers can fall back to POST /wms/storage/calculate results.
   */
  async listStorageCharges(params: StorageChargesParams): Promise<unknown[]> {
    const query: Record<string, string> = {
      party_id: params.party_id,
      status: params.status,
      charge_kind: params.charge_kind,
    };
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(WMS_API.storageCharges, {
          params: query,
          skipErrorToast: true,
        }),
      );
      return requestList(res.data);
    } catch (error) {
      const msg = getErrorMessage(error);
      if (/500|internal server error/i.test(msg)) {
        throw new Error(
          'Storage charges list is unavailable (server error). Use Calculate to create OPEN charges, then invoice from that result.',
        );
      }
      throw error instanceof Error ? error : new Error(msg);
    }
  },

  async invoiceStorage(dto: InvoiceStorageDto): Promise<unknown> {
    return request(() =>
      axiosInstance.post(WMS_API.storageInvoice, dto, {
        // Page shows inline form error; avoid duplicate global toast on expected 4xx.
        skipErrorToast: true,
      }),
    );
  },
};
