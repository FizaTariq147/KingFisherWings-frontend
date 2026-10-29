import { useEffect, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { MasterPlaceSelect } from '@/features/masters/components/MasterPlaceSelect';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useParties } from '@/features/parties/hooks/useParties';
import { useTenantCompanies } from '@/features/users/hooks/useTenantCompanies';
import { getErrorMessage } from '@/features/parties/utils/getErrorMessage';
import { isAirJobType } from '@/features/jobs/constants/job.constants';
import {
  INCOTERMS,
  JOB_TYPE_LABELS,
  type JobType,
} from '@/features/quotations/constants/quotation.constants';
import {
  JobTypeSelectGrid,
  QuotationWizardNav,
  QuotationWizardStepper,
} from '@/features/quotations/components/quotation-wizard';
import {
  SHIPMENT_WIZARD_STEPS,
  isShipmentWizardLastStep,
  shipmentWizardStepKey,
} from '../../constants/shipmentWizard.constants';
import type { CreateShipmentChargeDto, CreateShipmentDto } from '../../types/shipment.types';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)]';

const labelClass = 'text-xs font-medium text-[var(--color-neutral-500)]';

const panelClass =
  'rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6';

export type ShipmentFormValues = {
  job_type: string;
  customer_id: string;
  company_id: string;
  branch_id: string;
  department_id: string;
  quotation_id: string;
  enquiry_id: string;
  salesperson_id: string;
  carrier_id: string;
  origin_port_id: string;
  dest_port_id: string;
  por_port_id: string;
  pof_port_id: string;
  place_of_delivery: string;
  shipment_date: string;
  customer_address: string;
  incoterms: string;
  freight_payment_type: string;
  freight_terms: string;
  vessel_name: string;
  voyage_number: string;
  flight_number: string;
  commodity: string;
  hs_code: string;
  container_type_id: string;
  container_count: number | undefined;
  pieces: number | undefined;
  gross_weight: number | undefined;
  chargeable_weight: number | undefined;
  volume_cbm: number | undefined;
  is_dg: boolean;
  dg_class: string;
  notes: string;
  marks_numbers: string;
};

export const SHIPMENT_FORM_DEFAULTS: ShipmentFormValues = {
  job_type: '',
  customer_id: '',
  company_id: '',
  branch_id: '',
  department_id: '',
  quotation_id: '',
  enquiry_id: '',
  salesperson_id: '',
  carrier_id: '',
  origin_port_id: '',
  dest_port_id: '',
  por_port_id: '',
  pof_port_id: '',
  place_of_delivery: '',
  shipment_date: '',
  customer_address: '',
  incoterms: '',
  freight_payment_type: '',
  freight_terms: '',
  vessel_name: '',
  voyage_number: '',
  flight_number: '',
  commodity: '',
  hs_code: '',
  container_type_id: '',
  container_count: undefined,
  pieces: undefined,
  gross_weight: undefined,
  chargeable_weight: undefined,
  volume_cbm: undefined,
  is_dg: false,
  dg_class: '',
  notes: '',
  marks_numbers: '',
};

type DraftChargeLine = CreateShipmentChargeDto & { localId: string };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

function optionalUuid(raw?: string): string | undefined {
  const t = (raw || '').trim();
  return isUuid(t) ? t : undefined;
}

function optionalText(raw?: string): string | undefined {
  const t = (raw || '').trim();
  return t || undefined;
}

function optionalNumber(n: number | undefined | null): number | undefined {
  if (n == null || Number.isNaN(n)) return undefined;
  return n;
}

/** Map wizard values → OpenAPI CreateShipmentDto. */
export function buildCreateShipmentDtoFromForm(
  values: ShipmentFormValues,
  charges: DraftChargeLine[] = [],
): CreateShipmentDto {
  if (!values.job_type?.trim()) throw new Error('Select a shipment type.');
  if (!optionalUuid(values.customer_id)) throw new Error('Customer is required.');

  const dto: CreateShipmentDto = {
    job_type: values.job_type.trim(),
    customer_id: values.customer_id.trim(),
  };

  const assignUuid = (key: keyof CreateShipmentDto, raw?: string) => {
    const id = optionalUuid(raw);
    if (id) (dto as Record<string, unknown>)[key] = id;
  };
  const assignText = (key: keyof CreateShipmentDto, raw?: string) => {
    const t = optionalText(raw);
    if (t) (dto as Record<string, unknown>)[key] = t;
  };

  assignUuid('company_id', values.company_id);
  assignUuid('branch_id', values.branch_id);
  assignUuid('department_id', values.department_id);
  assignUuid('quotation_id', values.quotation_id);
  assignUuid('enquiry_id', values.enquiry_id);
  assignUuid('salesperson_id', values.salesperson_id);
  assignUuid('carrier_id', values.carrier_id);
  assignUuid('origin_port_id', values.origin_port_id);
  assignUuid('dest_port_id', values.dest_port_id);
  assignUuid('por_port_id', values.por_port_id);
  assignUuid('pof_port_id', values.pof_port_id);
  assignUuid('container_type_id', values.container_type_id);

  assignText('place_of_delivery', values.place_of_delivery);
  assignText('shipment_date', values.shipment_date);
  assignText('customer_address', values.customer_address);
  assignText('incoterms', values.incoterms);
  assignText('freight_payment_type', values.freight_payment_type);
  assignText('freight_terms', values.freight_terms);
  assignText('vessel_name', values.vessel_name);
  assignText('voyage_number', values.voyage_number);
  assignText('flight_number', values.flight_number);
  assignText('commodity', values.commodity);
  assignText('hs_code', values.hs_code);
  assignText('dg_class', values.dg_class);
  assignText('notes', values.notes);
  assignText('marks_numbers', values.marks_numbers);

  const containerCount = optionalNumber(values.container_count);
  const pieces = optionalNumber(values.pieces);
  const gw = optionalNumber(values.gross_weight);
  const cw = optionalNumber(values.chargeable_weight);
  const cbm = optionalNumber(values.volume_cbm);
  if (containerCount !== undefined) dto.container_count = containerCount;
  if (pieces !== undefined) dto.pieces = pieces;
  if (gw !== undefined) dto.gross_weight = gw;
  if (cw !== undefined) dto.chargeable_weight = cw;
  if (cbm !== undefined) dto.volume_cbm = cbm;
  if (values.is_dg) dto.is_dg = true;

  if (charges.length) {
    dto.charges = charges.map(({ localId: _id, ...line }) => ({
      description: line.description,
      unit_price: Number(line.unit_price) || 0,
      ...(optionalUuid(line.charge_code_id) ? { charge_code_id: line.charge_code_id } : {}),
      ...(optionalNumber(line.quantity) !== undefined ? { quantity: line.quantity } : {}),
      ...(optionalText(line.currency_code) ? { currency_code: line.currency_code } : {}),
      ...(line.is_cost ? { is_cost: true } : {}),
    }));
  }

  return dto;
}

type ShipmentFormProps = {
  defaultValues?: Partial<ShipmentFormValues>;
  onSubmit: (dto: CreateShipmentDto) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
};

export function ShipmentForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: ShipmentFormProps) {
  const [step, setStep] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ShipmentFormValues, string>>>(
    {},
  );
  const [draftLines, setDraftLines] = useState<DraftChargeLine[]>([]);
  const [chargeDraft, setChargeDraft] = useState({
    charge_code_id: '',
    description: '',
    quantity: '1',
    unit_price: '',
    currency_code: 'AED',
    is_cost: false,
  });
  const [showChargeForm, setShowChargeForm] = useState(false);

  const { data: companies = [] } = useTenantCompanies(true);
  const {
    data: customersResult,
    isLoading: customersLoading,
    isError: customersError,
    error: customersErr,
  } = useParties({ page: 1, limit: 100, party_type: 'CUSTOMER', order: 'asc' });
  const { data: carriersResult } = useParties({ page: 1, limit: 100, order: 'asc' });
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
  const { data: chargeCodes = [] } = useMasterOptions(
    'charge-codes',
    MASTER_PATHS['charge-codes'],
    true,
  );

  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useAppForm<ShipmentFormValues>({
    defaultValues: { ...SHIPMENT_FORM_DEFAULTS, ...defaultValues },
  });

  const watched = watch();
  const useAirports = isAirJobType(watched.job_type);
  const jtNorm = String(watched.job_type ?? '')
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  const hideContainers =
    jtNorm === 'WAREHOUSE' ||
    jtNorm === 'ROAD_FREIGHT' ||
    jtNorm === 'LAND' ||
    jtNorm === 'COURIER' ||
    jtNorm === 'CUSTOMS_CLEARANCE';

  const customers = (customersResult?.parties ?? []).filter((p) => isUuid(p.id));
  const carrierTypes = new Set(['AIRLINE', 'SHIPPING_LINE', 'TRUCKER', 'CARRIER', 'TRANSPORTER']);
  const carriersFiltered = (carriersResult?.parties ?? []).filter(
    (p) => isUuid(p.id) && carrierTypes.has(String(p.party_type)),
  );
  const carriers =
    carriersFiltered.length > 0
      ? carriersFiltered
      : (carriersResult?.parties ?? []).filter((p) => isUuid(p.id));

  useEffect(() => {
    if (watched.company_id) return;
    const first = companies.find((c) => isUuid(c.id));
    if (first) setValue('company_id', first.id);
  }, [companies, watched.company_id, setValue]);

  const wizardStepKey = shipmentWizardStepKey(step);
  const fieldError = (name: keyof ShipmentFormValues) =>
    fieldErrors[name] || (errors[name]?.message as string | undefined);

  const labelForCustomer = (id?: string) => {
    if (!id) return '—';
    const party = customers.find((c) => c.id === id);
    if (!party) return id;
    return party.code ? `${party.name} (${party.code})` : party.name;
  };
  const labelForCarrier = (id?: string) => {
    if (!id) return '—';
    return carriers.find((c) => c.id === id)?.name || id;
  };
  const labelForCompany = (id?: string) => {
    if (!id) return '—';
    return companies.find((c) => c.id === id)?.name || id;
  };
  const labelForContainer = (id?: string) => {
    if (!id) return '—';
    const row = containers.find((c) => String(c.id) === id);
    return row ? String(row.name ?? '').trim() || '—' : '—';
  };

  const chargeLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of chargeCodes) {
      if (!isUuid(String(c.id))) continue;
      map.set(String(c.id), String(c.code ?? c.name ?? c.id));
    }
    return map;
  }, [chargeCodes]);

  const validateStep = (): boolean => {
    const values = getValues();
    const next: Partial<Record<keyof ShipmentFormValues, string>> = {};
    if (wizardStepKey === 'create' && !values.job_type) {
      next.job_type = 'Select a shipment type.';
    }
    if (wizardStepKey === 'ports') {
      if (!optionalUuid(values.customer_id)) next.customer_id = 'Customer is required.';
      if (values.quotation_id.trim() && !isUuid(values.quotation_id.trim())) {
        next.quotation_id = 'Must be a valid UUID.';
      }
      if (values.enquiry_id.trim() && !isUuid(values.enquiry_id.trim())) {
        next.enquiry_id = 'Must be a valid UUID.';
      }
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = async () => {
    if (!validateStep()) return;
    if (isShipmentWizardLastStep(step)) {
      try {
        const dto = buildCreateShipmentDtoFromForm(getValues(), draftLines);
        await onSubmit(dto);
      } catch (e) {
        setFieldErrors({
          customer_id: e instanceof Error ? e.message : 'Could not create shipment.',
        });
      }
      return;
    }
    setStep((s) => Math.min(s + 1, SHIPMENT_WIZARD_STEPS.length - 1));
  };

  const addChargeLine = () => {
    const description = chargeDraft.description.trim();
    const unitPrice = Number(chargeDraft.unit_price);
    if (!description || !Number.isFinite(unitPrice)) return;
    setDraftLines((prev) => [
      ...prev,
      {
        localId: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        description,
        unit_price: unitPrice,
        quantity: Number(chargeDraft.quantity) || 1,
        currency_code: chargeDraft.currency_code.trim() || 'AED',
        is_cost: chargeDraft.is_cost,
        ...(isUuid(chargeDraft.charge_code_id)
          ? { charge_code_id: chargeDraft.charge_code_id }
          : {}),
      },
    ]);
    setShowChargeForm(false);
    setChargeDraft({
      charge_code_id: '',
      description: '',
      quantity: '1',
      unit_price: '',
      currency_code: 'AED',
      is_cost: false,
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void goNext();
      }}
      className="mx-auto max-w-5xl space-y-6"
    >
      <QuotationWizardStepper
        currentStep={step}
        steps={[...SHIPMENT_WIZARD_STEPS]}
        ariaLabel="Shipment steps"
      />

      {wizardStepKey === 'create' ? (
        <div className={panelClass}>
          <JobTypeSelectGrid
            value={watched.job_type}
            heading="What type of Shipment would you like to create?"
            onChange={(jobType: JobType) => {
              setValue('job_type', jobType, { shouldDirty: true });
              setFieldErrors((prev) => ({ ...prev, job_type: undefined }));
            }}
            error={fieldError('job_type')}
          />
        </div>
      ) : null}

      {wizardStepKey === 'ports' ? (
        <div className={panelClass}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Port Details</h3>
            <p className="text-xs text-[var(--color-neutral-500)]">
              Department:{' '}
              <span className="font-semibold text-[var(--color-neutral-800)]">
                {(JOB_TYPE_LABELS[watched.job_type as JobType] ?? watched.job_type) || '—'}
              </span>
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="branch_id" className={labelClass}>
                  Branch
                </label>
                <select id="branch_id" className={selectClass} {...register('branch_id')}>
                  <option value="">Select…</option>
                  {branches
                    .filter((b) => isUuid(String(b.id)))
                    .map((b) => (
                      <option key={String(b.id)} value={String(b.id)}>
                        {String(b.name ?? b.code ?? b.id)}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="customer_id" className={labelClass}>
                  Customer <span className="text-[var(--color-danger-500)]">*</span>
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
                    No customers found. Create one under{' '}
                    <Link className="font-medium underline" to="/parties/new">
                      Parties → New party
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
              <div className="space-y-1">
                <label htmlFor="company_id" className={labelClass}>
                  Company
                </label>
                <select id="company_id" className={selectClass} {...register('company_id')}>
                  <option value="">Select…</option>
                  {companies
                    .filter((c) => isUuid(c.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="incoterms" className={labelClass}>
                  INCO Terms
                </label>
                <select id="incoterms" className={selectClass} {...register('incoterms')}>
                  <option value="">Select…</option>
                  {INCOTERMS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
              <Input label="Shipment date" type="date" {...register('shipment_date')} />
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="department_id" className={labelClass}>
                  Department
                </label>
                <select id="department_id" className={selectClass} {...register('department_id')}>
                  <option value="">Select…</option>
                  {departments
                    .filter((d) => isUuid(String(d.id)))
                    .map((d) => (
                      <option key={String(d.id)} value={String(d.id)}>
                        {String(d.name ?? d.code ?? d.id)}
                      </option>
                    ))}
                </select>
              </div>
              <Controller
                name="origin_port_id"
                control={control}
                render={({ field }) => (
                  <MasterPlaceSelect
                    name="origin_port_id"
                    label={useAirports ? 'Origin airport' : 'Origin / POL'}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    jobType={watched.job_type}
                    excludeId={watched.dest_port_id || undefined}
                  />
                )}
              />
              <Controller
                name="dest_port_id"
                control={control}
                render={({ field }) => (
                  <MasterPlaceSelect
                    name="dest_port_id"
                    label={useAirports ? 'Destination airport' : 'Destination / POD'}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    jobType={watched.job_type}
                    excludeId={watched.origin_port_id || undefined}
                  />
                )}
              />
              <Controller
                name="por_port_id"
                control={control}
                render={({ field }) => (
                  <MasterPlaceSelect
                    name="por_port_id"
                    label="POR (Port of receipt)"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    jobType={watched.job_type}
                  />
                )}
              />
              <Controller
                name="pof_port_id"
                control={control}
                render={({ field }) => (
                  <MasterPlaceSelect
                    name="pof_port_id"
                    label="POF / Final destination"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    jobType={watched.job_type}
                  />
                )}
              />
            </div>

            <div className="space-y-4">
              <Input
                label="Quotation ID"
                placeholder="Optional UUID"
                error={fieldError('quotation_id')}
                {...register('quotation_id')}
              />
              <Input
                label="Enquiry ID"
                placeholder="Optional UUID"
                error={fieldError('enquiry_id')}
                {...register('enquiry_id')}
              />
              <div className="space-y-1">
                <label htmlFor="carrier_id" className={labelClass}>
                  Carrier
                </label>
                <select id="carrier_id" className={selectClass} {...register('carrier_id')}>
                  <option value="">Select…</option>
                  {carriers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input label="Freight payment" placeholder="PREPAID / COLLECT" {...register('freight_payment_type')} />
              <Input label="Freight terms" {...register('freight_terms')} />
              <div className="space-y-1">
                <label htmlFor="customer_address" className={labelClass}>
                  Customer address
                </label>
                <textarea
                  id="customer_address"
                  className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                  {...register('customer_address')}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {wizardStepKey === 'consignment' ? (
        <div className={panelClass}>
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-neutral-800)]">
            Planned Container / Consignment
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {!hideContainers ? (
              <>
                <div className="space-y-1">
                  <label htmlFor="container_type_id" className={labelClass}>
                    Container type
                  </label>
                  <select
                    id="container_type_id"
                    className={selectClass}
                    {...register('container_type_id')}
                  >
                    <option value="">Select…</option>
                    {containers
                      .filter((c) => isUuid(String(c.id)) && String(c.name ?? '').trim())
                      .map((c) => (
                        <option key={String(c.id)} value={String(c.id)}>
                          {String(c.name).trim()}
                        </option>
                      ))}
                  </select>
                </div>
                <Input
                  label="No of Container"
                  type="number"
                  {...register('container_count', { valueAsNumber: true })}
                />
              </>
            ) : null}
            <Input
              label="No of Packages / Pieces"
              type="number"
              {...register('pieces', { valueAsNumber: true })}
            />
            <Input label="Commodity" {...register('commodity')} />
            <Input label="HS code" {...register('hs_code')} />
            <Input
              label="Gross weight"
              type="number"
              step="any"
              {...register('gross_weight', { valueAsNumber: true })}
            />
            <Input
              label="Chargeable weight"
              type="number"
              step="any"
              {...register('chargeable_weight', { valueAsNumber: true })}
            />
            <Input
              label="Volume (CBM)"
              type="number"
              step="any"
              {...register('volume_cbm', { valueAsNumber: true })}
            />
            {useAirports ? (
              <Input label="Flight number" {...register('flight_number')} />
            ) : (
              <>
                <Input label="Vessel" {...register('vessel_name')} />
                <Input label="Voyage" {...register('voyage_number')} />
              </>
            )}
            <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)] sm:mt-6">
              <input type="checkbox" {...register('is_dg')} />
              Dangerous goods
            </label>
            <Input label="DG class" {...register('dg_class')} />
            <div className="space-y-1 sm:col-span-2 lg:col-span-3">
              <label htmlFor="marks_numbers" className={labelClass}>
                Marks &amp; numbers
              </label>
              <textarea
                id="marks_numbers"
                className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                {...register('marks_numbers')}
              />
            </div>
            <div className="space-y-1 sm:col-span-2 lg:col-span-3">
              <label htmlFor="notes" className={labelClass}>
                Notes / special requirements
              </label>
              <textarea
                id="notes"
                className="min-h-[88px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                {...register('notes')}
              />
            </div>
          </div>
        </div>
      ) : null}

      {wizardStepKey === 'costing' ? (
        <div className={`${panelClass} space-y-5`}>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">
              Costing / Charges
            </h3>
            <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
              Optional charge lines are sent on create via{' '}
              <span className="font-mono">POST /shipments</span> (<span className="font-mono">charges[]</span>
              ). You can also add charges later on the shipment Costing tab.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[var(--color-neutral-500)]">
              {draftLines.length
                ? `${draftLines.length} draft line${draftLines.length === 1 ? '' : 's'}`
                : 'No charge lines yet'}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Plus />}
              onClick={() => setShowChargeForm(true)}
            >
              Add charge line
            </Button>
          </div>

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
                {draftLines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-[var(--color-neutral-400)]">
                      No charge lines yet. Use Add charge line to draft pricing.
                    </td>
                  </tr>
                ) : (
                  draftLines.map((line) => {
                    const qty = Number(line.quantity) || 0;
                    const price = Number(line.unit_price) || 0;
                    return (
                      <tr key={line.localId} className="border-t border-[var(--color-neutral-100)]">
                        <td className="px-3 py-2">
                          <div className="font-medium text-[var(--color-neutral-800)]">
                            {line.description}
                          </div>
                          {line.charge_code_id ? (
                            <div className="font-mono text-xs text-[var(--color-neutral-400)]">
                              {chargeLabelById.get(line.charge_code_id) ||
                                line.charge_code_id.slice(0, 8)}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-3 py-2 font-mono">{qty}</td>
                        <td className="px-3 py-2 font-mono">
                          {line.currency_code || 'AED'} {price}
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
                              setDraftLines((prev) =>
                                prev.filter((row) => row.localId !== line.localId),
                              )
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

          {showChargeForm ? (
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-[var(--color-neutral-200)] p-4 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="ship_charge_code" className={labelClass}>
                  Charge code
                </label>
                <select
                  id="ship_charge_code"
                  className={selectClass}
                  value={chargeDraft.charge_code_id}
                  onChange={(e) => {
                    const id = e.target.value;
                    const code = chargeCodes.find((c) => String(c.id) === id);
                    setChargeDraft((prev) => ({
                      ...prev,
                      charge_code_id: id,
                      description:
                        prev.description ||
                        (code ? String(code.name ?? code.code ?? '') : prev.description),
                    }));
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
              </div>
              <Input
                label="Description *"
                value={chargeDraft.description}
                onChange={(e) =>
                  setChargeDraft((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <Input
                label="Quantity"
                type="number"
                value={chargeDraft.quantity}
                onChange={(e) =>
                  setChargeDraft((prev) => ({ ...prev, quantity: e.target.value }))
                }
              />
              <Input
                label="Unit price *"
                type="number"
                step="any"
                value={chargeDraft.unit_price}
                onChange={(e) =>
                  setChargeDraft((prev) => ({ ...prev, unit_price: e.target.value }))
                }
              />
              <Input
                label="Currency"
                value={chargeDraft.currency_code}
                onChange={(e) =>
                  setChargeDraft((prev) => ({ ...prev, currency_code: e.target.value }))
                }
              />
              <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)] sm:col-span-2">
                <input
                  type="checkbox"
                  checked={chargeDraft.is_cost}
                  onChange={(e) =>
                    setChargeDraft((prev) => ({ ...prev, is_cost: e.target.checked }))
                  }
                />
                Cost line (vs revenue)
              </label>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button type="button" variant="secondary" onClick={() => setShowChargeForm(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={addChargeLine}>
                  Add charge line
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {wizardStepKey === 'summary' ? (
        <div className={`${panelClass} space-y-4`}>
          <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Summary</h3>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[var(--color-neutral-500)]">Job type</dt>
              <dd className="font-medium text-[var(--color-neutral-800)]">
                {(JOB_TYPE_LABELS[watched.job_type as JobType] ?? watched.job_type) || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-neutral-500)]">Customer</dt>
              <dd className="font-medium text-[var(--color-neutral-800)]">
                {labelForCustomer(watched.customer_id)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-neutral-500)]">Company</dt>
              <dd className="font-medium text-[var(--color-neutral-800)]">
                {labelForCompany(watched.company_id)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-neutral-500)]">Carrier</dt>
              <dd className="font-medium text-[var(--color-neutral-800)]">
                {labelForCarrier(watched.carrier_id)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-neutral-500)]">Incoterm</dt>
              <dd className="font-medium text-[var(--color-neutral-800)]">
                {watched.incoterms || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-neutral-500)]">POL → POD</dt>
              <dd className="font-medium text-[var(--color-neutral-800)]">
                {[watched.origin_port_id ? 'Origin set' : null, watched.dest_port_id ? 'Dest set' : null]
                  .filter(Boolean)
                  .join(' → ') || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-neutral-500)]">Commodity</dt>
              <dd className="font-medium text-[var(--color-neutral-800)]">
                {watched.commodity || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-neutral-500)]">Container</dt>
              <dd className="font-medium text-[var(--color-neutral-800)]">
                {[
                  labelForContainer(watched.container_type_id) !== '—'
                    ? labelForContainer(watched.container_type_id)
                    : null,
                  watched.container_count != null && !Number.isNaN(watched.container_count)
                    ? `× ${watched.container_count}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' ') || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-neutral-500)]">Pieces / weight / volume</dt>
              <dd className="font-medium text-[var(--color-neutral-800)]">
                {[
                  watched.pieces != null && !Number.isNaN(watched.pieces)
                    ? `${watched.pieces} pcs`
                    : null,
                  watched.gross_weight != null && !Number.isNaN(watched.gross_weight)
                    ? `${watched.gross_weight} kg`
                    : null,
                  watched.volume_cbm != null && !Number.isNaN(watched.volume_cbm)
                    ? `${watched.volume_cbm} CBM`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-neutral-500)]">Costing</dt>
              <dd className="font-medium text-[var(--color-neutral-800)]">
                {draftLines.length
                  ? `${draftLines.length} charge line${draftLines.length === 1 ? '' : 's'}`
                  : 'No charges on create'}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}

      <QuotationWizardNav
        currentStep={step}
        totalSteps={SHIPMENT_WIZARD_STEPS.length}
        onPrevious={() => setStep((s) => Math.max(0, s - 1))}
        onCancel={onCancel}
        onNext={() => void goNext()}
        isSubmitting={isSubmitting}
        submitLabel="Create shipment"
        disableNext={wizardStepKey === 'create' && !watched.job_type}
      />
    </form>
  );
}
