import { vendorAdminDisputesService } from '@/features/vendor-admin-disputes/services/vendorAdminDisputes.service';
import { vendorUsersAdminService } from '@/features/vendor-users-admin/services/vendorUsersAdmin.service';

export type VendorServiceMenuStatKey = 'vendor-admin-disputes' | 'vendor-portal-users';

export type VendorServiceMenuStats = Partial<Record<VendorServiceMenuStatKey, number>>;

function isOpenDispute(status: string | undefined): boolean {
  const normalized = (status ?? '').toUpperCase();
  return normalized !== 'RESOLVED' && normalized !== 'REJECTED';
}

export const vendorServiceMenuService = {
  async loadStats(): Promise<VendorServiceMenuStats> {
    const [disputes, users] = await Promise.all([
      vendorAdminDisputesService.list().catch(() => []),
      vendorUsersAdminService.list().catch(() => []),
    ]);

    return {
      'vendor-admin-disputes': disputes.filter((dispute) => isOpenDispute(dispute.status)).length,
      'vendor-portal-users': users.length,
    };
  },
};
