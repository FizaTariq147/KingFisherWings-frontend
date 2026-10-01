import { useMemo } from 'react';
import { settingsMenu } from '../../features/settings/config/settingsMenu';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';
import { useAuth } from '@/hooks/useAuth';
import { TENANT_USER_MANAGER_ROLE_SLUGS } from '@/features/users/constants/userPermissions';

export default function SettingsMenuPage() {
  const { hasRole } = useAuth();
  const tiles = useMemo(
    () =>
      settingsMenu.filter((tile) => {
        if (
          tile.id === 'public-api' ||
          tile.id === 'online-payments-stripe' ||
          tile.id === 'billing'
        ) {
          return TENANT_USER_MANAGER_ROLE_SLUGS.some((slug) => hasRole(slug));
        }
        return true;
      }),
    [hasRole],
  );
  return <ModuleMenuShell title="Settings" tiles={tiles} />;
}
