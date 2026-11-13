export type TechLogPrincipal =
  | 'USER'
  | 'SUPER_ADMIN'
  | 'PORTAL'
  | 'VENDOR'
  | 'ANONYMOUS'
  | 'SYSTEM'
  | string;

export type TechIssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'IGNORED';

export type TechIssueSeverity = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface TechLogsListParams {
  page?: number;
  limit?: number;
  tenant_id?: string;
  user_id?: string;
  q?: string;
  principal?: TechLogPrincipal;
  from?: string;
  to?: string;
  status?: TechIssueStatus;
  severity?: TechIssueSeverity;
  status_code?: number;
}

export interface UpdateTechIssueDto {
  status?: TechIssueStatus;
  resolution_notes?: string | null;
}

export interface ReportClientErrorDto {
  message: string;
  stack?: string;
  path?: string;
  severity?: TechIssueSeverity;
  screen?: string;
  metadata?: Record<string, unknown>;
}

export interface TechLogsSummary {
  activity_count?: number;
  issue_count?: number;
  open_issues?: number;
  in_progress_issues?: number;
  resolved_issues?: number;
  ignored_issues?: number;
  error_get_count?: number;
  recent_open_issues: TechIssue[];
  raw: Record<string, unknown>;
}

export interface TechActivityRow {
  id: string;
  occurred_at?: string;
  method?: string;
  path?: string;
  status_code?: number;
  message?: string;
  principal?: TechLogPrincipal;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  tenant_id?: string;
  tenant_name?: string;
  duration_ms?: number;
  raw: Record<string, unknown>;
}

export interface TechIssue {
  id: string;
  occurred_at?: string;
  created_at?: string;
  updated_at?: string;
  status: TechIssueStatus;
  severity: TechIssueSeverity;
  status_code?: number;
  method?: string;
  path?: string;
  message?: string;
  stack?: string;
  screen?: string;
  principal?: TechLogPrincipal;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  tenant_id?: string;
  tenant_name?: string;
  resolution_notes?: string | null;
  raw: Record<string, unknown>;
}

export interface TechLogsPageResult<T> {
  items: T[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
