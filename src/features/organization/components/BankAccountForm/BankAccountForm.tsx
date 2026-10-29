import { useMemo, useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateChartOfAccount } from '@/features/chartOfAccounts/hooks/useChartOfAccounts';
import {
  isBankOrCashGlAccount,
  useGlAccountSelectOptions,
} from '@/features/chartOfAccounts/hooks/useGlAccountSelectOptions';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { CURRENCY_OPTIONS } from '../../constants/organization.constants';
import { createBankAccountSchema } from '../../schemas/organization.schema';
import type { BankAccountFormValues } from '../../types/organization.types';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

const DEFAULTS: BankAccountFormValues = {
  bank_name: '',
  account_name: '',
  account_number: '',
  iban: '',
  swift_code: '',
  currency_code: 'AED',
  branch_id: '',
  gl_account_id: '',
  is_default: false,
  is_active: true,
};

interface BankAccountFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<BankAccountFormValues>;
  isSubmitting?: boolean;
  onSubmit: (values: BankAccountFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export function BankAccountForm({
  mode,
  defaultValues,
  isSubmitting,
  onSubmit,
  onCancel,
}: BankAccountFormProps) {
  const { options: allGlOptions, accounts: allGlAccounts } = useGlAccountSelectOptions(true);
  const createGl = useCreateChartOfAccount();
  const [glHelperError, setGlHelperError] = useState<string | null>(null);
  const {
    register,
    watch,
    setValue,
    handleValidatedSubmit,
    formState: { errors },
  } = useAppForm<BankAccountFormValues>({
    resolver: zodResolver(createBankAccountSchema) as Resolver<BankAccountFormValues>,
    defaultValues: { ...DEFAULTS, ...defaultValues },
  });
  const selectedGlId = watch('gl_account_id');
  const currencyCode = watch('currency_code') || 'AED';
  const glAccountOptions = useMemo(() => {
    const bankCash = allGlAccounts
      .filter((a) => isBankOrCashGlAccount(a))
      .map((a) => {
        const code = String(a.account_code ?? '').trim();
        const name = String(a.account_name ?? '').trim();
        return {
          value: a.id,
          label: code && name ? `${code} — ${name}` : code || name || a.id,
        };
      })
      .sort((x, y) => x.label.localeCompare(y.label));
    // Keep current (possibly wrong) link visible so user can see and change it.
    if (selectedGlId && isUuid(selectedGlId) && !bankCash.some((o) => o.value === selectedGlId)) {
      const current = allGlOptions.find((o) => o.value === selectedGlId);
      bankCash.unshift({
        value: selectedGlId,
        label: `${current?.label ?? selectedGlId} (not Bank/Cash — change this)`,
      });
    }
    return bankCash;
  }, [allGlAccounts, allGlOptions, selectedGlId]);

  const createDummyBankGl = async () => {
    setGlHelperError(null);
    try {
      const suffix = String(Date.now()).slice(-6);
      const created = await createGl.mutateAsync({
        account_code: `DUMBANK${suffix}`,
        account_name: 'Dummy Bank Cash',
        account_group: 'ASSETS',
        account_type: 'CURRENT_ASSET',
        account_sub_type: 'BANK',
        is_header: false,
        is_postable: true,
        is_bank_account: true,
        is_cash_account: false,
        is_active: true,
        allow_manual_entry: true,
        currency_code: currencyCode.trim().toUpperCase() || 'AED',
        notes: 'Auto-created for payment-proof approve (dummy/dev data).',
      });
      setValue('gl_account_id', created.id, { shouldDirty: true, shouldValidate: true });
    } catch (err) {
      setGlHelperError(err instanceof Error ? err.message : 'Could not create dummy Bank GL.');
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={handleValidatedSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Bank name *"
          error={errors.bank_name?.message}
          {...register('bank_name')}
        />
        <Input
          label="Account name *"
          error={errors.account_name?.message}
          {...register('account_name')}
        />
        <Input
          label="Account number *"
          error={errors.account_number?.message}
          {...register('account_number')}
        />
        <Input label="IBAN" error={errors.iban?.message} {...register('iban')} />
        <Input
          label="SWIFT / BIC"
          error={errors.swift_code?.message}
          {...register('swift_code')}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="bank-account-currency" className="text-xs font-medium text-[var(--color-neutral-600)]">Currency</label>
          <select id="bank-account-currency" className={selectClass} {...register('currency_code')}>
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label
            htmlFor="bank-account-gl"
            className="text-xs font-medium text-[var(--color-neutral-600)]"
          >
            GL bank / cash account
          </label>
          <select id="bank-account-gl" className={selectClass} {...register('gl_account_id')}>
            <option value="">
              {glAccountOptions.length
                ? 'Select Bank/Cash ledger (required for payment-proof approve)…'
                : 'No Bank/Cash GL accounts — create one under Chart of Accounts (mark as Bank)'}
            </option>
            {glAccountOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.gl_account_id?.message ? (
            <p className="text-xs text-[var(--color-danger-500)]">{errors.gl_account_id.message}</p>
          ) : (
            <p className="text-[11px] text-[var(--color-neutral-400)]">
              Dummy data is fine — link any Bank/Cash ledger (not Trade Receivables). Or create one
              below.
            </p>
          )}
          {glHelperError ? (
            <p className="text-xs text-[var(--color-danger-600)]">{glHelperError}</p>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-1 w-fit"
            disabled={createGl.isPending || isSubmitting}
            onClick={() => void createDummyBankGl()}
          >
            {createGl.isPending ? 'Creating…' : 'Create dummy Bank GL & select it'}
          </Button>
        </div>
        <Input
          label="Branch"
          hint="Optional branch reference"
          error={errors.branch_id?.message}
          {...register('branch_id')}
        />
        <div className="flex flex-col gap-3 justify-end pb-1">
          <label className="inline-flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
            <input type="checkbox" className="rounded border" {...register('is_default')} />
            Default account
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
            <input type="checkbox" className="rounded border" {...register('is_active')} />
            Active
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving…'
            : mode === 'create'
              ? 'Add bank account'
              : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
