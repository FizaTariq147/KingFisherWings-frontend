import { Card } from '@/components/ui/Card';
import { AppAnimatedGrid, AppAnimatedGridItem, AppGsapCountUp, AppLoadingState } from '@/components/motion';
import type { TenantStatistics } from '../../types/tenant.types';
import { normalizeTenantStatistics } from '../../utils/normalizeTenantStatistics';

interface TenantStatsCardsProps {
  stats: TenantStatistics;
  isLoading?: boolean;
}

const STAT_COLORS: Record<string, string> = {
  'Total tenants': 'text-[var(--color-neutral-800)]',
  Active: 'text-[var(--color-success-500)]',
  Inactive: 'text-[var(--color-neutral-500)]',
  Trial: 'text-[var(--color-warning-500)]',
  MRR: 'text-[var(--color-primary-600)]',
};

export function TenantStatsCards({ stats, isLoading }: TenantStatsCardsProps) {
  const safe = normalizeTenantStatistics(stats);

  const items = [
    { label: 'Total tenants', value: safe.total, prefix: '' },
    { label: 'Active', value: safe.active, prefix: '' },
    { label: 'Inactive', value: safe.inactive, prefix: '' },
    { label: 'Trial', value: safe.trial, prefix: '' },
    { label: 'MRR', value: safe.mrr, prefix: '$' },
  ];

  if (isLoading) {
    return (
      <AppAnimatedGrid className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="col-span-2 lg:col-span-5">
          <AppLoadingState label="Loading statistics…" />
        </div>
      </AppAnimatedGrid>
    );
  }

  return (
    <AppAnimatedGrid className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <AppAnimatedGridItem key={item.label}>
          <Card>
            <p className="text-xs text-[var(--color-neutral-400)] font-medium mb-1">{item.label}</p>
            <p className={`text-xl font-bold ${STAT_COLORS[item.label] ?? 'text-[var(--color-neutral-800)]'}`}>
              <AppGsapCountUp value={item.value} prefix={item.prefix} />
            </p>
            {item.label === 'Trial' && (
              <p className="mt-0.5 text-[10px] text-[var(--color-neutral-400)]">
                Subscription plan Trial
              </p>
            )}
          </Card>
        </AppAnimatedGridItem>
      ))}
    </AppAnimatedGrid>
  );
}
