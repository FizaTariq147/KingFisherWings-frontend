import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TenantStatsCards } from '@/features/tenants/components/TenantStatsCards';
import { useTenantStatistics } from '@/features/tenants/hooks/useTenants';

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useTenantStatistics();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Platform Overview</h1>
        <p className="text-sm text-[var(--color-neutral-400)]">KINGFISHER WINGS LOGISTIC — Super Admin</p>
      </div>

      <TenantStatsCards
        stats={stats ?? { total: 0, active: 0, inactive: 0, trial: 0, mrr: 0 }}
        isLoading={isLoading}
      />

      <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-primary-50)' }}
          >
            <Building2 size={18} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-neutral-800)]">Tenant Management</p>
            <p className="text-xs text-[var(--color-neutral-400)]">Create, edit, and monitor workspaces</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => navigate('/superadmin/tenants')}>
          Manage Tenants
        </Button>
      </Card>
    </div>
  );
}
