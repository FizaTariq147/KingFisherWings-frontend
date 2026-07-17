import type { ReactNode } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';

export function AccountsFormAlert({
  variant = 'danger',
  children,
}: {
  variant?: 'danger' | 'warning';
  children: ReactNode;
}) {
  const isWarning = variant === 'warning';
  return (
    <div
      role="alert"
      className="rounded-lg border px-4 py-3 text-sm"
      style={
        isWarning
          ? {
              background: 'var(--color-warning-100, #FFFBEB)',
              borderColor: '#FDE68A',
              color: 'var(--color-warning-800, #92400E)',
            }
          : {
              background: 'var(--color-danger-100)',
              borderColor: '#FECACA',
              color: 'var(--color-danger-700)',
            }
      }
    >
      {children}
    </div>
  );
}

interface AccountsCreatePageLayoutProps {
  backLabel: string;
  backTo: string;
  title: string;
  subtitle: string;
  banner?: ReactNode;
  error?: string | null;
  children: ReactNode;
  className?: string;
}

/** Shared chrome for Accounts/GL create pages — back link, title, alerts, form slot. */
export function AccountsCreatePageLayout({
  backLabel,
  backTo,
  title,
  subtitle,
  banner,
  error,
  children,
  className = 'space-y-4',
}: AccountsCreatePageLayoutProps) {
  return (
    <div className={className}>
      <PageBackLink to={backTo} label={backLabel} />
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">{title}</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">{subtitle}</p>
      </div>
      {banner ? (
        typeof banner === 'string' ? (
          <AccountsFormAlert variant="warning">{banner}</AccountsFormAlert>
        ) : (
          banner
        )
      ) : null}
      {error ? <AccountsFormAlert>{error}</AccountsFormAlert> : null}
      {children}
    </div>
  );
}
