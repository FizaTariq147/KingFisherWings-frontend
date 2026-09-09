import { useFieldArray, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { invoiceDisplayNumber } from '@/features/invoices/utils/normalizeInvoice';
import { useInvoices } from '@/features/invoices/hooks/useInvoices';
import { createDebitNoteSchema } from '../../schemas/debitNote.schema';
import type { CreateDebitNoteFormValues } from '../../types/debitNote.types';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

const DEBIT_NOTE_FORM_DEFAULTS: CreateDebitNoteFormValues = {
  credited_invoice_id: '',
  remarks: undefined,
  lines: [],
};

interface DebitNoteFormProps {
  defaultValues?: Partial<CreateDebitNoteFormValues>;
  onSubmit: (values: CreateDebitNoteFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

export function DebitNoteForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: DebitNoteFormProps) {
  const { data: postedResult } = useInvoices({
    page: 1,
    limit: 100,
    status: 'POSTED',
    invoice_type: 'CUSTOMER_INVOICE',
  });
  const { data: allResult } = useInvoices({
    page: 1,
    limit: 100,
  });

  const postedInvoices = (postedResult?.invoices ?? []).filter((inv) => isUuid(inv.id));
  const fallbackInvoices = (allResult?.invoices ?? []).filter((inv) => isUuid(inv.id));
  const baseInvoices = postedInvoices.length ? postedInvoices : fallbackInvoices;
  const prefilledId = defaultValues?.credited_invoice_id;
  const invoiceOptions: Array<{
    id: string;
    label: string;
    status?: string;
  }> = baseInvoices.map((inv) => ({
    id: inv.id,
    label: `${invoiceDisplayNumber(inv)}${inv.party_name ? ` — ${inv.party_name}` : ''}`,
    status: inv.status,
  }));
  if (
    prefilledId &&
    isUuid(prefilledId) &&
    !invoiceOptions.some((opt) => opt.id === prefilledId)
  ) {
    invoiceOptions.unshift({
      id: prefilledId,
      label: prefilledId.slice(0, 8).toUpperCase(),
      status: 'POSTED',
    });
  }

  const {
    register,
    control,
    handleValidatedSubmit,
    applyApiErrors,
    formState: { errors, isSubmitted, isValid },
  } = useAppForm<CreateDebitNoteFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(createDebitNoteSchema) as Resolver<CreateDebitNoteFormValues>,
    defaultValues: { ...DEBIT_NOTE_FORM_DEFAULTS, ...defaultValues },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const fieldError = (name: keyof CreateDebitNoteFormValues) =>
    errors[name]?.message as string | undefined;

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
      className="max-w-4xl space-y-4"
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
        <CardHeader>
          <CardTitle>Debit note</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 p-4 pt-0 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label
              htmlFor="dn-debited-invoice"
              className="text-xs font-medium text-[var(--color-neutral-500)]"
            >
              Debited invoice *
            </label>
            <select
              id="dn-debited-invoice"
              className={selectClass}
              {...register('credited_invoice_id')}
            >
              <option value="">Select posted invoice…</option>
              {invoiceOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                  {opt.status ? ` (${opt.status})` : ''}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('credited_invoice_id')} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label
              htmlFor="dn-remarks"
              className="text-xs font-medium text-[var(--color-neutral-500)]"
            >
              Remarks
            </label>
            <textarea
              id="dn-remarks"
              className="min-h-[64px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('remarks')}
            />
            <FieldError message={fieldError('remarks')} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Lines (optional)</CardTitle>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              append({
                description: '',
                quantity: 1,
                unit_price: 0,
                is_taxable: true,
                sort_order: fields.length,
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add line
          </Button>
        </CardHeader>
        <div className="space-y-3 p-4 pt-0">
          {fields.length === 0 && (
            <p className="text-sm text-[var(--color-neutral-400)]">No lines yet.</p>
          )}
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 items-end gap-2 border-b border-[var(--color-neutral-100)] pb-3 sm:grid-cols-12"
            >
              <div className="sm:col-span-5">
                <Input label="Description *" {...register(`lines.${index}.description`)} />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Qty"
                  type="number"
                  step="any"
                  {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  label="Unit price *"
                  type="number"
                  step="any"
                  {...register(`lines.${index}.unit_price`, { valueAsNumber: true })}
                />
              </div>
              <div className="flex justify-end pb-1 sm:col-span-2">
                <Button type="button" variant="danger" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Create debit note'}
        </Button>
      </div>
    </form>
  );
}
