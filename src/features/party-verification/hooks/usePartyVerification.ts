import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { useVendorQueryScope } from '@/features/vendor-shared/useVendorQueryScope';
import type { VerificationDocKind } from '../api/partyVerification.api';
import {
  portalVerificationService,
  staffPartyVerificationService,
  vendorVerificationService,
} from '../services/partyVerification.service';

export const portalVerificationKeys = {
  all: (scope: string) => ['portal', scope, 'verification'] as const,
  detail: (scope: string) => [...portalVerificationKeys.all(scope), 'detail'] as const,
};

export const vendorVerificationKeys = {
  all: (scope: string) => ['vendor', scope, 'verification'] as const,
  detail: (scope: string) => [...vendorVerificationKeys.all(scope), 'detail'] as const,
};

export const staffVerificationKeys = {
  party: (partyId: string) => ['tenant', 'party-verification', partyId] as const,
};

export function usePortalVerification(enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalVerificationKeys.detail(scope),
    queryFn: () => portalVerificationService.get(),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 15_000,
  });
}

export function usePortalVerificationMutations() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: portalVerificationKeys.all(scope) });

  const upload = useMutation({
    mutationFn: ({ kind, file }: { kind: VerificationDocKind | string; file: File }) =>
      portalVerificationService.upload(kind, file),
    onSuccess: (data) => {
      qc.setQueryData(portalVerificationKeys.detail(scope), data);
      invalidate();
    },
  });
  const remove = useMutation({
    mutationFn: (documentId: string) => portalVerificationService.remove(documentId),
    onSuccess: (data) => {
      qc.setQueryData(portalVerificationKeys.detail(scope), data);
      invalidate();
    },
  });
  const submit = useMutation({
    mutationFn: () => portalVerificationService.submit(),
    onSuccess: (data) => {
      qc.setQueryData(portalVerificationKeys.detail(scope), data);
      invalidate();
    },
  });
  return { upload, remove, submit };
}

export function useVendorVerification(enabled = true) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorVerificationKeys.detail(scope),
    queryFn: () => vendorVerificationService.get(),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 15_000,
  });
}

export function useVendorVerificationMutations() {
  const qc = useQueryClient();
  const scope = useVendorQueryScope();
  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: vendorVerificationKeys.all(scope) });

  const upload = useMutation({
    mutationFn: ({ kind, file }: { kind: VerificationDocKind | string; file: File }) =>
      vendorVerificationService.upload(kind, file),
    onSuccess: (data) => {
      qc.setQueryData(vendorVerificationKeys.detail(scope), data);
      invalidate();
    },
  });
  const remove = useMutation({
    mutationFn: (documentId: string) => vendorVerificationService.remove(documentId),
    onSuccess: (data) => {
      qc.setQueryData(vendorVerificationKeys.detail(scope), data);
      invalidate();
    },
  });
  const submit = useMutation({
    mutationFn: () => vendorVerificationService.submit(),
    onSuccess: (data) => {
      qc.setQueryData(vendorVerificationKeys.detail(scope), data);
      invalidate();
    },
  });
  return { upload, remove, submit };
}

export function useStaffPartyVerification(partyId: string, enabled = true) {
  return useQuery({
    queryKey: staffVerificationKeys.party(partyId),
    queryFn: () => staffPartyVerificationService.get(partyId),
    enabled: Boolean(partyId) && enabled,
    staleTime: 15_000,
  });
}

export function useStaffPartyVerificationMutations(partyId: string) {
  const qc = useQueryClient();
  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: staffVerificationKeys.party(partyId) });

  const approve = useMutation({
    mutationFn: (notes?: string) => staffPartyVerificationService.approve(partyId, notes),
    onSuccess: () => invalidate(),
  });
  const reject = useMutation({
    mutationFn: (reason: string) => staffPartyVerificationService.reject(partyId, reason),
    onSuccess: () => invalidate(),
  });
  return { approve, reject, invalidate };
}
