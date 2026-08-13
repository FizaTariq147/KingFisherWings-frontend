import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppForm } from '@/lib/validation';
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  PRIORITIES,
  crmLabel,
  type LeadSource,
  type LeadStatus,
  type Priority,
} from '../constants/crm.constants';
import {
  CrmCountryField,
  CrmPhoneField,
  CrmSalespersonSelect,
} from '../components/CrmFormControls';
import { CrmAlert, CrmPageHeader, Field, SelectInput, TextArea, TextInput } from '../components/CrmUi';
import { useCreateCrmLead } from '../hooks/useCrmLeads';
import {
  createLeadSchema,
  toCreateLeadDto,
  type CreateLeadFormValues,
} from '../schemas/crm.schema';
import { getErrorMessage } from '../utils/getErrorMessage';

const defaults: CreateLeadFormValues = {
  company_name: '',
  contact_name: '',
  contact_country_code: '',
  email: '',
  phone: '',
  source: 'OTHER',
  status: 'NEW',
  priority: 'MEDIUM',
  potential_volume: '',
  service_requirements: '',
  assigned_salesperson_id: '',
  tags: '',
  notes: '',
};

export default function CrmLeadCreatePage() {
  const navigate = useNavigate();
  const mutation = useCreateCrmLead();
  const form = useAppForm<CreateLeadFormValues>({
    resolver: zodResolver(createLeadSchema) as unknown as Resolver<CreateLeadFormValues>,
    defaultValues: defaults,
  });
  const {
    register,
    handleValidatedSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const country = watch('contact_country_code') ?? '';

  const err = (name: keyof CreateLeadFormValues) =>
    errors[name]?.message ? String(errors[name]?.message) : undefined;

  return (
    <div className="space-y-4">
      <CrmPageHeader
        title="Create Lead"
        description="Add a prospective customer to the sales pipeline."
      />
      <Card className="p-5">
        <form
          className="space-y-4"
          onSubmit={handleValidatedSubmit(async (values) => {
            try {
              const lead = await mutation.mutateAsync(toCreateLeadDto(values));
              navigate(`/sales/lead/${lead.id}`);
            } catch (error) {
              mutation.reset();
              form.applyApiErrors(error);
            }
          })}
        >
          {mutation.isError && !form.formState.errors.root && (
            <CrmAlert>{getErrorMessage(mutation.error)}</CrmAlert>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Company name" required error={err('company_name')}>
              <TextInput {...register('company_name')} className={err('company_name') ? 'border-red-400' : ''} />
            </Field>
            <Field label="Contact name" required error={err('contact_name')}>
              <TextInput {...register('contact_name')} className={err('contact_name') ? 'border-red-400' : ''} />
            </Field>
            <CrmCountryField
              label="Contact country"
              value={country}
              onChange={(iso) =>
                setValue('contact_country_code', iso, { shouldValidate: true, shouldDirty: true })
              }
              error={err('contact_country_code')}
            />
            <Field label="Email" error={err('email')}>
              <TextInput type="email" {...register('email')} className={err('email') ? 'border-red-400' : ''} />
            </Field>
            <CrmPhoneField
              value={watch('phone') ?? ''}
              onChange={(v) => setValue('phone', v, { shouldValidate: true, shouldDirty: true })}
              countryIso={country}
              onCountryChange={(iso) =>
                setValue('contact_country_code', iso, { shouldValidate: true, shouldDirty: true })
              }
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
              onChange={(id) =>
                setValue('assigned_salesperson_id', id, { shouldValidate: true, shouldDirty: true })
              }
              error={err('assigned_salesperson_id')}
            />
            <Field label="Potential volume" error={err('potential_volume')}>
              <TextInput {...register('potential_volume')} />
            </Field>
            <Field label="Tags (comma separated)" error={err('tags')}>
              <TextInput {...register('tags')} placeholder="air, reefer, dubai" />
            </Field>
          </div>
          <Field label="Service requirements" error={err('service_requirements')}>
            <TextArea {...register('service_requirements')} />
          </Field>
          <Field label="Notes" error={err('notes')}>
            <TextArea {...register('notes')} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/sales/lead')}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating…' : 'Create lead'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
