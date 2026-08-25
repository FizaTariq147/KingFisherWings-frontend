import { useMemo } from 'react';
import { vendorServiceMenu } from '../../features/vendors/config/vendorServiceMenu';
import { useVendorServiceMenuStats } from '../../features/vendors/hooks/useVendorServiceMenuStats';
import type { VendorServiceMenuStatKey } from '../../features/vendors/services/vendorServiceMenu.service';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';

export default function VendorServiceMenuPage() {
  const statsQuery = useVendorServiceMenuStats();

  const tiles = useMemo(
    () =>
      vendorServiceMenu.map((tile) => {
        const badgeHint =
          tile.id === 'vendor-admin-disputes'
            ? 'open disputes'
            : tile.id === 'vendor-portal-users'
              ? 'users'
              : undefined;
        return {
          ...tile,
          badge: statsQuery.data?.[tile.id as VendorServiceMenuStatKey],
          badgeLoading: statsQuery.isLoading,
          badgeHint,
        };
      }),
    [statsQuery.data, statsQuery.isLoading],
  );

  return <ModuleMenuShell title="Vendors" tiles={tiles} compact />;
}
