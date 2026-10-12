import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { permissionsFromAccessToken } from '@/lib/tenantFromAuth';
import { useAuthStore } from '@/store/authStore';
import {
  hasShipmentsCreate,
  hasShipmentsGenerate,
  hasShipmentsUpdate,
  hasShipmentsView,
} from '../utils/shipmentPermissions';

/**
 * Staff Shipments JWT permissions — OpenAPI guards:
 * view | create | update | generate
 */
export function useShipmentsPermissions() {
  const { user, hasEnabledModule } = useAuth();
  const accessToken = useAuthStore((s) => s.accessToken);

  return useMemo(() => {
    const jwtPermissions = permissionsFromAccessToken(accessToken);
    const merged = user?.permissions?.length
      ? [...new Set([...user.permissions.map(String), ...jwtPermissions])]
      : jwtPermissions;

    const moduleEnabled =
      hasEnabledModule('shipments') || hasEnabledModule('operations');

    const canView = hasShipmentsView(merged);
    const canCreate = hasShipmentsCreate(merged);
    const canUpdate = hasShipmentsUpdate(merged);
    const canGenerate = hasShipmentsGenerate(merged);

    return {
      moduleEnabled,
      jwtPermissions,
      canView,
      canCreate,
      canUpdate,
      canGenerate,
      /** List + detail GET */
      canReadApi: moduleEnabled && canView,
      /** POST /shipments, copy */
      canWriteCreate: moduleEnabled && canCreate,
      /** PATCH / status / charges / docs */
      canWriteUpdate: moduleEnabled && canUpdate,
      /** generate-job, create-submaster */
      canWriteGenerate: moduleEnabled && canGenerate,
    };
  }, [accessToken, hasEnabledModule, user?.permissions]);
}
