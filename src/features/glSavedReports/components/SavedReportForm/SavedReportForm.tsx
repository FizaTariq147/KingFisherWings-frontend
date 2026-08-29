import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import {
  SAVED_REPORT_TYPES,
  SAVED_REPORT_TYPE_LABELS,
} from '../../constants/savedReport.constants';
import { createSavedReportSchema, updateSavedReportSchema } from '../../schemas/savedReport.schema';
import type {
  CreateSavedReportFormValues,
  UpdateSavedReportFormValues,
} from '../../types/savedReport.types';
import { SAVED_REPORT_FORM_DEFAULTS } from '../../utils/savedReportToFormValues';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

const checkClass = 'h-4 w-4 rounded border-[var(--color-neutral-300)]';

interface SavedReportFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateSavedReportFormValues>;
  onSubmit: (
    values: CreateSavedReportFormValues | UpdateSavedReportFormValues,
  ) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

function parseFiltersJson(raw: string): Record<string, unknown> | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const parsed = JSON.parse(t) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Filters must be a JSON object.');
  }
  return parsed as Record<string, unknown>;
}

function filtersToJson(filters?: Record<string, unknown>): string {
  if (!filters || Object.keys(filters).length === 0) return '';
  return JSON.stringify(filters, null, 2);
}

export function SavedReportForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: SavedReportFormProps) {
  const schema = mode === 'create' ? createSavedReportSchema : updateSavedReportSchema;

  const {
    register,
    control,
    watch,
    setValue,
    handleValidatedSubmit,
    formState: { errors, isSubmitted, isValid },
  } = useAppForm<CreateSavedReportFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(schema) as Resolver<CreateSavedReportFormValues>,
    defaultValues: { ...SAVED_REPORT_FORM_DEFAULTS, ...defaultValues },
  });

  const filtersJson = filtersToJson(watch('filters'));
  const fieldError = (name: keyof CreateSavedReportFormValues) =>
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
        await onSubmit(values);
      })}
      className="space-y-4 max-w-3xl"
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
          <CardTitle>Saved report configuration</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <Input label="Name *" error={fieldError('name')} {...register('name')} />
          <div className="space-y-1">
            <label htmlFor="saved-report-type" className="text-sm font-medium text-[var(--color-neutral-700)]">
              Report type *
            </label>
            <select id="saved-report-type" className={selectClass} {...register('report_type')}>
              {SAVED_REPORT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SAVED_REPORT_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('report_type')} />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Description"
              error={fieldError('description')}
              {...register('description')}
            />
          </div>
          <Input
            label="Company ID (optional)"
            error={fieldError('company_id')}
            {...register('company_id', uuidSelect)}
          />
          <label htmlFor="saved-report-is-shared" className="flex items-center gap-2 text-sm h-9">
            <Controller
              name="is_shared"
              control={control}
              render={({ field }) => (
                <input
                  id="saved-report-is-shared"
                  type="checkbox"
                  className={checkClass}
                  checked={Boolean(field.value)}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            Share with other users
          </label>
          <div className="sm:col-span-2 space-y-1">
            <label htmlFor="saved-report-filters" className="text-sm font-medium text-[var(--color-neutral-700)]">
              Filters (JSON object)
            </label>
            <textarea
              id="saved-report-filters"
              className="min-h-[120px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm font-mono"
              defaultValue={filtersJson}
              placeholder='{"from_date":"2026-06-01","to_date":"2026-06-30","hide_zero":true}'
              onBlur={(e) => {
                try {
                  const parsed = parseFiltersJson(e.target.value);
                  setValue('filters', parsed, { shouldValidate: true });
                } catch (err) {
                  setValue('filters', undefined, { shouldValidate: true });
                }
              }}
            />
            <FieldError message={fieldError('filters')} />
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Save report' : 'Save changes'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
