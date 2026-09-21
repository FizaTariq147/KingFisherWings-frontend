import { PageBackLink } from '@/components/ui/PageBackLink';
import { axiosInstance } from '@/lib/axios';
import { UnitConverterPanel } from '../components/UnitConverterPanel';

export default function StaffToolsPage() {
  return (
    <div className="space-y-4">
      <PageBackLink to="/settings" />
      <div>
        <h2 className="text-lg font-semibold">Tools</h2>
        <p className="text-sm text-[var(--color-neutral-500)]">
          Length, weight, liquid, CBM, and volume converters.
        </p>
      </div>
      <UnitConverterPanel client={axiosInstance} basePath="/tools" />
    </div>
  );
}
