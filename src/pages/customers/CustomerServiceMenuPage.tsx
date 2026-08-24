import { useMemo } from 'react';
import { customerServiceMenu } from '../../features/customers/config/customerServiceMenu';
import { useCustomerServiceMenuStats } from '../../features/customers/hooks/useCustomerServiceMenuStats';
import type { CustomerServiceMenuStatKey } from '../../features/customers/services/customerServiceMenu.service';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';

export default function CustomerServiceMenuPage() {
  const statsQuery = useCustomerServiceMenuStats();

  const tiles = useMemo(
    () =>
      customerServiceMenu.map((tile) => {
        const badgeHint =
          tile.id === 'portal-inbox'
            ? 'open items'
            : tile.id === 'portal-users'
              ? 'users'
              : 'this month';
        return {
          ...tile,
          badge: statsQuery.data?.[tile.id as CustomerServiceMenuStatKey],
          badgeLoading: statsQuery.isLoading,
          badgeHint,
        };
      }),
    [statsQuery.data, statsQuery.isLoading],
  );

  return (
    <ModuleMenuShell
      title="Customers"
      tiles={tiles}
      compact
    />
  );
}
