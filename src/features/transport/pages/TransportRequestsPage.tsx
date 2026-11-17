import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { appType, listShell, erpTable } from '@/lib/erpTypography';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { EmptyState, ErrorState } from '@/components/erp';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { jobService } from '@/features/jobs/services/job.service';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import { isUuid } from '@/lib/isUuid';
import { transportService, type TransportRequestRow } from '../services/transport.service';

function humanizeToken(value?: string): string {
  if (!value) return '';
  return value.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}

function requestDisplayName(row: TransportRequestRow): string {
  const named =
    row.request_number ||
    row.reference ||
    (row.request_type ? `${humanizeToken(row.request_type)} request` : '');
  if (named && !isUuid(named)) return named;
  if (row.request_type) return `${humanizeToken(row.request_type)} request`;
  return 'Transport request';
}

function jobDisplayName(row: TransportRequestRow, hydrated?: string): string {
  const named = row.job_number || hydrated || '';
  if (named && !isUuid(named)) return named;
  return 'Job';
}

const COST_STORAGE_PREFIX = 'kf:transportRequestCost:';

function readSavedCost(requestId: string): string {
  try {
    return sessionStorage.getItem(`${COST_STORAGE_PREFIX}${requestId}`) ?? '';
  } catch {
    return '';
  }
}

function writeSavedCost(requestId: string, value: number) {
  try {
    sessionStorage.setItem(`${COST_STORAGE_PREFIX}${requestId}`, String(value));
  } catch {
    /* private mode / quota */
  }
}

/** Prefer API cost on the row; fall back to last amount recorded in this browser session. */
function resolveSavedCostAmount(row?: TransportRequestRow | null): string {
  if (!row?.id) return '';
  if (row.cost_amount != null && Number.isFinite(row.cost_amount)) {
    return String(row.cost_amount);
  }
  return readSavedCost(row.id);
}

/**
 * Tenant transport board — jobs passed to Transport appear here.
 * Assign trucker / pickup / transit / delivery on the request; open the linked job for
 * handoff-limited ops (containers, port token, docs).
 */
export default function TransportRequestsPage() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['transport-requests', { limit: 100 }],
    queryFn: () => transportService.list({ page: 1, limit: 100 }),
  });
  const { data: truckers = [] } = useMasterOptions('truckers', MASTER_PATHS.truckers, true);
  const [selected, setSelected] = useState<string | null>(null);
  const [truckerId, setTruckerId] = useState('');
  const [amount, setAmount] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allJobIds = useMemo(() => {
    const ids = new Set<string>();
    for (const row of list.data ?? []) {
      if (row.job_id && isUuid(row.job_id)) ids.add(row.job_id);
    }
    return [...ids].sort();
  }, [list.data]);

  const jobMetaQuery = useQuery({
    queryKey: ['transport-requests', 'job-meta', allJobIds],
    enabled: allJobIds.length > 0,
    staleTime: 60_000,
    queryFn: async () => {
      const entries = await Promise.all(
        allJobIds.map(async (id) => {
          try {
            const job = await jobService.getById(id);
            const number = String(job.job_number ?? '').trim();
            return [
              id,
              {
                job_number: number && !isUuid(number) ? number : '',
                path: jobDetailPath({ id: job.id, job_type: job.job_type }),
              },
            ] as const;
          } catch {
            return [id, { job_number: '', path: '' }] as const;
          }
        }),
      );
      return Object.fromEntries(entries) as Record<
        string,
        { job_number: string; path: string }
      >;
    },
  });

  const jobMetaById = jobMetaQuery.data ?? {};

  const truckerOptions = useMemo(
    () =>
      truckers
        .filter((t) => isUuid(String(t.id)))
        .map((t) => ({
          value: String(t.id),
          label: String(t.name ?? t.code ?? t.id),
        })),
    [truckers],
  );

  const run = useMutation({
    mutationFn: async (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => {
      setError(null);
      setMessage('Saved.');
      void qc.invalidateQueries({ queryKey: ['transport-requests'] });
    },
    onError: (err: unknown) => {
      setMessage(null);
      setError(getErrorMessage(err));
    },
  });

  const rows = useMemo(() => {
    const all = list.data ?? [];
    if (!statusFilter.trim()) return all;
    const want = statusFilter.trim().toUpperCase();
    return all.filter((row) => String(row.status ?? '').toUpperCase() === want);
  }, [list.data, statusFilter]);

  const current = rows.find((row) => row.id === selected) ?? rows[0];
  const currentId = current?.id;

  useEffect(() => {
    setAmount(resolveSavedCostAmount(current));
    setTruckerId(
      current?.trucker_id && isUuid(String(current.trucker_id))
        ? String(current.trucker_id)
        : '',
    );
    setMessage(null);
    setError(null);
  }, [currentId, current?.trucker_id, current?.cost_amount]);

  const currentJobMeta = current?.job_id ? jobMetaById[current.job_id] : undefined;
  const currentJobLabel = current
    ? jobDisplayName(current, currentJobMeta?.job_number)
    : '';
  const currentJobPath =
    currentJobMeta?.path ||
    (current?.job_id ? `/jobs/road-freight/${current.job_id}` : '');

  return (
    <div className={listShell.page}>
      <PageBackLink to="/dashboard" label="Back to dashboard" />
      <div className={listShell.card}>
        <div className={listShell.header}>
          <div className="min-w-0">
            <h2 className={appType.pageTitle}>Transport requests</h2>
            <p className="mt-1 text-[13px] text-[#64748b]">
              Jobs passed to Transport appear here. Assign trucker and stamp pickup / transit /
              delivery on the request. Open the linked job for the handoff view (containers, port
              token, documents).
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            leftIcon={<RefreshCw className={list.isFetching ? 'animate-spin' : undefined} />}
            disabled={list.isFetching}
            onClick={() => void list.refetch()}
          >
            Refresh
          </Button>
        </div>

        <div className={listShell.toolbar}>
          <label className="flex items-center gap-2 text-[13px]">
            <span className="text-[12px] font-medium text-[#64748B]">Status</span>
            <select
              className="h-8 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-2 text-[13px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="CREATED">CREATED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="PICKUP_CONFIRMED">PICKUP_CONFIRMED</option>
              <option value="IN_TRANSIT">IN_TRANSIT</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </label>
        </div>

        {error ? (
          <p className="px-4 pt-3 text-[13px] text-[var(--color-danger-600)]" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="px-4 pt-3 text-[13px] text-[var(--color-success-700)]" role="status">
            {message}
          </p>
        ) : null}

        {list.isLoading ? (
          <div className="space-y-1.5 px-3 py-4" aria-busy>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-sm bg-[#eef2f6]" />
            ))}
          </div>
        ) : list.isError ? (
          <div className="px-3 py-3">
            <ErrorState
              message={getErrorMessage(list.error) || 'Failed to load transport requests.'}
              onRetry={() => void list.refetch()}
            />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No transport requests yet"
            description="Pass a job to Transport (Pass to Transport / Department pass). It will enqueue here for trucker assignment."
          />
        ) : (
          <div className="grid gap-0 lg:grid-cols-[1.35fr_1fr]">
            <div className="overflow-x-auto border-r border-[var(--fresa-border,#E8EEF5)]">
              <table className={listShell.table}>
                <thead>
                  <tr>
                    <th className={erpTable.th}>Job</th>
                    <th className={erpTable.th}>Request</th>
                    <th className={erpTable.th}>Status</th>
                    <th className={erpTable.th}>Trucker</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const hydrated = row.job_id
                      ? jobMetaById[row.job_id]?.job_number
                      : undefined;
                    const active = current?.id === row.id;
                    return (
                      <tr
                        key={row.id}
                        className={`${erpTable.row} cursor-pointer ${
                          active ? 'bg-[var(--color-primary-50,#EFF6FF)]' : ''
                        }`}
                        onClick={() => setSelected(row.id)}
                      >
                        <td className={erpTable.td}>
                          {jobDisplayName(row, hydrated)}
                        </td>
                        <td className={erpTable.td}>{requestDisplayName(row)}</td>
                        <td className={erpTable.td}>
                          {humanizeToken(row.status) || '—'}
                        </td>
                        <td className={erpTable.td}>
                          {row.trucker_name || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {current ? (
              <div className="space-y-3 px-4 py-4 text-[13px]">
                <div>
                  <h3 className="text-[14px] font-medium text-[#1E293B]">Request actions</h3>
                  <p className="mt-0.5 text-[12px] text-[#64748B]">
                    {requestDisplayName(current)}
                    {current.request_type
                      ? ` · ${humanizeToken(current.request_type)}`
                      : ''}
                  </p>
                </div>

                {current.job_id && currentJobPath ? (
                  <div className="rounded-sm border border-sky-200 bg-sky-50 px-3 py-2 text-[13px] text-sky-900">
                    <p className="mb-1.5">
                      Linked job{' '}
                      <strong>{currentJobLabel}</strong> — open for handoff work
                      (containers, port token, documents).
                    </p>
                    <Link
                      to={currentJobPath}
                      className="inline-flex h-8 items-center rounded-sm border border-sky-300 bg-white px-3 text-[13px] font-medium text-[var(--color-primary-700)] hover:bg-sky-50"
                    >
                      Open job handoff
                    </Link>
                  </div>
                ) : null}

                <label className="block">
                  <span className="mb-1 block text-[12px] font-medium text-[#334155]">
                    Trucker
                  </span>
                  <select
                    className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-2 text-[13px]"
                    value={truckerId}
                    onChange={(e) => setTruckerId(e.target.value)}
                  >
                    <option value="">Select trucker…</option>
                    {truckerOptions.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  type="button"
                  size="sm"
                  disabled={!truckerId.trim() || run.isPending}
                  onClick={() =>
                    run.mutate(() =>
                      transportService.assign(current.id, {
                        trucker_id: truckerId.trim(),
                      }),
                    )
                  }
                >
                  Assign trucker
                </Button>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      run.mutate(() => transportService.stamp(current.id, 'pickup'))
                    }
                  >
                    Pickup
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      run.mutate(() => transportService.stamp(current.id, 'transit'))
                    }
                  >
                    In transit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      run.mutate(() =>
                        transportService.stamp(current.id, 'delivered'),
                      )
                    }
                  >
                    Delivered
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      run.mutate(() => transportService.cancel(current.id))
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      run.mutate(() => transportService.queuePdf(current.id))
                    }
                  >
                    Queue PDF
                  </Button>
                </div>

                <Input
                  label="Transport cost amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={
                    resolveSavedCostAmount(current)
                      ? undefined
                      : 'Enter cost for this request'
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={
                    !amount.trim() ||
                    run.isPending ||
                    !Number.isFinite(Number(amount))
                  }
                  onClick={() => {
                    const n = Number(amount);
                    if (!Number.isFinite(n)) return;
                    run.mutate(async () => {
                      await transportService.recordCost(current.id, { amount: n });
                      writeSavedCost(current.id, n);
                      setAmount(String(n));
                    });
                  }}
                >
                  Record transport cost
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
