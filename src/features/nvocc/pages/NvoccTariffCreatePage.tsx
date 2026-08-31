import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { PageBackLink } from '@/components/ui/PageBackLink';

import { FieldError } from '@/components/ui/FieldError/FieldError';

import { NvoccPermissionNotice } from '@/features/nvocc/components/NvoccPermissionNotice';

import { SelectInput, TextInput, DateInput } from '@/components/widgets/FilterField';

import { NvoccFormActions, NvoccFormField } from '@/features/nvocc/components/NvoccFormField';

import {

  NVOCC_COMMODITY_TYPES,

  NVOCC_TARIFF_STATUSES,

  nvoccLabel,

} from '@/features/nvocc/constants/nvocc.constants';

import { useCreateNvoccTariff } from '@/features/nvocc/hooks/useNvocc';

import {

  createNvoccTariffFormSchema,

  tariffFormToSchemaInput,

  toTariffPayload,

  type NvoccTariffFormState,

} from '@/features/nvocc/schemas/nvocc.schema';

import { useInlineValidation } from '@/lib/validation';



const emptyTariffForm = (): NvoccTariffFormState => ({

  trade_lane: '',

  pol_region: '',

  pod_region: '',

  origin_port_id: '',

  dest_port_id: '',

  commodity_type: '',

  fcl_rate: '',

  lcl_rate_cbm: '',

  lcl_minimum_charge: '',

  origin_thc: '',

  dest_thc: '',

  bl_fee: '',

  rate_valid_from: '',

  rate_valid_to: '',

  currency_code: 'USD',

  status: 'ACTIVE',

});



export default function NvoccTariffCreatePage() {

  const navigate = useNavigate();

  const create = useCreateNvoccTariff();

  const { fieldError, formError, clearErrors, runValidated, revalidate, validatePath } =

    useInlineValidation();

  const [form, setForm] = useState<NvoccTariffFormState>(emptyTariffForm);



  const patch = (next: Partial<NvoccTariffFormState>) => {

    setForm((prev) => {

      const merged = { ...prev, ...next };

      revalidate(createNvoccTariffFormSchema, tariffFormToSchemaInput(merged));

      return merged;

    });

  };



  const submit = async (event: React.FormEvent) => {

    event.preventDefault();

    clearErrors();

    await runValidated(createNvoccTariffFormSchema, tariffFormToSchemaInput(form), async (parsed) => {

      const tariff = await create.mutateAsync(toTariffPayload(parsed));

      navigate(`/nvocc/tariffs/${tariff.id}`);

    });

  };



  return (

    <div className="mx-auto max-w-2xl space-y-4">

      <PageBackLink to="/nvocc/tariffs" label="Back to tariffs" />

      <NvoccPermissionNotice />

      <form onSubmit={submit} className="space-y-4 rounded-md border border-gray-200 bg-white p-5">

        <h1 className="text-lg font-semibold text-gray-900">New NVOCC tariff</h1>

        <p className="text-sm text-gray-500">

          Required by API: trade lane, valid from, currency.

        </p>



        <div className="grid gap-4 sm:grid-cols-2">

          <div className="sm:col-span-2">

            <NvoccFormField label="Trade lane" required error={fieldError('trade_lane')}>

              <TextInput

                value={form.trade_lane}

                onChange={(e) => patch({ trade_lane: e.target.value })}

                onBlur={() =>

                  validatePath(createNvoccTariffFormSchema, tariffFormToSchemaInput(form), 'trade_lane')

                }

              />

            </NvoccFormField>

          </div>

          <NvoccFormField label="POL region" error={fieldError('pol_region')}>

            <TextInput value={form.pol_region} onChange={(e) => patch({ pol_region: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="POD region" error={fieldError('pod_region')}>

            <TextInput value={form.pod_region} onChange={(e) => patch({ pod_region: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="Commodity type" error={fieldError('commodity_type')}>

            <SelectInput

              options={['', ...NVOCC_COMMODITY_TYPES.map((v) => ({ value: v, label: nvoccLabel(v) }))]}

              value={form.commodity_type}

              onChange={(e) => patch({ commodity_type: e.target.value })}

            />

          </NvoccFormField>

          <NvoccFormField label="Status" error={fieldError('status')}>

            <SelectInput

              options={NVOCC_TARIFF_STATUSES.map((v) => ({ value: v, label: nvoccLabel(v) }))}

              value={form.status}

              onChange={(e) => patch({ status: e.target.value })}

            />

          </NvoccFormField>

          <NvoccFormField label="Valid from" required error={fieldError('rate_valid_from')}>

            <DateInput value={form.rate_valid_from} onChange={(e) => patch({ rate_valid_from: e.target.value })} onBlur={() => validatePath(createNvoccTariffFormSchema, tariffFormToSchemaInput(form), 'rate_valid_from')} />

          </NvoccFormField>

          <NvoccFormField label="Valid to" error={fieldError('rate_valid_to')}>

            <DateInput value={form.rate_valid_to} onChange={(e) => patch({ rate_valid_to: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="Currency" required error={fieldError('currency_code')}>

            <TextInput value={form.currency_code} onChange={(e) => patch({ currency_code: e.target.value.toUpperCase() })} maxLength={3} />

          </NvoccFormField>

          <NvoccFormField label="FCL rate" error={fieldError('fcl_rate')}>

            <TextInput type="number" value={form.fcl_rate} onChange={(e) => patch({ fcl_rate: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="LCL rate (CBM)" error={fieldError('lcl_rate_cbm')}>

            <TextInput type="number" value={form.lcl_rate_cbm} onChange={(e) => patch({ lcl_rate_cbm: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="LCL minimum charge" error={fieldError('lcl_minimum_charge')}>

            <TextInput type="number" value={form.lcl_minimum_charge} onChange={(e) => patch({ lcl_minimum_charge: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="Origin THC" error={fieldError('origin_thc')}>

            <TextInput type="number" value={form.origin_thc} onChange={(e) => patch({ origin_thc: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="Dest THC" error={fieldError('dest_thc')}>

            <TextInput type="number" value={form.dest_thc} onChange={(e) => patch({ dest_thc: e.target.value })} />

          </NvoccFormField>

          <NvoccFormField label="BL fee" error={fieldError('bl_fee')}>

            <TextInput type="number" value={form.bl_fee} onChange={(e) => patch({ bl_fee: e.target.value })} />

          </NvoccFormField>

        </div>



        <FieldError message={formError} />

        <NvoccFormActions

          pending={create.isPending}

          submitLabel="Create tariff"

          onClear={() => {

            clearErrors();

            setForm(emptyTariffForm());

          }}

        />

      </form>

    </div>

  );

}

