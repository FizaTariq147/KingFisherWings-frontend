import { asRecord, pickString, unwrapData } from '@/features/portal-shared/normalize';
import type {
  TechActivityRow,
  TechIssue,
  TechIssueSeverity,
  TechIssueStatus,
  TechLogsPageResult,
  TechLogsSummary,
  TechLogPrincipal,
} from '../types/techLogs.types';

function unwrap(raw: unknown): unknown {
  return unwrapData(raw);
}

function num(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function asList(
  data: unknown,
  listKeys: string[] = [
    'items',
    'results',
    'rows',
    'activity',
    'activities',
    'issues',
    'data',
  ],
): Record<string, unknown>[] {
  const value = unwrap(data);
  if (Array.isArray(value)) return value as Record<string, unknown>[];
  const record = asRecord(value);
  if (!record) return [];
  for (const key of listKeys) {
    if (Array.isArray(record[key])) return record[key] as Record<string, unknown>[];
  }
  return [];
}

function pickMeta(raw: unknown): TechLogsPageResult<unknown>['meta'] {
  const root = asRecord(raw) ?? {};
  const data = asRecord(unwrap(raw)) ?? root;
  const meta = asRecord(root.meta) ?? asRecord(data.meta) ?? {};
  const page = num(meta.page ?? meta.current_page ?? meta.currentPage ?? data.page);
  const limit = num(meta.limit ?? meta.page_size ?? meta.pageSize ?? data.limit);
  const total = num(
    meta.total ?? meta.total_count ?? meta.totalCount ?? data.total ?? data.count,
  );
  const totalPages =
    num(meta.totalPages ?? meta.total_pages ?? meta.page_count ?? meta.pageCount) ??
    (total != null && limit ? Math.max(1, Math.ceil(total / limit)) : undefined);
  if (page == null && limit == null && total == null && totalPages == null) {
    return undefined;
  }
  return { page, limit, total, totalPages };
}

function pickUserName(rec: Record<string, unknown>): string | undefined {
  const user = asRecord(rec.user);
  return (
    pickString(
      rec.user_name,
      rec.userName,
      rec.user_display_name,
      rec.userDisplayName,
      rec.actor_name,
      rec.actorName,
      user?.name,
      user?.full_name,
      user?.fullName,
      user?.display_name,
      user?.displayName,
    ) || undefined
  );
}

function pickUserEmail(rec: Record<string, unknown>): string | undefined {
  const user = asRecord(rec.user);
  return (
    pickString(rec.user_email, rec.userEmail, rec.email, user?.email) || undefined
  );
}

function pickTenantName(rec: Record<string, unknown>): string | undefined {
  const tenant = asRecord(rec.tenant);
  return (
    pickString(
      rec.tenant_name,
      rec.tenantName,
      rec.tenant_display_name,
      tenant?.name,
      tenant?.display_name,
      tenant?.displayName,
      tenant?.code,
    ) || undefined
  );
}

function asStatus(value: unknown): TechIssueStatus {
  const s = String(value || 'OPEN').toUpperCase();
  if (s === 'IN_PROGRESS' || s === 'RESOLVED' || s === 'IGNORED' || s === 'OPEN') {
    return s;
  }
  return 'OPEN';
}

function asSeverity(value: unknown): TechIssueSeverity {
  const s = String(value || 'ERROR').toUpperCase();
  if (s === 'INFO' || s === 'WARN' || s === 'ERROR' || s === 'CRITICAL') return s;
  return 'ERROR';
}

export function normalizeTechActivityRow(raw: unknown): TechActivityRow | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id =
    pickString(rec.id, rec.activity_id, rec.activityId, rec.event_id, rec.eventId) ||
    '';
  if (!id) return null;
  return {
    id,
    occurred_at:
      pickString(
        rec.occurred_at,
        rec.occurredAt,
        rec.created_at,
        rec.createdAt,
        rec.timestamp,
      ) || undefined,
    method: pickString(rec.method, rec.http_method, rec.httpMethod) || undefined,
    path: pickString(rec.path, rec.url, rec.request_path, rec.requestPath) || undefined,
    status_code: num(rec.status_code ?? rec.statusCode ?? rec.status),
    message:
      pickString(rec.message, rec.error_message, rec.errorMessage, rec.summary) ||
      undefined,
    principal: (pickString(rec.principal, rec.actor_type, rec.actorType) ||
      undefined) as TechLogPrincipal | undefined,
    user_id: pickString(rec.user_id, rec.userId, asRecord(rec.user)?.id) || undefined,
    user_name: pickUserName(rec),
    user_email: pickUserEmail(rec),
    tenant_id:
      pickString(rec.tenant_id, rec.tenantId, asRecord(rec.tenant)?.id) || undefined,
    tenant_name: pickTenantName(rec),
    duration_ms: num(rec.duration_ms ?? rec.durationMs ?? rec.latency_ms),
    raw: rec,
  };
}

export function normalizeTechIssue(
  raw: unknown,
  fallbackId?: string,
): TechIssue | null {
  // Support `{ data: issue }`, `{ issue: … }`, or bare issue objects.
  let rec = asRecord(unwrap(raw));
  if (!rec) rec = asRecord(raw);
  if (!rec) return null;
  const nested =
    asRecord(rec.issue) ??
    asRecord(rec.tech_issue) ??
    asRecord(rec.techIssue) ??
    asRecord(rec.result);
  if (nested && !pickString(rec.id, rec.issue_id, rec.issueId)) {
    rec = nested;
  }
  const id =
    pickString(rec.id, rec.issue_id, rec.issueId, fallbackId) ||
    pickString(fallbackId) ||
    '';
  if (!id) return null;
  return {
    id,
    occurred_at:
      pickString(
        rec.occurred_at,
        rec.occurredAt,
        rec.created_at,
        rec.createdAt,
        rec.timestamp,
      ) || undefined,
    created_at: pickString(rec.created_at, rec.createdAt) || undefined,
    updated_at: pickString(rec.updated_at, rec.updatedAt) || undefined,
    status: asStatus(rec.status),
    severity: asSeverity(rec.severity),
    status_code: num(rec.status_code ?? rec.statusCode ?? rec.http_status),
    method: pickString(rec.method, rec.http_method, rec.httpMethod) || undefined,
    path: pickString(rec.path, rec.url, rec.request_path, rec.requestPath) || undefined,
    message:
      pickString(rec.message, rec.error_message, rec.errorMessage, rec.title, rec.summary) ||
      undefined,
    stack: pickString(rec.stack, rec.stack_trace, rec.stackTrace) || undefined,
    screen: pickString(rec.screen, rec.route, rec.screen_name, rec.screenName) || undefined,
    principal: (pickString(rec.principal, rec.actor_type, rec.actorType) ||
      undefined) as TechLogPrincipal | undefined,
    user_id: pickString(rec.user_id, rec.userId, asRecord(rec.user)?.id) || undefined,
    user_name: pickUserName(rec),
    user_email: pickUserEmail(rec),
    tenant_id:
      pickString(rec.tenant_id, rec.tenantId, asRecord(rec.tenant)?.id) || undefined,
    tenant_name: pickTenantName(rec),
    resolution_notes:
      pickString(rec.resolution_notes, rec.resolutionNotes, rec.notes) ||
      (rec.resolution_notes === null ? null : undefined),
    raw: rec,
  };
}

export function normalizeTechActivityPage(raw: unknown): TechLogsPageResult<TechActivityRow> {
  return {
    items: asList(raw)
      .map(normalizeTechActivityRow)
      .filter((x): x is TechActivityRow => Boolean(x)),
    meta: pickMeta(raw),
  };
}

export function normalizeTechIssuesPage(raw: unknown): TechLogsPageResult<TechIssue> {
  return {
    items: asList(raw)
      .map(normalizeTechIssue)
      .filter((x): x is TechIssue => Boolean(x)),
    meta: pickMeta(raw),
  };
}

export function normalizeTechLogsSummary(raw: unknown): TechLogsSummary {
  const root = asRecord(raw) ?? {};
  const data = asRecord(unwrap(raw)) ?? root;
  const recentRaw =
    data.recent_open_issues ??
    data.recentOpenIssues ??
    data.open_issues_preview ??
    data.recent_issues ??
    data.recentIssues;
  const recent = Array.isArray(recentRaw)
    ? recentRaw
        .map(normalizeTechIssue)
        .filter((x): x is TechIssue => Boolean(x))
    : [];
  return {
    activity_count: num(
      data.activity_count ?? data.activityCount ?? data.total_activity ?? data.activities,
    ),
    issue_count: num(data.issue_count ?? data.issueCount ?? data.total_issues ?? data.issues),
    open_issues: num(data.open_issues ?? data.openIssues ?? data.open),
    in_progress_issues: num(
      data.in_progress_issues ?? data.inProgressIssues ?? data.in_progress,
    ),
    resolved_issues: num(data.resolved_issues ?? data.resolvedIssues ?? data.resolved),
    ignored_issues: num(data.ignored_issues ?? data.ignoredIssues ?? data.ignored),
    error_get_count: num(data.error_get_count ?? data.errorGetCount),
    recent_open_issues: recent,
    raw: data,
  };
}
