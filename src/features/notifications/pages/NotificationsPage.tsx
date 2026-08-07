import { useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationUnreadCount,
  useNotifications,
} from '../hooks/useNotifications';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ page, limit: 20 }), [page]);
  const { data, isLoading, isError, refetch } = useNotifications(params);
  const unread = useNotificationUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">Notifications</h2>
          <p className="text-sm text-[var(--color-neutral-500)]">
            In-app notifications for your staff account.
          </p>
        </div>
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
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-[var(--color-neutral-400)]">Loading…</p>
        ) : isError ? (
          <div className="p-6 space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]">Failed to load notifications.</p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-[var(--color-neutral-400)]">
            <Bell size={28} />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((n) => (
              <li
                key={n.id}
                className={`flex items-start justify-between gap-3 px-4 py-3.5 ${
                  n.isRead ? '' : 'bg-[var(--color-primary-50)]/50'
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
              </li>
            ))}
          </ul>
        )}
      </Card>

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
