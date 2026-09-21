import { vendorApiClient } from '@/lib/vendorApiClient';
import { UnitConverterPanel } from '@/features/tools/components/UnitConverterPanel';

export default function VendorToolsPage() {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Tools</h2>
      <UnitConverterPanel client={vendorApiClient} basePath="/vendor/tools" />
    </div>
  );
}
