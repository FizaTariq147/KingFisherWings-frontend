import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { toast } from '@/store/toastStore';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationUnreadCount,
  useNotifications,
  useOpenNotification,
} from '../hooks/useNotifications';
import { AppFetchBar, AppLoadingState } from '@/components/motion';
import {
  notificationHref,
  staffNotificationTypeLabel,
} from '../utils/notificationLink';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const params = useMemo(
    () => ({ page, limit: 20, unread_only: unreadOnly ? 'true' : undefined }),
    [page, unreadOnly],
  );
  const { data, isLoading, isFetching, isError, refetch } = useNotifications(params);
  const unread = useNotificationUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const openNotification = useOpenNotification();
  const items = data?.items ?? [];
  const meta = data?.meta;

  const handleOpen = async (id: string, fallbackHref: string | null) => {
    try {
      const opened = await openNotification.mutateAsync(id);
      const path = opened.linkPath || fallbackHref;
      if (path) navigate(path);
      else toast.info('No linked screen for this notification.', { title: 'Notifications' });
    } catch {
      if (fallbackHref) navigate(fallbackHref);
      else toast.info('Could not open this notification.', { title: 'Notifications' });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">Notifications</h2>
          <p className="text-sm text-[var(--color-neutral-500)]">
            In-app notifications for your staff account. Open an item to jump to the related screen.
          </p>
        </div>
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
      </div>

      <Card className="overflow-hidden p-0">
        <AppFetchBar active={Boolean(isFetching && !isLoading)} />
        {isLoading ? (
          <AppLoadingState label="Loading notifications…" />
        ) : isError ? (
          <div className="space-y-2 p-6">
            <p className="text-sm text-[var(--color-danger-600)]">Failed to load notifications.</p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-[var(--color-neutral-400)]">
            <Bell size={28} />
            <p className="text-sm">{unreadOnly ? 'No unread notifications' : 'No notifications'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((n) => {
              const href = notificationHref(n);
              return (
                <li
                  key={n.id}
                  className={`flex items-start justify-between gap-3 px-4 py-3.5 ${
                    n.isRead ? '' : 'bg-[var(--color-primary-50)]/50'
                  }`}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    disabled={openNotification.isPending}
                    onClick={() => void handleOpen(n.id, href)}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold">{n.title}</div>
                      {n.type || n.kind ? (
                        <Badge variant="neutral">
                          {staffNotificationTypeLabel(n.type || n.kind)}
                        </Badge>
                      ) : null}
                    </div>
                    {n.body ? (
                      <p className="mt-1 text-sm text-[var(--color-neutral-600)]">{n.body}</p>
                    ) : null}
                    <div className="mt-1 text-xs text-[var(--color-neutral-500)]">
                      {n.createdAt || '—'}
                      {href || n.linkPath ? ' · Open related item' : ''}
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
                </li>
              );
            })}
          </ul>
        )}
      </Card>

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
