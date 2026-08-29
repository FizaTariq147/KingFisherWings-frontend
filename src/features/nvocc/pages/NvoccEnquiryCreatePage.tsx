import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { FieldError } from '@/components/ui/FieldError/FieldError';
import { SelectInput, TextInput, DateInput } from '@/components/widgets/FilterField';
import { useParties } from '@/features/parties/hooks/useParties';
import { NvoccFormActions, NvoccFormField } from '@/features/nvocc/components/NvoccFormField';
import { NvoccPermissionNotice } from '@/features/nvocc/components/NvoccPermissionNotice';
import { NVOCC_CARGO_TYPES } from '@/features/nvocc/constants/nvocc.constants';
import type { NvoccCargoType } from '@/features/nvocc/constants/nvocc.constants';
import { useCreateNvoccEnquiry } from '@/features/nvocc/hooks/useNvocc';
import {
  createNvoccEnquiryFormSchema,
  enquiryFormToSchemaInput,
  toEnquiryPayload,
  type NvoccEnquiryFormState,
} from '@/features/nvocc/schemas/nvocc.schema';
import { useInlineValidation } from '@/lib/validation';

const emptyEnquiryForm = (): NvoccEnquiryFormState => ({
  customer_id: '',
  voyage_id: '',
  cargo_type: 'FCL',
  container_count: '',
  cbm: '',
  gross_weight: '',
  pieces: '',
  commodity: '',
  hs_code: '',
  incoterms: '',
  freight_terms: '',
  rate_quoted: '',
  rate_validity: '',
  follow_up_date: '',
});

export default function NvoccEnquiryCreatePage() {
  const navigate = useNavigate();
  const create = useCreateNvoccEnquiry();
  const { fieldError, formError, clearErrors, runValidated, revalidate } = useInlineValidation();
  const [form, setForm] = useState<NvoccEnquiryFormState>(emptyEnquiryForm);
  const { data: customersResult } = useParties({ page: 1, limit: 5, party_type: 'CUSTOMER', order: 'asc' });
  const firstCustomerId = customersResult?.parties[0]?.id ?? '';

  const patch = (next: Partial<NvoccEnquiryFormState>) => {
    setForm((prev) => {
      const merged = { ...prev, ...next };
      revalidate(createNvoccEnquiryFormSchema, enquiryFormToSchemaInput(merged));
      return merged;
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearErrors();
    await runValidated(createNvoccEnquiryFormSchema, enquiryFormToSchemaInput(form), async (parsed) => {
      const enquiry = await create.mutateAsync(toEnquiryPayload(parsed));
      navigate(`/nvocc/enquiries/${enquiry.id}`);
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageBackLink to="/nvocc/enquiry-list" label="Back to enquiries" />
      <NvoccPermissionNotice />
      <form onSubmit={submit} className="space-y-4 rounded-md border border-gray-200 bg-white p-5">
        <h1 className="text-lg font-semibold text-gray-900">New NVOCC enquiry</h1>
        <p className="text-sm text-gray-500">
          FCL requires container count; LCL requires CBM.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <NvoccFormField label="Cargo type" required error={fieldError('cargo_type')}>
            <SelectInput
              options={NVOCC_CARGO_TYPES.map((v) => ({ value: v, label: v }))}
              value={form.cargo_type}
              onChange={(e) => patch({ cargo_type: e.target.value as NvoccCargoType })}
            />
          </NvoccFormField>
          <NvoccFormField label="Container count" error={fieldError('container_count')}>
            <TextInput type="number" value={form.container_count} onChange={(e) => patch({ container_count: e.target.value })} />
          </NvoccFormField>
          <NvoccFormField label="Customer ID" error={fieldError('customer_id')} hint={firstCustomerId ? `First customer: ${firstCustomerId.slice(0, 8)}…` : 'Optional party UUID'}>
            <TextInput value={form.customer_id} onChange={(e) => patch({ customer_id: e.target.value })} placeholder="UUID" />
          </NvoccFormField>
          <NvoccFormField label="Voyage ID" error={fieldError('voyage_id')} hint="Link to an open voyage">
            <TextInput value={form.voyage_id} onChange={(e) => patch({ voyage_id: e.target.value })} placeholder="UUID" />
          </NvoccFormField>
          <NvoccFormField label="CBM" error={fieldError('cbm')}>
            <TextInput type="number" value={form.cbm} onChange={(e) => patch({ cbm: e.target.value })} />
          </NvoccFormField>
          <NvoccFormField label="Gross weight (kg)" error={fieldError('gross_weight')}>
            <TextInput type="number" value={form.gross_weight} onChange={(e) => patch({ gross_weight: e.target.value })} />
          </NvoccFormField>
          <NvoccFormField label="Pieces" error={fieldError('pieces')}>
            <TextInput type="number" value={form.pieces} onChange={(e) => patch({ pieces: e.target.value })} />
          </NvoccFormField>
          <NvoccFormField label="Rate quoted" error={fieldError('rate_quoted')}>
            <TextInput type="number" value={form.rate_quoted} onChange={(e) => patch({ rate_quoted: e.target.value })} />
          </NvoccFormField>
          <NvoccFormField label="HS code" error={fieldError('hs_code')}>
            <TextInput value={form.hs_code} onChange={(e) => patch({ hs_code: e.target.value })} placeholder="870899" />
          </NvoccFormField>
          <NvoccFormField label="Incoterms" error={fieldError('incoterms')}>
            <TextInput value={form.incoterms} onChange={(e) => patch({ incoterms: e.target.value })} placeholder="FOB" />
          </NvoccFormField>
          <div className="sm:col-span-2">
            <NvoccFormField label="Commodity" error={fieldError('commodity')}>
              <TextInput value={form.commodity} onChange={(e) => patch({ commodity: e.target.value })} />
            </NvoccFormField>
          </div>
          <NvoccFormField label="Rate validity" error={fieldError('rate_validity')}>
            <DateInput value={form.rate_validity} onChange={(e) => patch({ rate_validity: e.target.value })} />
          </NvoccFormField>
          <NvoccFormField label="Follow up date" error={fieldError('follow_up_date')}>
            <DateInput value={form.follow_up_date} onChange={(e) => patch({ follow_up_date: e.target.value })} />
          </NvoccFormField>
        </div>

        <FieldError message={formError} />
        <NvoccFormActions
          pending={create.isPending}
          submitLabel="Create enquiry"
          onClear={() => {
            clearErrors();
            setForm(emptyEnquiryForm());
          }}
        />
      </form>
    </div>
  );
}
