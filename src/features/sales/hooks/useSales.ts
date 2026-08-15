import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { salesService } from '../services/sales.service';
import type {
  SalesClientListParams,
  SalesShipmentFilters,
  SalesTariffListParams,
  SalesVisitingCardParams,
} from '../types/sales.types';

const keys = {
  all: ['sales'] as const,
  clients: (params: SalesClientListParams) => [...keys.all, 'clients', params] as const,
  tariffs: (params: SalesTariffListParams) => [...keys.all, 'tariffs', params] as const,
  shipments: (filters: SalesShipmentFilters) => [...keys.all, 'shipments', filters] as const,
  visitingCards: (params: SalesVisitingCardParams) => [...keys.all, 'visiting-cards', params] as const,
};

function enabled(active = true) {
  return Boolean(useAuthStore.getState().accessToken) && active;
}

export function useSalesClients(params: SalesClientListParams, active = false) {
  return useQuery({
    queryKey: keys.clients(params),
    queryFn: () => salesService.listClients(params),
    enabled: enabled(active),
    staleTime: 30_000,
  });
}

export function useSalesTariffs(params: SalesTariffListParams, active = false) {
  return useQuery({
    queryKey: keys.tariffs(params),
    queryFn: () => salesService.listTariffs(params),
    enabled: enabled(active),
    staleTime: 30_000,
  });
}

export function useSalesShipments(filters: SalesShipmentFilters, active = false) {
  return useQuery({
    queryKey: keys.shipments(filters),
    queryFn: () => salesService.listSalesShipments(filters),
    enabled: enabled(active),
    staleTime: 30_000,
  });
}

export function useSalesVisitingCards(params: SalesVisitingCardParams, active = false) {
  return useQuery({
    queryKey: keys.visitingCards(params),
    queryFn: () => salesService.listVisitingCards(params),
    enabled: enabled(active),
    staleTime: 30_000,
  });
}
