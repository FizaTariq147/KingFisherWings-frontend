function opsEntityBase(prefix: string, entityType: string, entityId: string): string {
  return `${prefix}/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`;
}

/** Staff — Ops Activity Continuum (enquiry / quote / shipment / job). */
export const OPS_ACTIVITY_API = {
  entity: (entityType: string, entityId: string) => opsEntityBase('/ops', entityType, entityId),
  attachments: (entityType: string, entityId: string) =>
    `${opsEntityBase('/ops', entityType, entityId)}/attachments`,
  attachmentDownload: (entityType: string, entityId: string, attachmentId: string) =>
    `${opsEntityBase('/ops', entityType, entityId)}/attachments/${encodeURIComponent(attachmentId)}/download`,
  attachmentDownloadUrl: (entityType: string, entityId: string, attachmentId: string) =>
    `${opsEntityBase('/ops', entityType, entityId)}/attachments/${encodeURIComponent(attachmentId)}/download-url`,
  attachmentsUpload: (entityType: string, entityId: string) =>
    `${opsEntityBase('/ops', entityType, entityId)}/attachments/upload`,
  complaints: (entityType: string, entityId: string) =>
    `${opsEntityBase('/ops', entityType, entityId)}/complaints`,
  complaint: (entityType: string, entityId: string, complaintId: string) =>
    `${opsEntityBase('/ops', entityType, entityId)}/complaints/${encodeURIComponent(complaintId)}`,
  followUps: (entityType: string, entityId: string) =>
    `${opsEntityBase('/ops', entityType, entityId)}/follow-ups`,
  history: (entityType: string, entityId: string) =>
    `${opsEntityBase('/ops', entityType, entityId)}/history`,
  likes: (entityType: string, entityId: string) =>
    `${opsEntityBase('/ops', entityType, entityId)}/likes`,
  likesToggle: (entityType: string, entityId: string) =>
    `${opsEntityBase('/ops', entityType, entityId)}/likes/toggle`,
  links: (entityType: string, entityId: string) =>
    `${opsEntityBase('/ops', entityType, entityId)}/links`,
  references: (entityType: string, entityId: string) =>
    `${opsEntityBase('/ops', entityType, entityId)}/references`,
  tags: (entityType: string, entityId: string) =>
    `${opsEntityBase('/ops', entityType, entityId)}/tags`,
  tag: (entityType: string, entityId: string, tagId: string) =>
    `${opsEntityBase('/ops', entityType, entityId)}/tags/${encodeURIComponent(tagId)}`,
  comments: (entityType: string, entityId: string) =>
    `${opsEntityBase('/ops', entityType, entityId)}/comments`,
  comment: (entityType: string, entityId: string, commentId: string) =>
    `${opsEntityBase('/ops', entityType, entityId)}/comments/${encodeURIComponent(commentId)}`,
} as const;

/** Customer portal — shared continuum attachments. */
export const PORTAL_OPS_ACTIVITY_API = {
  attachments: (entityType: string, entityId: string) =>
    `${opsEntityBase('/portal/ops', entityType, entityId)}/attachments`,
  attachmentDownload: (entityType: string, entityId: string, attachmentId: string) =>
    `${opsEntityBase('/portal/ops', entityType, entityId)}/attachments/${encodeURIComponent(attachmentId)}/download`,
  attachmentDownloadUrl: (entityType: string, entityId: string, attachmentId: string) =>
    `${opsEntityBase('/portal/ops', entityType, entityId)}/attachments/${encodeURIComponent(attachmentId)}/download-url`,
  attachmentsUpload: (entityType: string, entityId: string) =>
    `${opsEntityBase('/portal/ops', entityType, entityId)}/attachments/upload`,
} as const;

/** Vendor portal — shared continuum attachments. */
export const VENDOR_OPS_ACTIVITY_API = {
  attachments: (entityType: string, entityId: string) =>
    `${opsEntityBase('/vendor/ops', entityType, entityId)}/attachments`,
  attachmentDownload: (entityType: string, entityId: string, attachmentId: string) =>
    `${opsEntityBase('/vendor/ops', entityType, entityId)}/attachments/${encodeURIComponent(attachmentId)}/download`,
  attachmentDownloadUrl: (entityType: string, entityId: string, attachmentId: string) =>
    `${opsEntityBase('/vendor/ops', entityType, entityId)}/attachments/${encodeURIComponent(attachmentId)}/download-url`,
  attachmentsUpload: (entityType: string, entityId: string) =>
    `${opsEntityBase('/vendor/ops', entityType, entityId)}/attachments/upload`,
} as const;
