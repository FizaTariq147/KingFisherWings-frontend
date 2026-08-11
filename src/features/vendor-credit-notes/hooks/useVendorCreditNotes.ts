import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { useVendorQueryScope } from '@/features/vendor-shared/useVendorQueryScope';
import { vendorCreditNotesService } from '../services/vendorCreditNotes.service';
import type { VendorCreditNoteListParams } from '../types/vendorCreditNotes.types';

export function useVendorCreditNotes(params: VendorCreditNoteListParams) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: ['vendor', scope, 'credit-notes', params] as const,
    queryFn: () => vendorCreditNotesService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}
