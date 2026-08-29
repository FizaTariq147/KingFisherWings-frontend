import { useNavigate, useParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { NvoccListState, NvoccStatusBadge } from '@/features/nvocc/components/NvoccUi';
import { useNvoccVoyage, useNvoccVoyageActions } from '@/features/nvocc/hooks/useNvocc';
import { formatNvoccDate, nvoccDisplayNumber } from '@/features/nvocc/utils/normalizeNvocc';
import { nvoccLabel } from '@/features/nvocc/constants/nvocc.constants';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value ?? '—'}</dd>
    </div>
  );
}

export default function NvoccVoyageDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const query = useNvoccVoyage(id);
  const actions = useNvoccVoyageActions(id);
  const voyage = query.data;

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch (error) {
      window.alert(extractAxiosErrorDetail(error));
    }
  };

  return (
    <div className="space-y-4">
      <PageBackLink to="/nvocc/vessel-voyage-master" label="Back to voyages" />
      <NvoccListState loading={query.isLoading} error={query.isError ? query.error : undefined} />
      {voyage && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-gray-200 bg-white p-5">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{nvoccDisplayNumber(voyage, 'Voyage')}</h1>
              <div className="mt-2">
                <NvoccStatusBadge status={voyage.voyage_status} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={actions.publish.isPending}
                onClick={() => run(() => actions.publish.mutateAsync())}
              >
                Publish
              </Button>
              <Button
                variant="secondary"
                disabled={actions.close.isPending}
                onClick={() => run(() => actions.close.mutateAsync())}
              >
                Close
              </Button>
              <Button
                variant="secondary"
                disabled={actions.markSailed.isPending}
                onClick={() => run(() => actions.markSailed.mutateAsync())}
              >
                Mark sailed
              </Button>
              <Button
                variant="secondary"
                disabled={actions.copy.isPending}
                onClick={() =>
                  run(async () => {
                    const copy = await actions.copy.mutateAsync({});
                    navigate(`/nvocc/voyages/${copy.id}`);
                  })
                }
              >
                Copy voyage
              </Button>
              <Button onClick={() => navigate(`/nvocc/load-list`)}>Load list</Button>
            </div>
          </div>

          <dl className="grid gap-4 rounded-md border border-gray-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Vessel" value={voyage.vessel_name ?? voyage.vessel_id} />
            <Field label="POL" value={voyage.pol_name ?? voyage.pol_id} />
            <Field label="POD" value={voyage.pod_name ?? voyage.pod_id} />
            <Field label="ETD" value={formatNvoccDate(voyage.etd)} />
            <Field label="ETA" value={formatNvoccDate(voyage.eta)} />
            <Field label="MBL" value={voyage.mbl_number} />
            <Field label="SI cutoff" value={formatNvoccDate(voyage.si_cutoff)} />
            <Field label="VGM cutoff" value={formatNvoccDate(voyage.vgm_cutoff)} />
            <Field label="CY cutoff" value={formatNvoccDate(voyage.cy_cutoff)} />
            <Field label="Cargo cutoff" value={formatNvoccDate(voyage.cargo_cutoff)} />
            <Field label="Slots" value={voyage.slot_allocation_containers} />
            <Field label="LCL capacity (CBM)" value={voyage.lcl_capacity_cbm} />
            <Field label="Freight rate" value={voyage.nvocc_freight_rate} />
            <Field label="Carrier cost" value={voyage.carrier_cost} />
            <Field label="Status" value={nvoccLabel(voyage.voyage_status)} />
            <Field label="Remarks" value={voyage.remarks} />
          </dl>
        </>
      )}
    </div>
  );
}
