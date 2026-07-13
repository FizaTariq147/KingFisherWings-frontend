import { NavLink, Outlet } from 'react-router-dom';
import { Building2, CreditCard, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { to: '/organization', label: 'Organization Profile', icon: Building2, end: true },
  { to: '/organization/bank-accounts', label: 'Bank Accounts', icon: CreditCard, end: false },
  { to: '/organization/number-formats', label: 'Number Formats', icon: Hash, end: false },
] as const;

export default function OrganizationShell() {
  return (
    <div className="space-y-4 max-w-6xl">
      <div>
        <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Organization</h1>
        <p className="text-sm text-[var(--color-neutral-400)]">
          Manage your tenant profile, bank accounts, and document number formats.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="w-full shrink-0 space-y-1 lg:w-52">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-[var(--color-primary-50)] font-medium text-[var(--color-primary-700)]'
                    : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
