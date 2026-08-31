import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { PageBackLink } from '@/components/ui/PageBackLink';

import { FieldError } from '@/components/ui/FieldError/FieldError';

import { TextInput, DateInput } from '@/components/widgets/FilterField';

import { NvoccFormActions, NvoccFormField } from '@/features/nvocc/components/NvoccFormField';

import { NvoccPermissionNotice } from '@/features/nvocc/components/NvoccPermissionNotice';

import { useCreateNvoccVoyage } from '@/features/nvocc/hooks/useNvocc';

import {

  createNvoccVoyageFormSchema,

  toVoyagePayload,

  voyageFormToSchemaInput,

  type NvoccVoyageFormState,

} from '@/features/nvocc/schemas/nvocc.schema';

import { useInlineValidation } from '@/lib/validation';



const emptyVoyageForm = (): NvoccVoyageFormState => ({

  vessel_id: '',

  shipping_line_id: '',

  pol_id: '',

  pod_id: '',

  etd: '',

  eta: '',

  si_cutoff: '',

  vgm_cutoff: '',

  cy_cutoff: '',

  cargo_cutoff: '',

  slot_allocation_containers: '',

  lcl_capacity_cbm: '',

  mbl_number: '',

  nvocc_freight_rate: '',

  carrier_cost: '',

  remarks: '',

});



export default function NvoccVoyageCreatePage() {

  const navigate = useNavigate();

  const create = useCreateNvoccVoyage();

  const { fieldError, formError, clearErrors, runValidated, revalidate } = useInlineValidation();

  const [form, setForm] = useState<NvoccVoyageFormState>(emptyVoyageForm);



  const patch = (next: Partial<NvoccVoyageFormState>) => {

    setForm((prev) => {

      const merged = { ...prev, ...next };

      revalidate(createNvoccVoyageFormSchema, voyageFormToSchemaInput(merged));

      return merged;

    });

  };



  const submit = async (event: React.FormEvent) => {

    event.preventDefault();

    clearErrors();

    await runValidated(createNvoccVoyageFormSchema, voyageFormToSchemaInput(form), async (parsed) => {

      const voyage = await create.mutateAsync(toVoyagePayload(parsed));

      navigate(`/nvocc/voyages/${voyage.id}`);

    });

  };



  return (

    <div className="mx-auto max-w-2xl space-y-4">

      <PageBackLink to="/nvocc/vessel-voyage-master" label="Back to voyages" />

      <NvoccPermissionNotice />

      <form onSubmit={submit} className="space-y-4 rounded-md border border-gray-200 bg-white p-5">

        <h1 className="text-lg font-semibold text-gray-900">New voyage</h1>

        <p className="text-sm text-gray-500">

          ETD must be before ETA. Cutoff dates should be on or before ETD.

        </p>



        <div className="grid gap-4 sm:grid-cols-2">

          <NvoccFormField label="ETD" error={fieldError('etd')}>

            <DateInput value={form.etd} onChange={(e) => patch({ etd: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="ETA" error={fieldError('eta')}>

            <DateInput value={form.eta} onChange={(e) => patch({ eta: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="SI cutoff" error={fieldError('si_cutoff')}>

            <DateInput value={form.si_cutoff} onChange={(e) => patch({ si_cutoff: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="VGM cutoff" error={fieldError('vgm_cutoff')}>

            <DateInput value={form.vgm_cutoff} onChange={(e) => patch({ vgm_cutoff: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="CY cutoff" error={fieldError('cy_cutoff')}>

            <DateInput value={form.cy_cutoff} onChange={(e) => patch({ cy_cutoff: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="Cargo cutoff" error={fieldError('cargo_cutoff')}>

            <DateInput value={form.cargo_cutoff} onChange={(e) => patch({ cargo_cutoff: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="MBL number" error={fieldError('mbl_number')}>

            <TextInput value={form.mbl_number} onChange={(e) => patch({ mbl_number: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="Slot allocation (containers)" error={fieldError('slot_allocation_containers')}>

            <TextInput type="number" value={form.slot_allocation_containers} onChange={(e) => patch({ slot_allocation_containers: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="LCL capacity (CBM)" error={fieldError('lcl_capacity_cbm')}>

            <TextInput type="number" value={form.lcl_capacity_cbm} onChange={(e) => patch({ lcl_capacity_cbm: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="NVOCC freight rate" error={fieldError('nvocc_freight_rate')}>

            <TextInput type="number" value={form.nvocc_freight_rate} onChange={(e) => patch({ nvocc_freight_rate: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="Carrier cost" error={fieldError('carrier_cost')}>

            <TextInput type="number" value={form.carrier_cost} onChange={(e) => patch({ carrier_cost: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="Vessel ID" error={fieldError('vessel_id')} hint="Optional master UUID">

            <TextInput value={form.vessel_id} onChange={(e) => patch({ vessel_id: e.target.value })} placeholder="UUID" />

          </NvoccFormField>

          <NvoccFormField label="POL ID" error={fieldError('pol_id')}>

            <TextInput value={form.pol_id} onChange={(e) => patch({ pol_id: e.target.value })} placeholder="Port UUID" />

          </NvoccFormField>

          <NvoccFormField label="POD ID" error={fieldError('pod_id')}>

            <TextInput value={form.pod_id} onChange={(e) => patch({ pod_id: e.target.value })} placeholder="Port UUID" />

          </NvoccFormField>

          <div className="sm:col-span-2">

            <NvoccFormField label="Remarks" error={fieldError('remarks')}>

              <TextInput value={form.remarks} onChange={(e) => patch({ remarks: e.target.value })} />

            </NvoccFormField>

          </div>

        </div>



        <FieldError message={formError} />

        <NvoccFormActions

          pending={create.isPending}

          submitLabel="Create voyage"

          onClear={() => {

            clearErrors();

            setForm(emptyVoyageForm());

          }}

        />

      </form>

    </div>

  );

}

