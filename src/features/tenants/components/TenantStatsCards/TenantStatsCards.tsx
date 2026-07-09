import { Card } from '@/components/ui/Card';
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
    { label: 'Total tenants', value: safe.total.toString() },
    { label: 'Active', value: safe.active.toString() },
    { label: 'Inactive', value: safe.inactive.toString() },
    { label: 'Trial', value: safe.trial.toString() },
    { label: 'MRR', value: `$${safe.mrr.toLocaleString()}` },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="text-xs text-[var(--color-neutral-400)] font-medium mb-1">{item.label}</p>
          <p className={`text-xl font-bold ${STAT_COLORS[item.label] ?? 'text-[var(--color-neutral-800)]'}`}>
            {item.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
