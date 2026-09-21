import { portalApiClient } from '@/lib/portalApiClient';
import { UnitConverterPanel } from '@/features/tools/components/UnitConverterPanel';

export default function PortalToolsPage() {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Tools</h2>
      <UnitConverterPanel client={portalApiClient} basePath="/portal/tools" />
    </div>
  );
}
