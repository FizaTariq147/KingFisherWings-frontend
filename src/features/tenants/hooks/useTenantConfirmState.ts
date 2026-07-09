import { useState } from 'react';
import type { Tenant } from '../types/tenant.types';
import type { TenantConfirmAction } from '../components/TenantConfirmModal';

export type TenantConfirmState = {
  action: TenantConfirmAction;
  tenant: Tenant;
} | null;

export function useTenantConfirmState() {
  const [confirm, setConfirm] = useState<TenantConfirmState>(null);

  const requestConfirm = (action: TenantConfirmAction, tenant: Tenant) => {
    setConfirm({ action, tenant });
  };

  const closeConfirm = () => setConfirm(null);

  return { confirm, requestConfirm, closeConfirm };
}
