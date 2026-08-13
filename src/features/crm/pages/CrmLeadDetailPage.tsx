import { useEffect, useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppForm } from '@/lib/validation';
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  PRIORITIES,
  crmLabel,
} from '../constants/crm.constants';
import {
  CrmCountryField,
  CrmPhoneField,
  CrmSalespersonSelect,
} from '../components/CrmFormControls';
import { CrmAlert, CrmEmpty, CrmPageHeader, Field, SelectInput, TextArea, TextInput } from '../components/CrmUi';
import { useConvertCrmLead, useCrmLead, useDeleteCrmLead, useUpdateCrmLead } from '../hooks/useCrmLeads';
import { convertLeadSchema, toUpdateLeadDto, updateLeadSchema, type UpdateLeadFormValues } from '../schemas/crm.schema';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function CrmLeadDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const query = useCrmLead(id);
  const update = useUpdateCrmLead(id);
  const convert = useConvertCrmLead();
  const remove = useDeleteCrmLead();

  const form = useAppForm<UpdateLeadFormValues>({
    resolver: zodResolver(updateLeadSchema) as unknown as Resolver<UpdateLeadFormValues>,
    defaultValues: {},
  });
  const convertForm = useAppForm<{ party_code?: string }>({
    resolver: zodResolver(convertLeadSchema),
    defaultValues: { party_code: '' },
  });

  const {
    register,
    handleValidatedSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!query.data) return;
    reset({
      company_name: query.data.company_name,
      contact_name: query.data.contact_name,
      contact_country_code: '',
      email: query.data.email ?? '',
      phone: query.data.phone ?? '',
      source: query.data.source,
      status: query.data.status,
      priority: query.data.priority,
      assigned_salesperson_id: query.data.assigned_salesperson_id ?? '',
      potential_volume: query.data.potential_volume ?? '',
      service_requirements: query.data.service_requirements ?? '',
      tags: (query.data.tags ?? []).join(', '),
      notes: query.data.notes ?? '',
      lost_reason: query.data.lost_reason ?? '',
    });
  }, [query.data, reset]);

  const country = watch('contact_country_code') ?? '';
  const err = (name: keyof UpdateLeadFormValues) =>
    errors[name]?.message ? String(errors[name]?.message) : undefined;

  const [convertResult, setConvertResult] = useState<Record<string, unknown> | null>(null);

  if (query.isLoading || query.isError || !query.data) {
    return (
      <div className="space-y-4">
        <CrmPageHeader title="Lead" description="Lead details" />
        <Card>
          <CrmEmpty
            loading={query.isLoading}
            error={query.isError ? getErrorMessage(query.error) : undefined}
            onRetry={() => query.refetch()}
          />
        </Card>
      </div>
    );
  }

  const partyId =
    typeof convertResult?.party_id === 'string'
      ? convertResult.party_id
      : typeof convertResult?.partyId === 'string'
        ? convertResult.partyId
        : '';

  return (
    <div className="space-y-4">
      <CrmPageHeader
        title={query.data.company_name}
        description={`Lead · ${query.data.contact_name}`}
        actions={
          <Button
            variant="danger"
            onClick={async () => {
              if (window.confirm('Delete this lead?')) {
                await remove.mutateAsync(id);
                navigate('/sales/lead');
              }
            }}
          >
            Delete
          </Button>
        }
      />
      {(update.isError || convert.isError || remove.isError) && (
        <CrmAlert>{getErrorMessage(update.error || convert.error || remove.error)}</CrmAlert>
      )}
      {update.isSuccess && <CrmAlert success>Lead updated.</CrmAlert>}
      {convertResult && (
        <CrmAlert success>
          Lead converted successfully.{' '}
          {partyId && (
            <Link className="underline" to={`/parties/${partyId}`}>
              Open party
            </Link>
          )}
        </CrmAlert>
      )}

      <Card className="p-5">
        <form
          className="space-y-4"
          onSubmit={handleValidatedSubmit(async (values) => {
            await update.mutateAsync(toUpdateLeadDto(values));
          })}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Company name" required error={err('company_name')}>
              <TextInput {...register('company_name')} />
            </Field>
            <Field label="Contact name" required error={err('contact_name')}>
              <TextInput {...register('contact_name')} />
            </Field>
            <CrmCountryField
              value={country}
              onChange={(iso) => setValue('contact_country_code', iso, { shouldValidate: true })}
              error={err('contact_country_code')}
            />
            <Field label="Email" error={err('email')}>
              <TextInput type="email" {...register('email')} />
            </Field>
            <CrmPhoneField
              value={watch('phone') ?? ''}
              onChange={(v) => setValue('phone', v, { shouldValidate: true })}
              countryIso={country}
              onCountryChange={(iso) => setValue('contact_country_code', iso, { shouldValidate: true })}
              error={err('phone')}
            />
            <Field label="Source" error={err('source')}>
              <SelectInput {...register('source')}>
                {LEAD_SOURCES.map((x) => (
                  <option key={x} value={x}>
                    {crmLabel(x)}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Status" error={err('status')}>
              <SelectInput {...register('status')}>
                {LEAD_STATUSES.map((x) => (
                  <option key={x} value={x}>
                    {crmLabel(x)}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Priority" error={err('priority')}>
              <SelectInput {...register('priority')}>
                {PRIORITIES.map((x) => (
                  <option key={x} value={x}>
                    {crmLabel(x)}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <CrmSalespersonSelect
              label="Assigned salesperson"
              value={watch('assigned_salesperson_id') ?? ''}
              onChange={(v) => setValue('assigned_salesperson_id', v, { shouldValidate: true })}
              error={err('assigned_salesperson_id')}
            />
            <Field label="Potential volume" error={err('potential_volume')}>
              <TextInput {...register('potential_volume')} />
            </Field>
            <Field label="Tags" error={err('tags')}>
              <TextInput {...register('tags')} />
            </Field>
          </div>
          <Field label="Requirements" error={err('service_requirements')}>
            <TextArea {...register('service_requirements')} />
          </Field>
          <Field label="Notes" error={err('notes')}>
            <TextArea {...register('notes')} />
          </Field>
          {watch('status') === 'LOST' && (
            <Field label="Lost reason" error={err('lost_reason')}>
              <TextArea {...register('lost_reason')} />
            </Field>
          )}
          <div className="flex justify-end">
            <Button disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save changes'}</Button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">Convert lead to party</h2>
        <p className="mb-3 mt-1 text-sm text-[var(--color-neutral-500)]">
          Optionally provide a party code. The existing parties module remains the customer source of truth.
        </p>
        <form
          className="flex max-w-xl gap-2"
          onSubmit={convertForm.handleValidatedSubmit(async ({ party_code }) => {
            setConvertResult(await convert.mutateAsync({ id, party_code: party_code || undefined }));
          })}
        >
          <TextInput
            placeholder="Party code (optional)"
            {...convertForm.register('party_code')}
            className={convertForm.formState.errors.party_code ? 'border-red-400' : ''}
          />
          <Button disabled={convert.isPending}>{convert.isPending ? 'Converting…' : 'Convert'}</Button>
        </form>
      </Card>
    </div>
  );
}
