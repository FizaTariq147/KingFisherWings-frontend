import { axiosInstance } from '@/lib/axios';
import { superAdminApiClient } from '@/lib/superAdminApiClient';
import { TECH_LOGS_API } from '../api/techLogs.api';
import type {
  ReportClientErrorDto,
  TechIssue,
  TechLogsListParams,
  TechLogsPageResult,
  TechLogsSummary,
  TechActivityRow,
  UpdateTechIssueDto,
} from '../types/techLogs.types';
import {
  normalizeTechActivityPage,
  normalizeTechIssue,
  normalizeTechIssuesPage,
  normalizeTechLogsSummary,
} from '../utils/normalizeTechLogs';

function cleanParams(params: TechLogsListParams = {}): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') continue;
    if (typeof value === 'number' && !Number.isFinite(value)) continue;
    out[key] = value as string | number;
  }
  return out;
}

export const techLogsService = {
  async getSummary(): Promise<TechLogsSummary> {
    const res = await superAdminApiClient.get(TECH_LOGS_API.summary);
    return normalizeTechLogsSummary(res.data);
  },

  async listActivity(
    params: TechLogsListParams = {},
  ): Promise<TechLogsPageResult<TechActivityRow>> {
    const res = await superAdminApiClient.get(TECH_LOGS_API.activity, {
      params: cleanParams(params),
    });
    return normalizeTechActivityPage(res.data);
  },

  async listIssues(
    params: TechLogsListParams = {},
  ): Promise<TechLogsPageResult<TechIssue>> {
    const res = await superAdminApiClient.get(TECH_LOGS_API.issues, {
      params: cleanParams(params),
    });
    return normalizeTechIssuesPage(res.data);
  },

  async getIssue(id: string): Promise<TechIssue> {
    const res = await superAdminApiClient.get(TECH_LOGS_API.issue(id));
    const issue = normalizeTechIssue(res.data, id);
    if (!issue) throw new Error('Issue not found.');
    return issue;
  },

  async updateIssue(id: string, dto: UpdateTechIssueDto): Promise<TechIssue> {
    const res = await superAdminApiClient.patch(TECH_LOGS_API.issue(id), dto);
    const issue = normalizeTechIssue(res.data, id);
    if (!issue) {
      // Some APIs return empty body on PATCH — re-fetch.
      return techLogsService.getIssue(id);
    }
    return issue;
  },

  /**
   * Staff FE → Issues (staff JWT via ERP axios). Never toast on failure —
   * used from global error reporters.
   */
  async reportClientError(dto: ReportClientErrorDto): Promise<void> {
    await axiosInstance.post(TECH_LOGS_API.clientErrors, {
      message: dto.message.slice(0, 4000),
      ...(dto.stack ? { stack: dto.stack.slice(0, 20000) } : {}),
      ...(dto.path ? { path: dto.path.slice(0, 500) } : {}),
      ...(dto.screen ? { screen: dto.screen.slice(0, 200) } : {}),
      severity: dto.severity ?? 'ERROR',
      ...(dto.metadata ? { metadata: dto.metadata } : {}),
    });
  },
};
