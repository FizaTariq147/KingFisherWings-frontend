import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { transportService, type TransportRequestRow } from '../services/transport.service';

function label(row: TransportRequestRow): string {
  return String(row.reference ?? row.request_number ?? row.status ?? row.id);
}

export default function TransportRequestsPage() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['transport-requests'], queryFn: () => transportService.list() });
  const [selected, setSelected] = useState<string | null>(null);
  const [truckerId, setTruckerId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const rows = list.data ?? [];
  const current = rows.find((row) => row.id === selected) ?? rows[0];

  return (
    <div className="space-y-4">
      <PageBackLink to="/dashboard" />
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Transport requests</h2>
        <p className="text-sm text-[var(--color-neutral-500)]">
          Tenant transport board — assign trucker, pickup, transit, delivery, cost, and PDF.
        </p>
      </div>
      {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}
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
              <p className="text-sm text-[var(--color-neutral-500)]">No transport requests yet.</p>
            ) : null}
            {rows.map((row) => (
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
                <span className="font-medium">{label(row)}</span>
                <span className="ml-2 text-xs text-[var(--color-neutral-500)]">
                  {String(row.status ?? '')}
                </span>
              </button>
            ))}
          </div>
        </Card>
        {current ? (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <div className="space-y-3 px-4 pb-4">
              <p className="text-xs text-[var(--color-neutral-500)] break-all">{current.id}</p>
              <Input
                label="Trucker id"
                value={truckerId}
                onChange={(e) => setTruckerId(e.target.value)}
              />
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
                <Button type="button" variant="secondary" onClick={() => run.mutate(() => transportService.stamp(current.id, 'pickup'))}>
                  Pickup
                </Button>
                <Button type="button" variant="secondary" onClick={() => run.mutate(() => transportService.stamp(current.id, 'transit'))}>
                  In transit
                </Button>
                <Button type="button" variant="secondary" onClick={() => run.mutate(() => transportService.stamp(current.id, 'delivered'))}>
                  Delivered
                </Button>
                <Button type="button" variant="secondary" onClick={() => run.mutate(() => transportService.cancel(current.id))}>
                  Cancel
                </Button>
                <Button type="button" variant="secondary" onClick={() => run.mutate(() => transportService.queuePdf(current.id))}>
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
