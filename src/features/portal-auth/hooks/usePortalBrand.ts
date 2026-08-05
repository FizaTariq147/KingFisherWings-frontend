import { usePortalAuthStore } from '../store/portalAuthStore';

const PRODUCT_NAME = 'KingFisher Tech Gold';

/** Portal chrome branding — tenant name when signed in, product name for guests. */
export function usePortalBrand() {
  const user = usePortalAuthStore((s) => s.user);
  const companyName = user?.tenantName?.trim() || PRODUCT_NAME;

  return {
    companyName,
    productName: PRODUCT_NAME,
    portalLabel: 'Customer Portal',
    companyInitial: companyName.charAt(0).toUpperCase(),
  };
}
