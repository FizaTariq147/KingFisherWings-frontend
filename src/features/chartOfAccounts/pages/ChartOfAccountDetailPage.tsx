import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { CHART_OF_ACCOUNT_ROUTE_PREFIX } from '../api/chartOfAccount.api';
import {
  ACCOUNT_GROUP_LABELS,
  ACCOUNT_TYPE_LABELS,
} from '../constants/chartOfAccount.constants';
import {
  useAccountLedger,
  useChartOfAccount,
  useDeleteChartOfAccount,
} from '../hooks/useChartOfAccounts';
import { chartOfAccountDisplayLabel } from '../utils/normalizeChartOfAccount';
import { getErrorMessage } from '../utils/getErrorMessage';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-neutral-400)]">{label}</dt>
      <dd className="text-sm text-[var(--color-neutral-800)] mt-0.5">{value ?? '—'}</dd>
    </div>
  );
}

export default function ChartOfAccountDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: account, isLoading, isError, error, refetch } = useChartOfAccount(id);
  const remove = useDeleteChartOfAccount();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const ledgerParams = {
    from_date: fromDate.trim() || undefined,
    to_date: toDate.trim() || undefined,
  };
  const {
    data: ledger,
    isLoading: ledgerLoading,
    isFetching: ledgerFetching,
    refetch: refetchLedger,
  } = useAccountLedger(id, ledgerParams, Boolean(account));

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !account) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Account not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const active = account.is_active !== false;

  const onDelete = async () => {
    setActionError(null);
    setPending(true);
    try {
      await remove.mutateAsync(id);
      navigate(CHART_OF_ACCOUNT_ROUTE_PREFIX);
    } catch (err) {
      setActionError(getErrorMessage(err));
      setConfirmDelete(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {actionError && (
        <div
          role="alert"
          className="mb-3 rounded-lg border px-3 py-2 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {actionError}
        </div>
      )}
      <DetailPageTemplate
        title={chartOfAccountDisplayLabel(account)}
        subtitle={`${ACCOUNT_GROUP_LABELS[account.account_group]} · ${ACCOUNT_TYPE_LABELS[account.account_type]}`}
        statusLabel={active ? 'Active' : 'Inactive'}
        statusTone={active ? 'emerald' : 'slate'}
        onBack={() => navigate(CHART_OF_ACCOUNT_ROUTE_PREFIX)}
        backLabel="Chart of Accounts"
        actionsDisabled={pending}
        actions={[
          {
            label: 'Edit',
            onClick: () => navigate(`${CHART_OF_ACCOUNT_ROUTE_PREFIX}/${id}/edit`),
            variant: 'secondary',
          },
          {
            label: confirmDelete ? 'Confirm delete' : 'Delete',
            onClick: () => {
              if (!confirmDelete) {
                setConfirmDelete(true);
                return;
              }
              void onDelete();
            },
            variant: 'danger',
          },
        ]}
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Account details</CardTitle>
                </CardHeader>
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-0">
                  <Field label="Code" value={account.account_code} />
                  <Field label="Name" value={account.account_name} />
                  <Field label="Name (AR)" value={account.account_name_ar} />
                  <Field label="Sub type" value={account.account_sub_type} />
                  <Field label="Currency" value={account.currency_code} />
                  <Field
                    label="Opening balance"
                    value={`${account.opening_balance ?? 0} ${account.opening_balance_type ?? ''}`.trim()}
                  />
                  <Field label="Parent" value={account.parent_code || account.parent_id} />
                  <Field label="Sort order" value={account.sort_order} />
                  <Field
                    label="Flags"
                    value={[
                      account.is_header ? 'Header' : null,
                      account.is_postable !== false ? 'Postable' : 'Non-postable',
                      account.is_bank_account ? 'Bank' : null,
                      account.is_cash_account ? 'Cash' : null,
                      account.allow_manual_entry !== false ? 'Manual entry' : null,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  />
                  <Field label="Notes" value={account.notes} />
                  <Field label="Created" value={account.created_at} />
                  <Field label="Updated" value={account.updated_at} />
                </dl>
              </Card>
            ),
          },
          {
            key: 'ledger',
            label: 'Ledger',
            content: (
              <Card className="p-4 space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">
                      Account ledger
                    </h3>
                    <p className="text-xs text-[var(--color-neutral-400)]">
                      Posted voucher lines (GET /gl/accounts/{'{id}'}/ledger).
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-end">
                    <Input
                      label="From"
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                    <Input
                      label="To"
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => refetchLedger()}
                      disabled={ledgerFetching}
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
                {ledgerLoading ? (
                  <p className="text-sm text-[var(--color-neutral-400)] py-6 text-center">
                    Loading ledger…
                  </p>
                ) : (
                  <Table className="min-w-[720px]">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Date</TableHead>
                        <TableHead>Voucher</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Debit</TableHead>
                        <TableHead>Credit</TableHead>
                        <TableHead>Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(ledger?.lines ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-[var(--color-neutral-400)] py-8"
                          >
                            No ledger lines
                          </TableCell>
                        </TableRow>
                      ) : (
                        (ledger?.lines ?? []).map((line, idx) => (
                          <TableRow key={line.id || `${line.voucher_id}-${idx}`}>
                            <TableCell>{line.voucher_date || '—'}</TableCell>
                            <TableCell mono>
                              {line.voucher_number || line.voucher_id || '—'}
                            </TableCell>
                            <TableCell>{line.description || '—'}</TableCell>
                            <TableCell mono>
                              {Number(line.debit ?? 0).toLocaleString()}
                            </TableCell>
                            <TableCell mono>
                              {Number(line.credit ?? 0).toLocaleString()}
                            </TableCell>
                            <TableCell mono>
                              {Number(line.balance ?? 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </Card>
            ),
          },
        ]}
      />
    </>
  );
}
