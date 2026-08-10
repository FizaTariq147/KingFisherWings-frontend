import { useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalEmptyState,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
} from '../components/portal-ui';
import {
  useMarkAllPortalNotificationsRead,
  useMarkPortalNotificationRead,
  usePortalNotificationUnreadCount,
  usePortalNotifications,
} from '@/features/portal-notifications/hooks/usePortalNotifications';

export default function PortalAlertsPage() {
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ page, limit: 20 }), [page]);
  const { data, isLoading, isError, error, refetch } = usePortalNotifications(params);
  const unread = usePortalNotificationUnreadCount();
  const markRead = useMarkPortalNotificationRead();
  const markAll = useMarkAllPortalNotificationsRead();
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Alerts"
        description="Notifications for your customer portal account."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="info">{unread.data ?? 0} unread</Badge>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={markAll.isPending || !(unread.data && unread.data > 0)}
              onClick={() => void markAll.mutateAsync()}
            >
              Mark all read
            </Button>
          </div>
        }
      />

      <PortalPanel>
        {isLoading ? (
          <PortalLoadingState />
        ) : isError ? (
          <div className="p-6 space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]">
              {error instanceof PortalApiError || error instanceof Error
                ? error.message
                : 'Failed to load notifications.'}
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <PortalEmptyState
            title="No alerts yet"
            description="Shipment, invoice, and document notifications will appear here."
            Icon={Bell}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((n) => (
              <PortalAnimatedListItem
                key={n.id}
                className={`flex items-start justify-between gap-3 px-4 py-3.5 ${
                  n.isRead ? '' : 'bg-[var(--color-primary-50)]/40'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{n.title}</div>
                  {n.body ? (
                    <p className="mt-1 text-sm text-[var(--color-neutral-600)]">{n.body}</p>
                  ) : null}
                  <div className="mt-1 text-xs text-[var(--color-neutral-500)]">
                    {n.createdAt || '—'}
                  </div>
                </div>
                {!n.isRead ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={markRead.isPending}
                    onClick={() => void markRead.mutateAsync(n.id)}
                  >
                    Mark read
                  </Button>
                ) : (
                  <Badge variant="neutral">Read</Badge>
                )}
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>
      {meta && meta.totalPages > 1 && (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
