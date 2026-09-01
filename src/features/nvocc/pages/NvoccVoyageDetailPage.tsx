import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { NvoccListState, NvoccStatusBadge } from '@/features/nvocc/components/NvoccUi';
import { useNvoccVoyage, useNvoccVoyageActions } from '@/features/nvocc/hooks/useNvocc';
import { useNvoccVoyagePnl } from '@/features/nvocc/hooks/useNvoccReports';
import { formatNvoccDate, nvoccDisplayNumber } from '@/features/nvocc/utils/normalizeNvocc';
import {
  extractReportMetrics,
  extractReportRows,
  formatReportCell,
  formatReportLabel,
} from '@/features/nvocc/utils/normalizeNvoccReports';
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
  const pnlQuery = useNvoccVoyagePnl(id);
  const voyage = query.data;
  const pnlMetrics = useMemo(() => extractReportMetrics(pnlQuery.data), [pnlQuery.data]);
  const pnlRows = useMemo(() => extractReportRows(pnlQuery.data), [pnlQuery.data]);

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

          <Card>
            <CardHeader>
              <CardTitle>Voyage P&L</CardTitle>
            </CardHeader>
            <div className="px-4 pb-4 space-y-4">
              {pnlQuery.isLoading ? (
                <p className="text-sm text-gray-500">Loading P&L…</p>
              ) : pnlQuery.isError ? (
                <p className="text-sm text-red-600">{extractAxiosErrorDetail(pnlQuery.error)}</p>
              ) : pnlMetrics.length === 0 && pnlRows.length === 0 ? (
                <p className="text-sm text-gray-500">No P&L data available.</p>
              ) : (
                <>
                  {pnlMetrics.length > 0 && (
                    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {pnlMetrics.map((m) => (
                        <div key={m.key} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                          <dt className="text-xs uppercase tracking-wide text-gray-500">{m.label}</dt>
                          <dd className="mt-1 text-sm font-semibold text-gray-900">{m.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {pnlRows.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="min-w-[480px] w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                            {Object.keys(pnlRows[0] ?? {}).map((col) => (
                              <th key={col} className="py-2 pr-4 font-medium">
                                {formatReportLabel(col)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pnlRows.map((row, index) => (
                            <tr key={String(row.id ?? index)} className="border-b border-gray-100">
                              {Object.keys(pnlRows[0] ?? {}).map((col) => (
                                <td key={col} className="py-2 pr-4">
                                  {formatReportCell(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
