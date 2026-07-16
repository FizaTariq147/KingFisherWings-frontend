import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { useParties } from '@/features/parties/hooks/useParties';
import { useBankAccounts } from '@/features/organization/hooks/useBankAccounts';
import {
  CHEQUE_CURRENCY_OPTIONS,
  CHEQUE_TYPES,
  CHEQUE_TYPE_LABELS,
} from '../../constants/cheque.constants';
import { createChequeSchema, updateChequeSchema } from '../../schemas/cheque.schema';
import type { CreateChequeFormValues, UpdateChequeFormValues } from '../../types/cheque.types';
import { CHEQUE_DEMO_PAYABLE, CHEQUE_DEMO_RECEIVABLE_PDC } from '../../utils/chequeDemoData';
import { CHEQUE_FORM_DEFAULTS } from '../../utils/chequeToFormValues';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

const checkClass = 'h-4 w-4 rounded border-[var(--color-neutral-300)]';

interface ChequeFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateChequeFormValues>;
  onSubmit: (values: CreateChequeFormValues | UpdateChequeFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

export function ChequeForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: ChequeFormProps) {
  const schema = mode === 'create' ? createChequeSchema : updateChequeSchema;
  const { data: partiesResult } = useParties({ page: 1, limit: 200 });
  const { data: bankData } = useBankAccounts({ page: 1, limit: 100 });
  const parties = (partiesResult?.parties ?? []).filter((p) => isUuid(p.id));
  const bankAccounts = (bankData?.accounts ?? []).filter((b) => isUuid(b.id));

  const {
    register,
    control,
    watch,
    reset,
    handleValidatedSubmit,
    formState: { errors, isSubmitted, isValid },
  } = useAppForm<CreateChequeFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(schema) as Resolver<CreateChequeFormValues>,
    defaultValues: { ...CHEQUE_FORM_DEFAULTS, ...defaultValues },
  });

  const isPdc = watch('is_pdc');
  const chequeType = watch('cheque_type');
  const fieldError = (name: keyof CreateChequeFormValues) =>
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
          <CardTitle>Cheque / PDC details</CardTitle>
          {showDemo && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const demo =
                  chequeType === 'PAYABLE' ? CHEQUE_DEMO_PAYABLE : CHEQUE_DEMO_RECEIVABLE_PDC;
                reset({
                  ...CHEQUE_FORM_DEFAULTS,
                  ...demo,
                  ...defaultValues,
                  cheque_type: chequeType ?? demo.cheque_type,
                  party_id: parties[0]?.id || demo.party_id || '',
                });
              }}
            >
              Demo data
            </Button>
          )}
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <Input
            label="Cheque number *"
            error={fieldError('cheque_number')}
            {...register('cheque_number')}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--color-neutral-700)]">Type *</label>
            <select className={selectClass} {...register('cheque_type')}>
              {CHEQUE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {CHEQUE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('cheque_type')} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--color-neutral-700)]">Party *</label>
            <select className={selectClass} {...register('party_id', uuidSelect)}>
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
            {...register('amount', { valueAsNumber: true })}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--color-neutral-700)]">
              Currency *
            </label>
            <select className={selectClass} {...register('currency_code')}>
              {CHEQUE_CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('currency_code')} />
          </div>
          <Input
            label="Cheque date *"
            type="date"
            error={fieldError('cheque_date')}
            {...register('cheque_date')}
          />
          <Input
            label={isPdc ? 'Due date *' : 'Due date'}
            type="date"
            error={fieldError('due_date')}
            {...register('due_date')}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--color-neutral-700)]">
              Bank account
            </label>
            <select className={selectClass} {...register('bank_account_id', uuidSelect)}>
              <option value="">— None —</option>
              {bankAccounts.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bank_name || b.account_name || b.id.slice(0, 8)}
                  {b.account_number ? ` · ${b.account_number}` : ''}
                </option>
              ))}
            </select>
          </div>
          <Input label="Bank name" error={fieldError('bank_name')} {...register('bank_name')} />
          <label className="flex items-center gap-2 text-sm h-9 sm:col-span-2">
            <Controller
              name="is_pdc"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  className={checkClass}
                  checked={Boolean(field.value)}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            Post-dated cheque (PDC)
          </label>
          <div className="sm:col-span-2">
            <Input label="Remarks" error={fieldError('remarks')} {...register('remarks')} />
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Register cheque' : 'Save changes'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
