import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAppForm } from '@/lib/validation';
import { DISTANCE_UNITS } from '../../constants/zipDistance.constants';
import { createZipDistanceSchema, updateZipDistanceSchema } from '../../schemas/zipDistance.schema';
import type {
  CreateZipDistanceFormValues,
  UpdateZipDistanceFormValues,
} from '../../types/zipDistance.types';
import { ZIP_DISTANCE_FORM_DEFAULTS } from '../../utils/zipDistanceToFormValues';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

interface ZipDistanceFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateZipDistanceFormValues>;
  onSubmit: (
    values: CreateZipDistanceFormValues | UpdateZipDistanceFormValues,
  ) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

export function ZipDistanceForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: ZipDistanceFormProps) {
  const schema = mode === 'create' ? createZipDistanceSchema : updateZipDistanceSchema;
  const {
    register,
    handleValidatedSubmit,
    formState: { errors, isSubmitted, isValid },
  } = useAppForm<CreateZipDistanceFormValues>({
    resolver: zodResolver(schema) as Resolver<CreateZipDistanceFormValues>,
    defaultValues: { ...ZIP_DISTANCE_FORM_DEFAULTS, ...defaultValues },
  });

  const fieldError = (name: keyof CreateZipDistanceFormValues) =>
    errors[name]?.message as string | undefined;

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
          <CardTitle>Origin</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <Input
            label="From ZIP *"
            error={fieldError('from_zip')}
            placeholder="e.g. 00000"
            autoComplete="postal-code"
            {...register('from_zip')}
          />
          <Input
            label="From city"
            error={fieldError('from_city')}
            placeholder="e.g. Dubai"
            {...register('from_city')}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Destination</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <Input
            label="To ZIP *"
            error={fieldError('to_zip')}
            placeholder="e.g. 11111"
            autoComplete="postal-code"
            {...register('to_zip')}
          />
          <Input
            label="To city"
            error={fieldError('to_city')}
            placeholder="e.g. Abu Dhabi"
            {...register('to_city')}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distance</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <Input
            label="Distance *"
            type="number"
            step="any"
            min={0}
            error={fieldError('distance')}
            placeholder="e.g. 140"
            {...register('distance', { valueAsNumber: true })}
          />
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">Unit *</label>
            <select className={selectClass} {...register('unit')}>
              {DISTANCE_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('unit')} />
          </div>
          <label className="flex items-center gap-2 text-sm mt-2">
            <input type="checkbox" {...register('is_active')} />
            Active
          </label>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
