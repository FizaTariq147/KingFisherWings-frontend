import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { JOB_TYPE_LABELS, JOB_STATUS_LABELS } from '../../constants/job.constants';
import { useJobResolvedLabels } from '../../hooks/useJobResolvedLabels';
import type { Job } from '../../types/job.types';
import { jobDisplayNumber } from '../../utils/jobRoute';

function Row({ label, value }: { label: string; value?: string | number | null }) {
  const display = value == null || value === '' ? '—' : String(value);
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm border-b border-[var(--color-neutral-100)] last:border-0">
      <span className="text-[var(--color-neutral-500)]">{label}</span>
      <span className="text-[var(--color-neutral-800)] text-right font-medium">{display}</span>
    </div>
  );
}

export function JobOverviewPanel({ job }: { job: Job }) {
  const { shipperLabel, consigneeLabel, agentLabel } = useJobResolvedLabels(job);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Basic</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4">
          <Row label="Job number" value={jobDisplayNumber(job)} />
          <Row label="Type" value={JOB_TYPE_LABELS[job.job_type] ?? job.job_type} />
          <Row label="Status" value={JOB_STATUS_LABELS[job.status] ?? job.status} />
          <Row label="ETD" value={job.etd} />
          <Row label="ETA" value={job.eta} />
          <Row label="Incoterms" value={job.incoterms} />
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Parties</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4">
          <Row label="Shipper" value={shipperLabel} />
          <Row label="Consignee" value={consigneeLabel} />
          <Row label="Agent" value={agentLabel} />
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cargo</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4">
          <Row label="Commodity" value={job.commodity} />
          <Row label="HS code" value={job.hs_code} />
          <Row label="Pieces" value={job.pieces} />
          <Row label="Gross weight" value={job.gross_weight} />
          <Row label="Chargeable weight" value={job.chargeable_weight} />
          <Row label="Volume (CBM)" value={job.volume_cbm} />
          <Row label="DG" value={job.is_dg ? `Yes (${job.dg_class || '—'})` : 'No'} />
        </div>
      </Card>
      {(job.notes || job.customer_remarks) && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4 space-y-2 text-sm text-[var(--color-neutral-700)]">
            {job.customer_remarks && (
              <div>
                <p className="text-xs text-[var(--color-neutral-400)] mb-1">Customer remarks</p>
                <p>{job.customer_remarks}</p>
              </div>
            )}
            {job.notes && (
              <div>
                <p className="text-xs text-[var(--color-neutral-400)] mb-1">Internal notes</p>
                <p>{job.notes}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
