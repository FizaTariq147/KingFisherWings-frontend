import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { GL_PAYMENT_ROUTE_PREFIX } from '../api/glPayment.api';
import { GlPaymentStatusBadge } from '../components/GlPaymentStatusBadge';
import { PaymentAllocationForm } from '../components/PaymentAllocationForm';
import {
  GL_PAYMENT_STATUS_LABELS,
  PAYMENT_DIRECTION_LABELS,
  PAYMENT_METHOD_LABELS,
} from '../constants/glPayment.constants';
import {
  useAddPaymentAllocation,
  useCancelGlPayment,
  useDeleteGlPayment,
  useGlPayment,
  usePostGlPayment,
  useRemovePaymentAllocation,
} from '../hooks/useGlPayments';
import { glPaymentDisplayNumber } from '../utils/normalizeGlPayment';
import { getErrorMessage } from '../utils/getErrorMessage';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-neutral-400)]">{label}</dt>
      <dd className="text-sm text-[var(--color-neutral-800)] mt-0.5">{value ?? '—'}</dd>
    </div>
  );
}

export default function GlPaymentDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: payment, isLoading, isError, error, refetch } = useGlPayment(id);
  const addAllocation = useAddPaymentAllocation(id);
  const removeAllocation = useRemovePaymentAllocation(id);
  const post = usePostGlPayment(id);
  const cancel = useCancelGlPayment(id);
  const remove = useDeleteGlPayment();
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showAllocate, setShowAllocate] = useState(false);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !payment) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Payment not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const isDraft = payment.status === 'DRAFT';
  const isPosted = payment.status === 'POSTED';
  const allocations = payment.allocations ?? [];
  const allocated = payment.allocated_amount ?? 0;
  const unallocated = payment.unallocated_amount ?? Math.max(0, payment.amount - allocated);

  const run = async (fn: () => Promise<unknown>, successMsg?: string) => {
    setActionError(null);
    setActionMessage(null);
    setPending(true);
    try {
      await fn();
      setActionMessage(successMsg || 'Action completed.');
      refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const headerActions = [
    ...(isDraft
      ? [
          {
            label: 'Edit',
            onClick: () => navigate(`${GL_PAYMENT_ROUTE_PREFIX}/${id}/edit`),
            variant: 'secondary' as const,
          },
          {
            label: 'Post',
            onClick: () => {
              if (unallocated > 0.0001) {
                setActionError(
                  'Fully allocate the payment amount to invoices before posting, or reduce the payment amount.',
                );
                return;
              }
              void run(() => post.mutateAsync(), 'Payment posted to GL.');
            },
            variant: 'primary' as const,
          },
          {
            label: 'Delete',
            onClick: () => {
              if (!window.confirm('Soft-delete this draft payment?')) return;
              void run(async () => {
                await remove.mutateAsync(id);
                navigate(GL_PAYMENT_ROUTE_PREFIX);
              });
            },
            variant: 'danger' as const,
          },
        ]
      : []),
    ...(isPosted
      ? [
          {
            label: 'Cancel',
            onClick: () => {
              if (!window.confirm('Cancel this payment? This reverses invoice balances and GL.')) {
                return;
              }
              void run(() => cancel.mutateAsync(), 'Payment cancelled.');
            },
            variant: 'danger' as const,
          },
        ]
      : []),
  ];

  return (
    <>
      {(actionError || actionMessage) && (
        <div
          role="alert"
          className="mb-3 rounded-lg border px-3 py-2 text-sm"
          style={
            actionError
              ? {
                  background: 'var(--color-danger-100)',
                  borderColor: '#FECACA',
                  color: 'var(--color-danger-700)',
                }
              : {
                  background: '#ECFDF5',
                  borderColor: '#A7F3D0',
                  color: '#047857',
                }
          }
        >
          {actionError || actionMessage}
        </div>
      )}
      <DetailPageTemplate
        title={glPaymentDisplayNumber(payment)}
        subtitle={`${PAYMENT_DIRECTION_LABELS[payment.direction]} · ${payment.payment_date || 'No date'}`}
        statusLabel={GL_PAYMENT_STATUS_LABELS[payment.status]}
        statusTone={
          payment.status === 'POSTED'
            ? 'emerald'
            : payment.status === 'CANCELLED'
              ? 'rose'
              : 'slate'
        }
        onBack={() => navigate(GL_PAYMENT_ROUTE_PREFIX)}
        backLabel="Payments (AR/AP)"
        actions={headerActions}
        actionsDisabled={pending}
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            content: (
              <div className="space-y-4">
                <GlPaymentStatusBadge status={payment.status} />
                <Card>
                  <CardHeader>
                    <CardTitle>Payment details</CardTitle>
                  </CardHeader>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-0">
                    <Field label="Direction" value={PAYMENT_DIRECTION_LABELS[payment.direction]} />
                    <Field
                      label="Method"
                      value={
                        payment.payment_method
                          ? PAYMENT_METHOD_LABELS[payment.payment_method]
                          : undefined
                      }
                    />
                    <Field label="Party" value={payment.party_name || payment.party_id} />
                    <Field
                      label="Amount"
                      value={`${payment.currency_code} ${payment.amount.toLocaleString()}`}
                    />
                    <Field label="Allocated" value={allocated.toLocaleString()} />
                    <Field label="Unallocated" value={unallocated.toLocaleString()} />
                    <Field label="Reference" value={payment.reference_number} />
                    <Field label="GL account" value={payment.gl_account_code || payment.gl_account_id} />
                    <Field label="Bank account" value={payment.bank_account_id} />
                    <Field label="Voucher" value={payment.voucher_id} />
                    <Field label="Narration" value={payment.narration} />
                    <Field label="Posted at" value={payment.posted_at} />
                    <Field label="Cancelled at" value={payment.cancelled_at} />
                    {payment.payment_method === 'CHEQUE' ? (
                      <>
                        <Field label="Cheque no" value={payment.cheque_number} />
                        <Field label="Cheque bank" value={payment.cheque_bank_name} />
                        <Field label="Cheque date" value={payment.cheque_date} />
                        <Field label="PDC" value={payment.is_pdc ? 'Yes' : 'No'} />
                      </>
                    ) : null}
                  </dl>
                </Card>
              </div>
            ),
          },
          {
            key: 'allocations',
            label: `Allocations (${allocations.length})`,
            content: (
              <div className="space-y-4">
                <Card className="overflow-hidden">
                  <Table className="min-w-[640px]">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Invoice</TableHead>
                        <TableHead>Amount</TableHead>
                        {isDraft ? <TableHead className="w-12">{' '}</TableHead> : null}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocations.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={isDraft ? 3 : 2}
                            className="text-center text-[var(--color-neutral-400)] py-8"
                          >
                            No allocations yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        allocations.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell mono>
                              {row.invoice_number || row.invoice_id.slice(0, 8)}
                            </TableCell>
                            <TableCell mono>{row.amount.toLocaleString()}</TableCell>
                            {isDraft ? (
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  disabled={pending || removeAllocation.isPending}
                                  onClick={() =>
                                    void run(
                                      () => removeAllocation.mutateAsync(row.id),
                                      'Allocation removed.',
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-[var(--color-danger-600)]" />
                                </Button>
                              </TableCell>
                            ) : null}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Card>

                {isDraft && (
                  <Card className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">Allocate to invoice</h3>
                      {!showAllocate ? (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setShowAllocate(true)}
                        >
                          Add allocation
                        </Button>
                      ) : null}
                    </div>
                    {showAllocate ? (
                      <PaymentAllocationForm
                        isSubmitting={addAllocation.isPending}
                        onCancel={() => setShowAllocate(false)}
                        onSubmit={async (values) => {
                          setActionError(null);
                          try {
                            await addAllocation.mutateAsync(values);
                            setActionMessage('Allocation added.');
                            setShowAllocate(false);
                            refetch();
                          } catch (err) {
                            setActionError(getErrorMessage(err));
                          }
                        }}
                      />
                    ) : null}
                    {unallocated > 0 ? (
                      <p className="text-xs text-[var(--color-neutral-400)]">
                        Unallocated: {payment.currency_code} {unallocated.toLocaleString()}
                      </p>
                    ) : null}
                  </Card>
                )}
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
