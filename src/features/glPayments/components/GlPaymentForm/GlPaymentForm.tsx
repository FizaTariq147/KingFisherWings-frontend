import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { useChartOfAccounts } from '@/features/chartOfAccounts/hooks/useChartOfAccounts';
import { chartOfAccountDisplayLabel } from '@/features/chartOfAccounts/utils/normalizeChartOfAccount';
import { useParties } from '@/features/parties/hooks/useParties';
import { useBankAccounts } from '@/features/organization/hooks/useBankAccounts';
import {
  GL_PAYMENT_CURRENCY_OPTIONS,
  PAYMENT_DIRECTIONS,
  PAYMENT_DIRECTION_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
} from '../../constants/glPayment.constants';
import { createGlPaymentSchema, updateGlPaymentSchema } from '../../schemas/glPayment.schema';
import type {
  CreateGlPaymentFormValues,
  UpdateGlPaymentFormValues,
} from '../../types/glPayment.types';
import { GL_PAYMENT_DEMO_CREATE, GL_PAYMENT_DEMO_VENDOR } from '../../utils/glPaymentDemoData';
import { GL_PAYMENT_FORM_DEFAULTS } from '../../utils/glPaymentToFormValues';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

const checkClass = 'h-4 w-4 rounded border-[var(--color-neutral-300)]';

interface GlPaymentFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateGlPaymentFormValues>;
  onSubmit: (values: CreateGlPaymentFormValues | UpdateGlPaymentFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

export function GlPaymentForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: GlPaymentFormProps) {
  const schema = mode === 'create' ? createGlPaymentSchema : updateGlPaymentSchema;
  const { data: partiesResult } = useParties({ page: 1, limit: 200 });
  const { data: accountsData } = useChartOfAccounts({ is_active: true, is_postable: true });
  const { data: bankData } = useBankAccounts({ page: 1, limit: 100 });
  const parties = (partiesResult?.parties ?? []).filter((p) => isUuid(p.id));
  const accounts = (accountsData?.accounts ?? []).filter((a) => isUuid(a.id));
  const bankAccounts = (bankData?.accounts ?? []).filter((b) => isUuid(b.id));

  const {
    register,
    control,
    watch,
    reset,
    handleValidatedSubmit,
    formState: { errors, isSubmitted, isValid },
  } = useAppForm<CreateGlPaymentFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(schema) as Resolver<CreateGlPaymentFormValues>,
    defaultValues: { ...GL_PAYMENT_FORM_DEFAULTS, ...defaultValues },
  });

  const paymentMethod = watch('payment_method');
  const direction = watch('direction');
  const fieldError = (name: keyof CreateGlPaymentFormValues) =>
    errors[name]?.message as string | undefined;
  const showDemo = mode === 'create' && import.meta.env.DEV;

  const uuidSelect = {
    setValueAs: (v: unknown) => {
      if (v == null) return undefined;
      const s = String(v).trim();
      return s && isUuid(s) ? s : undefined;
    },
  };

  const showFormErrors = isSubmitted && !isValid;

  return (
    <form
      onSubmit={handleValidatedSubmit(async (values) => {
        await onSubmit(values);
      })}
      className="space-y-4 max-w-4xl"
      noValidate
    >
      {showFormErrors && (
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
          <CardTitle>Payment details</CardTitle>
          {showDemo && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const demo =
                  direction === 'PAYMENT' ? GL_PAYMENT_DEMO_VENDOR : GL_PAYMENT_DEMO_CREATE;
                reset({
                  ...GL_PAYMENT_FORM_DEFAULTS,
                  ...demo,
                  ...defaultValues,
                  direction: direction ?? demo.direction,
                  party_id: parties[0]?.id || demo.party_id || '',
                });
              }}
            >
              Demo data
            </Button>
          )}
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <div className="space-y-1">
            <label htmlFor="gl-payment-direction" className="text-sm font-medium text-[var(--color-neutral-700)]">
              Direction *
            </label>
            <select id="gl-payment-direction" className={selectClass} {...register('direction')}>
              {PAYMENT_DIRECTIONS.map((d) => (
                <option key={d} value={d}>
                  {PAYMENT_DIRECTION_LABELS[d]}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('direction')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="gl-payment-method" className="text-sm font-medium text-[var(--color-neutral-700)]">Method</label>
            <select id="gl-payment-method" className={selectClass} {...register('payment_method')}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('payment_method')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="gl-payment-party" className="text-sm font-medium text-[var(--color-neutral-700)]">Party *</label>
            <select id="gl-payment-party" className={selectClass} {...register('party_id', uuidSelect)}>
              <option value="">— Select party —</option>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code ? `${p.name} (${p.code})` : p.name}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('party_id')} />
          </div>
          <Input
            label="Amount *"
            type="number"
            step="0.0001"
            error={fieldError('amount')}
            {...register('amount')}
          />
          <div className="space-y-1">
            <label htmlFor="gl-payment-currency" className="text-sm font-medium text-[var(--color-neutral-700)]">
              Currency *
            </label>
            <select id="gl-payment-currency" className={selectClass} {...register('currency_code')}>
              {GL_PAYMENT_CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('currency_code')} />
          </div>
          <Input
            label="Exchange rate"
            type="number"
            step="0.00000001"
            error={fieldError('exchange_rate')}
            {...register('exchange_rate')}
          />
          <Input
            label="Payment date"
            type="date"
            error={fieldError('payment_date')}
            {...register('payment_date')}
          />
          <Input
            label="Reference number"
            error={fieldError('reference_number')}
            {...register('reference_number')}
          />
          <div className="space-y-1">
            <label htmlFor="gl-payment-bank-account" className="text-sm font-medium text-[var(--color-neutral-700)]">
              Bank account
            </label>
            <select id="gl-payment-bank-account" className={selectClass} {...register('bank_account_id', uuidSelect)}>
              <option value="">— None —</option>
              {bankAccounts.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bank_name || b.account_name || b.id.slice(0, 8)}
                  {b.account_number ? ` · ${b.account_number}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="gl-payment-gl-account" className="text-sm font-medium text-[var(--color-neutral-700)]">
              GL account
            </label>
            <select id="gl-payment-gl-account" className={selectClass} {...register('gl_account_id', uuidSelect)}>
              <option value="">— None —</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {chartOfAccountDisplayLabel(a)}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Input label="Narration" error={fieldError('narration')} {...register('narration')} />
          </div>
        </div>
      </Card>

      {paymentMethod === 'CHEQUE' && (
        <Card>
          <CardHeader>
            <CardTitle>Cheque details</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
            <Input
              label="Cheque number *"
              error={fieldError('cheque_number')}
              {...register('cheque_number')}
            />
            <Input
              label="Cheque bank"
              error={fieldError('cheque_bank_name')}
              {...register('cheque_bank_name')}
            />
            <Input
              label="Cheque date"
              type="date"
              error={fieldError('cheque_date')}
              {...register('cheque_date')}
            />
            <Input
              label="Cheque due date"
              type="date"
              error={fieldError('cheque_due_date')}
              {...register('cheque_due_date')}
            />
            <label htmlFor="gl-payment-is-pdc" className="flex items-center gap-2 text-sm sm:col-span-2">
              <Controller
                name="is_pdc"
                control={control}
                render={({ field }) => (
                  <input
                    id="gl-payment-is-pdc"
                    type="checkbox"
                    className={checkClass}
                    checked={Boolean(field.value)}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
              Post-dated cheque (PDC)
            </label>
          </div>
        </Card>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create payment' : 'Save changes'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
