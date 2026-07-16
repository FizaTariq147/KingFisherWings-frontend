import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { CHEQUE_ROUTE_PREFIX } from '../api/cheque.api';
import { ChequeStatusBadge } from '../components/ChequeStatusBadge';
import { CHEQUE_STATUS_LABELS, CHEQUE_TYPE_LABELS } from '../constants/cheque.constants';
import {
  useBounceCheque,
  useCancelCheque,
  useCheque,
  useClearCheque,
  useDepositCheque,
} from '../hooks/useGlCheques';
import { chequeDisplayNumber } from '../utils/normalizeCheque';
import { getErrorMessage } from '../utils/getErrorMessage';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-neutral-400)]">{label}</dt>
      <dd className="text-sm text-[var(--color-neutral-800)] mt-0.5">{value ?? '—'}</dd>
    </div>
  );
}

function statusTone(status: string): 'emerald' | 'amber' | 'rose' | 'slate' {
  if (status === 'CLEARED') return 'emerald';
  if (status === 'BOUNCED' || status === 'CANCELLED') return 'rose';
  if (status === 'DEPOSITED') return 'amber';
  return 'slate';
}

export default function ChequeDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: cheque, isLoading, isError, error, refetch } = useCheque(id);
  const deposit = useDepositCheque(id);
  const clear = useClearCheque(id);
  const bounce = useBounceCheque(id);
  const cancel = useCancelCheque(id);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showBounce, setShowBounce] = useState(false);
  const [bounceReason, setBounceReason] = useState('');

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !cheque) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Cheque not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const isPendingStatus = cheque.status === 'PENDING';
  const isDeposited = cheque.status === 'DEPOSITED';
  const isTerminal = ['CLEARED', 'BOUNCED', 'CANCELLED'].includes(cheque.status);

  const run = async (fn: () => Promise<unknown>, successMsg?: string) => {
    setActionError(null);
    setActionMessage(null);
    setPending(true);
    try {
      await fn();
      setActionMessage(successMsg || 'Action completed.');
      setShowBounce(false);
      setBounceReason('');
      refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const headerActions = [
    ...(isPendingStatus
      ? [
          {
            label: 'Edit',
            onClick: () => navigate(`${CHEQUE_ROUTE_PREFIX}/${id}/edit`),
            variant: 'secondary' as const,
          },
          {
            label: 'Deposit',
            onClick: () => void run(() => deposit.mutateAsync(), 'Cheque marked deposited.'),
            variant: 'primary' as const,
          },
          {
            label: 'Cancel',
            onClick: () => {
              if (!window.confirm('Cancel this cheque?')) return;
              void run(() => cancel.mutateAsync(), 'Cheque cancelled.');
            },
            variant: 'secondary' as const,
          },
        ]
      : []),
    ...(isDeposited
      ? [
          {
            label: 'Clear',
            onClick: () => void run(() => clear.mutateAsync(), 'Cheque cleared.'),
            variant: 'primary' as const,
          },
          {
            label: 'Bounce',
            onClick: () => setShowBounce(true),
            variant: 'secondary' as const,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      {(actionError || actionMessage) && (
        <div
          role="status"
          className="rounded-lg border px-4 py-3 text-sm"
          style={
            actionError
              ? {
                  background: 'var(--color-danger-100)',
                  borderColor: '#FECACA',
                  color: 'var(--color-danger-700)',
                }
              : {
                  background: 'var(--color-success-100)',
                  borderColor: '#A7F3D0',
                  color: '#047857',
                }
          }
        >
          {actionError || actionMessage}
        </div>
      )}

      <DetailPageTemplate
        title={chequeDisplayNumber(cheque)}
        subtitle={`${CHEQUE_TYPE_LABELS[cheque.cheque_type]} · ${cheque.currency_code} ${cheque.amount.toLocaleString()}`}
        statusLabel={CHEQUE_STATUS_LABELS[cheque.status]}
        statusTone={statusTone(cheque.status)}
        onBack={() => navigate(CHEQUE_ROUTE_PREFIX)}
        backLabel="Cheques / PDC"
        actions={headerActions}
        actionsDisabled={pending}
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            content: (
              <div className="space-y-4">
                <ChequeStatusBadge status={cheque.status} />
                <Card>
                  <CardHeader>
                    <CardTitle>Cheque details</CardTitle>
                  </CardHeader>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-0">
                    <Field label="Cheque number" value={cheque.cheque_number} />
                    <Field label="Type" value={CHEQUE_TYPE_LABELS[cheque.cheque_type]} />
                    <Field label="Party" value={cheque.party_name || cheque.party_id} />
                    <Field
                      label="Amount"
                      value={`${cheque.currency_code} ${cheque.amount.toLocaleString()}`}
                    />
                    <Field label="Cheque date" value={cheque.cheque_date} />
                    <Field label="Due date" value={cheque.due_date} />
                    <Field label="PDC" value={cheque.is_pdc ? 'Yes' : 'No'} />
                    <Field label="Bank name" value={cheque.bank_name} />
                    <Field label="Bank account" value={cheque.bank_account_id} />
                    <Field label="Remarks" value={cheque.remarks} />
                    {cheque.bounce_reason ? (
                      <Field label="Bounce reason" value={cheque.bounce_reason} />
                    ) : null}
                    {cheque.deposited_at ? (
                      <Field label="Deposited at" value={cheque.deposited_at} />
                    ) : null}
                    {cheque.cleared_at ? (
                      <Field label="Cleared at" value={cheque.cleared_at} />
                    ) : null}
                    {cheque.bounced_at ? (
                      <Field label="Bounced at" value={cheque.bounced_at} />
                    ) : null}
                    {cheque.cancelled_at ? (
                      <Field label="Cancelled at" value={cheque.cancelled_at} />
                    ) : null}
                  </dl>
                </Card>

                {showBounce && !isTerminal && (
                  <Card className="p-4 space-y-3">
                    <CardHeader className="p-0">
                      <CardTitle>Bounce cheque</CardTitle>
                    </CardHeader>
                    <Input
                      label="Reason (optional)"
                      value={bounceReason}
                      onChange={(e) => setBounceReason(e.target.value)}
                      placeholder="Insufficient funds, signature mismatch…"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          void run(
                            () =>
                              bounce.mutateAsync(
                                bounceReason.trim() ? { reason: bounceReason.trim() } : {},
                              ),
                            'Cheque marked bounced.',
                          )
                        }
                      >
                        Confirm bounce
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowBounce(false)}
                        disabled={pending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
