import { Link } from 'react-router-dom';
import { PortalApiError } from '@/lib/portalApiClient';
import { PortalPageHeader, PortalPanel } from '@/features/portal-auth/components/portal-ui';
import { usePortalCcJobs } from '../hooks/usePortalCc';

export default function PortalCcJobsPage() {
  const { data = [], isLoading, isError, error, refetch } = usePortalCcJobs();

  return (
    <div className="space-y-4">
      <PortalPageHeader
        title="Customs clearance"
        description="Your CUSTOMS_CLEARANCE jobs — checklist and document upload."
      />
      <PortalPanel>
        <div className="mb-3 flex justify-end">
          <button type="button" className="text-sm underline" onClick={() => void refetch()}>
            Refresh
          </button>
        </div>
        {isLoading ? <p className="text-sm opacity-70">Loading…</p> : null}
        {isError ? (
          <p className="text-sm text-red-600">
            {error instanceof PortalApiError ? error.message : 'Could not load CC jobs.'}
          </p>
        ) : null}
        {!isLoading && data.length === 0 ? (
          <p className="text-sm opacity-70">No customs clearance jobs yet.</p>
        ) : null}
        <ul className="divide-y divide-black/10">
          {data.map((job) => (
            <li key={job.id} className="flex items-center justify-between gap-2 py-3 text-sm">
              <div>
                <p className="font-medium">{job.job_number || job.id.slice(0, 8)}</p>
                <p className="text-xs opacity-70">
                  {[job.stage, job.status, job.customer_name].filter(Boolean).join(' · ') || '—'}
                </p>
              </div>
              <Link className="underline" to={`/portal/cc-jobs/${job.id}`}>
                Open
              </Link>
            </li>
          ))}
        </ul>
      </PortalPanel>
    </div>
  );
}
