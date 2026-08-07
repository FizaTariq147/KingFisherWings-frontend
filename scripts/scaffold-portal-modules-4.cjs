/**
 * Admin inbox + staff notifications. Run: node scripts/scaffold-portal-modules-4.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'src', 'features');

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n');
  console.log('+', rel);
}

const N = `import {
  asRecord,
  normalizeMeta,
  pickBoolean,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';`;

// ADMIN INBOX
write('portal-admin-inbox/api/portalAdminInbox.api.ts', `
export const PORTAL_ADMIN_INBOX_API = {
  messages: '/portal-admin/messages',
  markMessageRead: (id: string) => \`/portal-admin/messages/\${id}/read\`,
  disputes: '/portal-admin/disputes',
  reviewDispute: (id: string) => \`/portal-admin/disputes/\${id}\`,
  creditRequests: '/portal-admin/credit-limit-requests',
  reviewCreditRequest: (id: string) => \`/portal-admin/credit-limit-requests/\${id}\`,
} as const;
`);

write('portal-admin-inbox/types/portalAdminInbox.types.ts', `
import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';

export interface AdminPortalMessageListParams {
  page?: number; limit?: number; party_id?: string; unread_only?: string | boolean;
}
export interface AdminPortalMessage {
  id: string; subject: string; body?: string; partyId?: string; partyName?: string;
  createdAt?: string; isRead?: boolean; senderEmail?: string;
}
export interface AdminPortalMessageListResult { items: AdminPortalMessage[]; meta: PortalPaginationMeta; }

export interface AdminPortalDispute {
  id: string; invoiceId?: string; invoiceNumber?: string; partyId?: string; partyName?: string;
  reason?: string; description?: string; status?: string; createdAt?: string; staffNotes?: string;
}
export interface ReviewDisputeDto { status: 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED'; staff_notes?: string; }

export interface AdminCreditLimitRequest {
  id: string; partyId?: string; partyName?: string; requestedLimit?: number; justification?: string;
  status?: string; createdAt?: string; reviewNotes?: string; approvedLimit?: number;
}
export interface ReviewCreditLimitDto {
  status: 'APPROVED' | 'REJECTED'; review_notes?: string; approved_limit?: number;
}
`);

write('portal-admin-inbox/utils/normalizePortalAdminInbox.ts', `
${N}
import type {
  AdminCreditLimitRequest, AdminPortalDispute, AdminPortalMessage, AdminPortalMessageListResult,
} from '../types/portalAdminInbox.types';

export function normalizeAdminMessage(raw: unknown): AdminPortalMessage | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  const readAt = pickString(r.read_at, r.readAt, r.staff_read_at);
  return {
    id,
    subject: pickString(r.subject, r.title) || 'Message',
    body: pickString(r.body, r.message) || undefined,
    partyId: pickString(r.party_id, r.partyId) || undefined,
    partyName: pickString(r.party_name, r.partyName, asRecord(r.party)?.name) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    isRead: pickBoolean(r.is_read, r.isRead, r.read_by_staff) ?? Boolean(readAt),
    senderEmail: pickString(r.sender_email, r.email, r.from_email) || undefined,
  };
}

export function normalizeAdminMessageList(raw: unknown, params: { page?: number; limit?: number }): AdminPortalMessageListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'messages', 'data']);
  const normalized = items.map(normalizeAdminMessage).filter((x): x is AdminPortalMessage => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeAdminDispute(raw: unknown): AdminPortalDispute | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  return {
    id,
    invoiceId: pickString(r.invoice_id, r.invoiceId) || undefined,
    invoiceNumber: pickString(r.invoice_number, r.invoiceNumber) || undefined,
    partyId: pickString(r.party_id, r.partyId) || undefined,
    partyName: pickString(r.party_name, r.partyName, asRecord(r.party)?.name) || undefined,
    reason: pickString(r.reason) || undefined,
    description: pickString(r.description) || undefined,
    status: pickString(r.status) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    staffNotes: pickString(r.staff_notes, r.staffNotes) || undefined,
  };
}

export function normalizeAdminDisputes(raw: unknown): AdminPortalDispute[] {
  const { items } = unwrapList(raw, ['items', 'results', 'disputes', 'data']);
  const unwrapped = unwrapData(raw);
  const list = items.length ? items : Array.isArray(unwrapped) ? unwrapped : [];
  return list.map(normalizeAdminDispute).filter((x): x is AdminPortalDispute => Boolean(x));
}

export function normalizeAdminCreditRequest(raw: unknown): AdminCreditLimitRequest | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  return {
    id,
    partyId: pickString(r.party_id, r.partyId) || undefined,
    partyName: pickString(r.party_name, r.partyName, asRecord(r.party)?.name) || undefined,
    requestedLimit: pickNumber(r.requested_limit, r.requestedLimit),
    justification: pickString(r.justification) || undefined,
    status: pickString(r.status) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    reviewNotes: pickString(r.review_notes, r.reviewNotes) || undefined,
    approvedLimit: pickNumber(r.approved_limit, r.approvedLimit),
  };
}

export function normalizeAdminCreditRequests(raw: unknown): AdminCreditLimitRequest[] {
  const { items } = unwrapList(raw, ['items', 'results', 'requests', 'data']);
  const unwrapped = unwrapData(raw);
  const list = items.length ? items : Array.isArray(unwrapped) ? unwrapped : [];
  return list.map(normalizeAdminCreditRequest).filter((x): x is AdminCreditLimitRequest => Boolean(x));
}
`);

write('portal-admin-inbox/services/portalAdminInbox.service.ts', `
import { axiosInstance } from '@/lib/axios';
import { PORTAL_ADMIN_INBOX_API } from '../api/portalAdminInbox.api';
import type {
  AdminCreditLimitRequest, AdminPortalDispute, AdminPortalMessageListParams,
  AdminPortalMessageListResult, ReviewCreditLimitDto, ReviewDisputeDto,
} from '../types/portalAdminInbox.types';
import {
  normalizeAdminCreditRequests, normalizeAdminDisputes, normalizeAdminMessageList,
} from '../utils/normalizePortalAdminInbox';

export const portalAdminInboxService = {
  async listMessages(params: AdminPortalMessageListParams = {}): Promise<AdminPortalMessageListResult> {
    const res = await axiosInstance.get(PORTAL_ADMIN_INBOX_API.messages, { params });
    return normalizeAdminMessageList(res.data, params);
  },
  async markMessageRead(id: string): Promise<void> {
    await axiosInstance.post(PORTAL_ADMIN_INBOX_API.markMessageRead(id));
  },
  async listDisputes(): Promise<AdminPortalDispute[]> {
    const res = await axiosInstance.get(PORTAL_ADMIN_INBOX_API.disputes);
    return normalizeAdminDisputes(res.data);
  },
  async reviewDispute(id: string, dto: ReviewDisputeDto): Promise<void> {
    await axiosInstance.patch(PORTAL_ADMIN_INBOX_API.reviewDispute(id), dto);
  },
  async listCreditRequests(): Promise<AdminCreditLimitRequest[]> {
    const res = await axiosInstance.get(PORTAL_ADMIN_INBOX_API.creditRequests);
    return normalizeAdminCreditRequests(res.data);
  },
  async reviewCreditRequest(id: string, dto: ReviewCreditLimitDto): Promise<void> {
    await axiosInstance.patch(PORTAL_ADMIN_INBOX_API.reviewCreditRequest(id), dto);
  },
};
`);

write('portal-admin-inbox/hooks/usePortalAdminInbox.ts', `
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { portalAdminInboxService } from '../services/portalAdminInbox.service';
import type {
  AdminPortalMessageListParams, ReviewCreditLimitDto, ReviewDisputeDto,
} from '../types/portalAdminInbox.types';

export const portalAdminInboxKeys = {
  all: ['portal-admin-inbox'] as const,
  messages: (params: AdminPortalMessageListParams) => [...portalAdminInboxKeys.all, 'messages', params] as const,
  disputes: () => [...portalAdminInboxKeys.all, 'disputes'] as const,
  creditRequests: () => [...portalAdminInboxKeys.all, 'credit-requests'] as const,
};

export function useAdminPortalMessages(params: AdminPortalMessageListParams) {
  return useQuery({
    queryKey: portalAdminInboxKeys.messages(params),
    queryFn: () => portalAdminInboxService.listMessages(params),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useMarkAdminPortalMessageRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => portalAdminInboxService.markMessageRead(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: portalAdminInboxKeys.all }); },
  });
}

export function useAdminPortalDisputes() {
  return useQuery({
    queryKey: portalAdminInboxKeys.disputes(),
    queryFn: () => portalAdminInboxService.listDisputes(),
    staleTime: 0,
  });
}

export function useReviewAdminPortalDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ReviewDisputeDto }) =>
      portalAdminInboxService.reviewDispute(id, dto),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: portalAdminInboxKeys.disputes() }); },
  });
}

export function useAdminCreditLimitRequests() {
  return useQuery({
    queryKey: portalAdminInboxKeys.creditRequests(),
    queryFn: () => portalAdminInboxService.listCreditRequests(),
    staleTime: 0,
  });
}

export function useReviewAdminCreditLimitRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ReviewCreditLimitDto }) =>
      portalAdminInboxService.reviewCreditRequest(id, dto),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: portalAdminInboxKeys.creditRequests() }); },
  });
}
`);

// STAFF NOTIFICATIONS
write('notifications/api/notifications.api.ts', `
export const NOTIFICATIONS_API = {
  list: '/notifications',
  unreadCount: '/notifications/unread-count',
  read: (id: string) => \`/notifications/\${id}/read\`,
  readAll: '/notifications/read-all',
} as const;
`);

write('notifications/types/notifications.types.ts', `
import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
export interface NotificationListParams { page?: number; limit?: number; unread_only?: string | boolean; }
export interface AppNotification {
  id: string; title: string; body?: string; createdAt?: string; readAt?: string | null; isRead?: boolean; type?: string;
}
export interface NotificationListResult { items: AppNotification[]; meta: PortalPaginationMeta; }
`);

write('notifications/utils/normalizeNotifications.ts', `
${N}
import type { AppNotification, NotificationListResult } from '../types/notifications.types';

export function normalizeNotification(raw: unknown): AppNotification | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  const readAt = pickString(r.read_at, r.readAt) || null;
  return {
    id,
    title: pickString(r.title, r.subject, r.message) || 'Notification',
    body: pickString(r.body, r.content, r.description) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    readAt,
    isRead: pickBoolean(r.is_read, r.isRead, r.read) ?? Boolean(readAt),
    type: pickString(r.type) || undefined,
  };
}

export function normalizeNotificationList(raw: unknown, params: { page?: number; limit?: number }): NotificationListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'notifications', 'data']);
  const normalized = items.map(normalizeNotification).filter((x): x is AppNotification => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeUnreadCount(raw: unknown): number {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return pickNumber(d.count, d.unread, d.unread_count, d.unreadCount, typeof raw === 'number' ? raw : undefined) ?? 0;
}
`);

write('notifications/services/notifications.service.ts', `
import { axiosInstance } from '@/lib/axios';
import { NOTIFICATIONS_API } from '../api/notifications.api';
import type { NotificationListParams, NotificationListResult } from '../types/notifications.types';
import { normalizeNotificationList, normalizeUnreadCount } from '../utils/normalizeNotifications';

export const notificationsService = {
  async list(params: NotificationListParams = {}): Promise<NotificationListResult> {
    const res = await axiosInstance.get(NOTIFICATIONS_API.list, { params });
    return normalizeNotificationList(res.data, params);
  },
  async unreadCount(): Promise<number> {
    const res = await axiosInstance.get(NOTIFICATIONS_API.unreadCount);
    return normalizeUnreadCount(res.data);
  },
  async markRead(id: string): Promise<void> {
    await axiosInstance.post(NOTIFICATIONS_API.read(id));
  },
  async markAllRead(): Promise<void> {
    await axiosInstance.post(NOTIFICATIONS_API.readAll);
  },
};
`);

write('notifications/hooks/useNotifications.ts', `
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import type { NotificationListParams } from '../types/notifications.types';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params: NotificationListParams) => [...notificationKeys.all, 'list', params] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
};

export function useNotifications(params: NotificationListParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsService.list(params),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useNotificationUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationsService.unreadCount(),
    staleTime: 0,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: notificationKeys.all }); },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: notificationKeys.all }); },
  });
}
`);

console.log('scaffold-4 done');
