import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface Notification {
  id: string;
  type: 'invoice' | 'shipment' | 'quotation' | 'hr' | 'wms' | 'system';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  actionPath?: string;
  meta?: string;
}

const mockNotifications: Notification[] = [
  { id: '1',  type: 'invoice',   priority: 'high',   title: 'Invoice Overdue',                description: 'INV/2026/00225 for DP World is overdue by 5 days. Amount: AED 6,200.',               time: '10 min ago',  read: false, actionLabel: 'View Invoice',   actionPath: '/invoices/3',          meta: 'AED 6,200' },
  { id: '2',  type: 'shipment',  priority: 'high',   title: 'Job ETD Tomorrow',               description: 'KFW/AE/06/26/00141 is due to depart tomorrow. Export docs still pending.',           time: '25 min ago',  read: false, actionLabel: 'View Job',       actionPath: '/jobs/air-export/1',   meta: 'KFW/AE/06/26/00141' },
  { id: '3',  type: 'quotation', priority: 'medium', title: 'Quotation Expiring Soon',        description: 'QT/2026/001 for Al Futtaim LLC expires in 2 days. Consider following up.',           time: '1 hr ago',    read: false, actionLabel: 'View Quote',     actionPath: '/quotations/1',        meta: 'QT/2026/001' },
  { id: '4',  type: 'invoice',   priority: 'high',   title: 'Invoice Overdue',                description: 'INV/2026/00198 for Noon.com is overdue by 12 days. Amount: AED 4,300.',             time: '2 hrs ago',   read: false, actionLabel: 'View Invoice',   actionPath: '/invoices/5',          meta: 'AED 4,300' },
  { id: '5',  type: 'hr',        priority: 'medium', title: 'Visa Expiry Alert',              description: 'Ahmed Ali (EMP-002) labour card expires on 2026-08-01. Renewal required.',           time: '3 hrs ago',   read: false, actionLabel: 'View Employee',  actionPath: '/hr/employees/2',      meta: 'EMP-002' },
  { id: '6',  type: 'shipment',  priority: 'medium', title: 'New Job Created',                description: 'KFW/SE/06/26/00089 Sea Export to Hamburg has been created by Omar Sheikh.',          time: '4 hrs ago',   read: true,  actionLabel: 'View Job',       actionPath: '/jobs/sea-fcl/1',      meta: 'KFW/SE/06/26/00089' },
  { id: '7',  type: 'wms',       priority: 'medium', title: 'Low Stock Alert',                description: '8 SKUs are below minimum threshold at DXB Main Warehouse.',                          time: '5 hrs ago',   read: true,  actionLabel: 'View WMS',       actionPath: '/warehouse/stock',     meta: '8 items' },
  { id: '8',  type: 'quotation', priority: 'low',    title: 'Quotation Approved',             description: 'QT/2026/003 for DP World has been approved. Ready to convert to job.',              time: '6 hrs ago',   read: true,  actionLabel: 'Convert to Job', actionPath: '/quotations/3',        meta: 'QT/2026/003' },
  { id: '9',  type: 'system',    priority: 'low',    title: 'Monthly Report Ready',           description: 'June 2026 MIS Executive Dashboard report has been generated.',                       time: '8 hrs ago',   read: true,  actionLabel: 'View Report',    actionPath: '/reports',             meta: 'June 2026' },
  { id: '10', type: 'hr',        priority: 'low',    title: 'Leave Request — Pending',        description: 'Omar Sheikh has applied for Annual Leave (Jul 10–20). Awaiting approval.',          time: '1 day ago',   read: true,  actionLabel: 'Review Request', actionPath: '/hr/leave',            meta: '11 days' },
  { id: '11', type: 'invoice',   priority: 'low',    title: 'Payment Received',               description: 'INV/2026/00210 — AED 18,900 received from Emirates Airlines. Marked as paid.',     time: '1 day ago',   read: true,  actionLabel: 'View Invoice',   actionPath: '/invoices/4',          meta: 'AED 18,900' },
  { id: '12', type: 'shipment',  priority: 'low',    title: 'Shipment Delivered',             description: 'KFW/SI/06/26/00034 has been delivered to consignee. POD received.',                 time: '2 days ago',  read: true,  actionLabel: 'View Job',       actionPath: '/jobs/1',              meta: 'KFW/SI/06/26/00034' },
  { id: '13', type: 'system',    priority: 'low',    title: 'New Customer Onboarded',         description: 'Majid Al Futtaim Group has been added as a new customer.',                          time: '2 days ago',  read: true,  actionLabel: 'View Customer',  actionPath: '/customers/7',         meta: 'MAF007' },
  { id: '14', type: 'wms',       priority: 'low',    title: 'GRN Completed',                  description: 'GRN/2026/00089 — 480 units received at DXB Main Warehouse for DP World.',          time: '3 days ago',  read: true,  actionLabel: 'View GRN',       actionPath: '/warehouse/grns',      meta: '480 units' },
  { id: '15', type: 'quotation', priority: 'low',    title: '3 Quotations Expiring This Week', description: 'QT/2026/002, QT/2026/004, and QT/2026/005 will expire within 7 days.',            time: '3 days ago',  read: true,  actionLabel: 'View Quotes',    actionPath: '/quotations',          meta: '3 quotes' },
];

const typeConfig: Record<Notification['type'], { icon: string; color: string; label: string }> = {
  invoice:   { icon: '💰', color: 'bg-green-50 border-green-200',   label: 'Invoice' },
  shipment:  { icon: '📦', color: 'bg-blue-50 border-blue-200',     label: 'Shipment' },
  quotation: { icon: '💬', color: 'bg-purple-50 border-purple-200', label: 'Quotation' },
  hr:        { icon: '👤', color: 'bg-orange-50 border-orange-200', label: 'HR' },
  wms:       { icon: '🏭', color: 'bg-cyan-50 border-cyan-200',     label: 'WMS' },
  system:    { icon: '⚙️', color: 'bg-gray-50 border-gray-200',     label: 'System' },
};

const priorityVariant: Record<Notification['priority'], 'danger' | 'warning' | 'neutral'> = {
  high:   'danger',
  medium: 'warning',
  low:    'neutral',
};

const FILTERS = ['All', 'Unread', 'Invoice', 'Shipment', 'Quotation', 'HR', 'WMS', 'System'] as const;

export default function NotificationsCenter() {
  const [filter, setFilter]           = useState<string>('All');
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => mockNotifications,
    initialData: mockNotifications,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === 'All')    return true;
    if (filter === 'Unread') return !n.read;
    return n.type === filter.toLowerCase();
  });

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, read: true } : n)
    );
  }

  function dismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const highPriority = notifications.filter((n) => n.priority === 'high' && !n.read);

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">Notifications</h1>
          {unreadCount > 0 && (
            <span className="w-6 h-6 rounded-full bg-[var(--color-danger-500)] text-white text-xs flex items-center justify-center font-semibold">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            ✓ Mark all read
          </Button>
          <Button variant="ghost" size="sm">
            ⚙ Preferences
          </Button>
        </div>
      </div>

      {/* High Priority Alerts */}
      {highPriority.length > 0 && (
        <Card className="border-[var(--color-danger-500)]/30 bg-[var(--color-danger-100)]">
          <CardHeader>
            <CardTitle className="text-[var(--color-danger-700)]">
              🚨 {highPriority.length} Critical Alert{highPriority.length > 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {highPriority.map((n) => (
              <div key={n.id} className="flex items-start justify-between p-3 rounded-lg bg-white border border-[var(--color-danger-500)]/20">
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0">{typeConfig[n.type].icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-neutral-800)]">{n.title}</p>
                    <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">{n.description}</p>
                  </div>
                </div>
                {n.actionLabel && (
                  <Button size="sm" variant="secondary" onClick={() => markRead(n.id)}>
                    {n.actionLabel}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: 'All',       count: notifications.length,                                             active: filter === 'All' },
          { label: 'Unread',    count: unreadCount,                                                      active: filter === 'Unread' },
          { label: 'Invoice',   count: notifications.filter((n) => n.type === 'invoice').length,         active: filter === 'Invoice' },
          { label: 'Shipment',  count: notifications.filter((n) => n.type === 'shipment').length,        active: filter === 'Shipment' },
          { label: 'HR',        count: notifications.filter((n) => n.type === 'hr').length,              active: filter === 'HR' },
          { label: 'System',    count: notifications.filter((n) => n.type === 'system').length,          active: filter === 'System' },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => setFilter(stat.label)}
            className={`p-3 rounded-lg border text-left transition-all ${
              stat.active
                ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                : 'border-[var(--color-neutral-200)] bg-white hover:bg-[var(--color-neutral-50)]'
            }`}
          >
            <p className={`text-lg font-bold ${stat.active ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-neutral-800)]'}`}>
              {stat.count}
            </p>
            <p className="text-xs text-[var(--color-neutral-400)]">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-[var(--color-primary-500)] text-white'
                : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-200)]'
            }`}
          >
            {f}
            {f === 'Unread' && unreadCount > 0 && (
              <span className="ml-1 px-1 rounded bg-[var(--color-danger-500)] text-white text-xs">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-[var(--color-neutral-400)]">
              <p className="text-4xl mb-3">🔔</p>
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs mt-1">You're all caught up!</p>
            </div>
          </Card>
        ) : (
          filtered.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                !notification.read
                  ? 'bg-white border-[var(--color-primary-200)] shadow-sm'
                  : 'bg-[var(--color-neutral-50)] border-[var(--color-neutral-200)]'
              }`}
            >
              {/* Unread dot */}
              <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                <div className={`w-2 h-2 rounded-full ${
                  !notification.read
                    ? 'bg-[var(--color-primary-500)]'
                    : 'bg-transparent'
                }`} />
              </div>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center text-xl shrink-0 ${typeConfig[notification.type].color}`}>
                {typeConfig[notification.type].icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold ${
                      !notification.read
                        ? 'text-[var(--color-neutral-800)]'
                        : 'text-[var(--color-neutral-600)]'
                    }`}>
                      {notification.title}
                    </p>
                    <Badge variant={priorityVariant[notification.priority]}>
                      {notification.priority}
                    </Badge>
                    {notification.meta && (
                      <span className="text-xs font-mono text-[var(--color-neutral-400)] bg-[var(--color-neutral-100)] px-1.5 py-0.5 rounded">
                        {notification.meta}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--color-neutral-400)] shrink-0">{notification.time}</span>
                </div>
                <p className="text-xs text-[var(--color-neutral-500)] leading-relaxed mb-2">
                  {notification.description}
                </p>
                <div className="flex items-center gap-2">
                  {notification.actionLabel && (
                    <button
                      onClick={() => markRead(notification.id)}
                      className="text-xs font-medium text-[var(--color-primary-500)] hover:text-[var(--color-primary-700)] hover:underline"
                    >
                      {notification.actionLabel} →
                    </button>
                  )}
                  {!notification.read && (
                    <button
                      onClick={() => markRead(notification.id)}
                      className="text-xs text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => dismiss(notification.id)}
                    className="text-xs text-[var(--color-neutral-300)] hover:text-[var(--color-danger-500)]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {filtered.length > 0 && (
        <div className="text-center">
          <Button variant="ghost" size="sm">
            Load older notifications
          </Button>
        </div>
      )}
    </div>
  );
}