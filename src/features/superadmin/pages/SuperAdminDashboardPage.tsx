import { useNavigate } from 'react-router-dom';
import { Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { usePlatformOnboardingStore } from '@/features/platform/store/platformOnboardingStore';
import { useCompanyRegistry } from '@/features/companies/hooks/useCompanies';
import { TenantStatsCards } from '@/features/tenants/components/TenantStatsCards';
import { useTenantStatistics } from '@/features/tenants/hooks/useTenants';

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useTenantStatistics();
  const draftCompanies = usePlatformOnboardingStore((s) => s.draftCompanies);
  const { data: companiesData } = useCompanyRegistry({ limit: 1 });
  const hasCompany =
    draftCompanies.length > 0 || (companiesData?.companies.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Platform Overview</h2>
        <p className="text-sm text-[var(--color-neutral-400)]">KINGFISHER WINGS LOGISTIC — Super Admin</p>
      </div>

      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium text-[var(--color-neutral-800)]">Provisioning flow</p>
        <ol className="text-sm text-[var(--color-neutral-600)] space-y-1 list-decimal list-inside">
          <li>Register a company</li>
          <li>Create a tenant workspace for that company</li>
        </ol>
        <p className="text-xs text-[var(--color-neutral-500)]">
          Tenant user management is handled by each Tenant Admin inside their workspace — not from
          Super Admin.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" onClick={() => navigate('/superadmin/companies/new')}>
            1. Register company
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/superadmin/tenants/new')}
            disabled={!hasCompany}
          >
            2. Create tenant
          </Button>
        </div>
      </Card>

      <TenantStatsCards
        stats={stats ?? { total: 0, active: 0, inactive: 0, trial: 0, mrr: 0 }}
        isLoading={isLoading}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-primary-50)' }}
            >
              <Briefcase size={18} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-neutral-800)]">Companies</p>
              <p className="text-xs text-[var(--color-neutral-400)]">Register and manage company profiles</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate('/superadmin/companies')}>
            Manage Companies
          </Button>
        </Card>

        <Card className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-primary-50)' }}
            >
              <Building2 size={18} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-neutral-800)]">Tenants</p>
              <p className="text-xs text-[var(--color-neutral-400)]">Workspaces, subscriptions, and limits</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate('/superadmin/tenants')}>
            Manage Tenants
          </Button>
        </Card>
      </div>
    </div>
  );
}
