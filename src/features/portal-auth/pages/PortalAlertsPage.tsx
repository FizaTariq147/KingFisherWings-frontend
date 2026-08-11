import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  notificationTypeLabel,
  portalNotificationHref,
} from '@/features/portal-notifications/utils/portalNotificationLink';

export default function PortalAlertsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const params = useMemo(
    () => ({ page, limit: 20, unread_only: unreadOnly ? 'true' : undefined }),
    [page, unreadOnly],
  );
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
        description="Document-ready and milestone notifications for your company account."
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
            title={unreadOnly ? 'No unread alerts' : 'No alerts yet'}
            description="Document-ready alerts appear here by default. Milestone updates require opt-in on Account."
            Icon={Bell}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((n) => {
              const href = portalNotificationHref(n);
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
                      {n.type ? <Badge variant="neutral">{notificationTypeLabel(n.type)}</Badge> : null}
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
                      Mark read
                    </Button>
                  ) : (
                    <Badge variant="neutral">Read</Badge>
                  )}
                </PortalAnimatedListItem>
              );
            })}
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
