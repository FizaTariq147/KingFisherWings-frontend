import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { isUuid } from '@/lib/isUuid';
import { sectionAttachmentService } from './sectionAttachment.service';
import type {
  OpsSectionKey,
  SectionAttachmentEntity,
  UploadSectionAttachmentFields,
} from './sectionAttachment.types';

export const sectionAttachmentKeys = {
  all: ['section-attachments'] as const,
  list: (
    entity: SectionAttachmentEntity,
    id: string,
    section: OpsSectionKey,
  ) => [...sectionAttachmentKeys.all, entity, id, section] as const,
};

export function useSectionAttachments(
  entity: SectionAttachmentEntity,
  id: string,
  section: OpsSectionKey,
  enabled = true,
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: sectionAttachmentKeys.list(entity, id, section),
    queryFn: () => sectionAttachmentService.list(entity, id, section),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
    staleTime: 15_000,
  });
}

export function useSectionAttachmentMutations(
  entity: SectionAttachmentEntity,
  id: string,
  section: OpsSectionKey,
) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: sectionAttachmentKeys.list(entity, id, section),
    });
    // Section list payloads may embed attachments — refresh sibling job/shipment queries.
    void queryClient.invalidateQueries({ queryKey: [entity, id] });
  };

  const upload = useMutation({
    mutationFn: ({
      file,
      fields,
    }: {
      file: File;
      fields?: UploadSectionAttachmentFields;
    }) => sectionAttachmentService.upload(entity, id, section, file, fields),
    onSuccess: () => invalidate(),
  });

  const openOrDownload = useMutation({
    mutationFn: ({
      documentId,
      fileName,
    }: {
      documentId: string;
      fileName?: string;
    }) =>
      sectionAttachmentService.openOrDownload(
        entity,
        id,
        section,
        documentId,
        fileName || 'attachment',
      ),
  });

  return { upload, openOrDownload, invalidate };
}
