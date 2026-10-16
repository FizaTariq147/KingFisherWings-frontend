import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { isUuid } from '@/lib/isUuid';
import { opsActivityService } from '../services/opsActivity.service';
import type { OpsEntityType } from '../types/opsActivity.types';

export const opsActivityKeys = {
  all: ['ops-activity'] as const,
  entity: (entityType: OpsEntityType, entityId: string) =>
    [...opsActivityKeys.all, entityType, entityId] as const,
  resource: (entityType: OpsEntityType, entityId: string, resource: string) =>
    [...opsActivityKeys.entity(entityType, entityId), resource] as const,
};

function useEnabled(entityId: string, enabled: boolean) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return Boolean(accessToken) && isUuid(entityId) && enabled;
}

export function useOpsComments(
  entityType: OpsEntityType,
  entityId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: opsActivityKeys.resource(entityType, entityId, 'comments'),
    queryFn: () => opsActivityService.listComments(entityType, entityId),
    enabled: useEnabled(entityId, enabled),
  });
}

export function useOpsFollowUps(
  entityType: OpsEntityType,
  entityId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: opsActivityKeys.resource(entityType, entityId, 'follow-ups'),
    queryFn: () => opsActivityService.listFollowUps(entityType, entityId),
    enabled: useEnabled(entityId, enabled),
  });
}

export function useOpsAttachments(
  entityType: OpsEntityType,
  entityId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: opsActivityKeys.resource(entityType, entityId, 'attachments'),
    queryFn: () => opsActivityService.listAttachments(entityType, entityId),
    enabled: useEnabled(entityId, enabled),
  });
}

export function useOpsReferences(
  entityType: OpsEntityType,
  entityId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: opsActivityKeys.resource(entityType, entityId, 'references'),
    queryFn: () => opsActivityService.listReferences(entityType, entityId),
    enabled: useEnabled(entityId, enabled),
  });
}

export function useOpsTags(
  entityType: OpsEntityType,
  entityId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: opsActivityKeys.resource(entityType, entityId, 'tags'),
    queryFn: () => opsActivityService.listTags(entityType, entityId),
    enabled: useEnabled(entityId, enabled),
  });
}

export function useOpsLinks(
  entityType: OpsEntityType,
  entityId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: opsActivityKeys.resource(entityType, entityId, 'links'),
    queryFn: () => opsActivityService.listLinks(entityType, entityId),
    enabled: useEnabled(entityId, enabled),
  });
}

export function useOpsLikes(
  entityType: OpsEntityType,
  entityId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: opsActivityKeys.resource(entityType, entityId, 'likes'),
    queryFn: () => opsActivityService.listLikes(entityType, entityId),
    enabled: useEnabled(entityId, enabled),
  });
}

export function useOpsComplaints(
  entityType: OpsEntityType,
  entityId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: opsActivityKeys.resource(entityType, entityId, 'complaints'),
    queryFn: () => opsActivityService.listComplaints(entityType, entityId),
    enabled: useEnabled(entityId, enabled),
  });
}

export function useOpsHistory(
  entityType: OpsEntityType,
  entityId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: opsActivityKeys.resource(entityType, entityId, 'history'),
    queryFn: () => opsActivityService.getHistory(entityType, entityId),
    enabled: useEnabled(entityId, enabled),
  });
}

export function useOpsActivityMutations(
  entityType: OpsEntityType,
  entityId: string,
) {
  const queryClient = useQueryClient();
  const invalidate = (resource?: string) => {
    if (resource) {
      void queryClient.invalidateQueries({
        queryKey: opsActivityKeys.resource(entityType, entityId, resource),
      });
    } else {
      void queryClient.invalidateQueries({
        queryKey: opsActivityKeys.entity(entityType, entityId),
      });
    }
  };

  return {
    addComment: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        opsActivityService.addComment(entityType, entityId, body),
      onSuccess: () => invalidate('comments'),
    }),
    patchComment: useMutation({
      mutationFn: ({
        commentId,
        body,
      }: {
        commentId: string;
        body: Record<string, unknown>;
      }) => opsActivityService.patchComment(entityType, entityId, commentId, body),
      onSuccess: () => invalidate('comments'),
    }),
    deleteComment: useMutation({
      mutationFn: (commentId: string) =>
        opsActivityService.deleteComment(entityType, entityId, commentId),
      onSuccess: () => invalidate('comments'),
    }),
    createFollowUp: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        opsActivityService.createFollowUp(entityType, entityId, body),
      onSuccess: () => invalidate('follow-ups'),
    }),
    registerAttachment: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        opsActivityService.registerAttachment(entityType, entityId, body),
      onSuccess: () => invalidate('attachments'),
    }),
    uploadAttachment: useMutation({
      mutationFn: ({
        file,
        fields,
      }: {
        file: File;
        fields?: Record<string, unknown>;
      }) => opsActivityService.uploadAttachment(entityType, entityId, file, fields),
      onSuccess: () => invalidate('attachments'),
    }),
    downloadAttachment: useMutation({
      mutationFn: ({
        attachmentId,
        fallbackName,
      }: {
        attachmentId: string;
        fallbackName?: string;
      }) =>
        opsActivityService.downloadAttachment(
          entityType,
          entityId,
          attachmentId,
          fallbackName,
        ),
    }),
    getAttachmentDownloadUrl: useMutation({
      mutationFn: (attachmentId: string) =>
        opsActivityService.getAttachmentDownloadUrl(
          entityType,
          entityId,
          attachmentId,
        ),
    }),
    addReference: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        opsActivityService.addReference(entityType, entityId, body),
      onSuccess: () => invalidate('references'),
    }),
    addTag: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        opsActivityService.addTag(entityType, entityId, body),
      onSuccess: () => invalidate('tags'),
    }),
    removeTag: useMutation({
      mutationFn: (tagId: string) =>
        opsActivityService.removeTag(entityType, entityId, tagId),
      onSuccess: () => invalidate('tags'),
    }),
    addLink: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        opsActivityService.addLink(entityType, entityId, body),
      onSuccess: () => invalidate('links'),
    }),
    toggleLike: useMutation({
      mutationFn: (body: Record<string, unknown> = {}) =>
        opsActivityService.toggleLike(entityType, entityId, body),
      onSuccess: () => invalidate('likes'),
    }),
    addComplaint: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        opsActivityService.addComplaint(entityType, entityId, body),
      onSuccess: () => invalidate('complaints'),
    }),
    patchComplaint: useMutation({
      mutationFn: ({
        complaintId,
        body,
      }: {
        complaintId: string;
        body: Record<string, unknown>;
      }) =>
        opsActivityService.patchComplaint(entityType, entityId, complaintId, body),
      onSuccess: () => invalidate('complaints'),
    }),
  };
}
