import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { useVendorQueryScope } from '@/features/vendor-shared/useVendorQueryScope';
import {
  staffVendorJobOffersService,
  vendorPortalJobsService,
} from '../services/vendorJobOffers.service';
import {
  fetchVendorAirportOptions,
  fetchVendorPortOptions,
} from '../utils/loadVendorLookupOptions';
import type {
  DisapproveVendorOfferDto,
  PassJobToVendorDto,
  ReviewVendorOfferDto,
  SubmitVendorJobPricingDto,
  VendorCounterOfferDto,
  VendorNegotiationAcceptDto,
  VendorNegotiationRejectDto,
  VendorPortalJobListParams,
  VendorReviseAndSendDto,
} from '../types/vendorJobOffers.types';

export const staffVendorJobOfferKeys = {
  all: ['tenant', 'job-vendor-offers'] as const,
  list: (jobId: string) => [...staffVendorJobOfferKeys.all, 'list', jobId] as const,
  negotiation: (offerId: string) =>
    [...staffVendorJobOfferKeys.all, 'negotiation', offerId] as const,
};

export const vendorPortalJobKeys = {
  all: (scope: string) => ['vendor', scope, 'jobs'] as const,
  list: (scope: string, params: VendorPortalJobListParams) =>
    [...vendorPortalJobKeys.all(scope), 'list', params] as const,
  detail: (scope: string, id: string) => [...vendorPortalJobKeys.all(scope), 'detail', id] as const,
  pricing: (scope: string, id: string) =>
    [...vendorPortalJobKeys.all(scope), 'pricing', id] as const,
  negotiation: (scope: string, id: string) =>
    [...vendorPortalJobKeys.all(scope), 'negotiation', id] as const,
};

export function useJobVendorOffers(jobId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: staffVendorJobOfferKeys.list(jobId),
    queryFn: () => staffVendorJobOffersService.listOffers(jobId),
    enabled: Boolean(accessToken) && Boolean(jobId),
    staleTime: 0,
  });
}

export function useStaffVendorOfferNegotiation(offerId: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: staffVendorJobOfferKeys.negotiation(offerId),
    queryFn: () => staffVendorJobOffersService.getNegotiation(offerId),
    enabled: Boolean(accessToken) && Boolean(offerId) && enabled,
    staleTime: 0,
  });
}

export function usePassJobToVendor(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: PassJobToVendorDto) => staffVendorJobOffersService.passToVendor(jobId, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: staffVendorJobOfferKeys.list(jobId) });
    },
  });
}

export function useStaffVendorOfferActions(jobId: string) {
  const queryClient = useQueryClient();
  const invalidate = (offerId?: string) => {
    void queryClient.invalidateQueries({ queryKey: staffVendorJobOfferKeys.list(jobId) });
    if (offerId) {
      void queryClient.invalidateQueries({
        queryKey: staffVendorJobOfferKeys.negotiation(offerId),
      });
    }
  };

  const reviseAndSend = useMutation({
    mutationFn: ({ offerId, dto }: { offerId: string; dto: VendorReviseAndSendDto }) =>
      staffVendorJobOffersService.reviseAndSend(offerId, dto),
    onSuccess: (_d, vars) => invalidate(vars.offerId),
  });
  const acceptCounter = useMutation({
    mutationFn: ({
      offerId,
      dto,
    }: {
      offerId: string;
      dto?: VendorNegotiationAcceptDto;
    }) => staffVendorJobOffersService.acceptCounter(offerId, dto),
    onSuccess: (_d, vars) => invalidate(vars.offerId),
  });
  const rejectCounter = useMutation({
    mutationFn: ({ offerId, dto }: { offerId: string; dto: VendorNegotiationRejectDto }) =>
      staffVendorJobOffersService.rejectCounter(offerId, dto),
    onSuccess: (_d, vars) => invalidate(vars.offerId),
  });
  const approve = useMutation({
    mutationFn: ({ offerId, dto }: { offerId: string; dto?: ReviewVendorOfferDto }) =>
      staffVendorJobOffersService.approveOffer(jobId, offerId, dto),
    onSuccess: (_d, vars) => invalidate(vars.offerId),
  });
  const disapprove = useMutation({
    mutationFn: ({ offerId, dto }: { offerId: string; dto: DisapproveVendorOfferDto }) =>
      staffVendorJobOffersService.disapproveOffer(jobId, offerId, dto),
    onSuccess: (_d, vars) => invalidate(vars.offerId),
  });

  return { reviseAndSend, acceptCounter, rejectCounter, approve, disapprove };
}

/** @deprecated Prefer useStaffVendorOfferActions */
export function useApproveVendorOffer(jobId: string) {
  return useStaffVendorOfferActions(jobId).approve;
}

/** @deprecated Prefer useStaffVendorOfferActions */
export function useDisapproveVendorOffer(jobId: string) {
  return useStaffVendorOfferActions(jobId).disapprove;
}

export function useVendorPortalJobs(params: VendorPortalJobListParams) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorPortalJobKeys.list(scope, params),
    queryFn: () => vendorPortalJobsService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useVendorPortalJob(id: string) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorPortalJobKeys.detail(scope, id),
    queryFn: () => vendorPortalJobsService.getById(id),
    enabled: Boolean(accessToken) && Boolean(id) && scope !== 'anon',
    staleTime: 0,
  });
}

export function useVendorPortalJobPricing(id: string) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorPortalJobKeys.pricing(scope, id),
    queryFn: () => vendorPortalJobsService.getPricing(id),
    enabled: Boolean(accessToken) && Boolean(id) && scope !== 'anon',
    staleTime: 0,
  });
}

export function useVendorPortalOfferNegotiation(id: string, enabled = true) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorPortalJobKeys.negotiation(scope, id),
    queryFn: () => vendorPortalJobsService.getNegotiation(id),
    enabled: Boolean(accessToken) && Boolean(id) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function useVendorPortalOfferActions(offerId: string) {
  const queryClient = useQueryClient();
  const scope = useVendorQueryScope();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: vendorPortalJobKeys.detail(scope, offerId) });
    void queryClient.invalidateQueries({ queryKey: vendorPortalJobKeys.pricing(scope, offerId) });
    void queryClient.invalidateQueries({
      queryKey: vendorPortalJobKeys.negotiation(scope, offerId),
    });
    void queryClient.invalidateQueries({ queryKey: vendorPortalJobKeys.all(scope) });
  };

  const accept = useMutation({
    mutationFn: (dto: VendorNegotiationAcceptDto = {}) =>
      vendorPortalJobsService.accept(offerId, dto),
    onSuccess: invalidate,
  });
  const reject = useMutation({
    mutationFn: (dto: VendorNegotiationRejectDto) =>
      vendorPortalJobsService.reject(offerId, dto),
    onSuccess: invalidate,
  });
  const counterOffer = useMutation({
    mutationFn: (dto: VendorCounterOfferDto) =>
      vendorPortalJobsService.counterOffer(offerId, dto),
    onSuccess: invalidate,
  });
  const submitPricing = useMutation({
    mutationFn: (dto: SubmitVendorJobPricingDto) =>
      vendorPortalJobsService.submitPricing(offerId, dto),
    onSuccess: invalidate,
  });

  return { accept, reject, counterOffer, submitPricing };
}

export function useSubmitVendorJobPricing(jobId: string) {
  return useVendorPortalOfferActions(jobId).submitPricing;
}

/** GET /vendor/lookups/ports — searchable world catalog. */
export function useVendorPortOptions(search = '', enabled = true) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  const q = search.trim();
  return useQuery({
    queryKey: [...vendorPortalJobKeys.all(scope), 'lookups', 'ports', q] as const,
    queryFn: () => fetchVendorPortOptions(q || undefined),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 10 * 60_000,
  });
}

/** GET /vendor/lookups/airports — searchable world catalog. */
export function useVendorAirportOptions(search = '', enabled = true) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  const q = search.trim();
  return useQuery({
    queryKey: [...vendorPortalJobKeys.all(scope), 'lookups', 'airports', q] as const,
    queryFn: () => fetchVendorAirportOptions(q || undefined),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 10 * 60_000,
  });
}
