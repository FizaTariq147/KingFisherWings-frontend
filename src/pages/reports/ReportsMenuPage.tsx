import { ModuleMenuShell } from '@/components/widgets/ModuleMenuShell';
import { reportsMenu } from '@/features/reports/config/reportsMenu';

/** Global Reports hub — catalogue + module/finance report entry points only. */
export default function ReportsMenuPage() {
  return (
    <ModuleMenuShell
      title="Reports"
      tiles={reportsMenu}
      className="bg-white"
      compact
      linkSearch="from=reports"
      sectionHeadingClassName="text-[10px] font-medium text-black tracking-wide"
      viewStorageKey="reports"
    />
  );
}
