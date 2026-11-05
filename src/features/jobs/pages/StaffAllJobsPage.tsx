import HubAllJobsPage from './HubAllJobsPage';

/**
 * Staff “all visible jobs” — every job (admin- or staff-created) whose job_type
 * the user can see. Matches Total jobs / job_count. Never org department_id.
 */
export default function StaffAllJobsPage() {
  return (
    <HubAllJobsPage
      variant="management"
      backTo="/dashboard"
      title="My department jobs"
      subtitle="All jobs for your granted job types (any creator) — same total as Total jobs."
    />
  );
}
