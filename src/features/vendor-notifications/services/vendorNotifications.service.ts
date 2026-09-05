import axios from 'axios';
import { VendorApiError, vendorApiClient } from '@/lib/vendorApiClient';
import { vendorDisputesService } from '@/features/vendor-disputes/services/vendorDisputes.service';
import { vendorPortalJobsService } from '@/features/vendor-job-offers/services/vendorJobOffers.service';
import { canVendorRespondToOffer } from '@/features/vendor-job-offers/utils/vendorOfferStatus';
import { vendorPaymentRequestsService } from '@/features/vendor-payment-requests/services/vendorPaymentRequests.service';
import { VENDOR_NOTIFICATIONS_API } from '../api/vendorNotifications.api';
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

const DISMISS_KEY = 'vendor.alerts.dismissed';

function isNotFound(err: unknown): boolean {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    return status === 404 || status === 501;
  }
  if (err instanceof VendorApiError) {
    return err.status === 404 || err.status === 501;
  }
  return false;
}

function readDismissed(): Set<string> {
  try {
    const raw = sessionStorage.getItem(DISMISS_KEY);
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
    sessionStorage.setItem(DISMISS_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore quota / private mode */
  }
}

function isOpenDispute(status?: string): boolean {
  const s = (status || '').trim().toUpperCase().replace(/\s+/g, '_');
  if (!s) return true;
  return s === 'OPEN' || s === 'UNDER_REVIEW' || s === 'PENDING' || s === 'IN_REVIEW';
}

function isActionablePaymentRequest(status?: string): boolean {
  const s = (status || '').trim().toUpperCase().replace(/\s+/g, '_');
  if (!s) return true;
  return (
    s === 'PENDING' ||
    s === 'SUBMITTED' ||
    s === 'DRAFT' ||
    s === 'UNDER_REVIEW' ||
    s === 'IN_REVIEW' ||
    s === 'AWAITING_APPROVAL'
  );
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

async function buildAggregateAlerts(): Promise<VendorNotification[]> {
  const empty = { items: [] };
  const [jobs, disputes, paymentRequests] = await Promise.all([
    vendorPortalJobsService.list({ page: 1, limit: 50 }).catch(() => empty),
    vendorDisputesService.list({ page: 1, limit: 50 }).catch(() => empty),
    vendorPaymentRequestsService.list({ page: 1, limit: 50 }).catch(() => empty),
  ]);

  const alerts: VendorNotification[] = [];

  for (const job of jobs.items) {
    if (!canVendorRespondToOffer(job.offerStatus)) continue;
    const title = job.jobNumber
      ? `Job offer needs response · ${job.jobNumber}`
      : 'Job offer needs response';
    const lane =
      job.origin || job.destination
        ? [job.origin, job.destination].filter(Boolean).join(' → ')
        : undefined;
    const bodyParts = [
      job.offerStatus ? `Status: ${String(job.offerStatus).replaceAll('_', ' ')}` : null,
      lane,
      job.costTotal != null
        ? `Forwarder cost offer: ${job.costTotal}${job.currencyCode ? ` ${job.currencyCode}` : ''}`
        : null,
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
      href: `/vendor/jobs/${job.id}`,
    });
  }

  for (const dispute of disputes.items) {
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

  for (const pr of paymentRequests.items) {
    if (!isActionablePaymentRequest(pr.status)) continue;
    const title = pr.number
      ? `Payment request update · ${pr.number}`
      : 'Payment request needs attention';
    alerts.push({
      id: `payment-request:${pr.id}`,
      title,
      body: [
        pr.status ? `Status: ${pr.status.replaceAll('_', ' ')}` : null,
        pr.amount != null
          ? `${pr.amount}${pr.currencyCode ? ` ${pr.currencyCode}` : ''}`
          : null,
        pr.notes,
      ]
        .filter(Boolean)
        .join(' · ') || undefined,
      createdAt: pr.requestedAt || pr.approvedAt,
      isRead: false,
      type: 'PAYMENT_REQUEST',
      kind: 'PAYMENT_REQUEST',
      entityId: pr.id,
      href: `/vendor/payment-requests/${pr.id}`,
    });
  }

  alerts.sort((a, b) => {
    const at = a.createdAt ? Date.parse(a.createdAt) : 0;
    const bt = b.createdAt ? Date.parse(b.createdAt) : 0;
    return bt - at;
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
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items: slice.map((n) => ({
      ...n,
      href: n.href || vendorNotificationHref(n),
    })),
    meta: { page, limit, total, totalPages },
    sourcedFromAggregate,
  };
}

export const vendorNotificationsService = {
  async list(params: VendorNotificationListParams = {}): Promise<VendorNotificationListResult> {
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
      if (!isNotFound(err)) throw err;
      const aggregate = await buildAggregateAlerts();
      return paginate(aggregate, params, true);
    }
  },

  async unreadCount(): Promise<number> {
    try {
      const res = await vendorApiClient.get(VENDOR_NOTIFICATIONS_API.unreadCount);
      return normalizeUnreadCount(res.data);
    } catch (err) {
      if (!isNotFound(err)) throw err;
      const aggregate = await buildAggregateAlerts();
      return aggregate.filter((n) => !n.isRead).length;
    }
  },

  async markRead(id: string): Promise<void> {
    try {
      await vendorApiClient.post(VENDOR_NOTIFICATIONS_API.read(id));
      return;
    } catch (err) {
      if (!isNotFound(err)) throw err;
      const dismissed = readDismissed();
      dismissed.add(id);
      writeDismissed(dismissed);
    }
  },

  async markAllRead(): Promise<void> {
    try {
      await vendorApiClient.post(VENDOR_NOTIFICATIONS_API.readAll);
      return;
    } catch (err) {
      if (!isNotFound(err)) throw err;
      const aggregate = await buildAggregateAlerts();
      const dismissed = readDismissed();
      for (const n of aggregate) dismissed.add(n.id);
      writeDismissed(dismissed);
    }
  },
};
