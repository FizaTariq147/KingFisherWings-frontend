import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useParties } from '@/features/parties/hooks/useParties';
import { useTenantCompanies } from '@/features/users/hooks/useTenantCompanies';
import { loadPartyCurrencyOptions } from '@/features/parties/utils/partyCurrencyOptions';
import { getErrorMessage } from '@/features/parties/utils/getErrorMessage';
import {
  INCOTERMS,
  JOB_TYPE_LABELS,
  JOB_TYPES,
} from '../../constants/quotation.constants';
import { createQuotationSchema, updateQuotationSchema } from '../../schemas/quotation.schema';
import type { CreateQuotationFormValues, UpdateQuotationFormValues } from '../../types/quotation.types';
import { QUOTATION_FORM_DEFAULTS } from '../../utils/quotationToFormValues';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)]';

interface QuotationFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateQuotationFormValues>;
  onSubmit: (values: CreateQuotationFormValues | UpdateQuotationFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  onValuesChange?: (values: CreateQuotationFormValues) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

export function QuotationForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  onValuesChange,
}: QuotationFormProps) {
  const schema = mode === 'create' ? createQuotationSchema : updateQuotationSchema;
  const { data: companies = [] } = useTenantCompanies(true);
  const {
    data: customersResult,
    isLoading: customersLoading,
    isError: customersError,
    error: customersErr,
  } = useParties({
    page: 1,
    limit: 100,
    party_type: 'CUSTOMER',
    order: 'asc',
  });
  const { data: carriersResult } = useParties({
    page: 1,
    limit: 100,
    order: 'asc',
  });
  const { data: ports = [] } = useMasterOptions('ports', MASTER_PATHS.ports, true);
  const { data: containers = [] } = useMasterOptions(
    'container-types',
    MASTER_PATHS['container-types'],
    true,
  );
  const { data: departments = [] } = useMasterOptions(
    'departments',
    MASTER_PATHS.departments,
    true,
  );
  const { data: branches = [] } = useMasterOptions('branches', MASTER_PATHS.branches, true);
  const { data: currencies = [] } = useQuery({
    queryKey: ['tenant', 'quotations', 'currency-options'],
    queryFn: loadPartyCurrencyOptions,
    staleTime: 60_000,
  });

  const customers = (customersResult?.parties ?? []).filter((p) => isUuid(p.id));
  const carrierTypes = new Set(['AIRLINE', 'SHIPPING_LINE', 'TRUCKER', 'CARRIER', 'TRANSPORTER']);
  const carriersFiltered = (carriersResult?.parties ?? []).filter(
    (p) => isUuid(p.id) && carrierTypes.has(String(p.party_type)),
  );
  const carriers =
    carriersFiltered.length > 0
      ? carriersFiltered
      : (carriersResult?.parties ?? []).filter((p) => isUuid(p.id));

  const {
    register,
    handleValidatedSubmit,
    applyApiErrors,
    watch,
    setValue,
    formState: { errors },
  } = useAppForm<CreateQuotationFormValues>({
    resolver: zodResolver(schema) as Resolver<CreateQuotationFormValues>,
    defaultValues: { ...QUOTATION_FORM_DEFAULTS, ...defaultValues },
  });

  const watched = watch();
  const onValuesChangeRef = useRef(onValuesChange);
  onValuesChangeRef.current = onValuesChange;
  useEffect(() => {
    onValuesChangeRef.current?.(watched);
  }, [watched]);

  useEffect(() => {
    if (watched.company_id) return;
    const first = companies.find((c) => isUuid(c.id));
    if (first) setValue('company_id', first.id);
  }, [companies, watched.company_id, setValue]);

  const fieldError = (name: keyof CreateQuotationFormValues) =>
    errors[name]?.message as string | undefined;

  const portOptions: Array<{ value: string; label: string }> = [];
  for (const p of ports) {
    if (!isUuid(String(p.id))) continue;
    portOptions.push({
      value: String(p.id),
      label: [p.code, p.name].filter(Boolean).join(' — ') || String(p.id),
    });
  }

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
    >
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <div className="space-y-1">
            <label htmlFor="job_type" className="text-xs font-medium text-[var(--color-neutral-500)]">Job type *</label>
            <select id="job_type" className={selectClass} {...register('job_type')}>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {JOB_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('job_type')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="valid_until" className="text-xs font-medium text-[var(--color-neutral-500)]">Valid until</label>
            <input id="valid_until" type="date" className={selectClass} {...register('valid_until')} />
            <FieldError message={fieldError('valid_until')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="company_id" className="text-xs font-medium text-[var(--color-neutral-500)]">
              Company <span className="text-[var(--color-danger-500)]">*</span>
            </label>
            <select id="company_id" className={selectClass} {...register('company_id')}>
              <option value="">Select…</option>
              {(() => {
                const opts = [];
                for (const c of companies) {
                  if (!isUuid(c.id)) continue;
                  opts.push(
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>,
                  );
                }
                return opts;
              })()}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="branch_id" className="text-xs font-medium text-[var(--color-neutral-500)]">Branch</label>
            <select id="branch_id" className={selectClass} {...register('branch_id')}>
              <option value="">Select…</option>
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
            <label htmlFor="department_id" className="text-xs font-medium text-[var(--color-neutral-500)]">Department</label>
            <select id="department_id" className={selectClass} {...register('department_id')}>
              <option value="">Select…</option>
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
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="customer_id" className="text-xs font-medium text-[var(--color-neutral-500)]">
              Customer *
            </label>
            <select id="customer_id" className={selectClass} {...register('customer_id')}>
              <option value="">
                {customersLoading ? 'Loading customers…' : 'Select customer…'}
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code ? `${c.name} (${c.code})` : c.name}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('customer_id')} />
            {customersError ? (
              <p className="text-xs text-[var(--color-danger-600)]">
                Could not load customers: {getErrorMessage(customersErr)}
              </p>
            ) : null}
            {!customersLoading && !customersError && customers.length === 0 ? (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                No customers found. The quotation customer list only shows parties with type{' '}
                <strong>Customer</strong>. Create one under{' '}
                <Link className="font-medium underline" to="/parties/new">
                  Parties → New party
                </Link>
                , set <strong>Party type = Customer</strong>, save, then return here.
              </p>
            ) : null}
          </div>
          <Input
            label="Salesperson ID"
            error={fieldError('salesperson_id')}
            placeholder="Optional user UUID"
            {...register('salesperson_id')}
          />
          <div className="space-y-1">
            <label htmlFor="carrier_id" className="text-xs font-medium text-[var(--color-neutral-500)]">Carrier</label>
            <select id="carrier_id" className={selectClass} {...register('carrier_id')}>
              <option value="">Select…</option>
              {carriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipment information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <div className="space-y-1">
            <label htmlFor="origin_port_id" className="text-xs font-medium text-[var(--color-neutral-500)]">Origin port</label>
            <select id="origin_port_id" className={selectClass} {...register('origin_port_id')}>
              <option value="">Select…</option>
              {portOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="dest_port_id" className="text-xs font-medium text-[var(--color-neutral-500)]">
              Destination port
            </label>
            <select id="dest_port_id" className={selectClass} {...register('dest_port_id')}>
              <option value="">Select…</option>
              {portOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="incoterm" className="text-xs font-medium text-[var(--color-neutral-500)]">Incoterm</label>
            <select id="incoterm" className={selectClass} {...register('incoterm')}>
              <option value="">Select…</option>
              {INCOTERMS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <Input label="Commodity" error={fieldError('commodity')} {...register('commodity')} />
          <Input label="HS code" error={fieldError('hs_code')} {...register('hs_code')} />
          <Input
            label="Gross weight"
            type="number"
            step="any"
            error={fieldError('gross_weight')}
            {...register('gross_weight', { valueAsNumber: true })}
          />
          <Input
            label="Chargeable weight"
            type="number"
            step="any"
            error={fieldError('chargeable_weight')}
            {...register('chargeable_weight', { valueAsNumber: true })}
          />
          <Input
            label="Volume (CBM)"
            type="number"
            step="any"
            error={fieldError('volume_cbm')}
            {...register('volume_cbm', { valueAsNumber: true })}
          />
          <Input
            label="Pieces"
            type="number"
            error={fieldError('pieces')}
            {...register('pieces', { valueAsNumber: true })}
          />
          <Input
            label="Container count"
            type="number"
            error={fieldError('container_count')}
            {...register('container_count', { valueAsNumber: true })}
          />
          <div className="space-y-1">
            <label htmlFor="container_type_id" className="text-xs font-medium text-[var(--color-neutral-500)]">
              Container type
            </label>
            <select id="container_type_id" className={selectClass} {...register('container_type_id')}>
              <option value="">Select…</option>
              {(() => {
                const opts = [];
                for (const c of containers) {
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
          <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)] mt-6">
            <input type="checkbox" {...register('is_dg')} />
            Dangerous goods
          </label>
          <Input label="DG class" error={fieldError('dg_class')} {...register('dg_class')} />
          <Input
            label="Transit time (days)"
            type="number"
            error={fieldError('transit_time_days')}
            {...register('transit_time_days', { valueAsNumber: true })}
          />
          <div className="sm:col-span-2 space-y-1">
            <label htmlFor="special_requirements" className="text-xs font-medium text-[var(--color-neutral-500)]">
              Special requirements
            </label>
            <textarea
              id="special_requirements"
              className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('special_requirements')}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <div className="space-y-1">
            <label htmlFor="currency_code" className="text-xs font-medium text-[var(--color-neutral-500)]">Currency *</label>
            <select id="currency_code" className={selectClass} {...register('currency_code')}>
              <option value="">Select…</option>
              {currencies.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('currency_code')} />
          </div>
          <Input
            label="Exchange rate"
            type="number"
            step="any"
            error={fieldError('exchange_rate')}
            {...register('exchange_rate', { valueAsNumber: true })}
          />
          <Input
            label="Discount %"
            type="number"
            step="any"
            error={fieldError('discount_percent')}
            {...register('discount_percent', { valueAsNumber: true })}
          />
          <Input
            label="Discount amount"
            type="number"
            step="any"
            error={fieldError('discount_amount')}
            {...register('discount_amount', { valueAsNumber: true })}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 p-4 pt-0">
          <div className="space-y-1">
            <label htmlFor="remarks" className="text-xs font-medium text-[var(--color-neutral-500)]">Remarks</label>
            <textarea
              id="remarks"
              className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('remarks')}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="internal_notes" className="text-xs font-medium text-[var(--color-neutral-500)]">
              Internal notes
            </label>
            <textarea
              id="internal_notes"
              className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('internal_notes')}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="routing_notes" className="text-xs font-medium text-[var(--color-neutral-500)]">
              Routing notes
            </label>
            <textarea
              id="routing_notes"
              className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('routing_notes')}
            />
          </div>
          <Input
            label="Carrier preference"
            error={fieldError('carrier_preference')}
            {...register('carrier_preference')}
          />
        </div>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create quotation' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
