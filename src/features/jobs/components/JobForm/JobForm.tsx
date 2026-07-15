import { type Resolver } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useParties } from '@/features/parties/hooks/useParties';
import {
  JOB_TYPE_LABELS,
  type JobType,
} from '../../constants/job.constants';
import { createJobSchema, updateJobSchema } from '../../schemas/job.schema';
import type { CreateJobFormValues, UpdateJobFormValues } from '../../types/job.types';
import { JOB_FORM_DEFAULTS } from '../../utils/prepareJobPayload';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

interface JobFormProps {
  mode: 'create' | 'edit';
  jobTypeOptions: JobType[];
  defaultJobType?: JobType;
  defaultValues?: Partial<CreateJobFormValues>;
  onSubmit: (values: CreateJobFormValues | UpdateJobFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

function partyOptions(parties: Array<{ id: string; name?: string; code?: string }>) {
  return parties
    .filter((p) => isUuid(p.id))
    .map((p) => ({
      value: p.id,
      label: [p.code, p.name].filter(Boolean).join(' — ') || p.id,
    }));
}

export function JobForm({
  mode,
  jobTypeOptions,
  defaultJobType,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: JobFormProps) {
  const schema = mode === 'create' ? createJobSchema : updateJobSchema;
  const { data: ports = [] } = useMasterOptions('ports', MASTER_PATHS.ports, true);
  const { data: containers = [] } = useMasterOptions(
    'container-types',
    MASTER_PATHS['container-types'],
    true,
  );
  const { data: partiesResult } = useParties({
    page: 1,
    limit: 300,
    order: 'asc',
  });
  const { data: agentsResult } = useParties({
    page: 1,
    limit: 300,
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

  const {
    register,
    control,
    watch,
    handleValidatedSubmit,
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
  const originPortId = watch('origin_port_id');
  const destPortId = watch('dest_port_id');

  const fieldError = (name: keyof CreateJobFormValues) =>
    errors[name]?.message as string | undefined;

  const portOpts = ports
    .filter((p) => isUuid(String(p.id)))
    .map((p) => ({
      value: String(p.id),
      label: [p.code, p.name].filter(Boolean).join(' — ') || String(p.id),
    }));

  const destPortOpts = portOpts.filter((p) => p.value !== originPortId);
  const originPortOpts = portOpts.filter((p) => p.value !== destPortId);

  return (
    <form
      onSubmit={handleValidatedSubmit((values) => onSubmit(values))}
      className="space-y-4 max-w-4xl"
      noValidate
    >
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <div className="p-4 pt-0 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Job type <span className="text-[var(--color-danger-500)]">*</span>
            </label>
            {mode === 'edit' ? (
              <select className={selectClass} {...register('job_type')} disabled>
                {jobTypeOptions.map((t) => (
                  <option key={t} value={t}>
                    {JOB_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {jobTypeOptions.map((t) => {
                  const checked = selectedJobType === t;
                  return (
                    <label
                      key={t}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
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
            )}
            <FieldError message={fieldError('job_type')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--color-neutral-500)]">Incoterms</label>
              <Input {...register('incoterms')} placeholder="e.g. FOB" />
              <FieldError message={fieldError('incoterms')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--color-neutral-500)]">ETD</label>
              <Input type="date" {...register('etd')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--color-neutral-500)]">ETA</label>
              <Input type="date" {...register('eta')} />
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
              <SearchableSelect
                name="origin_port_id"
                label="Origin port"
                value={field.value ?? ''}
                options={originPortOpts}
                onChange={field.onChange}
                error={fieldError('origin_port_id')}
              />
            )}
          />
          <Controller
            name="dest_port_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                name="dest_port_id"
                label="Destination port"
                value={field.value ?? ''}
                options={destPortOpts}
                onChange={field.onChange}
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
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">Commodity</label>
            <Input {...register('commodity')} />
            <FieldError message={fieldError('commodity')} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">HS code</label>
            <Input {...register('hs_code')} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">Pieces</label>
            <Input
              type="number"
              step="1"
              {...register('pieces', {
                setValueAs: (v) =>
                  v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v),
              })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Gross weight (kg)
            </label>
            <Input
              type="number"
              step="0.001"
              {...register('gross_weight', {
                setValueAs: (v) =>
                  v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v),
              })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Chargeable weight
            </label>
            <Input
              type="number"
              step="0.001"
              {...register('chargeable_weight', {
                setValueAs: (v) =>
                  v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v),
              })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">Volume (CBM)</label>
            <Input
              type="number"
              step="0.001"
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
                options={containers
                  .filter((c) => isUuid(String(c.id)))
                  .map((c) => ({
                    value: String(c.id),
                    label: [c.code, c.name].filter(Boolean).join(' — ') || String(c.id),
                  }))}
                onChange={field.onChange}
                error={fieldError('container_type_id')}
              />
            )}
          />
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Container count
            </label>
            <Input
              type="number"
              step="1"
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
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Customer remarks
            </label>
            <textarea
              className="w-full min-h-[72px] rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('customer_remarks')}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Internal notes
            </label>
            <textarea
              className="w-full min-h-[72px] rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('notes')}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_dg')} />
            Dangerous goods
          </label>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">DG class</label>
            <Input {...register('dg_class')} />
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
