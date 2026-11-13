import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Activity, RefreshCw } from 'lucide-react';
import { appType, erpTable } from '@/lib/erpTypography';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { useTenantsList } from '@/features/tenants/hooks/useTenants';
import {
  useTechLogsActivity,
  useTechLogsIssues,
  useTechLogsSummary,
} from '../hooks/useTechLogs';
import type {
  TechIssueSeverity,
  TechIssueStatus,
  TechLogPrincipal,
} from '../types/techLogs.types';

const PAGE_SIZE = 50;

type TabKey = 'activity' | 'issues';

const PRINCIPALS: TechLogPrincipal[] = [
  'USER',
  'SUPER_ADMIN',
  'PORTAL',
  'VENDOR',
  'ANONYMOUS',
  'SYSTEM',
];

const ISSUE_STATUSES: TechIssueStatus[] = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'IGNORED',
];

const SEVERITIES: TechIssueSeverity[] = ['INFO', 'WARN', 'ERROR', 'CRITICAL'];

function formatWhen(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function statusVariant(
  status: string,
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const s = status.toUpperCase();
  if (s === 'RESOLVED') return 'success';
  if (s === 'IN_PROGRESS') return 'info';
  if (s === 'IGNORED') return 'neutral';
  if (s === 'OPEN') return 'warning';
  if (s === 'CRITICAL' || s === 'ERROR') return 'danger';
  if (s === 'WARN') return 'warning';
  return 'neutral';
}

function httpTone(code?: number): string {
  if (code == null) return '';
  if (code >= 500) return 'text-[var(--color-danger-700)]';
  if (code >= 400) return 'text-amber-700';
  if (code >= 200 && code < 300) return 'text-emerald-700';
  return '';
}

export default function TechLogsPage() {
  const [tab, setTab] = useState<TabKey>('activity');
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [qDraft, setQDraft] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [principal, setPrincipal] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [issueStatus, setIssueStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [statusCode, setStatusCode] = useState('');

  const summary = useTechLogsSummary(true);
  const tenants = useTenantsList({ page: 1, limit: 200 });

  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      q: q.trim() || undefined,
      tenant_id: tenantId || undefined,
      principal: (principal || undefined) as TechLogPrincipal | undefined,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to).toISOString() : undefined,
      status: (issueStatus || undefined) as TechIssueStatus | undefined,
      severity: (severity || undefined) as TechIssueSeverity | undefined,
      status_code: statusCode.trim() ? Number(statusCode) : undefined,
    }),
    [page, q, tenantId, principal, from, to, issueStatus, severity, statusCode],
  );

  const activity = useTechLogsActivity(listParams, tab === 'activity');
  const issues = useTechLogsIssues(listParams, tab === 'issues');

  const applySearch = () => {
    setPage(1);
    setQ(qDraft.trim());
  };

  const resetFilters = () => {
    setQ('');
    setQDraft('');
    setTenantId('');
    setPrincipal('');
    setFrom('');
    setTo('');
    setIssueStatus('');
    setSeverity('');
    setStatusCode('');
    setPage(1);
  };

  const activeQuery = tab === 'activity' ? activity : issues;
  const totalPages =
    activeQuery.data?.meta?.totalPages ??
    (activeQuery.data?.meta?.total != null
      ? Math.max(1, Math.ceil(activeQuery.data.meta.total / PAGE_SIZE))
      : 1);

  const counters = [
    { label: 'Activity', value: summary.data?.activity_count },
    { label: 'Issues', value: summary.data?.issue_count },
    { label: 'Open', value: summary.data?.open_issues },
    { label: 'In progress', value: summary.data?.in_progress_issues },
    { label: 'Resolved', value: summary.data?.resolved_issues },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={appType.pageTitle}>Tech Logs</h2>
          <p className="text-sm text-[var(--color-neutral-400)]">
            Platform activity feed and error issues across tenants
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          onClick={() => {
            void summary.refetch();
            void activeQuery.refetch();
          }}
        >
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {counters.map((c) => (
          <Card key={c.label} className="p-3">
            <p className="text-[11px] uppercase tracking-wide text-[var(--color-neutral-500)]">
              {c.label}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--color-neutral-800)]">
              {summary.isLoading ? '…' : (c.value ?? '—')}
            </p>
          </Card>
        ))}
      </div>

      {summary.data?.recent_open_issues?.length ? (
        <Card className="p-4 space-y-2">
          <CardHeader className="p-0 mb-0">
            <CardTitle className="text-base">Recent open issues</CardTitle>
          </CardHeader>
          <ul className="space-y-1.5">
            {summary.data.recent_open_issues.slice(0, 5).map((issue) => (
              <li key={issue.id} className="text-sm">
                <Link
                  to={`/superadmin/tech-logs/issues/${issue.id}`}
                  className="font-medium text-[var(--fresa-header-text,#0A2942)] underline-offset-2 hover:underline"
                >
                  {issue.message || issue.path || issue.id}
                </Link>
                <span className="ml-2 text-[12px] text-[var(--color-neutral-500)]">
                  {issue.user_name || '—'} · {issue.tenant_name || '—'}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2 border-b border-[var(--color-neutral-200)] pb-2">
        <Button
          type="button"
          size="sm"
          variant={tab === 'activity' ? 'primary' : 'secondary'}
          leftIcon={<Activity className="h-3.5 w-3.5" />}
          onClick={() => {
            setTab('activity');
            setPage(1);
          }}
        >
          Activity
        </Button>
        <Button
          type="button"
          size="sm"
          variant={tab === 'issues' ? 'primary' : 'secondary'}
          leftIcon={<AlertTriangle className="h-3.5 w-3.5" />}
          onClick={() => {
            setTab('issues');
            setPage(1);
          }}
        >
          Issues
        </Button>
      </div>

      <Card className="p-4 space-y-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-xs">
            <span className="text-[var(--color-neutral-600)]">Search</span>
            <Input
              value={qDraft}
              onChange={(e) => setQDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applySearch();
              }}
              placeholder="User, email, path, message"
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-[var(--color-neutral-600)]">Tenant</span>
            <select
              className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-2 text-sm"
              value={tenantId}
              onChange={(e) => {
                setTenantId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All tenants</option>
              {(tenants.data?.tenants ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.display_name || t.code || t.id}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-[var(--color-neutral-600)]">Principal</span>
            <select
              className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-2 text-sm"
              value={principal}
              onChange={(e) => {
                setPrincipal(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All</option>
              {PRINCIPALS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          {tab === 'issues' ? (
            <label className="space-y-1 text-xs">
              <span className="text-[var(--color-neutral-600)]">Status</span>
              <select
                className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-2 text-sm"
                value={issueStatus}
                onChange={(e) => {
                  setIssueStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {ISSUE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="space-y-1 text-xs">
              <span className="text-[var(--color-neutral-600)]">From</span>
              <Input
                type="datetime-local"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
              />
            </label>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {tab === 'issues' ? (
            <>
              <label className="space-y-1 text-xs">
                <span className="text-[var(--color-neutral-600)]">Severity</span>
                <select
                  className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-2 text-sm"
                  value={severity}
                  onChange={(e) => {
                    setSeverity(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All</option>
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs">
                <span className="text-[var(--color-neutral-600)]">HTTP status</span>
                <Input
                  value={statusCode}
                  onChange={(e) => {
                    setStatusCode(e.target.value);
                    setPage(1);
                  }}
                  placeholder="e.g. 500"
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="text-[var(--color-neutral-600)]">From</span>
                <Input
                  type="datetime-local"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setPage(1);
                  }}
                />
              </label>
            </>
          ) : null}
          <label className="space-y-1 text-xs">
            <span className="text-[var(--color-neutral-600)]">To</span>
            <Input
              type="datetime-local"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <div className="flex items-end gap-2">
            <Button type="button" size="sm" onClick={applySearch}>
              Apply
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {activeQuery.isError ? (
        <p className="text-sm text-[var(--color-danger-700)]" role="alert">
          {getErrorMessage(activeQuery.error) || 'Failed to load tech logs.'}
        </p>
      ) : null}

      {tab === 'activity' ? (
        <div className="overflow-x-auto rounded-md border border-[var(--color-neutral-200)]">
          <table className="w-full min-w-[56rem] border-collapse text-left">
            <thead>
              <tr>
                <th className={erpTable.th}>When</th>
                <th className={erpTable.th}>User</th>
                <th className={erpTable.th}>Tenant</th>
                <th className={erpTable.th}>Method</th>
                <th className={erpTable.th}>Path</th>
                <th className={erpTable.th}>Status</th>
                <th className={erpTable.th}>Principal</th>
              </tr>
            </thead>
            <tbody>
              {activity.isLoading ? (
                <tr>
                  <td className={erpTable.td} colSpan={7}>
                    Loading activity…
                  </td>
                </tr>
              ) : (activity.data?.items ?? []).length === 0 ? (
                <tr>
                  <td className={erpTable.td} colSpan={7}>
                    No activity for these filters.
                  </td>
                </tr>
              ) : (
                (activity.data?.items ?? []).map((row) => (
                  <tr key={row.id} className={erpTable.row}>
                    <td className={erpTable.td}>{formatWhen(row.occurred_at)}</td>
                    <td className={erpTable.td}>
                      <div className="font-medium">{row.user_name || '—'}</div>
                      <div className="text-[11px] text-[var(--color-neutral-500)]">
                        {row.user_email || row.user_id || ''}
                      </div>
                    </td>
                    <td className={erpTable.td}>{row.tenant_name || row.tenant_id || '—'}</td>
                    <td className={`${erpTable.td} font-mono text-[12px]`}>
                      {row.method || '—'}
                    </td>
                    <td className={`${erpTable.td} max-w-[18rem] truncate`} title={row.path}>
                      {row.path || '—'}
                    </td>
                    <td className={`${erpTable.td} tabular-nums ${httpTone(row.status_code)}`}>
                      {row.status_code ?? '—'}
                    </td>
                    <td className={erpTable.td}>{row.principal || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-[var(--color-neutral-200)]">
          <table className="w-full min-w-[64rem] border-collapse text-left">
            <thead>
              <tr>
                <th className={erpTable.th}>When</th>
                <th className={erpTable.th}>Status</th>
                <th className={erpTable.th}>Severity</th>
                <th className={erpTable.th}>User</th>
                <th className={erpTable.th}>Tenant</th>
                <th className={erpTable.th}>Message</th>
                <th className={erpTable.th}>Path</th>
                <th className={erpTable.th} />
              </tr>
            </thead>
            <tbody>
              {issues.isLoading ? (
                <tr>
                  <td className={erpTable.td} colSpan={8}>
                    Loading issues…
                  </td>
                </tr>
              ) : (issues.data?.items ?? []).length === 0 ? (
                <tr>
                  <td className={erpTable.td} colSpan={8}>
                    No issues for these filters.
                  </td>
                </tr>
              ) : (
                (issues.data?.items ?? []).map((row) => (
                  <tr key={row.id} className={erpTable.row}>
                    <td className={erpTable.td}>{formatWhen(row.occurred_at)}</td>
                    <td className={erpTable.td}>
                      <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                    </td>
                    <td className={erpTable.td}>
                      <Badge variant={statusVariant(row.severity)}>{row.severity}</Badge>
                    </td>
                    <td className={erpTable.td}>
                      <div className="font-medium">{row.user_name || '—'}</div>
                      <div className="text-[11px] text-[var(--color-neutral-500)]">
                        {row.user_email || row.user_id || ''}
                      </div>
                    </td>
                    <td className={erpTable.td}>{row.tenant_name || row.tenant_id || '—'}</td>
                    <td className={`${erpTable.td} max-w-[16rem] truncate`} title={row.message}>
                      {row.message || '—'}
                    </td>
                    <td className={`${erpTable.td} max-w-[12rem] truncate`} title={row.path}>
                      {row.path || '—'}
                    </td>
                    <td className={erpTable.td}>
                      <Link
                        to={`/superadmin/tech-logs/issues/${row.id}`}
                        className="text-xs font-medium text-[var(--fresa-header-text,#0A2942)] underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[var(--color-neutral-500)]">
          Page {page}
          {activeQuery.data?.meta?.total != null
            ? ` · ${activeQuery.data.meta.total} total`
            : ''}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
