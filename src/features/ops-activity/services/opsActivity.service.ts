import type { AxiosInstance } from 'axios';
import { axiosInstance } from '@/lib/axios';
import { portalApiClient } from '@/lib/portalApiClient';
import { vendorApiClient } from '@/lib/vendorApiClient';
import { withGatewayRetry } from '@/lib/wakeApi';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { asList, unwrap } from '@/features/online-payments/utils/billingApiHelpers';
import {
  OPS_ACTIVITY_API,
  PORTAL_OPS_ACTIVITY_API,
  VENDOR_OPS_ACTIVITY_API,
} from '../api/opsActivity.api';

async function downloadBlob(client: AxiosInstance, path: string, fallbackName: string) {
  const res = await client.get(path, { responseType: 'blob' });
  const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
  const cd = res.headers['content-disposition'];
  let fileName = fallbackName;
  if (typeof cd === 'string') {
    const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(cd);
    if (match?.[1]) fileName = decodeURIComponent(match[1].replace(/"/g, ''));
  }
  triggerBlobDownload(blob, fileName);
}

function appendFormFields(form: FormData, fields?: Record<string, unknown>) {
  if (!fields) return;
  for (const [key, value] of Object.entries(fields)) {
    if (value == null) continue;
    if (value instanceof Blob || value instanceof File) {
      form.append(key, value);
    } else if (typeof value === 'object') {
      form.append(key, JSON.stringify(value));
    } else {
      form.append(key, String(value));
    }
  }
}

/** Keep only OpenAPI-allowed keys (forbid whitelist extras that cause 400). */
function pickDto(
  body: Record<string, unknown>,
  keys: readonly string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    const v = body[key];
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && !v.trim() && key !== 'notes') continue;
    out[key] = typeof v === 'string' ? v.trim() : v;
  }
  return out;
}

const COMMENT_KEYS = ['body'] as const;
const FOLLOW_UP_KEYS = ['due_date', 'subject', 'notes', 'owner_id'] as const;
const REFERENCE_KEYS = ['ref_type', 'ref_value', 'notes'] as const;
const TAG_KEYS = ['tag'] as const;
const LINK_KEYS = ['title', 'url'] as const;
const COMPLAINT_KEYS = ['subject', 'body'] as const;
const COMPLAINT_PATCH_KEYS = ['status'] as const;
const ATTACHMENT_KEYS = [
  'file_name',
  'storage_key',
  'file_url',
  'mime_type',
  'size_bytes',
  'notes',
  'visible_to_customer',
  'visible_to_vendor',
] as const;

export const opsActivityService = {
  async listAttachments(entityType: string, entityId: string, params?: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(OPS_ACTIVITY_API.attachments(entityType, entityId), { params }),
    );
    return asList(res.data);
  },

  async registerAttachment(
    entityType: string,
    entityId: string,
    body: Record<string, unknown>,
  ) {
    const payload = pickDto(body, ATTACHMENT_KEYS);
    const res = await withGatewayRetry(() =>
      axiosInstance.post(
        OPS_ACTIVITY_API.attachments(entityType, entityId),
        payload,
      ),
    );
    return unwrap(res.data);
  },

  async uploadAttachment(
    entityType: string,
    entityId: string,
    file: File,
    fields?: Record<string, unknown>,
  ) {
    const form = new FormData();
    form.append('file', file);
    appendFormFields(form, fields);
    const res = await withGatewayRetry(() =>
      axiosInstance.post(OPS_ACTIVITY_API.attachmentsUpload(entityType, entityId), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
    return unwrap(res.data);
  },

  async downloadAttachment(
    entityType: string,
    entityId: string,
    attachmentId: string,
    fallbackName = 'attachment',
  ) {
    await downloadBlob(
      axiosInstance,
      OPS_ACTIVITY_API.attachmentDownload(entityType, entityId, attachmentId),
      fallbackName,
    );
  },

  async getAttachmentDownloadUrl(entityType: string, entityId: string, attachmentId: string) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(
        OPS_ACTIVITY_API.attachmentDownloadUrl(entityType, entityId, attachmentId),
      ),
    );
    return unwrap(res.data);
  },

  async listComplaints(entityType: string, entityId: string, params?: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(OPS_ACTIVITY_API.complaints(entityType, entityId), { params }),
    );
    return asList(res.data);
  },

  async addComplaint(entityType: string, entityId: string, body: Record<string, unknown>) {
    const payload = pickDto(body, COMPLAINT_KEYS);
    const res = await withGatewayRetry(() =>
      axiosInstance.post(
        OPS_ACTIVITY_API.complaints(entityType, entityId),
        payload,
      ),
    );
    return unwrap(res.data);
  },

  async patchComplaint(
    entityType: string,
    entityId: string,
    complaintId: string,
    body: Record<string, unknown>,
  ) {
    const payload = pickDto(body, COMPLAINT_PATCH_KEYS);
    const res = await withGatewayRetry(() =>
      axiosInstance.patch(
        OPS_ACTIVITY_API.complaint(entityType, entityId, complaintId),
        payload,
      ),
    );
    return unwrap(res.data);
  },

  async listFollowUps(entityType: string, entityId: string, params?: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(OPS_ACTIVITY_API.followUps(entityType, entityId), { params }),
    );
    return asList(res.data);
  },

  async createFollowUp(entityType: string, entityId: string, body: Record<string, unknown>) {
    const payload = pickDto(body, FOLLOW_UP_KEYS);
    const res = await withGatewayRetry(() =>
      axiosInstance.post(
        OPS_ACTIVITY_API.followUps(entityType, entityId),
        payload,
      ),
    );
    return unwrap(res.data);
  },

  async getHistory(entityType: string, entityId: string, params?: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(OPS_ACTIVITY_API.history(entityType, entityId), { params }),
    );
    return asList(res.data);
  },

  async listLikes(entityType: string, entityId: string, params?: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(OPS_ACTIVITY_API.likes(entityType, entityId), { params }),
    );
    return asList(res.data);
  },

  async toggleLike(entityType: string, entityId: string, _body: Record<string, unknown> = {}) {
    // POST /likes/toggle — no request body in OpenAPI
    const res = await withGatewayRetry(() =>
      axiosInstance.post(OPS_ACTIVITY_API.likesToggle(entityType, entityId)),
    );
    return unwrap(res.data);
  },

  async listLinks(entityType: string, entityId: string, params?: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(OPS_ACTIVITY_API.links(entityType, entityId), { params }),
    );
    return asList(res.data);
  },

  async addLink(entityType: string, entityId: string, body: Record<string, unknown>) {
    const payload = pickDto(body, LINK_KEYS);
    const res = await withGatewayRetry(() =>
      axiosInstance.post(OPS_ACTIVITY_API.links(entityType, entityId), payload),
    );
    return unwrap(res.data);
  },

  async listReferences(entityType: string, entityId: string, params?: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(OPS_ACTIVITY_API.references(entityType, entityId), { params }),
    );
    return asList(res.data);
  },

  async addReference(entityType: string, entityId: string, body: Record<string, unknown>) {
    const payload = pickDto(body, REFERENCE_KEYS);
    const res = await withGatewayRetry(() =>
      axiosInstance.post(
        OPS_ACTIVITY_API.references(entityType, entityId),
        payload,
      ),
    );
    return unwrap(res.data);
  },

  async listTags(entityType: string, entityId: string, params?: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(OPS_ACTIVITY_API.tags(entityType, entityId), { params }),
    );
    return asList(res.data);
  },

  async addTag(entityType: string, entityId: string, body: Record<string, unknown>) {
    const payload = pickDto(body, TAG_KEYS);
    const res = await withGatewayRetry(() =>
      axiosInstance.post(OPS_ACTIVITY_API.tags(entityType, entityId), payload),
    );
    return unwrap(res.data);
  },

  async removeTag(entityType: string, entityId: string, tagId: string) {
    await withGatewayRetry(() =>
      axiosInstance.delete(OPS_ACTIVITY_API.tag(entityType, entityId, tagId)),
    );
  },

  async listComments(entityType: string, entityId: string, params?: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(OPS_ACTIVITY_API.comments(entityType, entityId), { params }),
    );
    return asList(res.data);
  },

  async addComment(entityType: string, entityId: string, body: Record<string, unknown>) {
    const payload = pickDto(body, COMMENT_KEYS);
    const res = await withGatewayRetry(() =>
      axiosInstance.post(
        OPS_ACTIVITY_API.comments(entityType, entityId),
        payload,
      ),
    );
    return unwrap(res.data);
  },

  async patchComment(
    entityType: string,
    entityId: string,
    commentId: string,
    body: Record<string, unknown>,
  ) {
    const payload = pickDto(body, COMMENT_KEYS);
    const res = await withGatewayRetry(() =>
      axiosInstance.patch(
        OPS_ACTIVITY_API.comment(entityType, entityId, commentId),
        payload,
      ),
    );
    return unwrap(res.data);
  },

  async deleteComment(entityType: string, entityId: string, commentId: string) {
    await withGatewayRetry(() =>
      axiosInstance.delete(OPS_ACTIVITY_API.comment(entityType, entityId, commentId)),
    );
  },
};

export const portalOpsActivityService = {
  async listAttachments(entityType: string, entityId: string, params?: Record<string, unknown>) {
    const res = await portalApiClient.get(
      PORTAL_OPS_ACTIVITY_API.attachments(entityType, entityId),
      { params },
    );
    return asList(res.data);
  },

  async uploadAttachment(
    entityType: string,
    entityId: string,
    file: File,
    fields?: Record<string, unknown>,
  ) {
    const form = new FormData();
    form.append('file', file);
    appendFormFields(form, fields);
    const res = await portalApiClient.post(
      PORTAL_OPS_ACTIVITY_API.attachmentsUpload(entityType, entityId),
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return unwrap(res.data);
  },

  async downloadAttachment(
    entityType: string,
    entityId: string,
    attachmentId: string,
    fallbackName = 'attachment',
  ) {
    await downloadBlob(
      portalApiClient,
      PORTAL_OPS_ACTIVITY_API.attachmentDownload(entityType, entityId, attachmentId),
      fallbackName,
    );
  },

  async getAttachmentDownloadUrl(entityType: string, entityId: string, attachmentId: string) {
    const res = await portalApiClient.get(
      PORTAL_OPS_ACTIVITY_API.attachmentDownloadUrl(entityType, entityId, attachmentId),
    );
    return unwrap(res.data);
  },
};

export const vendorOpsActivityService = {
  async listAttachments(entityType: string, entityId: string, params?: Record<string, unknown>) {
    const res = await vendorApiClient.get(
      VENDOR_OPS_ACTIVITY_API.attachments(entityType, entityId),
      { params },
    );
    return asList(res.data);
  },

  async uploadAttachment(
    entityType: string,
    entityId: string,
    file: File,
    fields?: Record<string, unknown>,
  ) {
    const form = new FormData();
    form.append('file', file);
    appendFormFields(form, fields);
    const res = await vendorApiClient.post(
      VENDOR_OPS_ACTIVITY_API.attachmentsUpload(entityType, entityId),
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return unwrap(res.data);
  },

  async downloadAttachment(
    entityType: string,
    entityId: string,
    attachmentId: string,
    fallbackName = 'attachment',
  ) {
    await downloadBlob(
      vendorApiClient,
      VENDOR_OPS_ACTIVITY_API.attachmentDownload(entityType, entityId, attachmentId),
      fallbackName,
    );
  },

  async getAttachmentDownloadUrl(entityType: string, entityId: string, attachmentId: string) {
    const res = await vendorApiClient.get(
      VENDOR_OPS_ACTIVITY_API.attachmentDownloadUrl(entityType, entityId, attachmentId),
    );
    return unwrap(res.data);
  },
};
