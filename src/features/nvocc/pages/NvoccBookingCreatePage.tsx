import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { PageBackLink } from '@/components/ui/PageBackLink';

import { FieldError } from '@/components/ui/FieldError/FieldError';

import { SelectInput, TextInput } from '@/components/widgets/FilterField';

import { useParties } from '@/features/parties/hooks/useParties';

import { NvoccFormActions, NvoccFormField } from '@/features/nvocc/components/NvoccFormField';

import { NvoccPermissionNotice } from '@/features/nvocc/components/NvoccPermissionNotice';

import { NVOCC_CARGO_TYPES } from '@/features/nvocc/constants/nvocc.constants';

import type { NvoccCargoType } from '@/features/nvocc/constants/nvocc.constants';

import { useCreateNvoccBooking } from '@/features/nvocc/hooks/useNvocc';

import {

  bookingFormToSchemaInput,

  createNvoccBookingFormSchema,

  toBookingPayload,

  type NvoccBookingFormState,

} from '@/features/nvocc/schemas/nvocc.schema';

import { useInlineValidation } from '@/lib/validation';



const emptyBookingForm = (): NvoccBookingFormState => ({

  voyage_id: '',

  enquiry_id: '',

  shipper_id: '',

  consignee_id: '',

  cargo_type: 'FCL',

  container_count: '',

  cbm_allocated: '',

  gross_weight: '',

  pieces: '',

  commodity: '',

  hs_code: '',

  shipper_ref: '',

  incoterms: '',

  freight_terms: '',

  apply_tariff: true,

});



export default function NvoccBookingCreatePage() {

  const navigate = useNavigate();

  const create = useCreateNvoccBooking();

  const { fieldError, formError, clearErrors, runValidated, revalidate } = useInlineValidation();

  const [form, setForm] = useState<NvoccBookingFormState>(emptyBookingForm);

  const { data: partiesResult } = useParties({ page: 1, limit: 5, order: 'asc' });

  const firstShipperId = partiesResult?.parties[0]?.id ?? '';



  const patch = (next: Partial<NvoccBookingFormState>) => {

    setForm((prev) => {

      const merged = { ...prev, ...next };

      revalidate(createNvoccBookingFormSchema, bookingFormToSchemaInput(merged));

      return merged;

    });

  };



  const submit = async (event: React.FormEvent) => {

    event.preventDefault();

    clearErrors();

    await runValidated(createNvoccBookingFormSchema, bookingFormToSchemaInput(form), async (parsed) => {

      const booking = await create.mutateAsync(toBookingPayload(parsed));

      navigate(`/nvocc/bookings/${booking.id}`);

    });

  };



  return (

    <div className="mx-auto max-w-2xl space-y-4">

      <PageBackLink to="/nvocc/booking-list" label="Back to bookings" />

      <NvoccPermissionNotice />

      <form onSubmit={submit} className="space-y-4 rounded-md border border-gray-200 bg-white p-5">

        <h1 className="text-lg font-semibold text-gray-900">New NVOCC booking</h1>

        <p className="text-sm text-gray-500">Voyage is required.</p>



        <div className="grid gap-4 sm:grid-cols-2">

          <NvoccFormField label="Voyage ID" required error={fieldError('voyage_id')}>

            <TextInput value={form.voyage_id} onChange={(e) => patch({ voyage_id: e.target.value })} placeholder="UUID" />

          </NvoccFormField>

          <NvoccFormField label="Enquiry ID" error={fieldError('enquiry_id')}>

            <TextInput value={form.enquiry_id} onChange={(e) => patch({ enquiry_id: e.target.value })} placeholder="Optional UUID" />

          </NvoccFormField>

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

          <NvoccFormField label="Shipper ID" error={fieldError('shipper_id')} hint={firstShipperId ? `First party: ${firstShipperId.slice(0, 8)}…` : undefined}>

            <TextInput value={form.shipper_id} onChange={(e) => patch({ shipper_id: e.target.value })} placeholder="UUID" />

          </NvoccFormField>

          <NvoccFormField label="Consignee ID" error={fieldError('consignee_id')}>

            <TextInput value={form.consignee_id} onChange={(e) => patch({ consignee_id: e.target.value })} placeholder="UUID" />

          </NvoccFormField>

          <NvoccFormField label="CBM allocated" error={fieldError('cbm_allocated')}>

            <TextInput type="number" value={form.cbm_allocated} onChange={(e) => patch({ cbm_allocated: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="Gross weight (kg)" error={fieldError('gross_weight')}>

            <TextInput type="number" value={form.gross_weight} onChange={(e) => patch({ gross_weight: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="HS code" error={fieldError('hs_code')}>

            <TextInput value={form.hs_code} onChange={(e) => patch({ hs_code: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="Shipper ref" error={fieldError('shipper_ref')}>

            <TextInput value={form.shipper_ref} onChange={(e) => patch({ shipper_ref: e.target.value })} />

          </NvoccFormField>

          <div className="sm:col-span-2">

            <NvoccFormField label="Commodity" error={fieldError('commodity')}>

              <TextInput value={form.commodity} onChange={(e) => patch({ commodity: e.target.value })} />

            </NvoccFormField>

          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">

            <input

              type="checkbox"

              checked={form.apply_tariff}

              onChange={(e) => patch({ apply_tariff: e.target.checked })}

              className="rounded border-gray-300"

            />

            Auto-apply matching NVOCC tariff charge lines

          </label>

        </div>



        <FieldError message={formError} />

        <NvoccFormActions

          pending={create.isPending}

          submitLabel="Create booking"

          onClear={() => {

            clearErrors();

            setForm(emptyBookingForm());

          }}

        />

      </form>

    </div>

  );

}

