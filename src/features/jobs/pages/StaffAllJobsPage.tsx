import HubAllJobsPage from './HubAllJobsPage';

/**
 * Staff-facing “all my visible jobs” list (matches dashboard Total jobs count).
 * Not the admin Management All Jobs-MIS route — scoped by BE / FE visible job types.
 */
export default function StaffAllJobsPage() {
  return (
    <HubAllJobsPage
      variant="management"
      backTo="/dashboard"
      title="My department jobs"
    />
  );
}
