import { useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useInvoiceActions } from '../../hooks/useInvoiceActions';
import { createInvoiceLineSchema } from '../../schemas/invoice.schema';
import type {
  CreateInvoiceLineFormValues,
  InvoiceLine,
} from '../../types/invoice.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

interface InvoiceLinesEditorProps {
  invoiceId: string;
  lines: InvoiceLine[];
  editable: boolean;
}

export function InvoiceLinesEditor({ invoiceId, lines, editable }: InvoiceLinesEditorProps) {
  const { addLine, updateLine, removeLine } = useInvoiceActions(invoiceId);
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
  } = useAppForm<CreateInvoiceLineFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(createInvoiceLineSchema) as Resolver<CreateInvoiceLineFormValues>,
    defaultValues: {
      description: '',
      quantity: 1,
      unit_price: 0,
      is_taxable: true,
      sort_order: lines.length,
    },
  });

  const uuidSelect = {
    setValueAs: (v: unknown) => {
      if (v == null) return undefined;
      const s = String(v).trim();
      return s && isUuid(s) ? s : undefined;
    },
  };

  const clearForm = () => {
    setEditingLineId(null);
    setShowForm(false);
    reset({
      description: '',
      quantity: 1,
      unit_price: 0,
      is_taxable: true,
      sort_order: lines.length,
    });
  };

  const startEdit = (line: InvoiceLine) => {
    setEditingLineId(line.id);
    setShowForm(true);
    setError(null);
    reset({
      description: line.description,
      quantity: line.quantity,
      unit_price: line.unit_price,
      charge_code_id: line.charge_code_id,
      tax_rate_id: line.tax_rate_id,
      is_taxable: line.is_taxable ?? true,
      sort_order: line.sort_order ?? 0,
    });
  };

  const onSave = handleValidatedSubmit(async (values) => {
    setError(null);
    try {
      if (editingLineId) {
        await updateLine.mutateAsync({ lineId: editingLineId, dto: values });
      } else {
        await addLine.mutateAsync(values);
      }
      clearForm();
    } catch (err) {
      applyApiErrors(err);
      setError(getErrorMessage(err));
    }
  });

  const busy = addLine.isPending || updateLine.isPending || removeLine.isPending;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Invoice lines</h3>
        {editable && (
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
        )}
      </div>

      {error && (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {error}
        </p>
      )}

      {showForm && editable && (
        <form onSubmit={onSave} className="rounded-lg border border-[var(--color-neutral-200)] p-3 space-y-3">
          <Input
            label="Description *"
            error={errors.description?.message as string | undefined}
            {...register('description')}
          />
          <div className="grid grid-cols-2 gap-3">
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
              error={errors.unit_price?.message as string | undefined}
              {...register('unit_price', { valueAsNumber: true })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="invoice-line-charge-code" className="text-xs font-medium text-[var(--color-neutral-500)]">
                Charge code
              </label>
              <select id="invoice-line-charge-code" className={selectClass} {...register('charge_code_id', uuidSelect)}>
                <option value="">—</option>
                {(() => {
                  const opts = [];
                  for (const c of chargeCodes) {
                    if (!isUuid(String(c.id))) continue;
                    opts.push(
                      <option key={String(c.id)} value={String(c.id)}>
                        {String(c.code ?? c.name ?? c.id)}
                      </option>,
                    );
                  }
                  return opts;
                })()}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="invoice-line-tax-rate" className="text-xs font-medium text-[var(--color-neutral-500)]">
                Tax rate
              </label>
              <select id="invoice-line-tax-rate" className={selectClass} {...register('tax_rate_id', uuidSelect)}>
                <option value="">—</option>
                {(() => {
                  const opts = [];
                  for (const t of taxRates) {
                    if (!isUuid(String(t.id))) continue;
                    opts.push(
                      <option key={String(t.id)} value={String(t.id)}>
                        {String(t.name ?? t.code ?? t.id)}
                      </option>,
                    );
                  }
                  return opts;
                })()}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_taxable')} />
            Taxable
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={clearForm} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : editingLineId ? 'Update line' : 'Add line'}
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-[var(--color-neutral-200)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-neutral-50)] text-left text-[var(--color-neutral-500)]">
            <tr>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="px-3 py-2 font-medium">Qty</th>
              <th className="px-3 py-2 font-medium">Unit price</th>
              <th className="px-3 py-2 font-medium">Total</th>
              {editable && <th className="px-3 py-2 w-24" />}
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td
                  colSpan={editable ? 5 : 4}
                  className="px-3 py-8 text-center text-[var(--color-neutral-400)]"
                >
                  No lines
                </td>
              </tr>
            ) : (
              lines.map((line) => (
                <tr key={line.id} className="border-t border-[var(--color-neutral-100)]">
                  <td className="px-3 py-2">{line.description}</td>
                  <td className="px-3 py-2 font-mono">{line.quantity}</td>
                  <td className="px-3 py-2 font-mono">{line.unit_price}</td>
                  <td className="px-3 py-2 font-mono">
                    {line.line_total ?? line.quantity * line.unit_price}
                  </td>
                  {editable && (
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={busy}
                          onClick={() => startEdit(line)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          disabled={busy}
                          onClick={async () => {
                            setError(null);
                            try {
                              await removeLine.mutateAsync(line.id);
                            } catch (err) {
                              setError(getErrorMessage(err));
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
