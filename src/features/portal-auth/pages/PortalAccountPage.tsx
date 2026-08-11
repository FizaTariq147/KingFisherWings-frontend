import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  usePortalPreferences,
  useUpdatePortalPreferences,
} from '@/features/portal-preferences/hooks/usePortalPreferences';
import { usePortalAuthStore } from '../store/portalAuthStore';
import {
  PortalAnimatedGrid,
  PortalAnimatedGridItem,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
} from '../components/portal-ui';

export default function PortalAccountPage() {
  const user = usePortalAuthStore((s) => s.user);
  const firstLetter = (user?.fullName || user?.email || 'U').charAt(0).toUpperCase();
  const prefs = usePortalPreferences();
  const updatePrefs = useUpdatePortalPreferences();
  const [milestoneAlerts, setMilestoneAlerts] = useState(false);
  const [documentAlerts, setDocumentAlerts] = useState(true);
  const [prefError, setPrefError] = useState<string | null>(null);
  const [prefSaved, setPrefSaved] = useState(false);

  useEffect(() => {
    if (!prefs.data) return;
    setMilestoneAlerts(prefs.data.milestoneAlertsEnabled);
    setDocumentAlerts(prefs.data.documentAlertsEnabled);
  }, [prefs.data]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PortalPageHeader title="Account" description="Your portal profile, company context, and alert preferences." />

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

        <PortalAnimatedGrid className="grid gap-3 sm:grid-cols-2">
          <PortalAnimatedGridItem>
            <Info label="Phone" value={user?.phone || '—'} />
          </PortalAnimatedGridItem>
          <PortalAnimatedGridItem>
            <Info label="Party" value={user?.party?.name || '—'} />
          </PortalAnimatedGridItem>
          <PortalAnimatedGridItem>
            <Info label="Tenant" value={user?.tenantName || user?.tenantSlug || '—'} />
          </PortalAnimatedGridItem>
        </PortalAnimatedGrid>
      </PortalPanel>

      <PortalPanel padded className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">Alert preferences</h2>
          <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
            Document-ready alerts are on by default. Milestone updates are opt-in (off until you enable them).
          </p>
        </div>
        {prefs.isLoading ? (
          <PortalLoadingState label="Loading preferences…" className="py-6" />
        ) : prefs.isError ? (
          <div className="space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]">
              {prefs.error instanceof PortalApiError || prefs.error instanceof Error
                ? prefs.error.message
                : 'Could not load preferences.'}
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => void prefs.refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={milestoneAlerts}
                onChange={(e) => setMilestoneAlerts(e.target.checked)}
              />
              <span>
                <span className="font-medium text-[var(--color-neutral-800)]">
                  Milestone alerts (opt-in)
                </span>
                <span className="block text-xs text-[var(--color-neutral-500)]">
                  Receive JOB_MILESTONE_UPDATED alerts. Off by default.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={documentAlerts}
                onChange={(e) => setDocumentAlerts(e.target.checked)}
              />
              <span>
                <span className="font-medium text-[var(--color-neutral-800)]">Document-ready alerts</span>
                <span className="block text-xs text-[var(--color-neutral-500)]">
                  Receive DOCUMENT_READY alerts when a file is available to download. On by default.
                </span>
              </span>
            </label>
            {prefError ? (
              <p className="text-sm text-[var(--color-danger-600)]" role="alert">
                {prefError}
              </p>
            ) : null}
            {prefSaved ? (
              <p className="text-sm text-[var(--color-success-600)]" role="status">
                Preferences saved.
              </p>
            ) : null}
            <Button
              type="button"
              size="sm"
              disabled={updatePrefs.isPending}
              onClick={() => {
                setPrefError(null);
                setPrefSaved(false);
                void updatePrefs
                  .mutateAsync({
                    milestone_alerts_enabled: milestoneAlerts,
                    document_alerts_enabled: documentAlerts,
                    default_shipment_filters: prefs.data?.defaultShipmentFilters,
                    default_invoice_filters: prefs.data?.defaultInvoiceFilters,
                  })
                  .then(() => setPrefSaved(true))
                  .catch((err) => {
                    setPrefError(
                      err instanceof PortalApiError || err instanceof Error
                        ? err.message
                        : 'Could not save preferences.',
                    );
                  });
              }}
            >
              {updatePrefs.isPending ? 'Saving…' : 'Save preferences'}
            </Button>
          </>
        )}
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
