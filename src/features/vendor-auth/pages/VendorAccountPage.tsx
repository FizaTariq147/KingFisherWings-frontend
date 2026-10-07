import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  PortalAnimatedGrid,
  PortalAnimatedGridItem,
  PortalPageHeader,
  PortalPanel,
} from '@/features/portal-auth/components/portal-ui';
import { useVendorAuthStore } from '../store/vendorAuthStore';

export default function VendorAccountPage() {
  const navigate = useNavigate();
  const user = useVendorAuthStore((s) => s.user);
  const mustChange = Boolean(user?.mustChangePassword);
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

      <PortalPanel padded className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">Password</h2>
          <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
            {mustChange
              ? 'You signed in with a temporary password. Set your own password to continue.'
              : 'Change the password you use to sign in to the vendor portal.'}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={mustChange ? 'primary' : 'secondary'}
          onClick={() => navigate('/vendor/change-password')}
        >
          {mustChange ? 'Set new password' : 'Change password'}
        </Button>
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
