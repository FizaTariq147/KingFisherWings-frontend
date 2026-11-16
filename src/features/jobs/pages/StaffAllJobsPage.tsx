import HubAllJobsPage from './HubAllJobsPage';

/**
 * Staff “all visible jobs” — job_type grants OR org-dept handoff match OR
 * ops_user_id=me (BE). Never send org department_id; server uses actor
 * User.department_id automatically for the handoff queue.
 */
export default function StaffAllJobsPage() {
  return (
    <HubAllJobsPage
      variant="management"
      backTo="/dashboard"
      title="My department jobs"
      subtitle="Jobs for your granted types, plus org-dept handoffs and jobs assigned to you — same total as Total jobs."
    />
  );
}
