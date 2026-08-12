import { formatTenantSlugLabel } from '@/features/auth/utils/normalizeAuthResponse';
import { useVendorAuthStore } from '../store/vendorAuthStore';

const PRODUCT_NAME = 'KingFisher Tech Gold';

export function useVendorBrand() {
  const user = useVendorAuthStore((s) => s.user);
  const companyName =
    user?.tenantName?.trim() ||
    formatTenantSlugLabel(user?.tenantSlug) ||
    PRODUCT_NAME;

  return {
    companyName,
    productName: PRODUCT_NAME,
    portalLabel: 'Vendor Portal',
    companyInitial: companyName.charAt(0).toUpperCase(),
  };
}
