import { useEffect, useState } from 'react';
import { type Resolver, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { MasterPlaceSelect } from '@/features/masters/components/MasterPlaceSelect';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { isUuid } from '@/lib/isUuid';
import { appType } from '@/lib/erpTypography';
import { useAppForm } from '@/lib/validation';
import {
  QuotationWizardNav,
  QuotationWizardStepper,
} from '@/features/quotations/components/quotation-wizard';
import { SERVICE_TYPES, crmLabel, type ServiceType } from '../constants/crm.constants';
import {
  CrmCurrencySelect,
  CrmPartySelect,
  CrmSalespersonSelect,
} from '../components/CrmFormControls';
import { ServiceTypeSelectGrid } from '../components/ServiceTypeSelectGrid';
import { CrmAlert, Field, SelectInput, TextArea, TextInput } from '../components/CrmUi';
import { useCreateCrmEnquiry } from '../hooks/useCrmEnquiries';
import { createEnquirySchema, type CreateEnquiryFormValues } from '../schemas/crm.schema';
import type { CreateEnquiryDto } from '../types/crm.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';
import { CUSTOMER_SERVICE_PATHS } from '@/features/customers/utils/customerServicePaths';

const defaults: CreateEnquiryFormValues = {
  service_type: 'SEA_FCL_EXPORT',
  currency_code: 'AED',
  weight_unit: 'KG',
  cbm_unit: 'CBM',
  charges: [],
};

/**
 * Fresa Enquiry Sheet flow:
 * Create Enquiry (Department) → Port Details → Consignment Details → Charge Details → Enquiry Summary → Finish
 */
const ENQUIRY_WIZARD_STEPS = [
  { key: 'create', label: 'Create Enquiry' },
  { key: 'ports', label: 'Port Details' },
  { key: 'consignment', label: 'Consignment Details' },
  { key: 'charges', label: 'Charge Details' },
  { key: 'summary', label: 'Enquiry Summary' },
] as const;

const ENQUIRY_SHEET_LIST = '/customer-service/enquiry-sheet';

const panelClass =
  'rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6';

export default function CrmEnquiryCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mutation = useCreateCrmEnquiry();
  const [stepIndex, setStepIndex] = useState(0);
  const step = ENQUIRY_WIZARD_STEPS[stepIndex]?.key ?? 'ports';

  const form = useAppForm<CreateEnquiryFormValues>({
    resolver: zodResolver(createEnquirySchema) as unknown as Resolver<CreateEnquiryFormValues>,
    defaultValues: defaults,
  });
  const {
    register,
    handleValidatedSubmit,
    watch,
    setValue,
    control,
    trigger,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'charges' });
  const err = (name: keyof CreateEnquiryFormValues) =>
    errors[name]?.message ? String(errors[name]?.message) : undefined;

  const values = watch();
  const serviceType = values.service_type;
  const isFcl = serviceType === 'SEA_FCL_EXPORT' || serviceType === 'SEA_FCL_IMPORT';
  const isAir = serviceType === 'AIR_EXPORT' || serviceType === 'AIR_IMPORT';
  const placeKind = isAir ? 'airports' : 'ports';
  const { data: containerTypes = [] } = useMasterOptions(
    'container-types',
    MASTER_PATHS['container-types'],
    true,
  );

  useEffect(() => {
    const partyId = searchParams.get('party_id');
    const leadId = searchParams.get('lead_id');
    if (partyId && isUuid(partyId)) setValue('party_id', partyId, { shouldValidate: true });
    if (leadId && isUuid(leadId)) setValue('lead_id', leadId, { shouldValidate: true });
    const service = searchParams.get('service_type');
    if (service && (SERVICE_TYPES as readonly string[]).includes(service)) {
      setValue('service_type', service as CreateEnquiryFormValues['service_type'], {
        shouldValidate: true,
      });
    }
  }, [searchParams, setValue]);

  const goNext = async () => {
    if (step === 'create') {
      const ok = await trigger(['service_type']);
      if (!ok || !values.service_type) return;
      setStepIndex(1);
      return;
    }
    if (step === 'ports') {
      const ok = await trigger(['service_type', 'currency_code', 'party_id']);
      if (!ok) return;
      setStepIndex(2);
      return;
    }
    if (step === 'consignment') {
      setStepIndex(3);
      return;
    }
    if (step === 'charges') {
      setStepIndex(4);
      return;
    }
    if (step === 'summary') {
      void handleValidatedSubmit(async (formValues) => {
        const item = await mutation.mutateAsync(
          prepareCrmPayload(formValues) as unknown as CreateEnquiryDto,
        );
        navigate(CUSTOMER_SERVICE_PATHS.enquiryDetail(item.id), {
          state: { enquiryCreated: true },
        });
      })();
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(ENQUIRY_SHEET_LIST)}
      >
        ← Back to Enquiry Sheet
      </button>
      <div className="text-center">
        <h2 className={appType.pageTitle}>Create Enquiry</h2>
        <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
          Enquiry Sheet — Department → Port Details → Consignment → Charges → Finish
        </p>
      </div>
      {mutation.isError ? <CrmAlert>{getErrorMessage(mutation.error)}</CrmAlert> : null}

      <form
        className="mx-auto max-w-5xl space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          void goNext();
        }}
      >
        <QuotationWizardStepper
          currentStep={stepIndex}
          steps={[...ENQUIRY_WIZARD_STEPS]}
          className="pt-1"
          ariaLabel="Enquiry steps"
        />

        {step === 'create' ? (
          <div className={panelClass}>
            <ServiceTypeSelectGrid
              value={values.service_type}
              onChange={(serviceType: ServiceType) =>
                setValue('service_type', serviceType, { shouldValidate: true, shouldDirty: true })
              }
              error={err('service_type')}
            />
          </div>
        ) : null}

        {step === 'ports' ? (
          <div className={panelClass}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">
                Port Details
              </h3>
              <p className="text-xs text-[var(--color-neutral-500)]">
                Department:{' '}
                <span className="font-semibold text-[var(--color-neutral-800)]">
                  {crmLabel(values.service_type)}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-4">
                <CrmPartySelect
                  label="Client"
                  required={isFcl}
                  value={values.party_id ?? ''}
                  onChange={(id) => setValue('party_id', id, { shouldValidate: true })}
                  error={err('party_id')}
                />
                <Field label="Customer address" error={err('customer_address')}>
                  <TextArea {...register('customer_address')} />
                </Field>
                <Field label="Incoterms" error={err('incoterms')}>
                  <TextInput {...register('incoterms')} placeholder="FOB / CIF…" maxLength={10} />
                </Field>
              </div>

              <div className="space-y-4">
                <CrmCurrencySelect
                  label="Currency"
                  required
                  value={values.currency_code ?? ''}
                  onChange={(c) => setValue('currency_code', c, { shouldValidate: true })}
                  error={err('currency_code')}
                />
                <Field label="Enquiry date" error={err('enquiry_date')}>
                  <TextInput type="date" {...register('enquiry_date')} />
                </Field>
                <MasterPlaceSelect
                  name="por_port_id"
                  label="POR (Port of receipt)"
                  kind={placeKind}
                  jobType={serviceType}
                  value={values.por_port_id ?? ''}
                  onChange={(v) => setValue('por_port_id', v, { shouldValidate: true })}
                  error={err('por_port_id')}
                />
                <MasterPlaceSelect
                  name="origin_port_id"
                  label={isFcl ? 'Origin / POL' : 'Origin'}
                  kind={placeKind}
                  jobType={serviceType}
                  value={values.origin_port_id ?? ''}
                  onChange={(v) => setValue('origin_port_id', v, { shouldValidate: true })}
                  error={err('origin_port_id')}
                  excludeId={values.dest_port_id || undefined}
                />
                <MasterPlaceSelect
                  name="dest_port_id"
                  label={isFcl ? 'Destination / POD' : 'Destination'}
                  kind={placeKind}
                  jobType={serviceType}
                  value={values.dest_port_id ?? ''}
                  onChange={(v) => setValue('dest_port_id', v, { shouldValidate: true })}
                  error={err('dest_port_id')}
                  excludeId={values.origin_port_id || undefined}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="ETD" error={err('etd')}>
                    <TextInput type="date" {...register('etd')} />
                  </Field>
                  <Field label="ETA" error={err('eta')}>
                    <TextInput type="date" {...register('eta')} />
                  </Field>
                </div>
              </div>

              <div className="space-y-4">
                <CrmSalespersonSelect
                  label="Salesperson"
                  value={values.salesperson_id ?? ''}
                  onChange={(v) => setValue('salesperson_id', v, { shouldValidate: true })}
                  error={err('salesperson_id')}
                />
                <Field label="Vessel" error={err('vessel_name')}>
                  <TextInput {...register('vessel_name')} />
                </Field>
                <Field label="Voyage" error={err('voyage_number')}>
                  <TextInput {...register('voyage_number')} />
                </Field>
                <Field label="Payable at" error={err('payable_at')}>
                  <TextInput {...register('payable_at')} />
                </Field>
                <Field label="Dispatch at" error={err('dispatch_at')}>
                  <TextInput {...register('dispatch_at')} />
                </Field>
                <CrmPartySelect
                  label="Shipper"
                  value={values.shipper_id ?? ''}
                  onChange={(id) => setValue('shipper_id', id, { shouldValidate: true })}
                  error={err('shipper_id')}
                />
                <CrmPartySelect
                  label="Consignee"
                  value={values.consignee_id ?? ''}
                  onChange={(id) => setValue('consignee_id', id, { shouldValidate: true })}
                  error={err('consignee_id')}
                />
                <Field label="Shipper address" error={err('shipper_address')}>
                  <TextArea {...register('shipper_address')} />
                </Field>
                <Field label="Consignee address" error={err('consignee_address')}>
                  <TextArea {...register('consignee_address')} />
                </Field>
                <Field label="Lead ID (optional)" error={err('lead_id')}>
                  <TextInput {...register('lead_id')} placeholder="UUID" />
                </Field>
              </div>
            </div>
          </div>
        ) : null}

        {step === 'consignment' ? (
          <div className={panelClass}>
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-neutral-800)]">
              Consignment Details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Commodity" error={err('commodity')}>
                <TextInput {...register('commodity')} />
              </Field>
              <Field label="HS code" error={err('hs_code')}>
                <TextInput {...register('hs_code')} maxLength={12} />
              </Field>
              <Field label="No of Packages / Pieces" error={err('pieces')}>
                <TextInput type="number" min={0} step="1" {...register('pieces')} />
              </Field>
              <Field label="Container type" error={err('container_type_id')}>
                <SelectInput {...register('container_type_id')}>
                  <option value="">Select…</option>
                  {containerTypes.map((o) => {
                    const id = String(o.id ?? '');
                    if (!id) return null;
                    return (
                      <option key={id} value={id}>
                        {String(o.name ?? o.code ?? id)}
                      </option>
                    );
                  })}
                </SelectInput>
              </Field>
              <Field label="No of Container" error={err('container_count')}>
                <TextInput type="number" min={0} step="1" {...register('container_count')} />
              </Field>
              <Field label="Weight unit" error={err('weight_unit')}>
                <TextInput {...register('weight_unit')} placeholder="KG" />
              </Field>
              <Field label="Gross weight" error={err('gross_weight')}>
                <TextInput type="number" min={0} step="any" {...register('gross_weight')} />
              </Field>
              <Field label="Net weight" error={err('net_weight')}>
                <TextInput type="number" min={0} step="any" {...register('net_weight')} />
              </Field>
              <Field label="Chargeable weight" error={err('chargeable_weight')}>
                <TextInput type="number" min={0} step="any" {...register('chargeable_weight')} />
              </Field>
              <Field label="Volume (CBM)" error={err('volume_cbm')}>
                <TextInput type="number" min={0} step="any" {...register('volume_cbm')} />
              </Field>
              <Field label="CBM unit" error={err('cbm_unit')}>
                <TextInput {...register('cbm_unit')} placeholder="CBM" />
              </Field>
              <Field label="Unit price" error={err('unit_price')}>
                <TextInput type="number" min={0} step="any" {...register('unit_price')} />
              </Field>
              <div className="sm:col-span-2 lg:col-span-3">
                <Field label="Cargo / consignment details" error={err('cargo_details')}>
                  <TextArea
                    {...register('cargo_details')}
                    placeholder="Commodity notes, packaging, marks…"
                  />
                </Field>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <Field label="Description / Special requirements" error={err('special_requirements')}>
                  <TextArea {...register('special_requirements')} />
                </Field>
              </div>
            </div>
          </div>
        ) : null}

        {step === 'charges' ? (
          <div className={`${panelClass} space-y-5`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">
                  Charge Details
                </h3>
                <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
                  Add charges for this enquiry (description + amount), then click Next to review the
                  Enquiry Summary.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  append({
                    description: '',
                    amount: 0,
                    quantity: 1,
                    unit_price: 0,
                    currency_code: values.currency_code || 'AED',
                    is_cost: false,
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add charges
              </Button>
            </div>
            {!fields.length ? (
              <p className="rounded-lg border border-dashed border-[var(--color-neutral-200)] px-3 py-8 text-center text-sm text-[var(--color-neutral-500)]">
                No charges yet. Click Add charges, or continue to Enquiry Summary.
              </p>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-3 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-3 sm:grid-cols-6"
                  >
                    <div className="sm:col-span-2">
                      <Field label="Description">
                        <TextInput {...register(`charges.${index}.description`)} />
                      </Field>
                    </div>
                    <Field label="Qty">
                      <TextInput
                        type="number"
                        min={0}
                        step="any"
                        {...register(`charges.${index}.quantity`)}
                      />
                    </Field>
                    <Field label="Unit price">
                      <TextInput
                        type="number"
                        step="any"
                        {...register(`charges.${index}.unit_price`)}
                      />
                    </Field>
                    <Field label="Amount">
                      <TextInput
                        type="number"
                        step="any"
                        {...register(`charges.${index}.amount`)}
                      />
                    </Field>
                    <div className="flex items-end gap-1">
                      <Field label="Currency">
                        <TextInput
                          {...register(`charges.${index}.currency_code`)}
                          maxLength={3}
                        />
                      </Field>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="mb-0.5"
                        onClick={() => remove(index)}
                        aria-label="Remove charge"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {step === 'summary' ? (
          <div className={panelClass}>
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-neutral-800)]">
              Enquiry Summary
            </h3>
            <p className="mb-4 text-xs text-[var(--color-neutral-500)]">
              Check all the details below, then click Finish to create the enquiry.
            </p>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryItem label="Department" value={crmLabel(values.service_type)} />
              <SummaryItem label="Currency" value={values.currency_code} />
              <SummaryItem
                label="Client"
                value={values.party_id ? `${values.party_id.slice(0, 8)}…` : '—'}
              />
              <SummaryItem label="Incoterms" value={values.incoterms || '—'} />
              <SummaryItem label="POR" value={values.por_port_id ? 'Selected' : '—'} />
              <SummaryItem label="Origin" value={values.origin_port_id ? 'Selected' : '—'} />
              <SummaryItem label="Destination" value={values.dest_port_id ? 'Selected' : '—'} />
              <SummaryItem
                label="ETD / ETA"
                value={[values.etd, values.eta].filter(Boolean).join(' → ') || '—'}
              />
              <SummaryItem label="Commodity" value={values.commodity || '—'} />
              <SummaryItem
                label="Containers"
                value={
                  values.container_count != null
                    ? `${values.container_count}${values.container_type_id ? ' × type' : ''}`
                    : '—'
                }
              />
              <SummaryItem
                label="Weights"
                value={
                  [
                    values.gross_weight != null ? `G:${values.gross_weight}` : null,
                    values.net_weight != null ? `N:${values.net_weight}` : null,
                    values.chargeable_weight != null ? `C:${values.chargeable_weight}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || '—'
                }
              />
              <SummaryItem label="Charges" value={`${values.charges?.length ?? 0} line(s)`} />
              <div className="sm:col-span-2 lg:col-span-3">
                <SummaryItem label="Cargo" value={values.cargo_details || '—'} />
              </div>
            </dl>
          </div>
        ) : null}

        <QuotationWizardNav
          currentStep={stepIndex}
          totalSteps={ENQUIRY_WIZARD_STEPS.length}
          onPrevious={() => setStepIndex((s) => Math.max(0, s - 1))}
          onCancel={() => navigate(ENQUIRY_SHEET_LIST)}
          onNext={() => void goNext()}
          isSubmitting={mutation.isPending}
          submitLabel="Finish"
          disableNext={step === 'create' && !values.service_type}
        />
      </form>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-neutral-500)]">{label}</dt>
      <dd className="mt-0.5 font-medium text-[var(--color-neutral-800)]">{value || '—'}</dd>
    </div>
  );
}
