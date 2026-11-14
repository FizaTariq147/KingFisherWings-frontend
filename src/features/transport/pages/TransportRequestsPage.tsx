import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { appType } from '@/lib/erpTypography';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { jobService } from '@/features/jobs/services/job.service';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
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

function listLabel(row: TransportRequestRow, hydratedJob?: string): string {
  const job = jobDisplayName(row, hydratedJob);
  const req = requestDisplayName(row);
  if (job !== 'Job') return `${job} — ${req}`;
  return req;
}

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

  const jobIdsNeedingNames = useMemo(() => {
    const ids = new Set<string>();
    for (const row of list.data ?? []) {
      if (row.job_id && isUuid(row.job_id) && !row.job_number) ids.add(row.job_id);
    }
    return [...ids].sort();
  }, [list.data]);

  const jobLabelsQuery = useQuery({
    queryKey: ['transport-requests', 'job-labels', jobIdsNeedingNames],
    enabled: jobIdsNeedingNames.length > 0,
    staleTime: 60_000,
    queryFn: async () => {
      const entries = await Promise.all(
        jobIdsNeedingNames.map(async (id) => {
          try {
            const job = await jobService.getById(id);
            const number = String(job.job_number ?? '').trim();
            return [id, number && !isUuid(number) ? number : ''] as const;
          } catch {
            return [id, ''] as const;
          }
        }),
      );
      return Object.fromEntries(entries) as Record<string, string>;
    },
  });

  const jobLabelById = jobLabelsQuery.data ?? {};

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
  const currentJobLabel = current
    ? jobDisplayName(
        current,
        current.job_id ? jobLabelById[current.job_id] : undefined,
      )
    : '';

  return (
    <div className="space-y-4">
      <PageBackLink to="/dashboard" />
      <div>
        <h2 className={appType.pageTitle}>Transport requests</h2>
        <p className="text-sm text-[var(--color-neutral-500)]">
          Tenant transport board — jobs passed to the Transport department appear here. Assign
          trucker, pickup, transit, delivery, cost, and PDF.
        </p>
      </div>
      {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}
      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
            Status
          </span>
          <select
            className="h-9 rounded-md border border-[var(--color-neutral-200)] bg-white px-2 text-sm"
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
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Requests</CardTitle>
          </CardHeader>
          <div className="space-y-1 px-4 pb-4">
            {list.isLoading ? <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p> : null}
            {list.isError ? (
              <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(list.error)}</p>
            ) : null}
            {rows.length === 0 && !list.isLoading ? (
              <p className="text-sm text-[var(--color-neutral-500)]">
                No transport requests yet. Pass a job to the Transport department (Department tab →
                Pass) to enqueue one here.
              </p>
            ) : null}
            {rows.map((row) => {
              const hydrated = row.job_id ? jobLabelById[row.job_id] : undefined;
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelected(row.id)}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                    current?.id === row.id
                      ? 'bg-[var(--color-primary-100)]'
                      : 'hover:bg-[var(--color-neutral-50)]'
                  }`}
                >
                  <span className="font-medium">{listLabel(row, hydrated)}</span>
                  <span className="ml-2 text-xs text-[var(--color-neutral-500)]">
                    {humanizeToken(row.status)}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
        {current ? (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <div className="space-y-3 px-4 pb-4">
              <div className="space-y-1 text-sm text-[var(--color-neutral-700)]">
                <p>
                  <span className="text-xs font-medium text-[var(--color-neutral-500)]">
                    Request{' '}
                  </span>
                  {requestDisplayName(current)}
                </p>
                {current.job_id ? (
                  <p>
                    <span className="text-xs font-medium text-[var(--color-neutral-500)]">
                      Job{' '}
                    </span>
                    <Link
                      to={`/jobs/${current.job_id}`}
                      className="font-medium text-[var(--color-primary-600)] hover:underline"
                    >
                      {currentJobLabel}
                    </Link>
                  </p>
                ) : null}
                {current.request_type ? (
                  <p>
                    <span className="text-xs font-medium text-[var(--color-neutral-500)]">
                      Type{' '}
                    </span>
                    {humanizeToken(current.request_type)}
                  </p>
                ) : null}
                {current.trucker_name ? (
                  <p>
                    <span className="text-xs font-medium text-[var(--color-neutral-500)]">
                      Trucker{' '}
                    </span>
                    {current.trucker_name}
                  </p>
                ) : null}
              </div>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
                  Trucker
                </span>
                <select
                  className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-2 text-sm"
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
                disabled={!truckerId.trim() || run.isPending}
                onClick={() =>
                  run.mutate(() =>
                    transportService.assign(current.id, { trucker_id: truckerId.trim() }),
                  )
                }
              >
                Assign trucker
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => run.mutate(() => transportService.stamp(current.id, 'pickup'))}
                >
                  Pickup
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => run.mutate(() => transportService.stamp(current.id, 'transit'))}
                >
                  In transit
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    run.mutate(() => transportService.stamp(current.id, 'delivered'))
                  }
                >
                  Delivered
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => run.mutate(() => transportService.cancel(current.id))}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => run.mutate(() => transportService.queuePdf(current.id))}
                >
                  Queue PDF
                </Button>
              </div>
              <Input label="Cost amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Button
                type="button"
                variant="secondary"
                disabled={!amount.trim() || run.isPending}
                onClick={() =>
                  run.mutate(() =>
                    transportService.recordCost(current.id, { amount: Number(amount) }),
                  )
                }
              >
                Record cost
              </Button>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
