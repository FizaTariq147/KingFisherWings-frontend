import { useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import {
  usePlatformBillingWebhookEvents,
  useReplayPlatformBillingWebhookEvent,
} from '../hooks/usePlatformBilling';
import { PlatformBillingErrorAlert } from '../components/PlatformBillingErrorAlert';
import { PlatformBillingFieldGrid } from '../components/PlatformBillingFieldGrid';
import { PlatformBillingListPager } from '../components/PlatformBillingListPager';
import { statusBadgeVariant } from '../utils/platformBillingUi';

const PAGE_SIZE = 20;

export default function PlatformBillingWebhooksPage() {
  const [page, setPage] = useState(1);
  const [eventError, setEventError] = useState<string | null>(null);
  const [eventMessage, setEventMessage] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = usePlatformBillingWebhookEvents({
    page,
    limit: PAGE_SIZE,
  });
  const replay = useReplayPlatformBillingWebhookEvent();

  const events = data?.items ?? [];

  const handleReplay = async (id: string) => {
    setEventError(null);
    setEventMessage(null);
    try {
      await replay.mutateAsync(id);
      setEventMessage(`Replay queued for event ${id}.`);
    } catch (err) {
      setEventError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <PageBackLink to="/superadmin/billing" label="Back to billing hub" />
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Webhook events</h2>
        <p className="text-sm text-[var(--color-neutral-400)]">Inspect Stripe webhook processing and replay failures</p>
      </div>

      {eventError && (
        <p className="text-sm text-[var(--color-danger-700)]" role="alert">
          {eventError}
        </p>
      )}
      {eventMessage && (
        <p className="text-sm text-emerald-700" role="status">
          {eventMessage}
        </p>
      )}

      {isError && <PlatformBillingErrorAlert error={error} onRetry={() => refetch()} />}
      {isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading events…</p>}

      <div className="space-y-3">
        {events.map((ev) => (
          <Card key={ev.id} className="p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[var(--color-neutral-800)]">{ev.type || ev.id}</p>
                <p className="text-xs font-mono text-[var(--color-neutral-500)]">{ev.id}</p>
              </div>
              <div className="flex items-center gap-2">
                {ev.status && <Badge variant={statusBadgeVariant(ev.status)}>{ev.status}</Badge>}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={replay.isPending}
                  onClick={() => void handleReplay(ev.id)}
                >
                  Replay
                </Button>
              </div>
            </div>
            <PlatformBillingFieldGrid normalized={ev as unknown as Record<string, unknown>} raw={ev.raw} />
          </Card>
        ))}
        {events.length === 0 && !isLoading && !isError && (
          <Card className="p-4 text-sm text-[var(--color-neutral-500)]">No webhook events found.</Card>
        )}
      </div>

      <PlatformBillingListPager meta={data?.meta} page={page} onPageChange={setPage} />
    </div>
  );
}
