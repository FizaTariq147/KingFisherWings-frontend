import { useFieldArray, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useParties } from '@/features/parties/hooks/useParties';
import { loadPartyCurrencyOptions } from '@/features/parties/utils/partyCurrencyOptions';
import { useTenantCompanies } from '@/features/users/hooks/useTenantCompanies';
import {
  createPurchaseInvoiceSchema,
  updatePurchaseInvoiceSchema,
} from '../../schemas/purchaseInvoice.schema';
import type {
  CreatePurchaseInvoiceFormValues,
  UpdatePurchaseInvoiceFormValues,
} from '../../types/purchaseInvoice.types';
import { PURCHASE_INVOICE_FORM_DEFAULTS } from '../../utils/purchaseInvoiceToFormValues';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

interface PurchaseInvoiceFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreatePurchaseInvoiceFormValues>;
  onSubmit: (
    values: CreatePurchaseInvoiceFormValues | UpdatePurchaseInvoiceFormValues,
  ) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

export function PurchaseInvoiceForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: PurchaseInvoiceFormProps) {
  const schema = mode === 'create' ? createPurchaseInvoiceSchema : updatePurchaseInvoiceSchema;
  const { data: companies = [] } = useTenantCompanies(true);
  const { data: suppliersResult } = useParties({
    page: 1,
    limit: 200,
    party_type: 'SUPPLIER',
    order: 'asc',
  });
  const { data: allPartiesResult } = useParties({ page: 1, limit: 200, order: 'asc' });
  const { data: branches = [] } = useMasterOptions('branches', MASTER_PATHS.branches, true);
  const { data: departments = [] } = useMasterOptions(
    'departments',
    MASTER_PATHS.departments,
    true,
  );
  const { data: currencies = [] } = useQuery({
    queryKey: ['tenant', 'purchase-invoices', 'currency-options'],
    queryFn: loadPartyCurrencyOptions,
    staleTime: 60_000,
  });

  const parties = (
    (suppliersResult?.parties?.length
      ? suppliersResult.parties
      : allPartiesResult?.parties) ?? []
  ).filter((p) => isUuid(p.id));

  const {
    register,
    control,
    handleValidatedSubmit,
    applyApiErrors,
    formState: { errors, isSubmitted, isValid },
  } = useAppForm<CreatePurchaseInvoiceFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(schema) as Resolver<CreatePurchaseInvoiceFormValues>,
    defaultValues: { ...PURCHASE_INVOICE_FORM_DEFAULTS, ...defaultValues },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const fieldError = (name: keyof CreatePurchaseInvoiceFormValues) =>
    errors[name]?.message as string | undefined;

  const uuidSelect = {
    setValueAs: (v: unknown) => {
      if (v == null) return undefined;
      const s = String(v).trim();
      return s && isUuid(s) ? s : undefined;
    },
  };

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
      className="space-y-4 max-w-4xl"
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
          <CardTitle>Purchase invoice header</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="party_id" className="text-xs font-medium text-[var(--color-neutral-500)]">
              Vendor / supplier *
            </label>
            <select id="party_id" className={selectClass} {...register('party_id')}>
              <option value="">Select…</option>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code ? `${p.name} (${p.code})` : p.name}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('party_id')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="currency_code" className="text-xs font-medium text-[var(--color-neutral-500)]">
              Currency *
            </label>
            <select id="currency_code" className={selectClass} {...register('currency_code')}>
              {(currencies.length ? currencies : [{ value: 'AED', label: 'AED' }]).map((c) => (
                <option key={String(c.value)} value={String(c.value)}>
                  {String(c.label ?? c.value)}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('currency_code')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="company_id" className="text-xs font-medium text-[var(--color-neutral-500)]">Company</label>
            <select id="company_id" className={selectClass} {...register('company_id', uuidSelect)}>
              <option value="">—</option>
              {(() => {
                const opts = [];
                for (const c of companies) {
                  if (!isUuid(String(c.id))) continue;
                  opts.push(
                    <option key={String(c.id)} value={String(c.id)}>
                      {String(c.name ?? c.code ?? c.id)}
                    </option>,
                  );
                }
                return opts;
              })()}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="branch_id" className="text-xs font-medium text-[var(--color-neutral-500)]">Branch</label>
            <select id="branch_id" className={selectClass} {...register('branch_id', uuidSelect)}>
              <option value="">—</option>
              {(() => {
                const opts = [];
                for (const b of branches) {
                  if (!isUuid(String(b.id))) continue;
                  opts.push(
                    <option key={String(b.id)} value={String(b.id)}>
                      {String(b.name ?? b.code ?? b.id)}
                    </option>,
                  );
                }
                return opts;
              })()}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="department_id" className="text-xs font-medium text-[var(--color-neutral-500)]">
              Department
            </label>
            <select id="department_id" className={selectClass} {...register('department_id', uuidSelect)}>
              <option value="">—</option>
              {(() => {
                const opts = [];
                for (const d of departments) {
                  if (!isUuid(String(d.id))) continue;
                  opts.push(
                    <option key={String(d.id)} value={String(d.id)}>
                      {String(d.name ?? d.code ?? d.id)}
                    </option>,
                  );
                }
                return opts;
              })()}
            </select>
          </div>
          <Input label="Job ID" placeholder="UUID" {...register('job_id', uuidSelect)} />
          <Input
            label="Exchange rate"
            type="number"
            step="any"
            {...register('exchange_rate', {
              setValueAs: (v) => {
                if (v === '' || v == null) return undefined;
                const n = Number(v);
                return Number.isFinite(n) ? n : undefined;
              },
            })}
          />
          <Input
            label="VAT rate %"
            type="number"
            step="any"
            {...register('vat_rate', {
              setValueAs: (v) => {
                if (v === '' || v == null) return undefined;
                const n = Number(v);
                return Number.isFinite(n) ? n : undefined;
              },
            })}
          />
          <Input label="Invoice date" type="date" {...register('invoice_date')} />
          <Input label="Due date" type="date" {...register('due_date')} />
          <Input label="LPO number" {...register('lpo_number')} />
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="remarks" className="text-xs font-medium text-[var(--color-neutral-500)]">Remarks</label>
            <textarea
              id="remarks"
              className="min-h-[64px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('remarks')}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="internal_notes" className="text-xs font-medium text-[var(--color-neutral-500)]">
              Internal notes
            </label>
            <textarea
              id="internal_notes"
              className="min-h-[64px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('internal_notes')}
            />
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
              <p className="text-sm text-[var(--color-neutral-400)]">
                No lines yet. You can add optional lines on create.
              </p>
            )}
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end border-b border-[var(--color-neutral-100)] pb-3"
              >
                <div className="sm:col-span-5">
                  <Input
                    label="Description *"
                    {...register(`lines.${index}.description`)}
                  />
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
                <div className="sm:col-span-2 flex justify-end pb-1">
                  <Button type="button" variant="danger" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving…'
            : mode === 'create'
              ? 'Create purchase invoice'
              : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
