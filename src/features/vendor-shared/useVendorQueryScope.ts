import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';

export function useVendorQueryScope(): string {
  return useVendorAuthStore((s) => {
    const userId = s.user?.id?.trim() || '';
    const partyId = s.user?.party?.id?.trim() || '';
    if (!userId && !partyId) return 'anon';
    return `${userId || 'user'}:${partyId || 'party'}`;
  });
}
