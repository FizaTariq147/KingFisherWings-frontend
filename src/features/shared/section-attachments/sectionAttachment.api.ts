import type { OpsSectionKey, SectionAttachmentEntity } from './sectionAttachment.types';

function base(entity: SectionAttachmentEntity, id: string, section: OpsSectionKey): string {
  return `/${entity}/${id}/${section}/attachments`;
}

export const SECTION_ATTACHMENT_API = {
  list: (entity: SectionAttachmentEntity, id: string, section: OpsSectionKey) =>
    base(entity, id, section),
  upload: (entity: SectionAttachmentEntity, id: string, section: OpsSectionKey) =>
    base(entity, id, section),
  download: (
    entity: SectionAttachmentEntity,
    id: string,
    section: OpsSectionKey,
    documentId: string,
  ) => `${base(entity, id, section)}/${encodeURIComponent(documentId)}/download`,
} as const;
