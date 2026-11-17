import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { JobContainersPanel } from '../JobContainersPanel';
import { JobDocumentsPanel } from '../JobDocumentsPanel';
import { JobPortTokenPanel } from '../JobPortTokenPanel';
import { RoadLandWorkflowPanel } from '../RoadLandWorkflowPanel';
import type { Job } from '../../types/job.types';
import { jobDisplayNumber } from '../../utils/jobRoute';
import { jobStatusDisplayLabel } from '../../constants/job.constants';
import { isRoadOrLandJobType } from '../../hooks/useRoadLandJob';

function display(value?: string | number | null): string {
  const raw = String(value ?? '').trim();
  return raw || '—';
}

/**
 * Handoff-limited ops surface after Pass-to-Transport / dept pass:
 * job summary + BL refs + containers + assign trucker + port-token + docs.
 */
export function JobHandoffPanel({
  job,
  onChanged,
}: {
  job: Job;
  onChanged?: () => void;
}) {
  const actions = job.actions;
  const canContainers = actions?.can_view_containers !== false;
  const canTrucker = actions?.can_assign_trucker !== false;
  const canPortToken = actions?.can_port_token !== false;
  const canDocs =
    actions?.can_documents !== false && actions?.can_upload_docs !== false;

  const sea = job.sea_fcl_details ?? job.sea_lcl_details;
  const air = job.air_details;
  const hbl = display(
    sea && 'hbl_number' in sea
      ? (sea as { hbl_number?: string }).hbl_number
      : undefined,
  );
  const mbl = display(
    sea && 'mbl_number' in sea
      ? (sea as { mbl_number?: string }).mbl_number
      : job.bl_number,
  );
  const hawb = display(air?.hawb_number);
  const mawb = display(air?.mawb_number);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Transport handoff</CardTitle>
        </CardHeader>
        <div className="grid gap-2 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3 text-[13px]">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">Job</div>
            <div className="font-medium text-[#0f172a]">{jobDisplayNumber(job)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">Status</div>
            <div>{jobStatusDisplayLabel(job)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">Branch</div>
            <div>{display(job.branch_name)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">Department</div>
            <div>{display(job.department_name)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">HBL / HAWB</div>
            <div>{hbl !== '—' ? hbl : hawb}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">MBL / MAWB</div>
            <div>{mbl !== '—' ? mbl : mawb}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">Origin</div>
            <div>{display(job.origin_port_code ?? job.origin_port_name)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">Destination</div>
            <div>{display(job.dest_port_code ?? job.dest_port_name)}</div>
          </div>
        </div>
        <p className="border-t border-[var(--fresa-border,#E8EEF5)] px-4 py-2 text-[12px] text-[#64748B]">
          Limited view — containers, trucker, port token, and document upload only. Costing and
          full edits stay with ops / Tenant Admin.{' '}
          <Link
            to="/operations/transport-requests"
            className="font-medium text-[var(--color-primary-700)] underline-offset-2 hover:underline"
          >
            Transport requests
          </Link>
        </p>
      </Card>

      {canContainers ? <JobContainersPanel jobId={job.id} /> : null}

      {canTrucker && isRoadOrLandJobType(job.job_type) ? (
        <RoadLandWorkflowPanel job={job} handoffLimited />
      ) : canTrucker ? (
        <Card>
          <CardHeader>
            <CardTitle>Assign trucker</CardTitle>
          </CardHeader>
          <p className="px-4 pb-4 text-[13px] text-[#64748B]">
            Use{' '}
            <Link
              to="/operations/transport-requests"
              className="font-medium text-[var(--color-primary-700)] underline-offset-2 hover:underline"
            >
              Transport requests
            </Link>{' '}
            to create or assign a trucker for this job.
          </p>
        </Card>
      ) : null}

      {canPortToken ? <JobPortTokenPanel jobId={job.id} /> : null}

      {canDocs ? (
        <JobDocumentsPanel jobId={job.id} jobType={job.job_type} />
      ) : null}
    </div>
  );
}
