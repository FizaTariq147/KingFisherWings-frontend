import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import {
  openBlobInNewTab,
  triggerBlobDownload,
} from '@/features/files/utils/triggerBlobDownload';
import { SECTION_ATTACHMENT_API } from './sectionAttachment.api';
import { normalizeSectionAttachmentsList } from './normalizeSectionAttachments';
import type {
  OpsSectionKey,
  SectionAttachmentEntity,
  SectionAttachmentsListResult,
  UploadSectionAttachmentFields,
} from './sectionAttachment.types';

function appendFormFields(form: FormData, fields?: UploadSectionAttachmentFields) {
  if (!fields) return;
  if (fields.record_id?.trim()) form.append('record_id', fields.record_id.trim());
  if (typeof fields.visible_to_customer === 'boolean') {
    form.append('visible_to_customer', String(fields.visible_to_customer));
  }
  if (typeof fields.visible_to_vendor === 'boolean') {
    form.append('visible_to_vendor', String(fields.visible_to_vendor));
  }
}

function filenameFromDisposition(header: unknown, fallback: string): string {
  if (typeof header !== 'string') return fallback;
  const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(header);
  if (!match?.[1]) return fallback;
  try {
    return decodeURIComponent(match[1].replace(/"/g, ''));
  } catch {
    return match[1].replace(/"/g, '');
  }
}

function isImageMime(mime?: string, name?: string): boolean {
  const m = (mime || '').toLowerCase();
  if (m.startsWith('image/')) return true;
  const n = (name || '').toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(n);
}

export const sectionAttachmentService = {
  async list(
    entity: SectionAttachmentEntity,
    id: string,
    section: OpsSectionKey,
  ): Promise<SectionAttachmentsListResult> {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(SECTION_ATTACHMENT_API.list(entity, id, section)),
    );
    return normalizeSectionAttachmentsList(res.data);
  },

  async upload(
    entity: SectionAttachmentEntity,
    id: string,
    section: OpsSectionKey,
    file: File,
    fields?: UploadSectionAttachmentFields,
  ): Promise<unknown> {
    const form = new FormData();
    form.append('file', file);
    appendFormFields(form, fields);
    const res = await withGatewayRetry(() =>
      axiosInstance.post(SECTION_ATTACHMENT_API.upload(entity, id, section), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
    return res.data;
  },

  /**
   * PDFs/images open inline; other types force download.
   */
  async openOrDownload(
    entity: SectionAttachmentEntity,
    id: string,
    section: OpsSectionKey,
    documentId: string,
    fallbackName = 'attachment',
  ): Promise<void> {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(
        SECTION_ATTACHMENT_API.download(entity, id, section, documentId),
        { responseType: 'blob' },
      ),
    );
    const blob =
      res.data instanceof Blob ? res.data : new Blob([res.data as BlobPart]);
    const headerType =
      typeof res.headers?.['content-type'] === 'string'
        ? res.headers['content-type']
        : blob.type;
    const name = filenameFromDisposition(
      res.headers?.['content-disposition'],
      fallbackName,
    );

    if ((await blobLooksLikePdf(blob)) || /pdf/i.test(headerType || '')) {
      await openBlobInNewTab(blob, undefined, { filename: name });
      return;
    }
    if (isImageMime(headerType, name)) {
      const typed =
        headerType && headerType.startsWith('image/') && blob.type !== headerType
          ? new Blob([blob], { type: headerType })
          : blob;
      const objectUrl = URL.createObjectURL(typed);
      const opened = window.open(objectUrl, '_blank', 'noopener,noreferrer');
      if (!opened) {
        URL.revokeObjectURL(objectUrl);
        triggerBlobDownload(typed, name);
        return;
      }
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 120_000);
      return;
    }
    triggerBlobDownload(blob, name);
  },
};
