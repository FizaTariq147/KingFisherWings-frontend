import { useParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { NvoccListState, NvoccStatusBadge } from '@/features/nvocc/components/NvoccUi';
import { useNvoccTariff } from '@/features/nvocc/hooks/useNvocc';
import { formatNvoccDate } from '@/features/nvocc/utils/normalizeNvocc';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value ?? '—'}</dd>
    </div>
  );
}

export default function NvoccTariffDetailPage() {
  const { id = '' } = useParams();
  const query = useNvoccTariff(id);
  const tariff = query.data;

  return (
    <div className="space-y-4">
      <PageBackLink to="/nvocc/tariffs" label="Back to tariffs" />
      <NvoccListState loading={query.isLoading} error={query.isError ? query.error : undefined} />
      {tariff && (
        <>
          <div className="rounded-md border border-gray-200 bg-white p-5">
            <h1 className="text-xl font-semibold text-gray-900">{tariff.trade_lane}</h1>
            <div className="mt-2">
              <NvoccStatusBadge status={tariff.status} />
            </div>
          </div>

          <dl className="grid gap-4 rounded-md border border-gray-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="POL region" value={tariff.pol_region} />
            <Field label="POD region" value={tariff.pod_region} />
            <Field label="Origin port" value={tariff.origin_port_id} />
            <Field label="Dest port" value={tariff.dest_port_id} />
            <Field label="Commodity" value={tariff.commodity_type} />
            <Field label="Valid from" value={formatNvoccDate(tariff.rate_valid_from)} />
            <Field label="Valid to" value={formatNvoccDate(tariff.rate_valid_to)} />
            <Field label="Currency" value={tariff.currency_code} />
            <Field label="FCL rate" value={tariff.fcl_rate} />
            <Field label="LCL rate (CBM)" value={tariff.lcl_rate_cbm} />
            <Field label="LCL min charge" value={tariff.lcl_minimum_charge} />
            <Field label="Origin THC" value={tariff.origin_thc} />
            <Field label="Dest THC" value={tariff.dest_thc} />
            <Field label="BL fee" value={tariff.bl_fee} />
            <Field label="BAF" value={tariff.baf_surcharge} />
            <Field label="CAF" value={tariff.caf_surcharge} />
          </dl>
        </>
      )}
    </div>
  );
}
