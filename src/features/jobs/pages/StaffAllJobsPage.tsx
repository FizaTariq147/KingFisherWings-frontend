import HubAllJobsPage from './HubAllJobsPage';

/**
 * Staff-facing “all my visible jobs” list.
 * Must match GET /jobs/dashboard-counts `job_count` (Total jobs).
 * Same ACL as list: resolveVisibleJobTypes (job types). Never org department_id.
 */
export default function StaffAllJobsPage() {
  return (
    <HubAllJobsPage
      variant="management"
      backTo="/dashboard"
      title="My department jobs"
      subtitle="Same jobs as Total jobs — every job in your visible job-type departments."
    />
  );
}
