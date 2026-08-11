import { Badge } from '@/components/ui/Badge';
import {
  PortalAnimatedGrid,
  PortalAnimatedGridItem,
  PortalPageHeader,
  PortalPanel,
} from '@/features/portal-auth/components/portal-ui';
import { useVendorAuthStore } from '../store/vendorAuthStore';

export default function VendorAccountPage() {
  const user = useVendorAuthStore((s) => s.user);
  const firstLetter = (user?.fullName || user?.email || 'V').charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PortalPageHeader
        title="Account"
        description="Your vendor portal profile and company context."
      />

      <PortalPanel padded>
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-lg font-bold text-white">
            {firstLetter}
          </div>
          <div className="min-w-0">
            <div className="text-lg font-semibold text-[var(--color-neutral-900)] truncate">
              {user?.fullName || '—'}
            </div>
            <div className="text-sm text-[var(--color-neutral-500)] truncate">{user?.email || '—'}</div>
            {user?.status ? (
              <div className="mt-2">
                <Badge variant={String(user.status).toUpperCase() === 'ACTIVE' ? 'success' : 'neutral'}>
                  {user.status}
                </Badge>
              </div>
            ) : null}
          </div>
        </div>

        <PortalAnimatedGrid className="grid gap-3 sm:grid-cols-2">
          <PortalAnimatedGridItem>
            <Info label="Vendor" value={user?.party?.name || '—'} />
          </PortalAnimatedGridItem>
          <PortalAnimatedGridItem>
            <Info label="Vendor code" value={user?.party?.code || '—'} />
          </PortalAnimatedGridItem>
          <PortalAnimatedGridItem>
            <Info label="Tenant" value={user?.tenantName || user?.tenantSlug || '—'} />
          </PortalAnimatedGridItem>
        </PortalAnimatedGrid>
      </PortalPanel>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] px-3 py-2.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-neutral-500)]">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-[var(--color-neutral-900)] break-words">{value}</div>
    </div>
  );
}
