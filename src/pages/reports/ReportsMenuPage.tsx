import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
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
    <div className="space-y-4">
      <div className="px-4 pt-4 sm:px-6">
        <Link
          to="/reports/dashboard"
          className="flex items-center gap-3 rounded-sm border border-[var(--color-primary-200,#BFDBFE)] bg-[var(--color-primary-50,#EFF6FF)] px-3 py-2 text-[13px] text-[var(--color-primary-900,#1E3A5F)] hover:bg-[var(--color-primary-100)] transition-colors"
        >
          <BarChart3 className="size-4 shrink-0" aria-hidden />
          <span>
            <strong>Reporting Dashboard</strong>
            {' — '}
            browse categories, search, and generate reports (same catalogue styling).
          </span>
        </Link>
      </div>
      <ModuleMenuShell
        title="Reports"
        tiles={tiles}
        className="bg-white"
        compact
        linkSearch="from=reports"
        sectionHeadingClassName="text-[10px] font-medium text-black tracking-wide"
        viewStorageKey="reports"
      />
    </div>
  );
}
