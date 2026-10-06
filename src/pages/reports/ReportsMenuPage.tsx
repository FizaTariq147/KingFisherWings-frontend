import { useMemo } from 'react';
import { ModuleMenuShell } from '@/components/widgets/ModuleMenuShell';
import { reportsMenu } from '@/features/reports/config/reportsMenu';
import { reportsTileModuleKey } from '@/features/reports/utils/reportModuleAccess';
import { useAuth } from '@/hooks/useAuth';

/** Global Reports hub — catalogue + module/finance report entry points only. */
export default function ReportsMenuPage() {
  const { hasEnabledModule } = useAuth();

  const tiles = useMemo(
    () =>
      reportsMenu.filter((tile) => {
        const moduleKey = reportsTileModuleKey(tile);
        // null = catalogue / unscoped — always show when user can open Reports.
        return !moduleKey || hasEnabledModule(moduleKey);
      }),
    [hasEnabledModule],
  );

  return (
    <ModuleMenuShell
      title="Reports"
      tiles={tiles}
      className="bg-white"
      compact
      linkSearch="from=reports"
      sectionHeadingClassName="text-[10px] font-medium text-black tracking-wide"
      viewStorageKey="reports"
    />
  );
}
