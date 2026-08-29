import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import {
  nvoccBookingService,
  nvoccEnquiryService,
  nvoccTariffService,
  nvoccVoyageService,
} from '../services/nvocc.service';
import type {
  AssignLoadListContainerDto,
  ConvertNvoccBookingToJobDto,
  CopyNvoccVoyageDto,
  CreateNvoccBookingDto,
  CreateNvoccEnquiryDto,
  CreateNvoccTariffDto,
  CreateNvoccVoyageDto,
  MarkNvoccEnquiryLostDto,
  NvoccBookingListParams,
  NvoccEnquiryListParams,
  NvoccTariffListParams,
  NvoccTariffLookupParams,
  NvoccVoyageListParams,
  SendCutoffReminderDto,
  SendNvoccRateDto,
  UpdateNvoccBookingDto,
  UpdateNvoccEnquiryDto,
  UpdateNvoccLoadListItemDto,
  UpdateNvoccTariffDto,
  UpdateNvoccVoyageDto,
} from '../types/nvocc.types';

export const nvoccKeys = {
  all: ['tenant', 'nvocc'] as const,
  tariffs: {
    all: ['tenant', 'nvocc', 'tariffs'] as const,
    list: (params: NvoccTariffListParams) => [...nvoccKeys.tariffs.all, 'list', params] as const,
    lookup: (params: NvoccTariffLookupParams) => [...nvoccKeys.tariffs.all, 'lookup', params] as const,
    detail: (id: string) => [...nvoccKeys.tariffs.all, id] as const,
  },
  voyages: {
    all: ['tenant', 'nvocc', 'voyages'] as const,
    list: (params: NvoccVoyageListParams) => [...nvoccKeys.voyages.all, 'list', params] as const,
    detail: (id: string) => [...nvoccKeys.voyages.all, id] as const,
    loadList: (id: string) => [...nvoccKeys.voyages.all, 'load-list', id] as const,
    weightCheck: (id: string) => [...nvoccKeys.voyages.all, 'weight-check', id] as const,
  },
  enquiries: {
    all: ['tenant', 'nvocc', 'enquiries'] as const,
    list: (params: NvoccEnquiryListParams) => [...nvoccKeys.enquiries.all, 'list', params] as const,
    detail: (id: string) => [...nvoccKeys.enquiries.all, id] as const,
    analytics: (params: Record<string, string | undefined>) =>
      [...nvoccKeys.enquiries.all, 'analytics', params] as const,
  },
  bookings: {
    all: ['tenant', 'nvocc', 'bookings'] as const,
    list: (params: NvoccBookingListParams) => [...nvoccKeys.bookings.all, 'list', params] as const,
    detail: (id: string) => [...nvoccKeys.bookings.all, id] as const,
  },
};

function useToken() {
  return useAuthStore((s) => s.accessToken);
}

export function useNvoccTariffs(params: NvoccTariffListParams, options?: { enabled?: boolean }) {
  const token = useToken();
  return useQuery({
    queryKey: nvoccKeys.tariffs.list(params),
    queryFn: () => nvoccTariffService.list(params),
    enabled: Boolean(token) && options?.enabled !== false,
    placeholderData: keepPreviousData,
  });
}

export function useNvoccTariff(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: nvoccKeys.tariffs.detail(id),
    queryFn: () => nvoccTariffService.get(id),
    enabled: Boolean(token) && isUuid(id),
  });
}

export function useCreateNvoccTariff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateNvoccTariffDto) => nvoccTariffService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nvoccKeys.tariffs.all }),
  });
}

export function useUpdateNvoccTariff(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateNvoccTariffDto) => nvoccTariffService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nvoccKeys.tariffs.all });
      queryClient.invalidateQueries({ queryKey: nvoccKeys.tariffs.detail(id) });
    },
  });
}

export function useNvoccVoyages(params: NvoccVoyageListParams, options?: { enabled?: boolean }) {
  const token = useToken();
  return useQuery({
    queryKey: nvoccKeys.voyages.list(params),
    queryFn: () => nvoccVoyageService.list(params),
    enabled: Boolean(token) && options?.enabled !== false,
    placeholderData: keepPreviousData,
  });
}

export function useNvoccVoyage(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: nvoccKeys.voyages.detail(id),
    queryFn: () => nvoccVoyageService.get(id),
    enabled: Boolean(token) && isUuid(id),
  });
}

export function useNvoccLoadList(voyageId: string, options?: { enabled?: boolean }) {
  const token = useToken();
  return useQuery({
    queryKey: nvoccKeys.voyages.loadList(voyageId),
    queryFn: () => nvoccVoyageService.loadList(voyageId),
    enabled: Boolean(token) && isUuid(voyageId) && options?.enabled !== false,
  });
}

export function useCreateNvoccVoyage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateNvoccVoyageDto) => nvoccVoyageService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nvoccKeys.voyages.all }),
  });
}

export function useUpdateNvoccVoyage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateNvoccVoyageDto) => nvoccVoyageService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nvoccKeys.voyages.all });
      queryClient.invalidateQueries({ queryKey: nvoccKeys.voyages.detail(id) });
    },
  });
}

export function useNvoccVoyageActions(id: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: nvoccKeys.voyages.all });
    queryClient.invalidateQueries({ queryKey: nvoccKeys.voyages.detail(id) });
  };
  return {
    publish: useMutation({ mutationFn: () => nvoccVoyageService.publish(id), onSuccess: invalidate }),
    close: useMutation({ mutationFn: () => nvoccVoyageService.close(id), onSuccess: invalidate }),
    markSailed: useMutation({ mutationFn: () => nvoccVoyageService.markSailed(id), onSuccess: invalidate }),
    copy: useMutation({
      mutationFn: (dto: CopyNvoccVoyageDto) => nvoccVoyageService.copy(id, dto),
      onSuccess: invalidate,
    }),
    updateLoadListItem: useMutation({
      mutationFn: ({ itemId, dto }: { itemId: string; dto: UpdateNvoccLoadListItemDto }) =>
        nvoccVoyageService.updateLoadListItem(id, itemId, dto),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: nvoccKeys.voyages.loadList(id) });
      },
    }),
    assignContainer: useMutation({
      mutationFn: ({ itemId, dto }: { itemId: string; dto: AssignLoadListContainerDto }) =>
        nvoccVoyageService.assignContainer(id, itemId, dto),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: nvoccKeys.voyages.loadList(id) });
      },
    }),
  };
}

export function useNvoccEnquiries(params: NvoccEnquiryListParams, options?: { enabled?: boolean }) {
  const token = useToken();
  return useQuery({
    queryKey: nvoccKeys.enquiries.list(params),
    queryFn: () => nvoccEnquiryService.list(params),
    enabled: Boolean(token) && options?.enabled !== false,
    placeholderData: keepPreviousData,
  });
}

export function useNvoccEnquiry(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: nvoccKeys.enquiries.detail(id),
    queryFn: () => nvoccEnquiryService.get(id),
    enabled: Boolean(token) && isUuid(id),
  });
}

export function useCreateNvoccEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateNvoccEnquiryDto) => nvoccEnquiryService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nvoccKeys.enquiries.all }),
  });
}

export function useUpdateNvoccEnquiry(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateNvoccEnquiryDto) => nvoccEnquiryService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nvoccKeys.enquiries.all });
      queryClient.invalidateQueries({ queryKey: nvoccKeys.enquiries.detail(id) });
    },
  });
}

export function useNvoccEnquiryActions(id: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: nvoccKeys.enquiries.all });
    queryClient.invalidateQueries({ queryKey: nvoccKeys.enquiries.detail(id) });
    queryClient.invalidateQueries({ queryKey: nvoccKeys.bookings.all });
  };
  return {
    sendRate: useMutation({
      mutationFn: (dto: SendNvoccRateDto) => nvoccEnquiryService.sendRate(id, dto),
      onSuccess: invalidate,
    }),
    markLost: useMutation({
      mutationFn: (dto: MarkNvoccEnquiryLostDto) => nvoccEnquiryService.markLost(id, dto),
      onSuccess: invalidate,
    }),
    convertToBooking: useMutation({
      mutationFn: () => nvoccEnquiryService.convertToBooking(id),
      onSuccess: invalidate,
    }),
  };
}

export function useNvoccBookings(params: NvoccBookingListParams, options?: { enabled?: boolean }) {
  const token = useToken();
  return useQuery({
    queryKey: nvoccKeys.bookings.list(params),
    queryFn: () => nvoccBookingService.list(params),
    enabled: Boolean(token) && options?.enabled !== false,
    placeholderData: keepPreviousData,
  });
}

export function useNvoccBooking(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: nvoccKeys.bookings.detail(id),
    queryFn: () => nvoccBookingService.get(id),
    enabled: Boolean(token) && isUuid(id),
  });
}

export function useCreateNvoccBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateNvoccBookingDto) => nvoccBookingService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: nvoccKeys.bookings.all }),
  });
}

export function useUpdateNvoccBooking(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateNvoccBookingDto) => nvoccBookingService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nvoccKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: nvoccKeys.bookings.detail(id) });
    },
  });
}

export function useNvoccBookingActions(id: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: nvoccKeys.bookings.all });
    queryClient.invalidateQueries({ queryKey: nvoccKeys.bookings.detail(id) });
  };
  return {
    confirm: useMutation({ mutationFn: () => nvoccBookingService.confirm(id), onSuccess: invalidate }),
    cancel: useMutation({ mutationFn: () => nvoccBookingService.cancel(id), onSuccess: invalidate }),
    convertToJob: useMutation({
      mutationFn: (dto: ConvertNvoccBookingToJobDto) => nvoccBookingService.convertToJob(id, dto),
      onSuccess: invalidate,
    }),
    sendCutoffReminder: useMutation({
      mutationFn: (dto: SendCutoffReminderDto) => nvoccBookingService.sendCutoffReminder(id, dto),
      onSuccess: invalidate,
    }),
  };
}
