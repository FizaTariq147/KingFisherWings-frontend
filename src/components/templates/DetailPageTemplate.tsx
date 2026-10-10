import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { appType } from '@/lib/erpTypography';

export interface DetailTab {
  key: string;
  label: string;
  content: ReactNode;
}

interface DetailAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface DetailPageTemplateProps {
  title: string;
  subtitle?: string;
  statusLabel?: string;
  statusTone?: 'emerald' | 'amber' | 'rose' | 'slate';
  tabs: DetailTab[];
  /** When set and matches a tab key, select that tab (e.g. ?tab=invoices after auto-invoice). */
  defaultTab?: string;
  actions?: DetailAction[];
  actionsDisabled?: boolean;
  sidebar?: ReactNode;
  /** Explicit back handler (module list). Preferred when provided. */
  onBack?: () => void;
  /** Explicit back path when `onBack` is not set. */
  backTo?: string;
  backLabel?: string;
}

const TONE_VARIANT: Record<
  string,
  'success' | 'warning' | 'danger' | 'neutral'
> = {
  emerald: 'success',
  amber: 'warning',
  rose: 'danger',
  slate: 'neutral',
};

const ACTION_VARIANT: Record<string, 'primary' | 'secondary' | 'danger'> = {
  primary: 'primary',
  secondary: 'secondary',
  danger: 'danger',
};

export function DetailPageTemplate({
  title,
  subtitle,
  statusLabel,
  statusTone = 'slate',
  tabs,
  defaultTab,
  actions,
  actionsDisabled,
  sidebar,
  onBack,
  backTo,
  backLabel = 'Back',
}: DetailPageTemplateProps) {
  const initialKey =
    (defaultTab && tabs.some((t) => t.key === defaultTab) ? defaultTab : undefined) ||
    tabs[0]?.key;
  const [activeTab, setActiveTab] = useState(initialKey);

  useEffect(() => {
    if (!defaultTab) return;
    if (!tabs.some((t) => t.key === defaultTab)) return;
    setActiveTab(defaultTab);
    // Only react when the requested tab key changes — not when `tabs` identity updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tabs content may remount; defaultTab drives selection
  }, [defaultTab]);

  return (
    <div>
      <PageBackLink to={backTo} label={backLabel} onClick={onBack} className="mb-3" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className={appType.pageTitle}>{title}</h1>
            {statusLabel ? (
              <Badge variant={TONE_VARIANT[statusTone] ?? 'neutral'} dot={false}>
                {statusLabel}
              </Badge>
            ) : null}
          </div>
          {subtitle && (
            <p className={appType.pageSubtitle}>{subtitle}</p>
          )}
        </div>
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {actions.map((a) => (
              <Button
                key={a.label}
                type="button"
                size="sm"
                variant={ACTION_VARIANT[a.variant ?? 'secondary']}
                onClick={a.onClick}
                disabled={actionsDisabled}
              >
                {a.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-6 border-b border-[var(--color-neutral-200)] mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === t.key
                ? 'border-[var(--color-primary-500)] text-[var(--color-neutral-800)]'
                : 'border-transparent text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={sidebar ? 'grid grid-cols-1 lg:grid-cols-12 gap-6' : ''}>
        <div className={sidebar ? 'lg:col-span-8' : ''}>
          {tabs.find((t) => t.key === activeTab)?.content}
        </div>
        {sidebar && <div className="lg:col-span-4">{sidebar}</div>}
      </div>
    </div>
  );
}
