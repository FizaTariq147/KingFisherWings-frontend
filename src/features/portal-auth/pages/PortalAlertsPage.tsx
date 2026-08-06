import { Bell } from 'lucide-react';
import { PortalEmptyState, PortalPageHeader, PortalPanel } from '../components/portal-ui';

export default function PortalAlertsPage() {
  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Alerts"
        description="Shipment and document notifications will appear here."
      />
      <PortalPanel>
        <PortalEmptyState
          title="No alerts yet"
          description="Coming soon — portal notifications will be wired when the backend is available."
          Icon={Bell}
        />
      </PortalPanel>
    </div>
  );
}
