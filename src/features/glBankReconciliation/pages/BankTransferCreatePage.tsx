import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AccountsCreatePageLayout } from '@/features/accounts/components';
import {
  useGlAccountSelectOptions,
} from '@/features/chartOfAccounts/hooks/useGlAccountSelectOptions';
import { useTenantCompanies } from '@/features/users/hooks/useTenantCompanies';
import { isUuid } from '@/lib/isUuid';
import { BANK_RECON_ROUTE_PREFIX } from '../api/bankReconciliation.api';
import { useCreateBankTransfer } from '../hooks/useBankReconciliation';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function BankTransferCreatePage() {
  const navigate = useNavigate();
  const create = useCreateBankTransfer();
  const [error, setError] = useState<string | null>(null);
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [currencyCode, setCurrencyCode] = useState('AED');
  const [exchangeRate, setExchangeRate] = useState('1');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().slice(0, 10));
  const [narration, setNarration] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [companyId, setCompanyId] = useState('');
  const { options: accountOptions } = useGlAccountSelectOptions(true, undefined, true);
  const { data: companies = [] } = useTenantCompanies(true);

  return (
    <AccountsCreatePageLayout
      className="space-y-4 max-w-3xl"
      backLabel="Back to bank reconciliation"
      backTo={BANK_RECON_ROUTE_PREFIX}
      title="New bank transfer"
      subtitle="Move funds between GL bank or cash accounts and record the transfer."
      error={error}
    >
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-[var(--color-neutral-700)]">From account *</span>
            <select
              className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
            >
              <option value="">Select account…</option>
              {accountOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-[var(--color-neutral-700)]">To account *</span>
            <select
              className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
            >
              <option value="">Select account…</option>
              {accountOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Amount *"
            type="number"
            step="0.0001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            label="Currency *"
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
          />
          <Input
            label="Exchange rate"
            type="number"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
          />
          <Input
            label="Transfer date"
            type="date"
            value={transferDate}
            onChange={(e) => setTransferDate(e.target.value)}
          />
          <Input
            label="Reference number"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
          <label className="space-y-1 text-sm">
            <span className="font-medium text-[var(--color-neutral-700)]">Company</span>
            <select
              className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            >
              <option value="">Select company…</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code ? `${c.name} (${c.code})` : c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <Input
              label="Narration"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            disabled={create.isPending}
            onClick={async () => {
              setError(null);
              if (!isUuid(fromAccountId) || !isUuid(toAccountId)) {
                setError('Select valid from and to accounts.');
                return;
              }
              const parsedAmount = Number(amount);
              if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
                setError('Amount must be greater than zero.');
                return;
              }
              try {
                await create.mutateAsync({
                  from_account_id: fromAccountId.trim(),
                  to_account_id: toAccountId.trim(),
                  amount: parsedAmount,
                  currency_code: currencyCode.trim().toUpperCase(),
                  exchange_rate: exchangeRate.trim() ? Number(exchangeRate) : undefined,
                  transfer_date: transferDate.trim() || undefined,
                  narration: narration.trim() || undefined,
                  reference_number: referenceNumber.trim() || undefined,
                  company_id: isUuid(companyId) ? companyId : undefined,
                });
                navigate(BANK_RECON_ROUTE_PREFIX);
              } catch (e) {
                setError(getErrorMessage(e));
              }
            }}
          >
            {create.isPending ? 'Creating…' : 'Create transfer'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(BANK_RECON_ROUTE_PREFIX)}>
            Cancel
          </Button>
        </div>
      </Card>
    </AccountsCreatePageLayout>
  );
}
