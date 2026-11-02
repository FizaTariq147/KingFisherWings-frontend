import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PartySearchSelect } from '@/features/shared/entity-search';
import { loadPartyCurrencyOptions } from '@/features/parties/utils/partyCurrencyOptions';
import { arApAgingService } from '../services/arApAging.service';
import type { OpeningBalanceResult } from '../types/openingBalance.types';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

export function PartyOpeningBalanceModal({
  open,
  onClose,
  kind,
  defaultPartyId = '',
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  kind: 'ar' | 'ap';
  defaultPartyId?: string;
  onSuccess?: (result: OpeningBalanceResult) => void;
}) {
  const [partyId, setPartyId] = useState(defaultPartyId);
  const [amount, setAmount] = useState('');
  const [currencyCode, setCurrencyCode] = useState('AED');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [createInvoice, setCreateInvoice] = useState(true);
  const [linkCoa, setLinkCoa] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OpeningBalanceResult | null>(null);

  const { data: currencies = [] } = useQuery({
    queryKey: ['tenant', 'parties', 'currency-options'],
    queryFn: loadPartyCurrencyOptions,
    staleTime: 60_000,
    enabled: open,
  });

  useEffect(() => {
    if (!open || currencies.length === 0) return;
    if (!currencies.some((c) => c.value === currencyCode)) {
      setCurrencyCode(currencies[0]?.value || 'AED');
    }
  }, [open, currencies, currencyCode]);

  const mutation = useMutation({
    mutationFn: () => {
      const n = Number(amount);
      const code = currencyCode.trim().toUpperCase();
      if (!partyId.trim()) throw new Error('Select a party.');
      if (!Number.isFinite(n) || n === 0) throw new Error('Enter a non-zero amount.');
      if (!date.trim()) throw new Error('Enter a transaction date.');
      if (code.length < 3) throw new Error('Select a currency.');
      const dto = {
        party_id: partyId.trim(),
        amount: n,
        currency_code: code,
        date: date.trim(),
        create_manual_invoice: createInvoice,
        ...(linkCoa.trim() ? { link_coa: linkCoa.trim() } : {}),
        ...(remarks.trim() ? { remarks: remarks.trim() } : {}),
      };
      return kind === 'ar'
        ? arApAgingService.postArOpeningBalance(dto)
        : arApAgingService.postApOpeningBalance(dto);
    },
  });

  if (!open) return null;

  const title = kind === 'ar' ? 'AR opening balance' : 'AP opening balance';
  const partyLabel = kind === 'ar' ? 'Customer' : 'Vendor';

  return (
    <Modal
      open
      onClose={() => {
        if (!mutation.isPending) onClose();
      }}
      title={title}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            type="button"
            size="sm"
            variant="create"
            disabled={mutation.isPending}
            onClick={() => {
              setError(null);
              setResult(null);
              void mutation
                .mutateAsync()
                .then((res) => {
                  setResult(res);
                  onSuccess?.(res);
                })
                .catch((err) => setError(getErrorMessage(err)));
            }}
          >
            {mutation.isPending ? 'Posting…' : 'Post opening balance'}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-[12px] text-[var(--color-neutral-500)]">
          Posts via{' '}
          <code className="text-[10px]">
            POST /gl/{kind}/opening-balance
          </code>
          . Manual invoice (default) creates a posted{' '}
          {kind === 'ar' ? 'Customer Invoice' : 'Purchase Invoice'}; otherwise an OPENING_BALANCE
          voucher is posted.
        </p>
        {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
        {result ? (
          <p className="rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {result.message || 'Opening balance posted.'}
            {result.invoice_number ? ` Invoice ${result.invoice_number}.` : ''}
            {result.voucher_number ? ` Voucher ${result.voucher_number}.` : ''}
          </p>
        ) : null}
        <PartySearchSelect
          name={`${kind}_opening_party`}
          label={partyLabel}
          value={partyId}
          onChange={setPartyId}
          partyType={kind === 'ar' ? 'CUSTOMER' : 'VENDOR'}
          required
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Input
            label="Amount *"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <label className="space-y-1 text-xs font-medium text-[var(--color-neutral-500)]">
            Currency *
            <select
              className={selectClass}
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              required
            >
              {currencies.length === 0 ? <option value="AED">AED</option> : null}
              {currencies.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Date *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <label className="flex items-start gap-2 text-[13px]">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={createInvoice}
            onChange={(e) => setCreateInvoice(e.target.checked)}
          />
          <span>Create manual invoice (posted, job_id null)</span>
        </label>
        <Input
          label="Link CoA (optional)"
          value={linkCoa}
          onChange={(e) => setLinkCoa(e.target.value)}
          placeholder="Control account id or code if supported"
        />
        <Input
          label="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>
    </Modal>
  );
}
