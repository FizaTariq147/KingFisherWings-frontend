import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { VendorApiError } from '@/lib/vendorApiClient';
import {
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalEmptyState,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
} from '@/features/portal-auth/components/portal-ui';
import {
  useMarkAllVendorNotificationsRead,
  useMarkVendorNotificationRead,
  useVendorNotificationUnreadCount,
  useVendorNotifications,
} from '../hooks/useVendorNotifications';
import {
  vendorNotificationHref,
  vendorNotificationTypeLabel,
} from '../utils/vendorNotificationLink';

export default function VendorAlertsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const params = useMemo(
    () => ({ page, limit: 20, unread_only: unreadOnly ? 'true' : undefined }),
    [page, unreadOnly],
  );
  const { data, isLoading, isError, error, refetch } = useVendorNotifications(params);
  const unread = useVendorNotificationUnreadCount();
  const markRead = useMarkVendorNotificationRead();
  const markAll = useMarkAllVendorNotificationsRead();
  const items = data?.items ?? [];
  const meta = data?.meta;
  const fromAggregate = Boolean(data?.sourcedFromAggregate);

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Alerts"
        description={
          fromAggregate
            ? 'Action items from job offers, disputes, and payment requests.'
            : 'Notifications for your vendor account.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">{unread.data ?? 0} unread</Badge>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setPage(1);
                setUnreadOnly((v) => !v);
              }}
            >
              {unreadOnly ? 'Show all' : 'Unread only'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={markAll.isPending || !(unread.data && unread.data > 0)}
              onClick={() => void markAll.mutateAsync()}
            >
              {fromAggregate ? 'Dismiss all' : 'Mark all read'}
            </Button>
          </div>
        }
      />

      <PortalPanel>
        {isLoading ? (
          <PortalLoadingState />
        ) : isError ? (
          <div className="space-y-2 p-6">
            <p className="text-sm text-[var(--color-danger-600)]">
              {error instanceof VendorApiError || error instanceof Error
                ? error.message
                : 'Failed to load alerts.'}
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <PortalEmptyState
            title={unreadOnly ? 'No unread alerts' : 'No alerts yet'}
            description="New job offers, open disputes, and payment-request updates appear here."
            Icon={Bell}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((n) => {
              const href = n.href || vendorNotificationHref(n);
              return (
                <PortalAnimatedListItem
                  key={n.id}
                  className={`flex items-start justify-between gap-3 px-4 py-3.5 ${
                    n.isRead ? '' : 'bg-[var(--color-primary-50)]/40'
                  }`}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => {
                      if (!n.isRead) void markRead.mutateAsync(n.id);
                      if (href) navigate(href);
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold">{n.title}</div>
                      {n.type || n.kind ? (
                        <Badge variant="neutral">
                          {vendorNotificationTypeLabel(n.type || n.kind)}
                        </Badge>
                      ) : null}
                    </div>
                    {n.body ? (
                      <p className="mt-1 text-sm text-[var(--color-neutral-600)]">{n.body}</p>
                    ) : null}
                    <div className="mt-1 text-xs text-[var(--color-neutral-500)]">
                      {n.createdAt || '—'}
                      {href ? ' · Open related item' : ''}
                    </div>
                  </button>
                  {!n.isRead ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={markRead.isPending}
                      onClick={() => void markRead.mutateAsync(n.id)}
                    >
                      {fromAggregate ? 'Dismiss' : 'Mark read'}
                    </Button>
                  ) : (
                    <Badge variant="neutral">{fromAggregate ? 'Dismissed' : 'Read'}</Badge>
                  )}
                </PortalAnimatedListItem>
              );
            })}
          </PortalAnimatedList>
        )}
      </PortalPanel>

      {meta && meta.totalPages > 1 ? (
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
      ) : null}
    </div>
  );
}
