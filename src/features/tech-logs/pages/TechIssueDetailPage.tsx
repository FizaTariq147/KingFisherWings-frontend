import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { appType } from '@/lib/erpTypography';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { useTechIssue, useUpdateTechIssue } from '../hooks/useTechLogs';
import type { TechIssueStatus } from '../types/techLogs.types';

const STATUSES: TechIssueStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'IGNORED'];

function formatWhen(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function TechIssueDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const issueQuery = useTechIssue(id, Boolean(id));
  const updateIssue = useUpdateTechIssue(id);
  const [status, setStatus] = useState<TechIssueStatus>('OPEN');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!issueQuery.data) return;
    setStatus(issueQuery.data.status);
    setNotes(issueQuery.data.resolution_notes ?? '');
  }, [issueQuery.data]);

  const issue = issueQuery.data;

  const save = async () => {
    setMsg(null);
    setError(null);
    try {
      await updateIssue.mutateAsync({
        status,
        resolution_notes: notes.trim() ? notes.trim() : null,
      });
      setMsg('Issue updated.');
      window.setTimeout(() => setMsg(null), 4000);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to update issue.');
    }
  };

  return (
    <div className="space-y-4">
      <PageBackLink to="/superadmin/tech-logs" label="Back to Tech Logs" />
      <div>
        <h2 className={appType.pageTitle}>Issue detail</h2>
        <p className="text-sm text-[var(--color-neutral-400)]">
          Triage status and resolution notes
        </p>
      </div>

      {issueQuery.isLoading ? (
        <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>
      ) : null}
      {issueQuery.isError ? (
        <p className="text-sm text-[var(--color-danger-700)]" role="alert">
          {getErrorMessage(issueQuery.error) || 'Failed to load issue.'}
        </p>
      ) : null}

      {issue ? (
        <>
          <Card className="p-4 space-y-3">
            <CardHeader className="p-0 mb-0 flex flex-row flex-wrap items-center gap-2">
              <CardTitle className="text-base">{issue.message || 'Issue'}</CardTitle>
              <Badge>{issue.status}</Badge>
              <Badge>{issue.severity}</Badge>
            </CardHeader>
            <dl className="grid gap-2 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-[11px] uppercase text-[var(--color-neutral-500)]">When</dt>
                <dd>{formatWhen(issue.occurred_at)}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase text-[var(--color-neutral-500)]">HTTP</dt>
                <dd>
                  {issue.method || '—'} {issue.status_code ?? ''}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase text-[var(--color-neutral-500)]">User</dt>
                <dd>
                  {issue.user_name || '—'}
                  {issue.user_email ? (
                    <span className="block text-[12px] text-[var(--color-neutral-500)]">
                      {issue.user_email}
                    </span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase text-[var(--color-neutral-500)]">Tenant</dt>
                <dd>{issue.tenant_name || issue.tenant_id || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[11px] uppercase text-[var(--color-neutral-500)]">Path</dt>
                <dd className="break-all font-mono text-[12px]">{issue.path || '—'}</dd>
              </div>
              {issue.screen ? (
                <div className="sm:col-span-2">
                  <dt className="text-[11px] uppercase text-[var(--color-neutral-500)]">Screen</dt>
                  <dd>{issue.screen}</dd>
                </div>
              ) : null}
            </dl>
            {issue.stack ? (
              <pre className="max-h-64 overflow-auto rounded-md bg-[var(--color-neutral-50)] p-3 text-[11px] text-[var(--color-neutral-700)]">
                {issue.stack}
              </pre>
            ) : null}
          </Card>

          <Card className="p-4 space-y-3">
            <CardTitle className="text-base">Triage</CardTitle>
            <label className="block space-y-1 text-xs">
              <span className="text-[var(--color-neutral-600)]">Status</span>
              <select
                className="h-9 w-full max-w-xs rounded-md border border-[var(--color-neutral-200)] bg-white px-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as TechIssueStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1 text-xs">
              <span className="text-[var(--color-neutral-600)]">Resolution notes</span>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What fixed it / why ignored"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                disabled={updateIssue.isPending}
                onClick={() => void save()}
              >
                {updateIssue.isPending ? 'Saving…' : 'Save changes'}
              </Button>
              <Link
                to="/superadmin/tech-logs"
                className="text-xs text-[var(--color-neutral-600)] underline"
              >
                Back to list
              </Link>
            </div>
            {msg ? (
              <p className="text-[13px] font-medium text-[var(--color-success-700)]">{msg}</p>
            ) : null}
            {error ? (
              <p className="text-[13px] text-[var(--color-danger-700)]" role="alert">
                {error}
              </p>
            ) : null}
          </Card>
        </>
      ) : null}
    </div>
  );
}
