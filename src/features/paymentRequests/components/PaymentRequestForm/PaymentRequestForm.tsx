import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { useParties } from '@/features/parties/hooks/useParties';
import { loadPartyCurrencyOptions } from '@/features/parties/utils/partyCurrencyOptions';
import { useInvoices } from '@/features/invoices/hooks/useInvoices';
import { invoiceDisplayNumber } from '@/features/invoices/utils/normalizeInvoice';
import {
  createPaymentRequestSchema,
  updatePaymentRequestSchema,
} from '../../schemas/paymentRequest.schema';
import type {
  CreatePaymentRequestFormValues,
  UpdatePaymentRequestFormValues,
} from '../../types/paymentRequest.types';
import { buildPaymentRequestDemoValues } from '../../utils/paymentRequestDemoData';
import { PAYMENT_REQUEST_FORM_DEFAULTS } from '../../utils/paymentRequestToFormValues';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

interface PaymentRequestFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreatePaymentRequestFormValues>;
  onSubmit: (
    values: CreatePaymentRequestFormValues | UpdatePaymentRequestFormValues,
  ) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

export function PaymentRequestForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: PaymentRequestFormProps) {
  const schema = mode === 'create' ? createPaymentRequestSchema : updatePaymentRequestSchema;
  const { data: partiesResult } = useParties({ page: 1, limit: 200, order: 'asc' });
  const { data: invoicesResult } = useInvoices({ page: 1, limit: 100 });
  const { data: currencies = [] } = useQuery({
    queryKey: ['tenant', 'payment-requests', 'currency-options'],
    queryFn: loadPartyCurrencyOptions,
    staleTime: 60_000,
  });

  const parties = (partiesResult?.parties ?? []).filter((p) => isUuid(p.id));
  const invoices = (invoicesResult?.invoices ?? []).filter((inv) => isUuid(inv.id));

  const {
    register,
    handleValidatedSubmit,
    reset,
    applyApiErrors,
    formState: { errors, isSubmitted, isValid },
  } = useAppForm<CreatePaymentRequestFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(schema) as Resolver<CreatePaymentRequestFormValues>,
    defaultValues: { ...PAYMENT_REQUEST_FORM_DEFAULTS, ...defaultValues },
  });

  const fieldError = (name: keyof CreatePaymentRequestFormValues) =>
    errors[name]?.message as string | undefined;

  const uuidSelect = {
    setValueAs: (v: unknown) => {
      if (v == null) return undefined;
      const s = String(v).trim();
      return s && isUuid(s) ? s : undefined;
    },
  };

  const fillDemo = () => {
    const partyId = parties[0]?.id;
    if (!partyId) return;
    reset(
      buildPaymentRequestDemoValues({
        partyId,
        currencyCode: String(currencies[0]?.value ?? 'AED'),
        invoiceId: invoices[0]?.id,
      }),
    );
  };

  return (
    <form
      onSubmit={handleValidatedSubmit(async (values) => {
        try {
          await onSubmit(values);
        } catch (err) {
          applyApiErrors(err);
          throw err;
        }
      })}
      className="space-y-4 max-w-3xl"
      noValidate
    >
      {isSubmitted && !isValid && (
        <div
          role="alert"
          className="rounded-lg border px-3 py-2 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          Please fix the highlighted fields before saving.
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Payment request</CardTitle>
          {mode === 'create' && (
            <Button type="button" variant="secondary" onClick={fillDemo} disabled={!parties[0]}>
              Demo data
            </Button>
          )}
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">Party *</label>
            <select className={selectClass} {...register('party_id', uuidSelect)}>
              <option value="">Select…</option>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code ? `${p.name} (${p.code})` : p.name}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('party_id')} />
          </div>
          <div className="space-y-1">
            <Input
              label="Amount *"
              type="number"
              step="any"
              min={0.01}
              {...register('amount', {
                setValueAs: (v) => {
                  if (v === '' || v == null) return undefined;
                  const n = Number(v);
                  return Number.isFinite(n) ? n : undefined;
                },
              })}
            />
            <FieldError message={fieldError('amount')} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Currency *
            </label>
            <select className={selectClass} {...register('currency_code')}>
              {(currencies.length ? currencies : [{ value: 'AED', label: 'AED' }]).map((c) => (
                <option key={String(c.value)} value={String(c.value)}>
                  {String(c.label ?? c.value)}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('currency_code')} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">Invoice</label>
            <select className={selectClass} {...register('invoice_id', uuidSelect)}>
              <option value="">—</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {invoiceDisplayNumber(inv)}
                  {inv.party_name ? ` — ${inv.party_name}` : ''}
                </option>
              ))}
            </select>
          </div>
          <Input label="Job ID" placeholder="UUID" {...register('job_id', uuidSelect)} />
          <Input label="Due date" type="date" {...register('due_date')} />
          <div className="space-y-1 sm:col-span-2">
            <Input label="Remarks" {...register('remarks')} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
