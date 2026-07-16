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
import { VOUCHER_ROUTE_PREFIX } from '../api/voucher.api';
import { VoucherLineForm } from '../components/VoucherLineForm';
import { VoucherStatusBadge } from '../components/VoucherStatusBadge';
import {
  VOUCHER_STATUS_LABELS,
  VOUCHER_TYPE_LABELS,
} from '../constants/voucher.constants';
import {
  useAddVoucherLine,
  useDeleteVoucher,
  usePostVoucher,
  useRemoveVoucherLine,
  useReverseVoucher,
  useVoucher,
} from '../hooks/useVouchers';
import {
  voucherDisplayNumber,
  voucherIsBalanced,
} from '../utils/normalizeVoucher';
import { getErrorMessage } from '../utils/getErrorMessage';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-neutral-400)]">{label}</dt>
      <dd className="text-sm text-[var(--color-neutral-800)] mt-0.5">{value ?? '—'}</dd>
    </div>
  );
}

export default function VoucherDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: voucher, isLoading, isError, error, refetch } = useVoucher(id);
  const addLine = useAddVoucherLine(id);
  const removeLine = useRemoveVoucherLine(id);
  const post = usePostVoucher(id);
  const reverse = useReverseVoucher(id);
  const remove = useDeleteVoucher();
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showAddLine, setShowAddLine] = useState(false);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !voucher) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Voucher not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const isDraft = voucher.status === 'DRAFT';
  const isPosted = voucher.status === 'POSTED';
  const balanced = voucherIsBalanced(voucher);
  const lines = voucher.lines ?? [];

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
            label: 'Edit header',
            onClick: () => navigate(`${VOUCHER_ROUTE_PREFIX}/${id}/edit`),
            variant: 'secondary' as const,
          },
          {
            label: 'Post',
            onClick: () => {
              if (!balanced) {
                setActionError('Voucher must be balanced (debit = credit) before posting.');
                return;
              }
              void run(() => post.mutateAsync(), 'Voucher posted to GL.');
            },
            variant: 'primary' as const,
          },
          {
            label: 'Delete',
            onClick: () => {
              if (!window.confirm('Soft-delete this draft voucher?')) return;
              void run(async () => {
                await remove.mutateAsync(id);
                navigate(VOUCHER_ROUTE_PREFIX);
              });
            },
            variant: 'danger' as const,
          },
        ]
      : []),
    ...(isPosted
      ? [
          {
            label: 'Reverse',
            onClick: () => {
              if (!window.confirm('Create an offsetting reversal voucher?')) return;
              void run(async () => {
                const rev = await reverse.mutateAsync();
                setActionMessage('Reversal created.');
                navigate(`${VOUCHER_ROUTE_PREFIX}/${rev.id}`);
              });
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
        title={voucherDisplayNumber(voucher)}
        subtitle={`${VOUCHER_TYPE_LABELS[voucher.voucher_type]} · ${voucher.voucher_date || 'No date'}`}
        statusLabel={VOUCHER_STATUS_LABELS[voucher.status]}
        statusTone={
          voucher.status === 'POSTED'
            ? 'emerald'
            : voucher.status === 'DRAFT'
              ? 'slate'
              : voucher.status === 'CANCELLED'
                ? 'rose'
                : 'amber'
        }
        onBack={() => navigate(VOUCHER_ROUTE_PREFIX)}
        backLabel="Vouchers"
        actions={headerActions}
        actionsDisabled={pending}
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            content: (
              <div className="space-y-4">
                <VoucherStatusBadge status={voucher.status} />
                <Card>
                  <CardHeader>
                    <CardTitle>Header</CardTitle>
                  </CardHeader>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-0">
                    <Field label="Type" value={VOUCHER_TYPE_LABELS[voucher.voucher_type]} />
                    <Field label="Date" value={voucher.voucher_date} />
                    <Field label="Currency" value={voucher.currency_code} />
                    <Field label="Exchange rate" value={voucher.exchange_rate} />
                    <Field label="Reference" value={voucher.reference_number} />
                    <Field label="Party" value={voucher.party_name || voucher.party_id} />
                    <Field label="Job" value={voucher.job_id} />
                    <Field label="Invoice" value={voucher.invoice_id} />
                    <Field
                      label="Total debit"
                      value={`${voucher.currency_code || ''} ${(voucher.total_debit ?? 0).toLocaleString()}`.trim()}
                    />
                    <Field
                      label="Total credit"
                      value={`${voucher.currency_code || ''} ${(voucher.total_credit ?? 0).toLocaleString()}`.trim()}
                    />
                    <Field label="Balanced" value={balanced ? 'Yes' : 'No'} />
                    <Field label="Narration" value={voucher.narration} />
                    <Field label="Posted at" value={voucher.posted_at} />
                    <Field label="Reversed at" value={voucher.reversed_at} />
                  </dl>
                </Card>
              </div>
            ),
          },
          {
            key: 'lines',
            label: `Lines (${lines.length})`,
            content: (
              <div className="space-y-4">
                <Card className="overflow-hidden">
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Account</TableHead>
                        <TableHead>Debit</TableHead>
                        <TableHead>Credit</TableHead>
                        <TableHead>Narration</TableHead>
                        {isDraft ? <TableHead className="w-12">{' '}</TableHead> : null}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={isDraft ? 5 : 4}
                            className="text-center text-[var(--color-neutral-400)] py-8"
                          >
                            No lines yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        lines.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell>
                              <div className="font-mono text-xs">{line.account_code || line.account_id.slice(0, 8)}</div>
                              {line.account_name ? (
                                <div className="text-sm">{line.account_name}</div>
                              ) : null}
                            </TableCell>
                            <TableCell mono>{line.debit_amount.toLocaleString()}</TableCell>
                            <TableCell mono>{line.credit_amount.toLocaleString()}</TableCell>
                            <TableCell>{line.narration || '—'}</TableCell>
                            {isDraft ? (
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  disabled={pending || removeLine.isPending}
                                  onClick={() =>
                                    void run(
                                      () => removeLine.mutateAsync(line.id),
                                      'Line removed.',
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
                      {lines.length > 0 ? (
                        <TableRow className="font-semibold bg-[var(--color-neutral-50)]">
                          <TableCell>Totals</TableCell>
                          <TableCell mono>
                            {(voucher.total_debit ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell mono>
                            {(voucher.total_credit ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell colSpan={isDraft ? 2 : 1}>
                            {balanced ? 'Balanced' : 'Unbalanced'}
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </Card>

                {isDraft && (
                  <Card className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">Add line</h3>
                      {!showAddLine ? (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setShowAddLine(true)}
                        >
                          New line
                        </Button>
                      ) : null}
                    </div>
                    {showAddLine ? (
                      <VoucherLineForm
                        isSubmitting={addLine.isPending}
                        onCancel={() => setShowAddLine(false)}
                        onSubmit={async (values) => {
                          setActionError(null);
                          try {
                            await addLine.mutateAsync(values);
                            setActionMessage('Line added.');
                            setShowAddLine(false);
                            refetch();
                          } catch (err) {
                            setActionError(getErrorMessage(err));
                          }
                        }}
                      />
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
