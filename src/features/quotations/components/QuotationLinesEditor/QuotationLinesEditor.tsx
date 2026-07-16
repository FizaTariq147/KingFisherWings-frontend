import { useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { createQuotationLineSchema } from '../../schemas/quotation.schema';
import type { CreateQuotationLineFormValues, QuotationLine } from '../../types/quotation.types';
import { useQuotationLines } from '../../hooks/useQuotationLines';
import { getErrorMessage } from '../../utils/getErrorMessage';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

interface QuotationLinesEditorProps {
  quotationId: string;
  lines: QuotationLine[];
  currencyCode: string;
  editable: boolean;
}

export function QuotationLinesEditor({
  quotationId,
  lines,
  currencyCode,
  editable,
}: QuotationLinesEditorProps) {
  const { add, update, remove, applyTariff } = useQuotationLines(quotationId);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const { data: chargeCodes = [] } = useMasterOptions(
    'charge-codes',
    MASTER_PATHS['charge-codes'],
    true,
  );
  const { data: taxRates = [] } = useMasterOptions('tax-rates', MASTER_PATHS['tax-rates'], true);

  const {
    register,
    handleValidatedSubmit,
    reset,
    applyApiErrors,
    formState: { errors },
  } = useAppForm<CreateQuotationLineFormValues>({
    resolver: zodResolver(createQuotationLineSchema) as Resolver<CreateQuotationLineFormValues>,
    defaultValues: {
      charge_code_id: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      currency_code: currencyCode,
      exchange_rate: 1,
      is_cost: false,
      sort_order: lines.length,
    },
  });

  const startEdit = (line: QuotationLine) => {
    setEditingLineId(line.id);
    setShowForm(true);
    setError(null);
    reset({
      charge_code_id: line.charge_code_id,
      description: line.description,
      unit: line.unit,
      quantity: line.quantity,
      unit_price: line.unit_price,
      currency_code: line.currency_code || currencyCode,
      exchange_rate: line.exchange_rate ?? 1,
      tax_rate_id: line.tax_rate_id,
      is_cost: Boolean(line.is_cost),
      sort_order: line.sort_order ?? 0,
    });
  };

  const clearForm = () => {
    setEditingLineId(null);
    setShowForm(false);
    reset({
      charge_code_id: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      currency_code: currencyCode,
      exchange_rate: 1,
      is_cost: false,
      sort_order: lines.length,
    });
  };

  const onSave = handleValidatedSubmit(async (values) => {
    setError(null);
    try {
      const dto = {
        ...values,
        currency_code: values.currency_code || currencyCode,
        quantity: values.quantity ?? 1,
      };
      if (editingLineId) {
        await update.mutateAsync({ lineId: editingLineId, dto });
      } else {
        await add.mutateAsync(dto);
      }
      clearForm();
    } catch (err) {
      applyApiErrors(err);
      setError(getErrorMessage(err));
    }
  });

  const busy = add.isPending || update.isPending || remove.isPending || applyTariff.isPending;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Charge lines</h3>
        {editable && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={async () => {
                setError(null);
                try {
                  await applyTariff.mutateAsync();
                } catch (err) {
                  setError(getErrorMessage(err));
                }
              }}
            >
              <Wand2 className="h-4 w-4" />
              Apply tariff
            </Button>
            <Button
              type="button"
              onClick={() => {
                setEditingLineId(null);
                setShowForm((v) => !v);
              }}
            >
              <Plus className="h-4 w-4" />
              Add line
            </Button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-md border border-[var(--color-neutral-200)]">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--color-neutral-50)] text-left text-xs text-[var(--color-neutral-500)]">
            <tr>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Unit price</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Total</th>
              {editable && <th className="px-3 py-2 w-20" />}
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td
                  colSpan={editable ? 6 : 5}
                  className="px-3 py-8 text-center text-[var(--color-neutral-400)]"
                >
                  No charge lines yet.
                </td>
              </tr>
            ) : (
              lines.map((line) => (
                <tr key={line.id} className="border-t border-[var(--color-neutral-100)]">
                  <td className="px-3 py-2">
                    <div className="font-medium text-[var(--color-neutral-800)]">
                      {line.description}
                    </div>
                    <div className="text-xs text-[var(--color-neutral-400)] font-mono">
                      {line.charge_code || line.charge_code_id.slice(0, 8)}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono">{line.quantity}</td>
                  <td className="px-3 py-2 font-mono">
                    {line.currency_code} {line.unit_price}
                  </td>
                  <td className="px-3 py-2">{line.is_cost ? 'Cost' : 'Revenue'}</td>
                  <td className="px-3 py-2 font-mono">
                    {line.line_total != null
                      ? line.line_total.toLocaleString()
                      : (line.quantity * line.unit_price).toLocaleString()}
                  </td>
                  {editable && (
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="p-1 text-[var(--color-neutral-500)] hover:text-[var(--color-primary-600)]"
                          title="Edit line"
                          disabled={busy}
                          onClick={() => startEdit(line)}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1 text-[var(--color-danger-500)]"
                          disabled={busy}
                          onClick={async () => {
                            setError(null);
                            try {
                              await remove.mutateAsync(line.id);
                            } catch (err) {
                              setError(getErrorMessage(err));
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editable && showForm && (
        <form
          onSubmit={onSave}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-[var(--color-neutral-200)] p-4"
        >
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Charge code *
            </label>
            <select className={selectClass} {...register('charge_code_id')}>
              <option value="">Select…</option>
              {chargeCodes
                .filter((c) => isUuid(String(c.id)))
                .map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {String(c.code ?? c.name ?? c.id)}
                  </option>
                ))}
            </select>
            {errors.charge_code_id && (
              <p className="text-xs text-[var(--color-danger-500)]">
                {errors.charge_code_id.message as string}
              </p>
            )}
          </div>
          <Input label="Description *" error={errors.description?.message as string} {...register('description')} />
          <Input label="Unit" {...register('unit')} />
          <Input
            label="Quantity"
            type="number"
            step="any"
            {...register('quantity', { valueAsNumber: true })}
          />
          <Input
            label="Unit price *"
            type="number"
            step="any"
            error={errors.unit_price?.message as string}
            {...register('unit_price', { valueAsNumber: true })}
          />
          <Input label="Currency" {...register('currency_code')} />
          <Input
            label="Exchange rate"
            type="number"
            step="any"
            {...register('exchange_rate', { valueAsNumber: true })}
          />
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">Tax rate</label>
            <select className={selectClass} {...register('tax_rate_id')}>
              <option value="">None</option>
              {taxRates
                .filter((t) => isUuid(String(t.id)))
                .map((t) => (
                  <option key={String(t.id)} value={String(t.id)}>
                    {String(t.name ?? t.code ?? t.id)}
                  </option>
                ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)] sm:col-span-2">
            <input type="checkbox" {...register('is_cost')} />
            Cost line (vs revenue)
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={clearForm} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy
                ? 'Saving…'
                : editingLineId
                  ? 'Update line'
                  : 'Add line'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
