import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppForm } from '@/lib/validation';
import { SERVICE_TYPES, crmLabel } from '../constants/crm.constants';
import { CrmCurrencySelect, CrmSalespersonSelect } from '../components/CrmFormControls';
import { CrmAlert, CrmPageHeader, Field, SelectInput, TextArea, TextInput } from '../components/CrmUi';
import { useCreateCrmEnquiry } from '../hooks/useCrmEnquiries';
import { createEnquirySchema, type CreateEnquiryFormValues } from '../schemas/crm.schema';
import { getErrorMessage } from '../utils/getErrorMessage';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';

const defaults: CreateEnquiryFormValues = {
  service_type: 'AIR_EXPORT',
  currency_code: 'AED',
  lead_id: '',
  party_id: '',
  salesperson_id: '',
  origin_port_id: '',
  dest_port_id: '',
  cargo_details: '',
  incoterms: '',
  special_requirements: '',
};

export default function CrmEnquiryCreatePage() {
  const navigate = useNavigate();
  const mutation = useCreateCrmEnquiry();
  const form = useAppForm<CreateEnquiryFormValues>({
    resolver: zodResolver(createEnquirySchema) as unknown as Resolver<CreateEnquiryFormValues>,
    defaultValues: defaults,
  });
  const {
    register,
    handleValidatedSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const err = (name: keyof CreateEnquiryFormValues) =>
    errors[name]?.message ? String(errors[name]?.message) : undefined;

  return (
    <div className="space-y-4">
      <CrmPageHeader
        title="Create Enquiry"
        description="Record service and cargo requirements before preparing a quotation."
      />
      <Card className="p-5">
        <form
          className="space-y-4"
          onSubmit={handleValidatedSubmit(async (values) => {
            const item = await mutation.mutateAsync(
              prepareCrmPayload(values) as CreateEnquiryFormValues,
            );
            navigate(`/sales/enquiries/${item.id}`);
          })}
        >
          {mutation.isError && <CrmAlert>{getErrorMessage(mutation.error)}</CrmAlert>}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Service type" required error={err('service_type')}>
              <SelectInput {...register('service_type')}>
                {SERVICE_TYPES.map((x) => (
                  <option key={x} value={x}>
                    {crmLabel(x)}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <CrmCurrencySelect
              label="Currency"
              required
              value={watch('currency_code') ?? ''}
              onChange={(c) => setValue('currency_code', c, { shouldValidate: true })}
              error={err('currency_code')}
            />
            <Field label="Lead ID" error={err('lead_id')}>
              <TextInput {...register('lead_id')} placeholder="UUID" />
            </Field>
            <Field label="Party ID" error={err('party_id')}>
              <TextInput {...register('party_id')} placeholder="UUID" />
            </Field>
            <CrmSalespersonSelect
              label="Salesperson"
              value={watch('salesperson_id') ?? ''}
              onChange={(v) => setValue('salesperson_id', v, { shouldValidate: true })}
              error={err('salesperson_id')}
            />
            <Field label="Incoterms" error={err('incoterms')}>
              <TextInput {...register('incoterms')} placeholder="EXW" maxLength={10} />
            </Field>
            <Field label="Origin port ID" error={err('origin_port_id')}>
              <TextInput {...register('origin_port_id')} placeholder="UUID" />
            </Field>
            <Field label="Destination port ID" error={err('dest_port_id')}>
              <TextInput {...register('dest_port_id')} placeholder="UUID" />
            </Field>
          </div>
          <Field label="Cargo details" error={err('cargo_details')}>
            <TextArea {...register('cargo_details')} />
          </Field>
          <Field label="Special requirements" error={err('special_requirements')}>
            <TextArea {...register('special_requirements')} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/sales/enquiries')}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              Create enquiry
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
