import axios from 'axios';
import { VendorApiError, vendorApiClient } from '@/lib/vendorApiClient';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { vendorDisputesService } from '@/features/vendor-disputes/services/vendorDisputes.service';
import { vendorInvoicesService } from '@/features/vendor-invoices/services/vendorInvoices.service';
import { vendorPortalJobsService } from '@/features/vendor-job-offers/services/vendorJobOffers.service';
import {
  canVendorRespondToOffer,
  coerceVendorOfferStatus,
  isVendorOfferTerminal,
} from '@/features/vendor-job-offers/utils/vendorOfferStatus';
import { vendorPaymentRequestsService } from '@/features/vendor-payment-requests/services/vendorPaymentRequests.service';
import {
  VENDOR_NOTIFICATIONS_API,
  vendorNotificationsApiEnabled,
} from '../api/vendorNotifications.api';
import type {
  VendorNotification,
  VendorNotificationListParams,
  VendorNotificationListResult,
} from '../types/vendorNotifications.types';
import {
  normalizeUnreadCount,
  normalizeVendorNotificationList,
} from '../utils/normalizeVendorNotifications';
import { vendorNotificationHref } from '../utils/vendorNotificationLink';

const DISMISS_PREFIX = 'vendor.alerts.dismissed.v2';

function isMissingEndpoint(err: unknown): boolean {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    // Gateways often return 404/501/405 for unknown routes; some return 403.
    return status === 404 || status === 501 || status === 405;
  }
  if (err instanceof VendorApiError) {
    return err.status === 404 || err.status === 501 || err.status === 405;
  }
  return false;
}

function dismissStorageKey(): string {
  const userId = useVendorAuthStore.getState().user?.id || 'anon';
  return `${DISMISS_PREFIX}.${userId}`;
}

function readDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(dismissStorageKey());
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map(String).filter(Boolean));
  } catch {
    return new Set();
  }
}

function writeDismissed(ids: Set<string>) {
  try {
    localStorage.setItem(dismissStorageKey(), JSON.stringify([...ids]));
  } catch {
    /* ignore quota / private mode */
  }
}

function isOpenDispute(status?: string): boolean {
  const s = (status || '').trim().toUpperCase().replace(/\s+/g, '_');
  if (!s) return true;
  return (
    s === 'OPEN' ||
    s === 'UNDER_REVIEW' ||
    s === 'PENDING' ||
    s === 'IN_REVIEW' ||
    s === 'AWAITING_RESPONSE' ||
    s === 'ESCALATED'
  );
}

function isActionablePaymentRequest(status?: string): boolean {
  const s = (status || '').trim().toUpperCase().replace(/\s+/g, '_');
  if (!s) return true;
  if (
    s === 'PAID' ||
    s === 'CANCELLED' ||
    s === 'CANCELED' ||
    s === 'REJECTED' ||
    s === 'CLOSED' ||
    s === 'COMPLETED'
  ) {
    return false;
  }
  return true;
}

function applyDismissals(items: VendorNotification[]): VendorNotification[] {
  const dismissed = readDismissed();
  return items.map((n) => {
    if (dismissed.has(n.id)) {
      return { ...n, isRead: true, readAt: n.readAt || new Date().toISOString() };
    }
    return n;
  });
}

/**
 * Build vendor alerts from live Swagger vendor APIs (no /vendor/notifications).
 */
async function buildAggregateAlerts(): Promise<VendorNotification[]> {
  const settled = await Promise.allSettled([
    vendorPortalJobsService.list({ page: 1, limit: 100 }),
    vendorDisputesService.list({ page: 1, limit: 100 }),
    vendorPaymentRequestsService.list({ page: 1, limit: 100 }),
    vendorInvoicesService.openItems(),
  ]);

  const jobs =
    settled[0].status === 'fulfilled' ? settled[0].value.items : [];
  const disputes =
    settled[1].status === 'fulfilled' ? settled[1].value.items : [];
  const paymentRequests =
    settled[2].status === 'fulfilled' ? settled[2].value.items : [];
  const openInvoices =
    settled[3].status === 'fulfilled' ? settled[3].value.items : [];

  const alerts: VendorNotification[] = [];

  for (const job of jobs) {
    const status = coerceVendorOfferStatus(job.offerStatus);
    if (isVendorOfferTerminal(status)) continue;

    const needsResponse = canVendorRespondToOffer(status);
    const title = job.jobNumber
      ? needsResponse
        ? `Job offer needs response · ${job.jobNumber}`
        : `Job offer update · ${job.jobNumber}`
      : needsResponse
        ? 'Job offer needs response'
        : 'Job offer update';

    // Only surface offers that still need vendor action, or are mid-negotiation.
    if (!needsResponse && status !== 'NEGOTIATING') continue;

    const lane =
      job.origin || job.destination
        ? [job.origin, job.destination].filter(Boolean).join(' → ')
        : undefined;
    const bodyParts = [
      status ? `Status: ${String(status).replaceAll('_', ' ')}` : null,
      lane,
      job.costTotal != null
        ? `Cost: ${job.costTotal}${job.currencyCode ? ` ${job.currencyCode}` : ''}`
        : null,
      needsResponse
        ? 'Accept, reject, or counter in Jobs.'
        : 'Waiting for forwarder — check negotiation.',
    ].filter(Boolean);

    alerts.push({
      id: `job:${job.id}`,
      title,
      body: bodyParts.join(' · ') || undefined,
      createdAt: job.updatedAt || job.createdAt,
      isRead: false,
      type: 'JOB_OFFER',
      kind: 'JOB_OFFER',
      jobId: job.id,
      entityId: job.id,
      href: `/vendor/jobs/${job.id}`,
    });
  }

  for (const dispute of disputes) {
    if (!isOpenDispute(dispute.status)) continue;
    const title = dispute.invoiceNumber
      ? `Open dispute · ${dispute.invoiceNumber}`
      : 'Open dispute';
    alerts.push({
      id: `dispute:${dispute.id}`,
      title,
      body: dispute.reason || dispute.description || undefined,
      createdAt: dispute.createdAt,
      isRead: false,
      type: 'DISPUTE',
      kind: 'DISPUTE',
      invoiceId: dispute.invoiceId,
      entityId: dispute.id,
      href: '/vendor/disputes',
    });
  }

  for (const pr of paymentRequests) {
    if (!isActionablePaymentRequest(pr.status)) continue;
    const title = pr.number
      ? `Payment request · ${pr.number}`
      : 'Payment request needs attention';
    alerts.push({
      id: `payment-request:${pr.id}`,
      title,
      body:
        [
          pr.status ? `Status: ${pr.status.replaceAll('_', ' ')}` : null,
          pr.amount != null
            ? `${pr.amount}${pr.currencyCode ? ` ${pr.currencyCode}` : ''}`
            : null,
          pr.notes,
        ]
          .filter(Boolean)
          .join(' · ') || undefined,
      createdAt: pr.requestedAt || pr.approvedAt || pr.paidAt,
      isRead: false,
      type: 'PAYMENT_REQUEST',
      kind: 'PAYMENT_REQUEST',
      entityId: pr.id,
      href: `/vendor/payment-requests/${pr.id}`,
    });
  }

  for (const inv of openInvoices) {
    const balance = inv.outstandingBalance ?? inv.totalAmount;
    if (balance != null && balance <= 0) continue;
    const title = inv.number
      ? `Open invoice · ${inv.number}`
      : 'Open purchase invoice';
    alerts.push({
      id: `invoice:${inv.id}`,
      title,
      body:
        [
          balance != null
            ? `Outstanding: ${balance}${inv.currencyCode ? ` ${inv.currencyCode}` : ''}`
            : null,
          inv.dueDate ? `Due ${inv.dueDate}` : null,
          inv.status ? `Status: ${inv.status.replaceAll('_', ' ')}` : null,
        ]
          .filter(Boolean)
          .join(' · ') || undefined,
      createdAt: inv.dueDate || inv.invoiceDate,
      isRead: false,
      type: 'OPEN_INVOICE',
      kind: 'OPEN_INVOICE',
      invoiceId: inv.id,
      entityId: inv.id,
      href: `/vendor/invoices/${inv.id}`,
    });
  }

  alerts.sort((a, b) => {
    const at = a.createdAt ? Date.parse(a.createdAt) : 0;
    const bt = b.createdAt ? Date.parse(b.createdAt) : 0;
    if (Number.isFinite(at) && Number.isFinite(bt) && at !== bt) return bt - at;
    return a.title.localeCompare(b.title);
  });

  return applyDismissals(alerts);
}

function paginate(
  items: VendorNotification[],
  params: VendorNotificationListParams,
  sourcedFromAggregate: boolean,
): VendorNotificationListResult {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? 20);
  const unreadOnly =
    params.unread_only === true ||
    params.unread_only === 'true' ||
    params.unread_only === '1';
  const filtered = unreadOnly ? items.filter((n) => !n.isRead) : items;
  const start = (page - 1) * limit;
  const slice = filtered.slice(start, start + limit);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)) || 1);
  return {
    items: slice.map((n) => ({
      ...n,
      href: n.href || vendorNotificationHref(n),
    })),
    meta: { page, limit, total, totalPages },
    sourcedFromAggregate,
  };
}

async function tryDedicatedNotificationsApi(
  params: VendorNotificationListParams,
): Promise<VendorNotificationListResult | null> {
  if (!vendorNotificationsApiEnabled()) return null;
  try {
    const res = await vendorApiClient.get(VENDOR_NOTIFICATIONS_API.list, { params });
    const normalized = normalizeVendorNotificationList(res.data, params);
    return {
      ...normalized,
      items: normalized.items.map((n) => ({
        ...n,
        href: vendorNotificationHref(n),
      })),
      sourcedFromAggregate: false,
    };
  } catch (err) {
    if (isMissingEndpoint(err)) return null;
    throw err;
  }
}

export const vendorNotificationsService = {
  async list(params: VendorNotificationListParams = {}): Promise<VendorNotificationListResult> {
    const dedicated = await tryDedicatedNotificationsApi(params);
    if (dedicated) return dedicated;
    const aggregate = await buildAggregateAlerts();
    return paginate(aggregate, params, true);
  },

  async unreadCount(): Promise<number> {
    if (vendorNotificationsApiEnabled()) {
      try {
        const res = await vendorApiClient.get(VENDOR_NOTIFICATIONS_API.unreadCount);
        return normalizeUnreadCount(res.data);
      } catch (err) {
        if (!isMissingEndpoint(err)) throw err;
      }
    }
    const aggregate = await buildAggregateAlerts();
    return aggregate.filter((n) => !n.isRead).length;
  },

  async markRead(id: string): Promise<void> {
    if (vendorNotificationsApiEnabled()) {
      try {
        await vendorApiClient.post(VENDOR_NOTIFICATIONS_API.read(id));
        return;
      } catch (err) {
        if (!isMissingEndpoint(err)) throw err;
      }
    }
    const dismissed = readDismissed();
    dismissed.add(id);
    writeDismissed(dismissed);
  },

  async markAllRead(): Promise<void> {
    if (vendorNotificationsApiEnabled()) {
      try {
        await vendorApiClient.post(VENDOR_NOTIFICATIONS_API.readAll);
        return;
      } catch (err) {
        if (!isMissingEndpoint(err)) throw err;
      }
    }
    const aggregate = await buildAggregateAlerts();
    const dismissed = readDismissed();
    for (const n of aggregate) dismissed.add(n.id);
    writeDismissed(dismissed);
  },
};
