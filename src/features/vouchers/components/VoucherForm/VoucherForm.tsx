import { type Resolver, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { useChartOfAccounts } from '@/features/chartOfAccounts/hooks/useChartOfAccounts';
import { chartOfAccountDisplayLabel } from '@/features/chartOfAccounts/utils/normalizeChartOfAccount';
import { useParties } from '@/features/parties/hooks/useParties';
import {
  VOUCHER_CURRENCY_OPTIONS,
  VOUCHER_TYPES,
  VOUCHER_TYPE_LABELS,
} from '../../constants/voucher.constants';
import { createVoucherSchema, updateVoucherSchema } from '../../schemas/voucher.schema';
import type {
  CreateVoucherFormValues,
  UpdateVoucherFormValues,
} from '../../types/voucher.types';
import { VOUCHER_FORM_DEFAULTS } from '../../utils/voucherToFormValues';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

interface VoucherFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateVoucherFormValues>;
  onSubmit: (values: CreateVoucherFormValues | UpdateVoucherFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

export function VoucherForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: VoucherFormProps) {
  const schema = mode === 'create' ? createVoucherSchema : updateVoucherSchema;
  const { data: accountsData } = useChartOfAccounts({ is_active: true, is_postable: true });
  const { data: partiesResult } = useParties({ page: 1, limit: 200, order: 'asc' });
  const accounts = (accountsData?.accounts ?? []).filter((a) => isUuid(a.id));
  const parties = (partiesResult?.parties ?? []).filter((p) => isUuid(p.id));

  const {
    register,
    control,
    handleValidatedSubmit,
    formState: { errors, isSubmitted, isValid },
  } = useAppForm<CreateVoucherFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(schema) as Resolver<CreateVoucherFormValues>,
    defaultValues: { ...VOUCHER_FORM_DEFAULTS, ...defaultValues },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const fieldError = (name: keyof CreateVoucherFormValues) =>
    errors[name]?.message as string | undefined;

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
        const cleaned = { ...values } as CreateVoucherFormValues;
        if (mode === 'edit') {
          delete (cleaned as { lines?: unknown }).lines;
        } else if (cleaned.lines) {
          cleaned.lines = cleaned.lines.filter((l) => isUuid(l.account_id));
          if (!cleaned.lines.length) delete cleaned.lines;
        }
        await onSubmit(cleaned);
      })}
      className="space-y-4 max-w-5xl"
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
        <CardHeader>
          <CardTitle>Voucher header</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <div className="space-y-1">
            <label htmlFor="voucher_type" className="text-sm font-medium text-[var(--color-neutral-700)]">
              Voucher type *
            </label>
            <select id="voucher_type" className={selectClass} {...register('voucher_type')}>
              {VOUCHER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {VOUCHER_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('voucher_type')} />
          </div>
          <Input
            label="Voucher date"
            type="date"
            error={fieldError('voucher_date')}
            {...register('voucher_date')}
          />
          <div className="space-y-1">
            <label htmlFor="currency_code" className="text-sm font-medium text-[var(--color-neutral-700)]">Currency</label>
            <select id="currency_code" className={selectClass} {...register('currency_code')}>
              <option value="">—</option>
              {VOUCHER_CURRENCY_OPTIONS.map((c) => (
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
            label="Reference number"
            error={fieldError('reference_number')}
            {...register('reference_number')}
          />
          <div className="space-y-1">
            <label htmlFor="party_id" className="text-sm font-medium text-[var(--color-neutral-700)]">Party</label>
            <select id="party_id" className={selectClass} {...register('party_id', uuidSelect)}>
              <option value="">— None —</option>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                    {p.code ? `${p.name} (${p.code})` : p.name}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('party_id')} />
          </div>
          <Input
            label="Job ID"
            placeholder="UUID"
            error={fieldError('job_id')}
            {...register('job_id', uuidSelect)}
          />
          <Input
            label="Invoice ID"
            placeholder="UUID"
            error={fieldError('invoice_id')}
            {...register('invoice_id', uuidSelect)}
          />
          <div className="sm:col-span-2">
            <Input label="Narration" error={fieldError('narration')} {...register('narration')} />
          </div>
        </div>
      </Card>

      {mode === 'create' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Lines (optional)</CardTitle>
            <Button
              type="button"
              variant="secondary"
              className="h-8"
              onClick={() =>
                append({
                  account_id: '',
                  debit_amount: 0,
                  credit_amount: 0,
                  currency_code: 'AED',
                  exchange_rate: 1,
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add line
            </Button>
          </CardHeader>
          <div className="space-y-4 p-4 pt-0">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 sm:grid-cols-6 gap-3 rounded-lg border border-[var(--color-neutral-200)] p-3"
              >
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor={`voucher-line-account-${index}`} className="text-sm font-medium text-[var(--color-neutral-700)]">
                    Account
                  </label>
                  <select
                    id={`voucher-line-account-${index}`}
                    className={selectClass}
                    {...register(`lines.${index}.account_id` as const)}
                  >
                    <option value="">— Select —</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {chartOfAccountDisplayLabel(a)}
                      </option>
                    ))}
                  </select>
                  <FieldError
                    message={errors.lines?.[index]?.account_id?.message as string | undefined}
                  />
                </div>
                <Input
                  label="Debit"
                  type="number"
                  step="0.01"
                  error={errors.lines?.[index]?.debit_amount?.message as string | undefined}
                  {...register(`lines.${index}.debit_amount` as const)}
                />
                <Input
                  label="Credit"
                  type="number"
                  step="0.01"
                  error={errors.lines?.[index]?.credit_amount?.message as string | undefined}
                  {...register(`lines.${index}.credit_amount` as const)}
                />
                <Input
                  label="Narration"
                  error={errors.lines?.[index]?.narration?.message as string | undefined}
                  {...register(`lines.${index}.narration` as const)}
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="danger"
                    className="h-9 w-full"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <p className="text-xs text-[var(--color-neutral-400)]">
              Leave lines empty to create a header-only draft, then add lines on the detail page.
            </p>
          </div>
        </Card>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create voucher' : 'Save changes'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
