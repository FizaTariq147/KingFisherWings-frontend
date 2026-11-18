import { useAuth } from '@/hooks/useAuth';
import { isTransportHandoffOnly } from '../utils/isTransportHandoffOnly';
import HubAllJobsPage from './HubAllJobsPage';

/**
 * Staff “all visible jobs” — job_type grants OR org-dept handoff match OR
 * ops_user_id=me (BE). Never send org department_id; server uses actor
 * User.department_id automatically for the handoff queue.
 *
 * Transport handoff-only (`jobs.transport.handoff`): assignee queue only
 * (Job.ops_user_id = me) — no ops job-type grants.
 */
export default function StaffAllJobsPage() {
  const { user } = useAuth();
  const handoffOnly = isTransportHandoffOnly(user);
  return (
    <HubAllJobsPage
      variant="management"
      backTo="/dashboard"
      title={handoffOnly ? 'Assigned jobs' : 'My department jobs'}
      subtitle={
        handoffOnly
          ? 'Jobs assigned to you after Pass-to-Transport (ops_user_id = you). Open a job for the handoff tab — containers, trucker, port token, documents, and custom status.'
          : 'Jobs for your granted types, plus org-dept handoffs and jobs assigned to you — same total as Total jobs.'
      }
    />
  );
}
