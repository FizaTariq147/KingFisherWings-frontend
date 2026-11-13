import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { techLogsService } from '../services/techLogs.service';
import type { TechLogsListParams, UpdateTechIssueDto } from '../types/techLogs.types';

export const techLogsKeys = {
  all: ['superadmin', 'tech-logs'] as const,
  summary: () => [...techLogsKeys.all, 'summary'] as const,
  activity: (params: TechLogsListParams) =>
    [...techLogsKeys.all, 'activity', params] as const,
  issues: (params: TechLogsListParams) =>
    [...techLogsKeys.all, 'issues', params] as const,
  issue: (id: string) => [...techLogsKeys.all, 'issue', id] as const,
};

export function useTechLogsSummary(enabled = true) {
  return useQuery({
    queryKey: techLogsKeys.summary(),
    queryFn: () => techLogsService.getSummary(),
    enabled,
    refetchInterval: 60_000,
  });
}

export function useTechLogsActivity(params: TechLogsListParams, enabled = true) {
  return useQuery({
    queryKey: techLogsKeys.activity(params),
    queryFn: () => techLogsService.listActivity(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useTechLogsIssues(params: TechLogsListParams, enabled = true) {
  return useQuery({
    queryKey: techLogsKeys.issues(params),
    queryFn: () => techLogsService.listIssues(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useTechIssue(id: string, enabled = true) {
  return useQuery({
    queryKey: techLogsKeys.issue(id),
    queryFn: () => techLogsService.getIssue(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useUpdateTechIssue(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateTechIssueDto) => techLogsService.updateIssue(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: techLogsKeys.all });
      void qc.invalidateQueries({ queryKey: techLogsKeys.issue(id) });
    },
  });
}
