import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, PlugZap, RadioTower } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { useAuth } from '@/hooks/useAuth';
import { appType, erpTable, listShell } from '@/lib/erpTypography';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { resolveAuthRoleSlug } from '@/features/users/constants/userPermissions';
import {
  StatusMapEditor,
  rowsFromStatusMap,
  statusMapFromRows,
  type StatusMapRow,
} from '../components/StatusMapEditor';
import {
  useQuoteRequestConnection,
  useQuoteRequestsList,
  useQuoteRequestSyncRuns,
  useSyncQuoteRequests,
  useTestQuoteRequestConnection,
  useUpsertQuoteRequestConnection,
} from '../hooks/useAdminQuoteRequests';
import type { QuoteRequestProvider } from '../types/adminQuoteRequests.types';
import {
  canManageQuoteRequestConnection,
  canSyncQuoteRequests,
  canViewQuoteRequests,
} from '../utils/quoteRequestsPermissions';

const PAGE_SIZE = 20;

function formatWhen(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function isFeatureOffError(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 404;
}

function providerLabel(provider: QuoteRequestProvider): string {
  return provider === 'GENERIC_REST' ? 'Generic REST' : 'WordPress KFPP';
}

export default function AdminQuoteRequestsPage() {
  const auth = useAuth();
  const roleSlug = resolveAuthRoleSlug(auth.user?.role);
  const canView = canViewQuoteRequests(auth, roleSlug);
  const canManage = canManageQuoteRequestConnection(auth, roleSlug);
  const canSync = canSyncQuoteRequests(auth, roleSlug);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [runsPage, setRunsPage] = useState(1);

  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<QuoteRequestProvider>('KFPP_WP');
  const [authHeader, setAuthHeader] = useState('X-KFPP-Api-Key');
  const [isActive, setIsActive] = useState(true);
  const [statusMapRows, setStatusMapRows] = useState<StatusMapRow[]>([]);
  const [formHydrated, setFormHydrated] = useState(false);

  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connection = useQuoteRequestConnection(canView);
  const list = useQuoteRequestsList(
    {
      page,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      status: status.trim() || undefined,
    },
    canView,
  );
  const syncRuns = useQuoteRequestSyncRuns({ page: runsPage, limit: 10 }, canView);

  const upsert = useUpsertQuoteRequestConnection();
  const test = useTestQuoteRequestConnection();
  const sync = useSyncQuoteRequests();

  useEffect(() => {
    if (!connection.data || formHydrated) return;
    setBaseUrl(connection.data.base_url || '');
    setProvider(
      connection.data.provider === 'GENERIC_REST' ? 'GENERIC_REST' : 'KFPP_WP',
    );
    setAuthHeader(connection.data.auth_header_name || 'X-KFPP-Api-Key');
    setIsActive(connection.data.is_active);
    setStatusMapRows(rowsFromStatusMap(connection.data.status_map));
    setFormHydrated(true);
  }, [connection.data, formHydrated]);

  const featureOff =
    isFeatureOffError(connection.error) ||
    isFeatureOffError(list.error) ||
    isFeatureOffError(syncRuns.error);

  const connectionMissing =
    !connection.isLoading &&
    !connection.isError &&
    (!connection.data || !connection.data.configured || !connection.data.base_url);

  const rows = list.data?.items ?? [];
  const runs = syncRuns.data?.items ?? [];

  const healthLabel = useMemo(() => {
    const row = connection.data;
    if (!row) return 'Not configured';
    if (row.last_health_error) return `Needs attention — ${row.last_health_error}`;
    if (row.last_health_at) return `Healthy · ${formatWhen(row.last_health_at)}`;
    return row.is_active ? 'Active · not tested yet' : 'Inactive';
  }, [connection.data]);

  const runAction = async (label: string, fn: () => Promise<unknown>) => {
    setError(null);
    setNotice(null);
    try {
      const result = await fn();
      if (result && typeof result === 'object') {
        const record = result as Record<string, unknown>;
        const ok = record.ok;
        const message =
          typeof record.message === 'string'
            ? record.message
            : typeof record.error_summary === 'string'
              ? record.error_summary
              : null;
        if (ok === false) {
          setError(message || `${label} failed.`);
          return;
        }
        const parts = [
          label,
          typeof record.fetched === 'number' ? `${record.fetched} fetched` : null,
          typeof record.upserted === 'number' ? `${record.upserted} updated` : null,
          typeof record.failed === 'number' && record.failed > 0
            ? `${record.failed} failed`
            : null,
          message,
        ].filter(Boolean);
        setNotice(parts.join(' · '));
        return;
      }
      setNotice(`${label} completed.`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const saveConnection = async () => {
    if (!baseUrl.trim()) {
      setError('Base URL is required.');
      return;
    }
    if (!apiKey.trim()) {
      setError('Enter the website API key to save (it is write-only and never shown again).');
      return;
    }

    const incompleteMap = statusMapRows.some(
      (row) =>
        (row.remote.trim() && !row.local.trim()) ||
        (!row.remote.trim() && row.local.trim()),
    );
    if (incompleteMap) {
      setError('Each status mapping needs both a website status and a KingFisher status.');
      return;
    }

    const statusMap = statusMapFromRows(statusMapRows);

    await runAction('Connection saved', () =>
      upsert.mutateAsync({
        base_url: baseUrl.trim(),
        api_key: apiKey.trim(),
        provider,
        auth_header_name: authHeader.trim() || 'X-KFPP-Api-Key',
        is_active: isActive,
        ...(statusMap ? { status_map: statusMap } : {}),
      }),
    );
    setApiKey('');
  };

  if (!canView) {
    return (
      <div className="space-y-3">
        <PageBackLink to="/dashboard" />
        <p className="text-sm text-[var(--color-danger-600)]">
          You do not have permission to view quote-requests integration.
        </p>
      </div>
    );
  }

  return (
    <div className={listShell.page}>
      <PageBackLink to="/dashboard" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={appType.pageTitle}>Quote Requests Integration</h1>
          <p className={appType.pageSubtitle}>
            Sync website quote requests into KingFisher for Sales follow-up and freight quoting.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canSync ? (
            <Button
              type="button"
              disabled={sync.isPending || connectionMissing || featureOff}
              onClick={() => runAction('Sync', () => sync.mutateAsync())}
            >
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Sync now
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            disabled={list.isFetching}
            onClick={() => {
              void connection.refetch();
              void list.refetch();
              void syncRuns.refetch();
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      {featureOff ? (
        <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This integration is not enabled for your workspace. Ask a Super Admin to enable Quote
          requests bridge under Tenant → Features.
        </Card>
      ) : null}

      {error ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="text-sm text-emerald-700" role="status">
          {notice}
        </p>
      ) : null}

      {!featureOff && connectionMissing ? (
        <Card className="border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          Setup required: enter your website API base URL and key, save, then test the connection
          before syncing.
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="space-y-3 p-4">
          <CardHeader className="mb-0 p-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <PlugZap className="h-4 w-4" />
              Website connection
            </CardTitle>
          </CardHeader>
          {connection.isLoading ? (
            <p className="text-sm text-[var(--color-neutral-500)]">Loading connection…</p>
          ) : null}
          {connection.isError && !featureOff ? (
            <p className="text-sm text-[var(--color-danger-600)]">
              {getErrorMessage(connection.error)}
            </p>
          ) : null}
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[var(--color-neutral-400)]">Stored key</dt>
              <dd className="text-[var(--color-neutral-700)]">
                {connection.data?.api_key_prefix
                  ? `••••${connection.data.api_key_prefix}`
                  : 'Not saved yet'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-neutral-400)]">Health</dt>
              <dd className="text-[var(--color-neutral-700)]">{healthLabel}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-neutral-400)]">Last sync</dt>
              <dd className="text-[var(--color-neutral-700)]">
                {formatWhen(connection.data?.last_sync_at)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-neutral-400)]">Last website id</dt>
              <dd className="text-[var(--color-neutral-700)]">
                {connection.data?.last_external_id ||
                  connection.data?.sync_cursor ||
                  '—'}
              </dd>
            </div>
          </dl>

          {canManage ? (
            <div className="space-y-3 border-t border-[var(--color-neutral-100)] pt-3">
              <Input
                label="Base URL"
                placeholder="https://example.com/wp-json/kfpp/v1"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                disabled={featureOff}
              />
              <Input
                label="API key"
                type="password"
                autoComplete="off"
                hint={
                  connection.data?.api_key_prefix
                    ? 'Leave blank only if you are not changing the key — saving still requires re-entry to rotate.'
                    : 'Paste the website plugin API key. It is never shown again after save.'
                }
                placeholder="Website API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={featureOff}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
                    Provider
                  </span>
                  <select
                    className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
                    value={provider}
                    disabled={featureOff}
                    onChange={(e) =>
                      setProvider(e.target.value as QuoteRequestProvider)
                    }
                  >
                    <option value="KFPP_WP">{providerLabel('KFPP_WP')}</option>
                    <option value="GENERIC_REST">{providerLabel('GENERIC_REST')}</option>
                  </select>
                </label>
                <Input
                  label="Auth header name"
                  value={authHeader}
                  onChange={(e) => setAuthHeader(e.target.value)}
                  disabled={featureOff}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
                <input
                  type="checkbox"
                  checked={isActive}
                  disabled={featureOff}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Keep connection active for scheduled and manual sync
              </label>

              <StatusMapEditor
                rows={statusMapRows}
                onChange={setStatusMapRows}
                disabled={featureOff}
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={upsert.isPending || featureOff}
                  onClick={() => void saveConnection()}
                >
                  Save connection
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={test.isPending || connectionMissing || featureOff}
                  onClick={() => runAction('Connection test', () => test.mutateAsync())}
                >
                  <RadioTower className="mr-1.5 h-4 w-4" />
                  Test connection
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-neutral-500)]">
              Connection settings are read-only for your role.
            </p>
          )}
        </Card>

        <Card className="space-y-3 p-4">
          <CardHeader className="mb-0 p-0">
            <CardTitle className="text-base">Sync history</CardTitle>
          </CardHeader>
          {syncRuns.isLoading ? (
            <p className="text-sm text-[var(--color-neutral-500)]">Loading sync history…</p>
          ) : null}
          {syncRuns.isError && !featureOff ? (
            <p className="text-sm text-[var(--color-danger-600)]">
              {getErrorMessage(syncRuns.error)}
            </p>
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className={erpTable.th}>Started</th>
                  <th className={erpTable.th}>Fetched</th>
                  <th className={erpTable.th}>Updated</th>
                  <th className={erpTable.th}>Failed</th>
                  <th className={erpTable.th}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {runs.length === 0 ? (
                  <tr>
                    <td className={erpTable.td} colSpan={5}>
                      No sync runs yet.
                    </td>
                  </tr>
                ) : (
                  runs.map((run) => (
                    <tr key={run.id} className={erpTable.row}>
                      <td className={erpTable.td}>{formatWhen(run.started_at)}</td>
                      <td className={erpTable.td}>{run.fetched}</td>
                      <td className={erpTable.td}>{run.upserted}</td>
                      <td className={erpTable.td}>{run.failed}</td>
                      <td className={erpTable.td}>{run.error_summary || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-neutral-500)]">
              {syncRuns.data?.total ?? 0} run(s)
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={runsPage <= 1}
                onClick={() => setRunsPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={runsPage >= (syncRuns.data?.totalPages ?? 1)}
                onClick={() => setRunsPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card className={listShell.card}>
        <div className={listShell.header}>
          <h2 className={appType.sectionTitle}>Website quote requests</h2>
          <div className="flex flex-wrap gap-2">
            <input
              className="rounded-md border border-[var(--color-neutral-200)] px-3 py-1.5 text-sm"
              placeholder="Search name, email, or id"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              disabled={featureOff}
            />
            <input
              className="rounded-md border border-[var(--color-neutral-200)] px-3 py-1.5 text-sm"
              placeholder="Filter by status"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              disabled={featureOff}
            />
          </div>
        </div>
        {list.isLoading ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--color-neutral-500)]">
            Loading…
          </p>
        ) : null}
        {list.isError && !featureOff ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--color-danger-600)]">
            {getErrorMessage(list.error)}
          </p>
        ) : null}
        {!list.isLoading && !list.isError && !featureOff ? (
          <>
            <div className="overflow-x-auto">
              <table className={listShell.table}>
                <thead>
                  <tr>
                    <th className={erpTable.th}>Request</th>
                    <th className={erpTable.th}>Contact</th>
                    <th className={erpTable.th}>Status</th>
                    <th className={erpTable.th}>Submitted</th>
                    <th className={erpTable.th}>CRM</th>
                    <th className={erpTable.th}>Last sync</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td className={listShell.empty} colSpan={6}>
                        No quote requests yet. Save the connection and run Sync.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className={listShell.row}>
                        <td className={erpTable.td}>
                          <Link
                            className="font-medium text-[var(--color-primary,#0A2942)] underline-offset-2 hover:underline"
                            to={`/admin/integrations/quote-requests/${encodeURIComponent(row.id)}`}
                          >
                            #{row.external_id}
                          </Link>
                          {row.commodity ? (
                            <div className="text-xs text-[var(--color-neutral-500)]">
                              {row.commodity}
                            </div>
                          ) : null}
                        </td>
                        <td className={erpTable.td}>
                          <div>{row.contact_name || '—'}</div>
                          <div className="text-xs text-[var(--color-neutral-500)]">
                            {[row.contact_email, row.contact_phone].filter(Boolean).join(' · ')}
                          </div>
                        </td>
                        <td className={erpTable.td}>
                          <span className="capitalize">{row.status || '—'}</span>
                          {row.status_push_pending ? (
                            <span className="ml-1 text-xs text-amber-700">Push pending</span>
                          ) : null}
                        </td>
                        <td className={erpTable.td}>{formatWhen(row.submitted_at)}</td>
                        <td className={erpTable.td}>
                          {row.lead_id || row.enquiry_id
                            ? [
                                row.lead_id ? 'Lead' : null,
                                row.enquiry_id ? 'Enquiry' : null,
                              ]
                                .filter(Boolean)
                                .join(' + ')
                            : 'Not linked'}
                        </td>
                        <td className={erpTable.td}>
                          {row.sync_error ? (
                            <span className="text-[var(--color-danger-600)]">{row.sync_error}</span>
                          ) : (
                            formatWhen(row.last_synced_at)
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 text-sm">
              <span className="text-[var(--color-neutral-500)]">
                {list.data?.total ?? 0} request(s)
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="px-2 py-1.5">
                  Page {page} of {list.data?.totalPages ?? 1}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page >= (list.data?.totalPages ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </Card>
    </div>
  );
}
