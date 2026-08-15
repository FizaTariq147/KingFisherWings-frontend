import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import type {
  CustomerEnquiryFilters,
  CustomerPricingFilters,
  CustomerShipmentFilters,
} from '../types/customerService.types';
import { customerServiceService } from '../services/customerService.service';

const keys = {
  all: ['customer-service'] as const,
  shipments: (filters: CustomerShipmentFilters) => [...keys.all, 'shipments', filters] as const,
  agentEdi: (filters: CustomerShipmentFilters) => [...keys.all, 'agent-edi', filters] as const,
  tracking: (filters: CustomerShipmentFilters) => [...keys.all, 'tracking', filters] as const,
  sailing: (filters: CustomerShipmentFilters) => [...keys.all, 'sailing', filters] as const,
  costing: (filters: CustomerShipmentFilters) => [...keys.all, 'costing', filters] as const,
  costingDetail: (jobId: string) => [...keys.all, 'costing-detail', jobId] as const,
  enquiries: (filters: CustomerEnquiryFilters) => [...keys.all, 'enquiries', filters] as const,
  pricing: (filters: CustomerPricingFilters) => [...keys.all, 'pricing', filters] as const,
};

function enabled(active = true) {
  return Boolean(useAuthStore.getState().accessToken) && active;
}

export function useCustomerShipments(filters: CustomerShipmentFilters, active = false) {
  return useQuery({
    queryKey: keys.shipments(filters),
    queryFn: () => customerServiceService.listShipments(filters),
    enabled: enabled(active),
    staleTime: 30_000,
  });
}

export function useCustomerAgentEdi(filters: CustomerShipmentFilters, active = false) {
  return useQuery({
    queryKey: keys.agentEdi(filters),
    queryFn: () => customerServiceService.listAgentEdiShipments(filters),
    enabled: enabled(active),
    staleTime: 30_000,
  });
}

export function useCustomerTracking(filters: CustomerShipmentFilters, active = false) {
  return useQuery({
    queryKey: keys.tracking(filters),
    queryFn: () => customerServiceService.listTracking(filters),
    enabled: enabled(active),
    staleTime: 30_000,
  });
}

export function useCustomerSailingSchedule(filters: CustomerShipmentFilters, active = false) {
  return useQuery({
    queryKey: keys.sailing(filters),
    queryFn: () => customerServiceService.listSailingSchedule(filters),
    enabled: enabled(active),
    staleTime: 30_000,
  });
}

export function useCustomerCostingShipments(filters: CustomerShipmentFilters, active = false) {
  return useQuery({
    queryKey: keys.costing(filters),
    queryFn: () => customerServiceService.listCostingShipments(filters),
    enabled: enabled(active),
    staleTime: 30_000,
  });
}

export function useCustomerJobCosting(jobId: string | null, active = false) {
  return useQuery({
    queryKey: keys.costingDetail(jobId ?? ''),
    queryFn: () => customerServiceService.loadJobCosting(jobId!),
    enabled: enabled(active && Boolean(jobId)),
    staleTime: 15_000,
  });
}

export function useCustomerEnquiries(filters: CustomerEnquiryFilters, active = false) {
  return useQuery({
    queryKey: keys.enquiries(filters),
    queryFn: () => customerServiceService.listEnquiries(filters),
    enabled: enabled(active),
    staleTime: 30_000,
  });
}

export function useCustomerPricingDashboard(filters: CustomerPricingFilters, active = false) {
  return useQuery({
    queryKey: keys.pricing(filters),
    queryFn: () => customerServiceService.loadPricingDashboard(filters),
    enabled: enabled(active),
    staleTime: 30_000,
  });
}

export function useCustomerPricingRefresh() {
  return useMutation({
    mutationFn: (filters: CustomerPricingFilters) => customerServiceService.loadPricingDashboard(filters),
  });
}
