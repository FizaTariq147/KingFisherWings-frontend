import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import {
  useCcFinancialSummary,
  useCcJobActions,
  useCcLinkFreight,
} from '../hooks/useCustomsClearance';

export function CcFinancePanel({ jobId }: { jobId: string }) {
  const financial = useCcFinancialSummary(jobId);
  const link = useCcLinkFreight(jobId);
  const actions = useCcJobActions(jobId);
  const [freightId, setFreightId] = useState('');
  const [paidByClient, setPaidByClient] = useState(false);
  const [dutyNotes, setDutyNotes] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setErr(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      await Promise.all([financial.refetch(), link.refetch()]);
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const s = financial.data;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Financial summary</CardTitle>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void financial.refetch()}
          >
            Refresh
          </Button>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4 text-sm">
          {financial.isLoading ? (
            <p className="text-[var(--color-neutral-400)]">Loading…</p>
          ) : financial.isError ? (
            <p className="text-[var(--color-danger-600)]">{getErrorMessage(financial.error)}</p>
          ) : (
            <dl className="grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Duty</dt>
                <dd className="font-medium tabular-nums">
                  {s?.duty_amount != null
                    ? `${s.currency_code || ''} ${s.duty_amount}`
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Tax</dt>
                <dd className="font-medium tabular-nums">
                  {s?.tax_amount != null ? `${s.currency_code || ''} ${s.tax_amount}` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Fees</dt>
                <dd className="font-medium tabular-nums">
                  {s?.fees_amount != null ? `${s.currency_code || ''} ${s.fees_amount}` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Total</dt>
                <dd className="font-medium tabular-nums">
                  {s?.total_amount != null
                    ? `${s.currency_code || ''} ${s.total_amount}`
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Duty paid</dt>
                <dd>{s?.duty_paid ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          )}
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm sm:col-span-3">
              <input
                type="checkbox"
                checked={paidByClient}
                onChange={(e) => setPaidByClient(e.target.checked)}
              />
              Paid by client
            </label>
            <Input
              className="sm:col-span-2"
              placeholder="Duty paid notes"
              value={dutyNotes}
              onChange={(e) => setDutyNotes(e.target.value)}
            />
            <Button
              type="button"
              disabled={actions.dutyPaymentRequest.isPending}
              onClick={() =>
                void run(() => actions.dutyPaymentRequest.mutateAsync({}), 'Duty payment requested.')
              }
            >
              Duty payment request
            </Button>
          </div>
          <Button
            type="button"
            disabled={actions.stageDutyPaid.isPending}
            onClick={() =>
              void run(
                () =>
                  actions.stageDutyPaid.mutateAsync({
                    paid_by_client: paidByClient,
                    notes: dutyNotes.trim() || undefined,
                  }),
                'Duty marked paid.',
              )
            }
          >
            Stage: duty paid
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Link freight</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          {link.data?.freight_job_id ? (
            <p className="text-sm">
              Linked:{' '}
              <strong>
                {link.data.freight_job_number || link.data.freight_job_id}
              </strong>
            </p>
          ) : (
            <p className="text-sm text-[var(--color-neutral-400)]">No freight job linked.</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-[220px] flex-1"
              placeholder="Freight job UUID"
              value={freightId}
              onChange={(e) => setFreightId(e.target.value)}
            />
            <Button
              type="button"
              disabled={actions.linkFreight.isPending || !freightId.trim()}
              onClick={() =>
                void run(
                  () =>
                    actions.linkFreight.mutateAsync({ freight_job_id: freightId.trim() }),
                  'Freight linked.',
                )
              }
            >
              Link
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={actions.unlinkFreight.isPending}
              onClick={() => void run(() => actions.unlinkFreight.mutateAsync(), 'Unlinked.')}
            >
              Unlink
            </Button>
          </div>
          {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
          {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}
        </div>
      </Card>
    </div>
  );
}
