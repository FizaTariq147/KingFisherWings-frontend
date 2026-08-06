import { Badge } from '@/components/ui/Badge';
import { usePortalAuthStore } from '../store/portalAuthStore';
import { PortalPageHeader, PortalPanel } from '../components/portal-ui';

export default function PortalAccountPage() {
  const user = usePortalAuthStore((s) => s.user);
  const firstLetter = (user?.fullName || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PortalPageHeader title="Account" description="Your portal profile and company context." />

      <PortalPanel padded>
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-lg font-bold text-white">
            {firstLetter}
          </div>
          <div className="min-w-0">
            <div className="text-lg font-semibold text-[var(--color-neutral-900)] truncate">
              {user?.fullName || '—'}
            </div>
            <div className="text-sm text-[var(--color-neutral-500)] truncate">
              {user?.email || '—'}
            </div>
            {user?.status ? (
              <div className="mt-2">
                <Badge variant={String(user.status).toUpperCase() === 'ACTIVE' ? 'success' : 'neutral'}>
                  {user.status}
                </Badge>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="Phone" value={user?.phone || '—'} />
          <Info label="Party" value={user?.party?.name || '—'} />
          <Info label="Tenant" value={user?.tenantName || user?.tenantSlug || '—'} />
        </div>
      </PortalPanel>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-[var(--color-neutral-800)] break-all">
        {value}
      </div>
    </div>
  );
}
