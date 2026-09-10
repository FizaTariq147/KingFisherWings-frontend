import { useMemo, useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { createQuotationLineSchema } from '../../schemas/quotation.schema';
import type { CreateQuotationLineFormValues } from '../../types/quotation.types';
import type { QuotationWizardCostingPayload } from '../../types/quotationWizardCosting.types';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

const labelClass = 'text-xs font-medium text-[var(--color-neutral-500)]';

export type QuotationDraftChargeLine = CreateQuotationLineFormValues & { localId: string };

type QuotationWizardCostingPanelProps = {
  currencyCode: string;
  lines: QuotationDraftChargeLine[];
  applyTariff: boolean;
  onLinesChange: (lines: QuotationDraftChargeLine[]) => void;
  onApplyTariffChange: (value: boolean) => void;
};

function newLocalId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function QuotationWizardCostingPanel({
  currencyCode,
  lines,
  applyTariff,
  onLinesChange,
  onApplyTariffChange,
}: QuotationWizardCostingPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const { data: chargeCodes = [] } = useMasterOptions(
    'charge-codes',
    MASTER_PATHS['charge-codes'],
    true,
  );
  const { data: taxRates = [] } = useMasterOptions('tax-rates', MASTER_PATHS['tax-rates'], true);

  const chargeLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of chargeCodes) {
      if (!isUuid(String(c.id))) continue;
      map.set(String(c.id), String(c.code ?? c.name ?? c.id));
    }
    return map;
  }, [chargeCodes]);

  const {
    register,
    handleValidatedSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useAppForm<CreateQuotationLineFormValues>({
    resolver: zodResolver(createQuotationLineSchema) as Resolver<CreateQuotationLineFormValues>,
    defaultValues: {
      charge_code_id: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      currency_code: currencyCode || 'AED',
      exchange_rate: 1,
      is_cost: false,
      sort_order: lines.length,
    },
  });

  const openAddForm = () => {
    setShowForm(true);
    reset({
      charge_code_id: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      currency_code: currencyCode || 'AED',
      exchange_rate: 1,
      is_cost: false,
      sort_order: lines.length,
    });
  };

  const onAddLine = handleValidatedSubmit((values) => {
    const chargeId = values.charge_code_id;
    const codeLabel = chargeLabelById.get(chargeId);
    onLinesChange([
      ...lines,
      {
        ...values,
        localId: newLocalId(),
        currency_code: values.currency_code || currencyCode || 'AED',
        quantity: values.quantity ?? 1,
        description: values.description?.trim() || codeLabel || 'Charge',
        sort_order: values.sort_order ?? lines.length,
      },
    ]);
    setShowForm(false);
  });

  const draftTotal = lines.reduce((sum, line) => {
    const qty = Number(line.quantity) || 0;
    const price = Number(line.unit_price) || 0;
    return sum + qty * price;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Charges</h3>
          <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
            Add charge lines now; they are saved via the lines API after the quotation header is
            created. Apply tariff uses lane/job matching on the server.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={openAddForm}>
            <Plus className="h-4 w-4" />
            Add charge line
          </Button>
        </div>
      </div>

      <label className="flex items-start gap-2 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2.5 text-sm text-[var(--color-neutral-800)]">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={applyTariff}
          onChange={(e) => onApplyTariffChange(e.target.checked)}
        />
        <span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Wand2 className="h-3.5 w-3.5" aria-hidden />
            Apply tariff after create
          </span>
          <span className="mt-0.5 block text-xs font-normal text-[var(--color-neutral-500)]">
            Calls <span className="font-mono">POST /quotations/:id/apply-tariff</span> using origin,
            destination, and job type from earlier steps. Manual lines below are added afterward.
          </span>
        </span>
      </label>

      <div className="overflow-x-auto rounded-md border border-[var(--color-neutral-200)]">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--color-neutral-50)] text-left text-xs text-[var(--color-neutral-500)]">
            <tr>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Unit price</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2 w-12" />
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-[var(--color-neutral-400)]">
                  No charge lines yet.
                  {applyTariff ? ' Tariff lines will be generated after create.' : ''}
                  {' '}
                  Use Add charge line to draft pricing.
                </td>
              </tr>
            ) : (
              lines.map((line) => {
                const qty = Number(line.quantity) || 0;
                const price = Number(line.unit_price) || 0;
                return (
                  <tr key={line.localId} className="border-t border-[var(--color-neutral-100)]">
                    <td className="px-3 py-2">
                      <div className="font-medium text-[var(--color-neutral-800)]">
                        {line.description}
                      </div>
                      <div className="font-mono text-xs text-[var(--color-neutral-400)]">
                        {chargeLabelById.get(line.charge_code_id) || line.charge_code_id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono">{qty}</td>
                    <td className="px-3 py-2 font-mono">
                      {line.currency_code || currencyCode} {price}
                    </td>
                    <td className="px-3 py-2">{line.is_cost ? 'Cost' : 'Revenue'}</td>
                    <td className="px-3 py-2 font-mono">
                      {(qty * price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="p-1 text-[var(--color-danger-500)]"
                        aria-label="Remove line"
                        onClick={() =>
                          onLinesChange(lines.filter((row) => row.localId !== line.localId))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {lines.length > 0 ? (
        <p className="text-right text-sm font-medium text-[var(--color-neutral-800)]">
          Draft lines total:{' '}
          <span className="font-mono">
            {currencyCode || 'AED'}{' '}
            {draftTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
      ) : null}

      {showForm ? (
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-[var(--color-neutral-200)] p-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="draft_charge_code_id" className={labelClass}>
              Charge code *
            </label>
            <select
              id="draft_charge_code_id"
              className={selectClass}
              {...register('charge_code_id')}
              onChange={(e) => {
                const id = e.target.value;
                setValue('charge_code_id', id, { shouldValidate: true });
                const code = chargeCodes.find((c) => String(c.id) === id);
                if (code) {
                  const desc = String(code.name ?? code.code ?? '');
                  if (desc) setValue('description', desc, { shouldValidate: true });
                }
              }}
            >
              <option value="">Select…</option>
              {chargeCodes
                .filter((c) => isUuid(String(c.id)))
                .map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {String(c.code ?? c.name ?? c.id)}
                  </option>
                ))}
            </select>
            {errors.charge_code_id ? (
              <p className="text-xs text-[var(--color-danger-500)]">
                {errors.charge_code_id.message as string}
              </p>
            ) : null}
          </div>
          <Input
            label="Description *"
            error={errors.description?.message as string}
            {...register('description')}
          />
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
          <div className="space-y-1">
            <label htmlFor="draft_tax_rate_id" className={labelClass}>
              Tax rate
            </label>
            <select id="draft_tax_rate_id" className={selectClass} {...register('tax_rate_id')}>
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
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void onAddLine()}>
              Add charge line
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function toCostingPayload(
  lines: QuotationDraftChargeLine[],
  applyTariff: boolean,
): QuotationWizardCostingPayload {
  return {
    apply_tariff: applyTariff,
    lines: lines.map(({ localId: _localId, ...line }) => line),
  };
}
