/**
 * Scaffold messages, disputes, notifications, public track, admin inbox, staff notifications
 * Run: node scripts/scaffold-portal-modules-3.cjs
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

// MESSAGES
write('portal-messages/api/portalMessages.api.ts', `
export const PORTAL_MESSAGES_API = { list: '/portal/messages', create: '/portal/messages' } as const;
`);
write('portal-messages/types/portalMessages.types.ts', `
import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
export interface PortalMessageListParams { page?: number; limit?: number; }
export interface PortalMessageCreateDto { subject: string; body: string; job_id?: string; invoice_id?: string; }
export interface PortalMessage {
  id: string; subject: string; body?: string; createdAt?: string; readByStaff?: boolean;
  jobId?: string; invoiceId?: string;
}
export interface PortalMessageListResult { items: PortalMessage[]; meta: PortalPaginationMeta; }
`);
write('portal-messages/utils/normalizePortalMessages.ts', `
${N}
import type { PortalMessage, PortalMessageListResult } from '../types/portalMessages.types';

export function normalizePortalMessage(raw: unknown): PortalMessage | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  return {
    id,
    subject: pickString(r.subject, r.title) || 'Message',
    body: pickString(r.body, r.message, r.content) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    readByStaff: pickBoolean(r.read_by_staff, r.readByStaff, r.is_read, r.isRead),
    jobId: pickString(r.job_id, r.jobId) || undefined,
    invoiceId: pickString(r.invoice_id, r.invoiceId) || undefined,
  };
}

export function normalizePortalMessageList(raw: unknown, params: { page?: number; limit?: number }): PortalMessageListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'messages', 'data']);
  const normalized = items.map(normalizePortalMessage).filter((x): x is PortalMessage => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}
`);
write('portal-messages/services/portalMessages.service.ts', `
import { portalApiClient } from '@/lib/portalApiClient';
import { PORTAL_MESSAGES_API } from '../api/portalMessages.api';
import type { PortalMessage, PortalMessageCreateDto, PortalMessageListParams, PortalMessageListResult } from '../types/portalMessages.types';
import { normalizePortalMessage, normalizePortalMessageList } from '../utils/normalizePortalMessages';

export const portalMessagesService = {
  async list(params: PortalMessageListParams = {}): Promise<PortalMessageListResult> {
    const res = await portalApiClient.get(PORTAL_MESSAGES_API.list, { params });
    return normalizePortalMessageList(res.data, params);
  },
  async create(dto: PortalMessageCreateDto): Promise<PortalMessage> {
    const res = await portalApiClient.post(PORTAL_MESSAGES_API.create, dto);
    const item = normalizePortalMessage(res.data?.data ?? res.data);
    if (!item) throw new Error('Could not send message.');
    return item;
  },
};
`);
write('portal-messages/hooks/usePortalMessages.ts', `
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalMessagesService } from '../services/portalMessages.service';
import type { PortalMessageCreateDto, PortalMessageListParams } from '../types/portalMessages.types';

export const portalMessageKeys = {
  all: (scope: string) => ['portal', scope, 'messages'] as const,
  list: (scope: string, params: PortalMessageListParams) => [...portalMessageKeys.all(scope), 'list', params] as const,
};

export function usePortalMessages(params: PortalMessageListParams) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalMessageKeys.list(scope, params),
    queryFn: () => portalMessagesService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useCreatePortalMessage() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: (dto: PortalMessageCreateDto) => portalMessagesService.create(dto),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: portalMessageKeys.all(scope) }); },
  });
}
`);

// DISPUTES
write('portal-disputes/api/portalDisputes.api.ts', `
export const PORTAL_DISPUTES_API = { list: '/portal/disputes', create: '/portal/disputes' } as const;
export const PORTAL_DISPUTE_STATUSES = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'] as const;
`);
write('portal-disputes/types/portalDisputes.types.ts', `
import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
export interface PortalDisputeListParams { page?: number; limit?: number; status?: string; }
export interface PortalDisputeCreateDto { invoice_id: string; reason: string; description: string; }
export interface PortalDispute {
  id: string; invoiceId?: string; invoiceNumber?: string; reason?: string; description?: string;
  status?: string; createdAt?: string; staffNotes?: string;
}
export interface PortalDisputeListResult { items: PortalDispute[]; meta: PortalPaginationMeta; }
`);
write('portal-disputes/utils/normalizePortalDisputes.ts', `
${N}
import type { PortalDispute, PortalDisputeListResult } from '../types/portalDisputes.types';

export function normalizePortalDispute(raw: unknown): PortalDispute | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  return {
    id,
    invoiceId: pickString(r.invoice_id, r.invoiceId) || undefined,
    invoiceNumber: pickString(r.invoice_number, r.invoiceNumber) || undefined,
    reason: pickString(r.reason) || undefined,
    description: pickString(r.description) || undefined,
    status: pickString(r.status) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    staffNotes: pickString(r.staff_notes, r.staffNotes) || undefined,
  };
}

export function normalizePortalDisputeList(raw: unknown, params: { page?: number; limit?: number }): PortalDisputeListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'disputes', 'data']);
  const normalized = items.map(normalizePortalDispute).filter((x): x is PortalDispute => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}
`);
write('portal-disputes/services/portalDisputes.service.ts', `
import { portalApiClient } from '@/lib/portalApiClient';
import { PORTAL_DISPUTES_API } from '../api/portalDisputes.api';
import type { PortalDispute, PortalDisputeCreateDto, PortalDisputeListParams, PortalDisputeListResult } from '../types/portalDisputes.types';
import { normalizePortalDispute, normalizePortalDisputeList } from '../utils/normalizePortalDisputes';

export const portalDisputesService = {
  async list(params: PortalDisputeListParams = {}): Promise<PortalDisputeListResult> {
    const res = await portalApiClient.get(PORTAL_DISPUTES_API.list, { params });
    return normalizePortalDisputeList(res.data, params);
  },
  async create(dto: PortalDisputeCreateDto): Promise<PortalDispute> {
    const res = await portalApiClient.post(PORTAL_DISPUTES_API.create, dto);
    const item = normalizePortalDispute(res.data?.data ?? res.data);
    if (!item) throw new Error('Could not raise dispute.');
    return item;
  },
};
`);
write('portal-disputes/hooks/usePortalDisputes.ts', `
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalDisputesService } from '../services/portalDisputes.service';
import type { PortalDisputeCreateDto, PortalDisputeListParams } from '../types/portalDisputes.types';

export const portalDisputeKeys = {
  all: (scope: string) => ['portal', scope, 'disputes'] as const,
  list: (scope: string, params: PortalDisputeListParams) => [...portalDisputeKeys.all(scope), 'list', params] as const,
};

export function usePortalDisputes(params: PortalDisputeListParams) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalDisputeKeys.list(scope, params),
    queryFn: () => portalDisputesService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useCreatePortalDispute() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: (dto: PortalDisputeCreateDto) => portalDisputesService.create(dto),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: portalDisputeKeys.all(scope) }); },
  });
}
`);

// PORTAL NOTIFICATIONS
write('portal-notifications/api/portalNotifications.api.ts', `
export const PORTAL_NOTIFICATIONS_API = {
  list: '/portal/notifications',
  unreadCount: '/portal/notifications/unread-count',
  read: (id: string) => \`/portal/notifications/\${id}/read\`,
  readAll: '/portal/notifications/read-all',
} as const;
`);
write('portal-notifications/types/portalNotifications.types.ts', `
import type { PortalPaginationMeta } from '@/features/portal-shared/normalize';
export interface PortalNotificationListParams { page?: number; limit?: number; unread_only?: string | boolean; }
export interface PortalNotification {
  id: string; title: string; body?: string; createdAt?: string; readAt?: string | null; isRead?: boolean; type?: string;
}
export interface PortalNotificationListResult { items: PortalNotification[]; meta: PortalPaginationMeta; }
`);
write('portal-notifications/utils/normalizePortalNotifications.ts', `
${N}
import type { PortalNotification, PortalNotificationListResult } from '../types/portalNotifications.types';

export function normalizePortalNotification(raw: unknown): PortalNotification | null {
  const r = asRecord(raw); if (!r) return null;
  const id = pickString(r.id); if (!id) return null;
  const readAt = pickString(r.read_at, r.readAt) || null;
  const isRead = pickBoolean(r.is_read, r.isRead, r.read) ?? Boolean(readAt);
  return {
    id,
    title: pickString(r.title, r.subject, r.message) || 'Notification',
    body: pickString(r.body, r.content, r.description) || undefined,
    createdAt: pickString(r.created_at, r.createdAt) || undefined,
    readAt,
    isRead,
    type: pickString(r.type, r.notification_type) || undefined,
  };
}

export function normalizePortalNotificationList(raw: unknown, params: { page?: number; limit?: number }): PortalNotificationListResult {
  const { items, meta } = unwrapList(raw, ['items', 'results', 'notifications', 'data']);
  const normalized = items.map(normalizePortalNotification).filter((x): x is PortalNotification => Boolean(x));
  return { items: normalized, meta: normalizeMeta(meta, normalized.length, params) };
}

export function normalizeUnreadCount(raw: unknown): number {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return pickNumber(d.count, d.unread, d.unread_count, d.unreadCount, typeof raw === 'number' ? raw : undefined) ?? 0;
}
`);
write('portal-notifications/services/portalNotifications.service.ts', `
import { portalApiClient } from '@/lib/portalApiClient';
import { PORTAL_NOTIFICATIONS_API } from '../api/portalNotifications.api';
import type { PortalNotificationListParams, PortalNotificationListResult } from '../types/portalNotifications.types';
import { normalizePortalNotificationList, normalizeUnreadCount } from '../utils/normalizePortalNotifications';

export const portalNotificationsService = {
  async list(params: PortalNotificationListParams = {}): Promise<PortalNotificationListResult> {
    const res = await portalApiClient.get(PORTAL_NOTIFICATIONS_API.list, { params });
    return normalizePortalNotificationList(res.data, params);
  },
  async unreadCount(): Promise<number> {
    const res = await portalApiClient.get(PORTAL_NOTIFICATIONS_API.unreadCount);
    return normalizeUnreadCount(res.data);
  },
  async markRead(id: string): Promise<void> {
    await portalApiClient.post(PORTAL_NOTIFICATIONS_API.read(id));
  },
  async markAllRead(): Promise<void> {
    await portalApiClient.post(PORTAL_NOTIFICATIONS_API.readAll);
  },
};
`);
write('portal-notifications/hooks/usePortalNotifications.ts', `
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalNotificationsService } from '../services/portalNotifications.service';
import type { PortalNotificationListParams } from '../types/portalNotifications.types';

export const portalNotificationKeys = {
  all: (scope: string) => ['portal', scope, 'notifications'] as const,
  list: (scope: string, params: PortalNotificationListParams) => [...portalNotificationKeys.all(scope), 'list', params] as const,
  unread: (scope: string) => [...portalNotificationKeys.all(scope), 'unread'] as const,
};

export function usePortalNotifications(params: PortalNotificationListParams) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalNotificationKeys.list(scope, params),
    queryFn: () => portalNotificationsService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function usePortalNotificationUnreadCount() {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalNotificationKeys.unread(scope),
    queryFn: () => portalNotificationsService.unreadCount(),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    refetchInterval: 60_000,
  });
}

export function useMarkPortalNotificationRead() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: (id: string) => portalNotificationsService.markRead(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: portalNotificationKeys.all(scope) }); },
  });
}

export function useMarkAllPortalNotificationsRead() {
  const qc = useQueryClient();
  const scope = usePortalQueryScope();
  return useMutation({
    mutationFn: () => portalNotificationsService.markAllRead(),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: portalNotificationKeys.all(scope) }); },
  });
}
`);

// PUBLIC TRACK
write('public-track/api/publicTrack.api.ts', `
export const PUBLIC_TRACK_API = {
  track: '/track',
  embed: '/track/embed',
} as const;
`);
write('public-track/types/publicTrack.types.ts', `
export interface PublicTrackMilestone {
  id: string; label: string; occurredAt?: string; location?: string; status?: string;
}
export interface PublicTrackResult {
  reference: string; status?: string; origin?: string; destination?: string;
  jobType?: string; milestones: PublicTrackMilestone[]; partyName?: string;
}
export interface PublicTrackEmbedConfig {
  tenantSlug?: string; companyName?: string; primaryColor?: string; logoUrl?: string;
}
`);
write('public-track/utils/normalizePublicTrack.ts', `
${N}
import type { PublicTrackEmbedConfig, PublicTrackMilestone, PublicTrackResult } from '../types/publicTrack.types';

export function normalizePublicMilestone(raw: unknown, index: number): PublicTrackMilestone | null {
  const r = asRecord(raw); if (!r) return null;
  return {
    id: pickString(r.id) || String(index),
    label: pickString(r.label, r.name, r.code, r.milestone) || 'Milestone',
    occurredAt: pickString(r.occurred_at, r.occurredAt, r.date) || undefined,
    location: pickString(r.location, r.place) || undefined,
    status: pickString(r.status) || undefined,
  };
}

export function normalizePublicTrack(raw: unknown): PublicTrackResult | null {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw); if (!d) return null;
  const shipment = asRecord(d.shipment) ?? d;
  const ref = pickString(shipment.reference, shipment.job_number, shipment.jobNumber, d.ref, d.reference);
  if (!ref) return null;
  const msRaw = Array.isArray(shipment.milestones) ? shipment.milestones : Array.isArray(d.milestones) ? d.milestones : [];
  return {
    reference: ref,
    status: pickString(shipment.status, d.status) || undefined,
    origin: pickString(shipment.origin, shipment.origin_name) || undefined,
    destination: pickString(shipment.destination, shipment.dest_name) || undefined,
    jobType: pickString(shipment.job_type, shipment.jobType) || undefined,
    partyName: pickString(shipment.party_name, d.party_name) || undefined,
    milestones: msRaw.map(normalizePublicMilestone).filter((m): m is PublicTrackMilestone => Boolean(m)),
  };
}

export function normalizeEmbedConfig(raw: unknown): PublicTrackEmbedConfig {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return {
    tenantSlug: pickString(d.tenant_slug, d.tenantSlug) || undefined,
    companyName: pickString(d.company_name, d.companyName, d.tenant_name) || undefined,
    primaryColor: pickString(d.primary_color, d.primaryColor) || undefined,
    logoUrl: pickString(d.logo_url, d.logoUrl) || undefined,
  };
}
`);
write('public-track/services/publicTrack.service.ts', `
import axios from 'axios';
import { PUBLIC_TRACK_API } from '../api/publicTrack.api';
import type { PublicTrackEmbedConfig, PublicTrackResult } from '../types/publicTrack.types';
import { normalizeEmbedConfig, normalizePublicTrack } from '../utils/normalizePublicTrack';

const publicClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
  timeout: 60_000,
});

export const publicTrackService = {
  async track(tenantSlug: string, ref: string): Promise<PublicTrackResult> {
    const res = await publicClient.get(PUBLIC_TRACK_API.track, {
      params: { tenant_slug: tenantSlug.trim(), ref: ref.trim() },
    });
    const result = normalizePublicTrack(res.data);
    if (!result) throw new Error('Shipment not found for that reference.');
    return result;
  },
  async embed(tenantSlug?: string): Promise<PublicTrackEmbedConfig> {
    const res = await publicClient.get(PUBLIC_TRACK_API.embed, {
      params: tenantSlug ? { tenant_slug: tenantSlug } : undefined,
    });
    return normalizeEmbedConfig(res.data);
  },
};
`);
write('public-track/hooks/usePublicTrack.ts', `
import { useMutation, useQuery } from '@tanstack/react-query';
import { publicTrackService } from '../services/publicTrack.service';

export function usePublicTrackEmbed(tenantSlug?: string) {
  return useQuery({
    queryKey: ['public-track', 'embed', tenantSlug ?? ''],
    queryFn: () => publicTrackService.embed(tenantSlug),
    staleTime: 5 * 60_000,
  });
}

export function usePublicTrackLookup() {
  return useMutation({
    mutationFn: ({ tenantSlug, ref }: { tenantSlug: string; ref: string }) =>
      publicTrackService.track(tenantSlug, ref),
  });
}
`);

console.log('scaffold-3a done');
