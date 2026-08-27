import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { isUuid } from '@/lib/isUuid';
import { wmsService } from '../services/wms.service';
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
} from '../types/wms.types';

export const wmsKeys = {
  all: ['tenant', 'wms'] as const,
  settings: () => [...wmsKeys.all, 'settings'] as const,
  items: (params: WmsItemListParams) => [...wmsKeys.all, 'items', params] as const,
  item: (id: string) => [...wmsKeys.all, 'item', id] as const,
  asns: () => [...wmsKeys.all, 'asns'] as const,
  asn: (id: string) => [...wmsKeys.all, 'asn', id] as const,
  grns: () => [...wmsKeys.all, 'grns'] as const,
  grn: (id: string) => [...wmsKeys.all, 'grn', id] as const,
  gdos: () => [...wmsKeys.all, 'gdos'] as const,
  gdo: (id: string) => [...wmsKeys.all, 'gdo', id] as const,
  stockOnHand: (params: StockOnHandParams) => [...wmsKeys.all, 'stock-on-hand', params] as const,
  stockMovements: (params: StockMovementsParams) =>
    [...wmsKeys.all, 'stock-movements', params] as const,
  stockLow: (params: StockOnHandParams) => [...wmsKeys.all, 'stock-low', params] as const,
  stockAging: (params: StockOnHandParams) => [...wmsKeys.all, 'stock-aging', params] as const,
  transfers: () => [...wmsKeys.all, 'transfers'] as const,
  transfer: (id: string) => [...wmsKeys.all, 'transfer', id] as const,
  storageCharges: (params: StorageChargesParams) =>
    [...wmsKeys.all, 'storage-charges', params] as const,
};

function useWmsEnabled(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return Boolean(accessToken) && enabled;
}

export function useInvalidateWms() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: wmsKeys.all });
}

export function useWmsSettings() {
  return useQuery({
    queryKey: wmsKeys.settings(),
    queryFn: () => wmsService.getSettings(),
    enabled: useWmsEnabled(),
    staleTime: 60_000,
  });
}

export function useUpsertWmsSettings() {
  const invalidate = useInvalidateWms();
  return useMutation({
    mutationFn: (dto: UpsertWmsSettingsDto) => wmsService.upsertSettings(dto),
    onSuccess: () => invalidate(),
  });
}

export function useWmsItems(params: WmsItemListParams) {
  return useQuery({
    queryKey: wmsKeys.items(params),
    queryFn: () => wmsService.listItems(params),
    enabled: useWmsEnabled(),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useWmsItem(id: string) {
  return useQuery({
    queryKey: wmsKeys.item(id),
    queryFn: () => wmsService.getItem(id),
    enabled: useWmsEnabled() && isUuid(id),
  });
}

export function useCreateWmsItem() {
  const invalidate = useInvalidateWms();
  return useMutation({
    mutationFn: (dto: CreateWmsItemDto) => wmsService.createItem(dto),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateWmsItem(id: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateWms();
  return useMutation({
    mutationFn: (dto: UpdateWmsItemDto) => wmsService.updateItem(id, dto),
    onSuccess: (item) => {
      invalidate();
      queryClient.setQueryData(wmsKeys.item(id), item);
    },
  });
}

export function useDeleteWmsItem() {
  const invalidate = useInvalidateWms();
  return useMutation({
    mutationFn: (id: string) => wmsService.deleteItem(id),
    onSuccess: () => invalidate(),
  });
}

export function useWmsAsns() {
  return useQuery({
    queryKey: wmsKeys.asns(),
    queryFn: () => wmsService.listAsns(),
    enabled: useWmsEnabled(),
    staleTime: 30_000,
  });
}

export function useWmsAsn(id: string) {
  return useQuery({
    queryKey: wmsKeys.asn(id),
    queryFn: () => wmsService.getAsn(id),
    enabled: useWmsEnabled() && isUuid(id),
  });
}

export function useCreateWmsAsn() {
  const invalidate = useInvalidateWms();
  return useMutation({
    mutationFn: (dto: CreateAsnDto) => wmsService.createAsn(dto),
    onSuccess: () => invalidate(),
  });
}

export function useWmsAsnActions(id: string) {
  const invalidate = useInvalidateWms();
  return {
    confirm: useMutation({
      mutationFn: () => wmsService.confirmAsn(id),
      onSuccess: () => invalidate(),
    }),
    cancel: useMutation({
      mutationFn: () => wmsService.cancelAsn(id),
      onSuccess: () => invalidate(),
    }),
  };
}

export function useWmsGrns() {
  return useQuery({
    queryKey: wmsKeys.grns(),
    queryFn: () => wmsService.listGrns(),
    enabled: useWmsEnabled(),
    staleTime: 30_000,
  });
}

export function useWmsGrn(id: string) {
  return useQuery({
    queryKey: wmsKeys.grn(id),
    queryFn: () => wmsService.getGrn(id),
    enabled: useWmsEnabled() && isUuid(id),
  });
}

export function useCreateWmsGrn() {
  const invalidate = useInvalidateWms();
  return useMutation({
    mutationFn: (dto: CreateGrnDto) => wmsService.createGrn(dto),
    onSuccess: () => invalidate(),
  });
}

export function useWmsGrnActions(id: string) {
  const invalidate = useInvalidateWms();
  return {
    post: useMutation({
      mutationFn: () => wmsService.postGrn(id),
      onSuccess: () => invalidate(),
    }),
    cancel: useMutation({
      mutationFn: () => wmsService.cancelGrn(id),
      onSuccess: () => invalidate(),
    }),
  };
}

export function useWmsGdos() {
  return useQuery({
    queryKey: wmsKeys.gdos(),
    queryFn: () => wmsService.listGdos(),
    enabled: useWmsEnabled(),
    staleTime: 30_000,
  });
}

export function useWmsGdo(id: string) {
  return useQuery({
    queryKey: wmsKeys.gdo(id),
    queryFn: () => wmsService.getGdo(id),
    enabled: useWmsEnabled() && isUuid(id),
  });
}

export function useCreateWmsGdo() {
  const invalidate = useInvalidateWms();
  return useMutation({
    mutationFn: (dto: CreateGdoDto) => wmsService.createGdo(dto),
    onSuccess: () => invalidate(),
  });
}

export function useWmsGdoActions(id: string) {
  const invalidate = useInvalidateWms();
  return {
    post: useMutation({
      mutationFn: () => wmsService.postGdo(id),
      onSuccess: () => invalidate(),
    }),
    cancel: useMutation({
      mutationFn: () => wmsService.cancelGdo(id),
      onSuccess: () => invalidate(),
    }),
  };
}

export function useWmsStockOnHand(params: StockOnHandParams, enabled = true) {
  return useQuery({
    queryKey: wmsKeys.stockOnHand(params),
    queryFn: () => wmsService.stockOnHand(params),
    enabled: useWmsEnabled(enabled),
    staleTime: 30_000,
  });
}

export function useWmsStockMovements(params: StockMovementsParams, enabled = true) {
  return useQuery({
    queryKey: wmsKeys.stockMovements(params),
    queryFn: () => wmsService.stockMovements(params),
    enabled: useWmsEnabled(enabled),
    staleTime: 30_000,
  });
}

export function useWmsStockLow(params: StockOnHandParams, enabled = true) {
  return useQuery({
    queryKey: wmsKeys.stockLow(params),
    queryFn: () => wmsService.stockLowStock(params),
    enabled: useWmsEnabled(enabled),
    staleTime: 30_000,
  });
}

export function useWmsStockAging(params: StockOnHandParams, enabled = true) {
  return useQuery({
    queryKey: wmsKeys.stockAging(params),
    queryFn: () => wmsService.stockLotAging(params),
    enabled: useWmsEnabled(enabled),
    staleTime: 30_000,
  });
}

export function useAdjustWmsStock() {
  const invalidate = useInvalidateWms();
  return useMutation({
    mutationFn: (dto: AdjustStockDto) => wmsService.adjustStock(dto),
    onSuccess: () => invalidate(),
  });
}

export function useWmsTransfers() {
  return useQuery({
    queryKey: wmsKeys.transfers(),
    queryFn: () => wmsService.listTransfers(),
    enabled: useWmsEnabled(),
    staleTime: 30_000,
  });
}

export function useWmsTransfer(id: string) {
  return useQuery({
    queryKey: wmsKeys.transfer(id),
    queryFn: () => wmsService.getTransfer(id),
    enabled: useWmsEnabled() && isUuid(id),
  });
}

export function useCreateWmsTransfer() {
  const invalidate = useInvalidateWms();
  return useMutation({
    mutationFn: (dto: CreateTransferDto) => wmsService.createTransfer(dto),
    onSuccess: () => invalidate(),
  });
}

export function usePostWmsTransfer() {
  const invalidate = useInvalidateWms();
  return useMutation({
    mutationFn: (id: string) => wmsService.postTransfer(id),
    onSuccess: () => invalidate(),
  });
}

export function useWmsStorageCharges(params: StorageChargesParams, enabled = true) {
  return useQuery({
    queryKey: wmsKeys.storageCharges(params),
    queryFn: () => wmsService.listStorageCharges(params),
    enabled: useWmsEnabled(enabled) && isUuid(params.party_id) && Boolean(params.status?.trim()),
    staleTime: 30_000,
  });
}

export function useCalculateWmsStorage() {
  return useMutation({
    mutationFn: (dto: CalculateStorageDto) => wmsService.calculateStorage(dto),
  });
}

export function useInvoiceWmsStorage() {
  const invalidate = useInvalidateWms();
  return useMutation({
    mutationFn: (dto: InvoiceStorageDto) => wmsService.invoiceStorage(dto),
    onSuccess: () => invalidate(),
  });
}
