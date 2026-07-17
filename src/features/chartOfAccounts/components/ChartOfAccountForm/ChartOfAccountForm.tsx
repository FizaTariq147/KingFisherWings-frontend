import { type Resolver, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAppForm } from '@/lib/validation';
import {
  ACCOUNT_GROUPS,
  ACCOUNT_GROUP_LABELS,
  ACCOUNT_SUB_TYPES,
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
  COA_CURRENCY_OPTIONS,
  OPENING_BALANCE_TYPES,
} from '../../constants/chartOfAccount.constants';
import {
  createChartOfAccountSchema,
  updateChartOfAccountSchema,
} from '../../schemas/chartOfAccount.schema';
import type {
  ChartOfAccount,
  CreateChartOfAccountFormValues,
  UpdateChartOfAccountFormValues,
} from '../../types/chartOfAccount.types';
import { CHART_OF_ACCOUNT_DEMO_CREATE } from '../../utils/chartOfAccountDemoData';
import { CHART_OF_ACCOUNT_FORM_DEFAULTS } from '../../utils/chartOfAccountToFormValues';
import { chartOfAccountDisplayLabel } from '../../utils/normalizeChartOfAccount';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

const checkClass = 'h-4 w-4 rounded border-[var(--color-neutral-300)]';

interface ChartOfAccountFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateChartOfAccountFormValues>;
  parentOptions?: ChartOfAccount[];
  onSubmit: (
    values: CreateChartOfAccountFormValues | UpdateChartOfAccountFormValues,
  ) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

export function ChartOfAccountForm({
  mode,
  defaultValues,
  parentOptions = [],
  onSubmit,
  onCancel,
  isSubmitting,
}: ChartOfAccountFormProps) {
  const schema = mode === 'create' ? createChartOfAccountSchema : updateChartOfAccountSchema;
  const {
    register,
    control,
    reset,
    handleValidatedSubmit,
    formState: { errors, isSubmitted, isValid },
  } = useAppForm<CreateChartOfAccountFormValues>({
    resolver: zodResolver(schema) as Resolver<CreateChartOfAccountFormValues>,
    defaultValues: { ...CHART_OF_ACCOUNT_FORM_DEFAULTS, ...defaultValues },
  });

  const fieldError = (name: keyof CreateChartOfAccountFormValues) =>
    errors[name]?.message as string | undefined;

  const showFormErrors = isSubmitted && !isValid;
  const showDemo = mode === 'create' && import.meta.env.DEV;

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
          <CardTitle>Identity</CardTitle>
          {showDemo && (
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                reset({
                  ...CHART_OF_ACCOUNT_FORM_DEFAULTS,
                  ...CHART_OF_ACCOUNT_DEMO_CREATE,
                  ...defaultValues,
                })
              }
            >
              Demo data
            </Button>
          )}
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <Input
            label="Account code *"
            error={fieldError('account_code')}
            placeholder="e.g. 1100"
            autoComplete="off"
            className="uppercase"
            {...register('account_code')}
          />
          <Input
            label="Account name *"
            error={fieldError('account_name')}
            placeholder="e.g. Trade Receivables"
            {...register('account_name')}
          />
          <Input
            label="Account name (Arabic)"
            error={fieldError('account_name_ar')}
            {...register('account_name_ar')}
          />
          <div className="space-y-1">
            <label htmlFor="coa-parent-id" className="text-sm font-medium text-[var(--color-neutral-700)]">
              Parent account
            </label>
            <select id="coa-parent-id" className={selectClass} {...register('parent_id')}>
              <option value="">— None —</option>
              {parentOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {chartOfAccountDisplayLabel(a)}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('parent_id')} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classification</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <div className="space-y-1">
            <label htmlFor="coa-account-group" className="text-sm font-medium text-[var(--color-neutral-700)]">
              Account group *
            </label>
            <select id="coa-account-group" className={selectClass} {...register('account_group')}>
              {ACCOUNT_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {ACCOUNT_GROUP_LABELS[g]}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('account_group')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="coa-account-type" className="text-sm font-medium text-[var(--color-neutral-700)]">
              Account type *
            </label>
            <select id="coa-account-type" className={selectClass} {...register('account_type')}>
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ACCOUNT_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('account_type')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="coa-account-sub-type" className="text-sm font-medium text-[var(--color-neutral-700)]">
              Sub type
            </label>
            <select id="coa-account-sub-type" className={selectClass} {...register('account_sub_type')}>
              {ACCOUNT_SUB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('account_sub_type')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="coa-currency-code" className="text-sm font-medium text-[var(--color-neutral-700)]">Currency</label>
            <select id="coa-currency-code" className={selectClass} {...register('currency_code')}>
              <option value="">—</option>
              {COA_CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('currency_code')} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Balances & flags</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <Input
            label="Opening balance"
            type="number"
            step="0.0001"
            error={fieldError('opening_balance')}
            {...register('opening_balance')}
          />
          <div className="space-y-1">
            <label htmlFor="coa-opening-balance-type" className="text-sm font-medium text-[var(--color-neutral-700)]">
              Opening balance type
            </label>
            <select id="coa-opening-balance-type" className={selectClass} {...register('opening_balance_type')}>
              {OPENING_BALANCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('opening_balance_type')} />
          </div>
          <Input
            label="Sort order"
            type="number"
            step="1"
            error={fieldError('sort_order')}
            {...register('sort_order')}
          />
          <Input label="Notes" error={fieldError('notes')} {...register('notes')} />
          <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(
              [
                ['is_header', 'Header account'],
                ['is_postable', 'Postable'],
                ['is_bank_account', 'Bank account'],
                ['is_cash_account', 'Cash account'],
                ['allow_manual_entry', 'Allow manual entry'],
                ['is_active', 'Active'],
              ] as const
            ).map(([name, label]) => (
              <label key={name} htmlFor={`coa-flag-${name}`} className="flex items-center gap-2 text-sm">
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <input
                      id={`coa-flag-${name}`}
                      type="checkbox"
                      className={checkClass}
                      checked={Boolean(field.value)}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create account' : 'Save changes'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
