import { useState } from 'react';
import { Link } from 'react-router-dom';
import { type Resolver } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { FieldError } from '@/components/ui/FieldError/FieldError';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { MasterPlaceSelect } from '@/features/masters/components/MasterPlaceSelect';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useParties } from '@/features/parties/hooks/useParties';
import { QuotationWizardNav } from '@/features/quotations/components/quotation-wizard';
import {
  JOB_TYPE_LABELS,
  isAirJobType,
  type JobType,
} from '../../constants/job.constants';
import { JOB_CREATE_WIZARD_STEPS } from '../../constants/jobWizard.constants';
import { createJobSchema, updateJobSchema } from '../../schemas/job.schema';
import type { CreateJobFormValues, UpdateJobFormValues } from '../../types/job.types';
import { JOB_FORM_DEFAULTS } from '../../utils/prepareJobPayload';
import {
  JobWizardCostingPanel,
  JobWizardStepper,
  toJobCostingPayload,
  type JobDraftChargeLine,
} from '../job-wizard';
import type { JobWizardCostingPayload } from '../../types/jobWizardCosting.types';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

const labelClass = 'text-xs font-medium text-[var(--color-neutral-500)]';

const DEPARTMENT_FIELDS: (keyof CreateJobFormValues)[] = ['job_type', 'shipper_id', 'branch_id'];
const JOB_INFO_FIELDS: (keyof CreateJobFormValues)[] = [
  'consignee_id',
  'agent_id',
  'origin_port_id',
  'dest_port_id',
  'incoterms',
  'etd',
  'eta',
  'customer_remarks',
  'notes',
];

interface JobFormProps {
  mode: 'create' | 'edit';
  /** FRESA-like multi-step create UI. Edit stays flat. */
  layout?: 'flat' | 'wizard';
  jobTypeOptions: JobType[];
  defaultJobType?: JobType;
  defaultValues?: Partial<CreateJobFormValues>;
  onSubmit: (
    values: CreateJobFormValues | UpdateJobFormValues,
    options?: { costing?: JobWizardCostingPayload },
  ) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function FieldErrorMessage({ message }: { message?: string }) {
  return <FieldError message={message} />;
}

function textareaClass(hasError?: boolean) {
  return `w-full min-h-[72px] rounded-md border px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-500)] ${
    hasError ? 'border-[var(--color-danger-500)]' : 'border-[var(--color-neutral-200)]'
  }`;
}

function partyOptions(parties: Array<{ id: string; name?: string; code?: string }>) {
  const opts: Array<{ value: string; label: string }> = [];
  for (const p of parties) {
    if (!isUuid(p.id)) continue;
    opts.push({
      value: p.id,
      label: [p.code, p.name].filter(Boolean).join(' — ') || p.id,
    });
  }
  return opts;
}

function labelForParty(
  id: string | undefined,
  opts: Array<{ value: string; label: string }>,
): string {
  if (!id) return '—';
  return opts.find((o) => o.value === id)?.label ?? id;
}

export function JobForm({
  mode,
  layout = 'flat',
  jobTypeOptions,
  defaultJobType,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: JobFormProps) {
  const isWizard = layout === 'wizard' && mode === 'create';
  const [step, setStep] = useState(0);
  const [draftCharges, setDraftCharges] = useState<JobDraftChargeLine[]>([]);
  const schema = mode === 'create' ? createJobSchema : updateJobSchema;
  const {
    register,
    control,
    watch,
    trigger,
    handleValidatedSubmit,
    applyApiErrors,
    formState: { errors },
  } = useAppForm<CreateJobFormValues>({
    resolver: zodResolver(schema) as Resolver<CreateJobFormValues>,
    defaultValues: {
      ...JOB_FORM_DEFAULTS,
      job_type: defaultJobType ?? jobTypeOptions[0] ?? 'AIR_EXPORT',
      ...defaultValues,
    },
  });

  const selectedJobType = watch('job_type');
  const useAirports = isAirJobType(selectedJobType);
  const { data: containers = [] } = useMasterOptions(
    'container-types',
    MASTER_PATHS['container-types'],
    true,
  );
  const { data: branches = [] } = useMasterOptions('branches', MASTER_PATHS.branches, true);
  const { data: partiesResult } = useParties({
    page: 1,
    limit: 100,
    order: 'asc',
  });
  const { data: agentsResult } = useParties({
    page: 1,
    limit: 100,
    party_type: 'AGENT',
    order: 'asc',
  });

  const allParties = partiesResult?.parties ?? [];
  const shipperOpts = partyOptions(allParties);
  const consigneeOpts = partyOptions(allParties);
  const agentOpts = partyOptions([
    ...(agentsResult?.parties ?? []),
    ...allParties.filter((p) => p.party_type === 'OVERSEAS_AGENT'),
  ]);

  const originPortId = watch('origin_port_id');
  const destPortId = watch('dest_port_id');
  const watched = watch();

  const fieldError = (name: keyof CreateJobFormValues) =>
    errors[name]?.message as string | undefined;

  const [apiError, setApiError] = useState<string | null>(null);

  const containerOpts: Array<{ value: string; label: string }> = [];
  for (const c of containers) {
    if (!isUuid(String(c.id))) continue;
    containerOpts.push({
      value: String(c.id),
      label: [c.code, c.name].filter(Boolean).join(' — ') || String(c.id),
    });
  }

  const branchOptions = branches
    .filter((b) => isUuid(String(b.id)))
    .map((b) => (
      <option key={String(b.id)} value={String(b.id)}>
        {String(b.name ?? b.code ?? b.id)}
      </option>
    ));

  const submitForm = handleValidatedSubmit(async (values) => {
    setApiError(null);
    try {
      const costing =
        isWizard && draftCharges.length > 0 ? toJobCostingPayload(draftCharges) : undefined;
      await onSubmit(values, costing ? { costing } : undefined);
    } catch (err) {
      const banner = applyApiErrors(err, { onRoot: setApiError });
      if (banner) setApiError(banner);
    }
  });

  const goNext = async () => {
    setApiError(null);
    if (step === 0) {
      const ok = await trigger(DEPARTMENT_FIELDS);
      if (!ok) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      const ok = await trigger(JOB_INFO_FIELDS);
      if (!ok) return;
      setStep(2);
      return;
    }
    if (step === 2 || step === 3) {
      setStep(step + 1);
      return;
    }
    await submitForm();
  };

  const jobTypeRadios = (
    <div className="space-y-2">
      <span className={labelClass}>
        Department / Job type <span className="text-[var(--color-danger-500)]">*</span>
      </span>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {jobTypeOptions.map((t) => {
          const checked = selectedJobType === t;
          return (
            <label
              key={t}
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                checked
                  ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                  : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] hover:border-[var(--color-neutral-300)]'
              }`}
            >
              <input
                type="radio"
                value={t}
                className="accent-[var(--color-primary-600)]"
                {...register('job_type')}
              />
              {JOB_TYPE_LABELS[t]}
            </label>
          );
        })}
      </div>
      <FieldErrorMessage message={fieldError('job_type')} />
    </div>
  );

  if (isWizard) {
    const totalSteps = JOB_CREATE_WIZARD_STEPS.length;
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void goNext();
        }}
        className="mx-auto max-w-5xl space-y-6"
        noValidate
      >
        {apiError && (
          <div
            role="alert"
            className="rounded-lg border px-4 py-3 text-sm"
            style={{
              background: 'var(--color-danger-100)',
              borderColor: '#FECACA',
              color: 'var(--color-danger-700)',
            }}
          >
            {apiError}
          </div>
        )}

        <JobWizardStepper currentStep={step} />

        {step === 0 ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:items-end">
              <div className="space-y-1">
                <label htmlFor="job-branch" className={labelClass}>
                  Branch
                </label>
                <select id="job-branch" className={selectClass} {...register('branch_id')}>
                  <option value="">Select…</option>
                  {branchOptions}
                </select>
                <FieldErrorMessage message={fieldError('branch_id')} />
              </div>
              <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                  <Controller
                    name="shipper_id"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        name="shipper_id"
                        label="Client"
                        required
                        value={field.value ?? ''}
                        options={shipperOpts}
                        onChange={field.onChange}
                        error={fieldError('shipper_id')}
                        placeholder="Search client…"
                      />
                    )}
                  />
                </div>
                <Link
                  to="/parties/new"
                  title="Add new client"
                  className="mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Add client</span>
                </Link>
              </div>
            </div>
            {jobTypeRadios}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-4">
                <Controller
                  name="consignee_id"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      name="consignee_id"
                      label="Consignee"
                      value={field.value ?? ''}
                      options={consigneeOpts}
                      onChange={field.onChange}
                      error={fieldError('consignee_id')}
                      placeholder="Select consignee…"
                    />
                  )}
                />
                <Controller
                  name="agent_id"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      name="agent_id"
                      label="Agent"
                      value={field.value ?? ''}
                      options={agentOpts}
                      onChange={field.onChange}
                      error={fieldError('agent_id')}
                      placeholder="Select agent…"
                    />
                  )}
                />
                <Input
                  id="job-incoterms"
                  label="Incoterms"
                  error={fieldError('incoterms')}
                  {...register('incoterms')}
                  placeholder="e.g. FOB"
                />
              </div>
              <div className="space-y-4">
                <Controller
                  name="origin_port_id"
                  control={control}
                  render={({ field }) => (
                    <MasterPlaceSelect
                      name="origin_port_id"
                      label={useAirports ? 'Origin airport' : 'Origin'}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      jobType={selectedJobType}
                      excludeId={destPortId}
                      error={fieldError('origin_port_id')}
                    />
                  )}
                />
                <Controller
                  name="dest_port_id"
                  control={control}
                  render={({ field }) => (
                    <MasterPlaceSelect
                      name="dest_port_id"
                      label={useAirports ? 'Destination airport' : 'Destination'}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      jobType={selectedJobType}
                      excludeId={originPortId}
                      error={fieldError('dest_port_id')}
                    />
                  )}
                />
                <Input
                  id="job-etd"
                  type="date"
                  label="ETD"
                  error={fieldError('etd')}
                  {...register('etd')}
                />
              </div>
              <div className="space-y-4">
                <Input
                  id="job-eta"
                  type="date"
                  label="ETA"
                  error={fieldError('eta')}
                  {...register('eta')}
                />
                <div className="space-y-1">
                  <label htmlFor="job-customer-remarks" className={labelClass}>
                    Customer remarks
                  </label>
                  <textarea
                    id="job-customer-remarks"
                    className={textareaClass(Boolean(fieldError('customer_remarks')))}
                    {...register('customer_remarks')}
                  />
                  <FieldErrorMessage message={fieldError('customer_remarks')} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="job-notes" className={labelClass}>
                    Internal notes
                  </label>
                  <textarea
                    id="job-notes"
                    className={textareaClass(Boolean(fieldError('notes')))}
                    {...register('notes')}
                  />
                  <FieldErrorMessage message={fieldError('notes')} />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-neutral-800)]">
              Planned Container / Consignment
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Controller
                name="container_type_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    name="container_type_id"
                    label="Container type"
                    value={field.value ?? ''}
                    options={containerOpts}
                    onChange={field.onChange}
                    error={fieldError('container_type_id')}
                  />
                )}
              />
              <Input
                id="job-container-count"
                label="No of Container"
                type="number"
                step="1"
                error={fieldError('container_count')}
                {...register('container_count', {
                  setValueAs: (v) =>
                    v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v),
                })}
              />
              <Input
                id="job-pieces"
                label="No of Packages / Pieces"
                type="number"
                step="1"
                error={fieldError('pieces')}
                {...register('pieces', {
                  setValueAs: (v) =>
                    v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v),
                })}
              />
              <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                <Input
                  id="job-commodity"
                  label="Commodity / Description"
                  error={fieldError('commodity')}
                  {...register('commodity')}
                />
              </div>
              <Input
                id="job-hs-code"
                label="HS code"
                error={fieldError('hs_code')}
                {...register('hs_code')}
              />
              <Input
                id="job-gross-weight"
                label="Gross weight (kg)"
                type="number"
                step="0.001"
                error={fieldError('gross_weight')}
                {...register('gross_weight', {
                  setValueAs: (v) =>
                    v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v),
                })}
              />
              <Input
                id="job-chargeable-weight"
                label="Chargeable weight"
                type="number"
                step="0.001"
                error={fieldError('chargeable_weight')}
                {...register('chargeable_weight', {
                  setValueAs: (v) =>
                    v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v),
                })}
              />
              <Input
                id="job-volume-cbm"
                label="Volume (CBM)"
                type="number"
                step="0.001"
                error={fieldError('volume_cbm')}
                {...register('volume_cbm', {
                  setValueAs: (v) =>
                    v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v),
                })}
              />
              <label className="flex items-center gap-2 text-sm sm:mt-6">
                <input type="checkbox" {...register('is_dg')} />
                Dangerous goods
              </label>
              <Input
                id="job-dg-class"
                label="DG class"
                error={fieldError('dg_class')}
                {...register('dg_class')}
              />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            <JobWizardCostingPanel
              lines={draftCharges}
              onLinesChange={setDraftCharges}
            />
          </div>
        ) : null}

        {step === 4 ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Summary</h3>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Job type</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {JOB_TYPE_LABELS[watched.job_type as JobType] ?? watched.job_type}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Client (shipper)</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {labelForParty(watched.shipper_id, shipperOpts)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Consignee</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {labelForParty(watched.consignee_id, consigneeOpts)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Incoterms</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {watched.incoterms || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">ETD / ETA</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {[watched.etd || '—', watched.eta || '—'].join(' → ')}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Commodity</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {watched.commodity || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Pieces / containers</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {[
                    watched.pieces != null ? `${watched.pieces} pcs` : null,
                    watched.container_count != null ? `${watched.container_count} ctr` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Weight / volume</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {[
                    watched.gross_weight != null ? `${watched.gross_weight} kg` : null,
                    watched.volume_cbm != null ? `${watched.volume_cbm} CBM` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Costing</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {draftCharges.length
                    ? `${draftCharges.length} draft charge line${draftCharges.length === 1 ? '' : 's'}`
                    : 'No draft charges'}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        <QuotationWizardNav
          currentStep={step}
          totalSteps={totalSteps}
          onPrevious={() => setStep((s) => Math.max(0, s - 1))}
          onCancel={onCancel}
          onNext={() => void goNext()}
          isSubmitting={isSubmitting}
          nextLabel={step === totalSteps - 1 ? 'Create job' : 'Next'}
          disableNext={step === 0 && !selectedJobType}
        />
      </form>
    );
  }

  return (
    <form
      onSubmit={submitForm}
      className="space-y-4 max-w-4xl"
      noValidate
    >
      {apiError && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {apiError}
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <div className="p-4 pt-0 space-y-4">
          <div className="space-y-2">
            {mode === 'edit' ? (
              <>
                <label htmlFor="job-type" className={labelClass}>
                  Job type <span className="text-[var(--color-danger-500)]">*</span>
                </label>
                <select id="job-type" className={selectClass} {...register('job_type')} disabled>
                  {jobTypeOptions.map((t) => (
                    <option key={t} value={t}>
                      {JOB_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              jobTypeRadios
            )}
            {mode === 'edit' ? <FieldErrorMessage message={fieldError('job_type')} /> : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="job-incoterms" className={labelClass}>
                Incoterms
              </label>
              <Input
                id="job-incoterms"
                error={fieldError('incoterms')}
                {...register('incoterms')}
                placeholder="e.g. FOB"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="job-etd" className={labelClass}>
                ETD
              </label>
              <Input id="job-etd" type="date" error={fieldError('etd')} {...register('etd')} />
            </div>
            <div className="space-y-1">
              <label htmlFor="job-eta" className={labelClass}>
                ETA
              </label>
              <Input id="job-eta" type="date" error={fieldError('eta')} {...register('eta')} />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer information</CardTitle>
        </CardHeader>
        <div className="p-4 pt-0 grid gap-4 sm:grid-cols-2">
          <Controller
            name="shipper_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                name="shipper_id"
                label="Shipper"
                required
                value={field.value ?? ''}
                options={shipperOpts}
                onChange={field.onChange}
                error={fieldError('shipper_id')}
                placeholder="Select shipper…"
              />
            )}
          />
          <Controller
            name="consignee_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                name="consignee_id"
                label="Consignee"
                value={field.value ?? ''}
                options={consigneeOpts}
                onChange={field.onChange}
                error={fieldError('consignee_id')}
                placeholder="Select consignee…"
              />
            )}
          />
          <Controller
            name="agent_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                name="agent_id"
                label="Agent"
                value={field.value ?? ''}
                options={agentOpts}
                onChange={field.onChange}
                error={fieldError('agent_id')}
                placeholder="Select agent…"
              />
            )}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipment information</CardTitle>
        </CardHeader>
        <div className="p-4 pt-0 grid gap-4 sm:grid-cols-2">
          <Controller
            name="origin_port_id"
            control={control}
            render={({ field }) => (
              <MasterPlaceSelect
                name="origin_port_id"
                label={useAirports ? 'Origin airport' : 'Origin port'}
                value={field.value ?? ''}
                onChange={field.onChange}
                jobType={selectedJobType}
                excludeId={destPortId}
                error={fieldError('origin_port_id')}
              />
            )}
          />
          <Controller
            name="dest_port_id"
            control={control}
            render={({ field }) => (
              <MasterPlaceSelect
                name="dest_port_id"
                label={useAirports ? 'Destination airport' : 'Destination port'}
                value={field.value ?? ''}
                onChange={field.onChange}
                jobType={selectedJobType}
                excludeId={originPortId}
                error={fieldError('dest_port_id')}
              />
            )}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cargo information</CardTitle>
        </CardHeader>
        <div className="p-4 pt-0 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="job-commodity" className={labelClass}>
              Commodity
            </label>
            <Input id="job-commodity" error={fieldError('commodity')} {...register('commodity')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="job-hs-code" className={labelClass}>
              HS code
            </label>
            <Input id="job-hs-code" error={fieldError('hs_code')} {...register('hs_code')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="job-pieces" className={labelClass}>
              Pieces
            </label>
            <Input
              id="job-pieces"
              type="number"
              step="1"
              error={fieldError('pieces')}
              {...register('pieces', {
                setValueAs: (v) =>
                  v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v),
              })}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="job-gross-weight" className={labelClass}>
              Gross weight (kg)
            </label>
            <Input
              id="job-gross-weight"
              type="number"
              step="0.001"
              error={fieldError('gross_weight')}
              {...register('gross_weight', {
                setValueAs: (v) =>
                  v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v),
              })}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="job-chargeable-weight" className={labelClass}>
              Chargeable weight
            </label>
            <Input
              id="job-chargeable-weight"
              type="number"
              step="0.001"
              error={fieldError('chargeable_weight')}
              {...register('chargeable_weight', {
                setValueAs: (v) =>
                  v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v),
              })}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="job-volume-cbm" className={labelClass}>
              Volume (CBM)
            </label>
            <Input
              id="job-volume-cbm"
              type="number"
              step="0.001"
              error={fieldError('volume_cbm')}
              {...register('volume_cbm', {
                setValueAs: (v) =>
                  v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v),
              })}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Container information</CardTitle>
        </CardHeader>
        <div className="p-4 pt-0 grid gap-4 sm:grid-cols-2">
          <Controller
            name="container_type_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                name="container_type_id"
                label="Container type"
                value={field.value ?? ''}
                options={containerOpts}
                onChange={field.onChange}
                error={fieldError('container_type_id')}
              />
            )}
          />
          <div className="space-y-1">
            <label htmlFor="job-container-count" className={labelClass}>
              Container count
            </label>
            <Input
              id="job-container-count"
              type="number"
              step="1"
              error={fieldError('container_count')}
              {...register('container_count', {
                setValueAs: (v) =>
                  v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v),
              })}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional information</CardTitle>
        </CardHeader>
        <div className="p-4 pt-0 grid gap-4">
          <div className="space-y-1">
            <label htmlFor="job-customer-remarks" className={labelClass}>
              Customer remarks
            </label>
            <textarea
              id="job-customer-remarks"
              className={textareaClass(Boolean(fieldError('customer_remarks')))}
              {...register('customer_remarks')}
            />
            <FieldErrorMessage message={fieldError('customer_remarks')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="job-notes" className={labelClass}>
              Internal notes
            </label>
            <textarea
              id="job-notes"
              className={textareaClass(Boolean(fieldError('notes')))}
              {...register('notes')}
            />
            <FieldErrorMessage message={fieldError('notes')} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_dg')} />
            Dangerous goods
          </label>
          <div className="space-y-1">
            <label htmlFor="job-dg-class" className={labelClass}>
              DG class
            </label>
            <Input id="job-dg-class" error={fieldError('dg_class')} {...register('dg_class')} />
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {mode === 'create' ? 'Create job' : 'Save changes'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
