import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  const {
    register,
    handleValidatedSubmit,
    formState: { errors },
  } = useAppForm<BankAccountFormValues>({
    resolver: zodResolver(createBankAccountSchema) as Resolver<BankAccountFormValues>,
    defaultValues: { ...DEFAULTS, ...defaultValues },
  });

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
          <label className="text-xs font-medium text-[var(--color-neutral-600)]">Currency</label>
          <select className={selectClass} {...register('currency_code')}>
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Branch id (UUID)"
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
