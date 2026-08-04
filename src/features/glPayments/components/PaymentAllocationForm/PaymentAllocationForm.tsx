import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { useInvoices } from '@/features/invoices/hooks/useInvoices';
import { invoiceDisplayNumber } from '@/features/invoices/utils/normalizeInvoice';
import { paymentAllocationInputSchema } from '../../schemas/glPayment.schema';
import type { PaymentAllocationInputFormValues } from '../../types/glPayment.types';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

interface PaymentAllocationFormProps {
  onSubmit: (values: PaymentAllocationInputFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

export function PaymentAllocationForm({
  onSubmit,
  isSubmitting,
  onCancel,
}: PaymentAllocationFormProps) {
  const { data: invoicesResult } = useInvoices({ page: 1, limit: 100 });
  const invoices = (invoicesResult?.invoices ?? []).filter((inv) => isUuid(inv.id));

  const {
    register,
    handleValidatedSubmit,
    reset,
    formState: { errors },
  } = useAppForm<PaymentAllocationInputFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(paymentAllocationInputSchema) as Resolver<PaymentAllocationInputFormValues>,
    defaultValues: { invoice_id: '', amount: 0 },
  });

  const uuidSelect = {
    setValueAs: (v: unknown) => {
      if (v == null) return undefined;
      const s = String(v).trim();
      return s && isUuid(s) ? s : undefined;
    },
  };

  return (
    <form
      onSubmit={handleValidatedSubmit(async (values) => {
        await onSubmit(values);
        reset({ invoice_id: '', amount: 0 });
      })}
      className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
      noValidate
    >
      <div className="sm:col-span-2 space-y-1">
        <label htmlFor="payment-alloc-invoice" className="text-sm font-medium text-[var(--color-neutral-700)]">Invoice *</label>
        <select id="payment-alloc-invoice" className={selectClass} {...register('invoice_id', uuidSelect)}>
          <option value="">— Select invoice —</option>
          {invoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {invoiceDisplayNumber(inv)}
              {inv.party_name ? ` · ${inv.party_name}` : ''}
            </option>
          ))}
        </select>
        <FieldError message={errors.invoice_id?.message as string | undefined} />
      </div>
      <Input
        label="Amount *"
        type="number"
        step="0.0001"
        error={errors.amount?.message as string | undefined}
        {...register('amount')}
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Adding…' : 'Allocate'}
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
