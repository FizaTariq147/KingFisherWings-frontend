import { useEffect } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppForm } from '@/lib/validation';
import { ENQUIRY_STATUSES, SERVICE_TYPES, crmLabel } from '../constants/crm.constants';
import { CrmCurrencySelect, CrmSalespersonSelect } from '../components/CrmFormControls';
import { CrmAlert, CrmEmpty, CrmPageHeader, Field, SelectInput, TextArea, TextInput } from '../components/CrmUi';
import { useConvertCrmEnquiry, useCrmEnquiry, useUpdateCrmEnquiry } from '../hooks/useCrmEnquiries';
import { updateEnquirySchema, type UpdateEnquiryFormValues } from '../schemas/crm.schema';
import { getErrorMessage } from '../utils/getErrorMessage';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';

export default function CrmEnquiryDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const query = useCrmEnquiry(id);
  const update = useUpdateCrmEnquiry(id);
  const convert = useConvertCrmEnquiry();

  const form = useAppForm<UpdateEnquiryFormValues>({
    resolver: zodResolver(updateEnquirySchema) as unknown as Resolver<UpdateEnquiryFormValues>,
    defaultValues: {},
  });
  const { register, handleValidatedSubmit, watch, setValue, reset, formState: { errors } } = form;

  useEffect(() => {
    if (!query.data) return;
    reset({
      service_type: query.data.service_type,
      currency_code: query.data.currency_code,
      status: query.data.status,
      lead_id: query.data.lead_id ?? '',
      party_id: query.data.party_id ?? '',
      salesperson_id: query.data.salesperson_id ?? '',
      origin_port_id: query.data.origin_port_id ?? '',
      dest_port_id: query.data.dest_port_id ?? '',
      cargo_details: query.data.cargo_details ?? '',
      incoterms: query.data.incoterms ?? '',
      special_requirements: query.data.special_requirements ?? '',
    });
  }, [query.data, reset]);

  const err = (name: keyof UpdateEnquiryFormValues) =>
    errors[name]?.message ? String(errors[name]?.message) : undefined;

  if (query.isLoading || query.isError || !query.data) {
    return (
      <>
        <CrmPageHeader title="Enquiry" description="Enquiry details" />
        <Card>
          <CrmEmpty loading={query.isLoading} error={query.isError ? getErrorMessage(query.error) : undefined} />
        </Card>
      </>
    );
  }

  return (
    <div className="space-y-4">
      <CrmPageHeader
        title={`Enquiry ${id.slice(0, 8)}`}
        description="Update requirements or convert this enquiry into the quotations workflow."
        actions={
          <Button
            onClick={async () => {
              const result = await convert.mutateAsync(id);
              const quote = result.quotation_id ?? result.quotationId ?? result.id;
              if (typeof quote === 'string') navigate(`/quotations/${quote}`);
            }}
            disabled={convert.isPending || watch('status') === 'QUOTED'}
          >
            {convert.isPending ? 'Converting…' : 'Convert to quote'}
          </Button>
        }
      />
      {(update.isError || convert.isError) && (
        <CrmAlert>{getErrorMessage(update.error || convert.error)}</CrmAlert>
      )}
      {update.isSuccess && <CrmAlert success>Enquiry updated.</CrmAlert>}

      <Card className="p-5">
        <form
          className="space-y-4"
          onSubmit={handleValidatedSubmit(async (values) => {
            await update.mutateAsync(prepareCrmPayload(values) as UpdateEnquiryFormValues);
          })}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Service" error={err('service_type')}>
              <SelectInput {...register('service_type')}>
                {SERVICE_TYPES.map((x) => (
                  <option key={x} value={x}>
                    {crmLabel(x)}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Status" error={err('status')}>
              <SelectInput {...register('status')}>
                {ENQUIRY_STATUSES.map((x) => (
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
            <CrmSalespersonSelect
              label="Salesperson"
              value={watch('salesperson_id') ?? ''}
              onChange={(v) => setValue('salesperson_id', v, { shouldValidate: true })}
              error={err('salesperson_id')}
            />
            <Field label="Lead ID" error={err('lead_id')}>
              <TextInput {...register('lead_id')} />
            </Field>
            <Field label="Party ID" error={err('party_id')}>
              <TextInput {...register('party_id')} />
            </Field>
            <Field label="Incoterms" error={err('incoterms')}>
              <TextInput {...register('incoterms')} maxLength={10} />
            </Field>
            <Field label="Origin port ID" error={err('origin_port_id')}>
              <TextInput {...register('origin_port_id')} />
            </Field>
            <Field label="Destination port ID" error={err('dest_port_id')}>
              <TextInput {...register('dest_port_id')} />
            </Field>
          </div>
          <Field label="Cargo details" error={err('cargo_details')}>
            <TextArea {...register('cargo_details')} />
          </Field>
          <Field label="Special requirements" error={err('special_requirements')}>
            <TextArea {...register('special_requirements')} />
          </Field>
          <div className="flex justify-end">
            <Button disabled={update.isPending}>Save changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
