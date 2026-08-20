import { useMemo, useState } from 'react';
import { type DashboardPeriod, periodRange } from '../utils/dashboardFormat';

export function useDashboardPeriod() {
  const [period, setPeriod] = useState<DashboardPeriod>('month');
  const range = useMemo(() => periodRange(period), [period]);
  return { period, setPeriod, range };
}
