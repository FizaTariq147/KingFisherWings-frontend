import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OperationTypeBadge } from '@/components/erp';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { JOB_TYPE_LABELS, type JobType } from '../../constants/job.constants';
import { jobStatusDisplayLabel } from '../../constants/job.constants';
import { isRoadOrLandJobType } from '../../hooks/useRoadLandJob';
import { jobService } from '../../services/job.service';
import type { Job } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { jobDisplayNumber } from '../../utils/jobRoute';
import { JobContainersPanel } from '../JobContainersPanel';
import { JobDocumentsPanel } from '../JobDocumentsPanel';
import { JobPortTokenPanel } from '../JobPortTokenPanel';
import { RoadLandWorkflowPanel } from '../RoadLandWorkflowPanel';

function display(value?: string | number | null): string {
  const raw = String(value ?? '').trim();
  return raw || '—';
}

function humanizeHint(hint: string): string {
  return hint.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

const HANDOFF_HINT_ORDER = [
  'containers',
  'assign_trucker',
  'trucker',
  'transport_request',
  'transport-requests',
  'port_token',
  'port-token',
  'documents',
  'upload_docs',
] as const;

/**
 * Handoff-limited ops surface after Pass-to-Transport / dept pass:
 * job summary + party/route + BL refs + containers + trucker + port-token + docs.
 */
export function JobHandoffPanel({
  job,
  onChanged,
}: {
  job: Job;
  onChanged?: () => void;
}) {
  const qc = useQueryClient();
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
  const bl = display(job.bl_number);
  const hawb = display(air?.hawb_number);
  const mawb = display(air?.mawb_number);

  const party =
    display(job.client_name) !== '—'
      ? display(job.client_name)
      : display(job.shipper_name) !== '—'
        ? display(job.shipper_name)
        : display(job.billing_party_name) !== '—'
          ? display(job.billing_party_name)
          : display(job.consignee_name);
  const origin = display(job.origin_port_code ?? job.origin_port_name);
  const destination = display(job.dest_port_code ?? job.dest_port_name);
  const route =
    origin !== '—' || destination !== '—'
      ? `${origin} → ${destination}`
      : '—';

  const typeLabel =
    (job.job_type && JOB_TYPE_LABELS[job.job_type as JobType]) ||
    display(job.job_type);

  const pathHints = useMemo(() => {
    const raw = job.path_hints ?? [];
    const list = Array.isArray(raw) ? raw.map(String).filter(Boolean) : [];
    if (!list.length) {
      const defaults: string[] = [];
      if (canContainers) defaults.push('containers');
      if (canTrucker) defaults.push('assign_trucker', 'transport_request');
      if (canPortToken) defaults.push('port_token');
      if (canDocs) defaults.push('documents');
      return defaults;
    }
    const rank = (h: string) => {
      const key = h.toLowerCase();
      const idx = HANDOFF_HINT_ORDER.findIndex((k) => key.includes(k));
      return idx === -1 ? 99 : idx;
    };
    return [...list].sort((a, b) => rank(a) - rank(b));
  }, [job.path_hints, canContainers, canTrucker, canPortToken, canDocs]);

  const transportQuery = useQuery({
    queryKey: ['jobs', job.id, 'transport-requests'],
    queryFn: () => jobService.listTransportRequests(job.id),
    enabled: canTrucker && !isRoadOrLandJobType(job.job_type),
  });

  const [transportMsg, setTransportMsg] = useState<string | null>(null);
  const [transportErr, setTransportErr] = useState<string | null>(null);

  const createTransport = useMutation({
    mutationFn: () =>
      jobService.createTransportRequest(job.id, {
        request_type: 'PICKUP',
        cargo_details: undefined,
      }),
    onSuccess: async () => {
      setTransportErr(null);
      setTransportMsg('Transport request created — open Transport requests to assign a trucker.');
      await qc.invalidateQueries({ queryKey: ['jobs', job.id, 'transport-requests'] });
      await qc.invalidateQueries({ queryKey: ['transport-requests'] });
      onChanged?.();
    },
    onError: (err: unknown) => {
      setTransportMsg(null);
      setTransportErr(getErrorMessage(err));
    },
  });

  const transportRows = transportQuery.data ?? [];
  const hasTransportRequest = transportRows.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Transport handoff</CardTitle>
        </CardHeader>
        <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3 text-[13px]">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">Job</div>
            <div className="font-medium text-[#0f172a]">{jobDisplayNumber(job)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">Status</div>
            <div>{jobStatusDisplayLabel(job)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">Type</div>
            <div className="flex items-center gap-2">
              {job.job_type ? <OperationTypeBadge code={job.job_type} /> : null}
              <span>{typeLabel}</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">Party</div>
            <div>{party}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">
              Route
            </div>
            <div>{route}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">
              Branch
            </div>
            <div>{display(job.branch_name)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">
              Department
            </div>
            <div>{display(job.department_name)}</div>
          </div>
          {bl !== '—' ? (
            <div>
              <div className="text-[11px] uppercase tracking-wide text-[#64748B]">BL</div>
              <div>{bl}</div>
            </div>
          ) : null}
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">
              HBL / HAWB
            </div>
            <div>{hbl !== '—' ? hbl : hawb}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">
              MBL / MAWB
            </div>
            <div>{mbl !== '—' ? mbl : mawb}</div>
          </div>
        </div>

        {pathHints.length ? (
          <div className="border-t border-[var(--fresa-border,#E8EEF5)] px-4 py-3">
            <div className="mb-1.5 text-[11px] uppercase tracking-wide text-[#64748B]">
              Allowed actions
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {pathHints.map((hint) => (
                <li
                  key={hint}
                  className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[#F8FAFC] px-2 py-0.5 text-[12px] text-[#334155]"
                >
                  {humanizeHint(hint)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="border-t border-[var(--fresa-border,#E8EEF5)] px-4 py-2 text-[12px] text-[#64748B]">
          Limited handoff view — containers, trucker, port token, and document upload only.
          Costing, pass, close, and full ops tabs stay with Tenant Admin / Branch Manager.{' '}
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
          <div className="space-y-3 px-4 pb-4 text-[13px]">
            {transportErr ? (
              <p className="text-[var(--color-danger-600)]">{transportErr}</p>
            ) : null}
            {transportMsg ? (
              <p className="text-[var(--color-success-700)]">{transportMsg}</p>
            ) : null}
            <p className="text-[#64748B]">
              {hasTransportRequest
                ? 'A transport request exists for this job. Open the board to assign a trucker and update pickup / transit / delivery.'
                : 'Create a transport request for this job, then assign a trucker on the Transport requests board.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {!hasTransportRequest ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={createTransport.isPending}
                  onClick={() => createTransport.mutate()}
                >
                  {createTransport.isPending
                    ? 'Creating…'
                    : 'Create transport request'}
                </Button>
              ) : null}
              <Link
                to="/operations/transport-requests"
                className="inline-flex h-8 items-center rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-3 text-[13px] font-medium text-[#334155] hover:bg-[#F8FAFC]"
              >
                Open Transport requests
              </Link>
            </div>
          </div>
        </Card>
      ) : null}

      {canPortToken ? <JobPortTokenPanel jobId={job.id} /> : null}

      {canDocs ? (
        <JobDocumentsPanel jobId={job.id} jobType={job.job_type} />
      ) : null}
    </div>
  );
}
