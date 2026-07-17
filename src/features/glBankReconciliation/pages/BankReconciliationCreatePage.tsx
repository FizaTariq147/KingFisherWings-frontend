import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AccountsCreatePageLayout } from '@/features/accounts/components';
import { isUuid } from '@/lib/isUuid';
import { useBankAccounts } from '@/features/organization/hooks/useBankAccounts';
import { useChartOfAccounts } from '@/features/chartOfAccounts/hooks/useChartOfAccounts';
import { BANK_RECON_ROUTE_PREFIX } from '../api/bankReconciliation.api';
import { useCreateBankReconciliation } from '../hooks/useBankReconciliation';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function BankReconciliationCreatePage() {
  const navigate = useNavigate();
  const create = useCreateBankReconciliation();
  const [error, setError] = useState<string | null>(null);
  const [glAccountId, setGlAccountId] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [statementDate, setStatementDate] = useState(new Date().toISOString().slice(0, 10));
  const [statementBalance, setStatementBalance] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [remarks, setRemarks] = useState('');
  const { data: accountsData } = useChartOfAccounts({ is_active: true, is_postable: true });
  const { data: bankData } = useBankAccounts({ page: 1, limit: 100 });

  return (
    <AccountsCreatePageLayout
      className="space-y-4 max-w-3xl"
      backLabel="Back to reconciliations"
      backTo={BANK_RECON_ROUTE_PREFIX}
      title="Start reconciliation"
      subtitle="Match a bank statement closing balance to the GL cash or bank account."
      error={error}
    >
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="br-gl-account" className="text-sm font-medium">GL account *</label>
            <select
              id="br-gl-account"
              className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={glAccountId}
              onChange={(e) => setGlAccountId(e.target.value)}
            >
              <option value="">— Select —</option>
              {(accountsData?.accounts ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_code || a.id} · {a.account_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="br-bank-account" className="text-sm font-medium">Bank account</label>
            <select
              id="br-bank-account"
              className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={bankAccountId}
              onChange={(e) => setBankAccountId(e.target.value)}
            >
              <option value="">— None —</option>
              {(bankData?.accounts ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bank_name || b.account_name || b.id}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Statement date *"
            type="date"
            value={statementDate}
            onChange={(e) => setStatementDate(e.target.value)}
          />
          <Input
            label="Statement balance *"
            type="number"
            step="0.0001"
            value={statementBalance}
            onChange={(e) => setStatementBalance(e.target.value)}
          />
          <Input
            label="Company ID (optional)"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
          />
          <Input label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            disabled={create.isPending}
            onClick={async () => {
              setError(null);
              if (!isUuid(glAccountId)) {
                setError('Valid GL account is required.');
                return;
              }
              const amount = Number(statementBalance);
              if (!Number.isFinite(amount)) {
                setError('Statement balance is required.');
                return;
              }
              try {
                const created = await create.mutateAsync({
                  gl_account_id: glAccountId,
                  bank_account_id: isUuid(bankAccountId) ? bankAccountId : undefined,
                  statement_date: statementDate,
                  statement_balance: amount,
                  company_id: isUuid(companyId) ? companyId : undefined,
                  remarks: remarks.trim() || undefined,
                });
                navigate(`${BANK_RECON_ROUTE_PREFIX}/${created.id}`);
              } catch (err) {
                setError(getErrorMessage(err));
              }
            }}
          >
            {create.isPending ? 'Saving…' : 'Create'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(BANK_RECON_ROUTE_PREFIX)}
          >
            Cancel
          </Button>
        </div>
      </Card>
    </AccountsCreatePageLayout>
  );
}
