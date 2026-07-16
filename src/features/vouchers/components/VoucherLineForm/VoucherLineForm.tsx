import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { useChartOfAccounts } from '@/features/chartOfAccounts/hooks/useChartOfAccounts';
import { chartOfAccountDisplayLabel } from '@/features/chartOfAccounts/utils/normalizeChartOfAccount';
import { createVoucherLineSchema } from '../../schemas/voucher.schema';
import type { CreateVoucherLineFormValues } from '../../types/voucher.types';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

interface VoucherLineFormProps {
  onSubmit: (values: CreateVoucherLineFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

export function VoucherLineForm({ onSubmit, isSubmitting, onCancel }: VoucherLineFormProps) {
  const { data: accountsData } = useChartOfAccounts({ is_active: true, is_postable: true });
  const accounts = (accountsData?.accounts ?? []).filter((a) => isUuid(a.id));

  const {
    register,
    handleValidatedSubmit,
    reset,
    formState: { errors },
  } = useAppForm<CreateVoucherLineFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(createVoucherLineSchema) as Resolver<CreateVoucherLineFormValues>,
    defaultValues: {
      account_id: '',
      debit_amount: 0,
      credit_amount: 0,
      currency_code: 'AED',
      exchange_rate: 1,
    },
  });

  return (
    <form
      onSubmit={handleValidatedSubmit(async (values) => {
        await onSubmit(values);
        reset({
          account_id: '',
          debit_amount: 0,
          credit_amount: 0,
          currency_code: 'AED',
          exchange_rate: 1,
        });
      })}
      className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end"
      noValidate
    >
      <div className="sm:col-span-2 space-y-1">
        <label className="text-sm font-medium text-[var(--color-neutral-700)]">Account *</label>
        <select className={selectClass} {...register('account_id')}>
          <option value="">— Select —</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {chartOfAccountDisplayLabel(a)}
            </option>
          ))}
        </select>
        <FieldError message={errors.account_id?.message as string | undefined} />
      </div>
      <Input
        label="Debit"
        type="number"
        step="0.01"
        error={errors.debit_amount?.message as string | undefined}
        {...register('debit_amount')}
      />
      <Input
        label="Credit"
        type="number"
        step="0.01"
        error={errors.credit_amount?.message as string | undefined}
        {...register('credit_amount')}
      />
      <Input
        label="Narration"
        error={errors.narration?.message as string | undefined}
        {...register('narration')}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Adding…' : 'Add'}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
