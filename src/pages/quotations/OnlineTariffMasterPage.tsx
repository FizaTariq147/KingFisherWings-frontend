import MasterResourceListPage from '@/features/masters/pages/MasterResourceListPage';
import MasterResourceFormPage from '@/features/masters/pages/MasterResourceFormPage';
import MasterResourceDetailPage from '@/features/masters/pages/MasterResourceDetailPage';
import type { MasterPageRouteProps } from '@/features/masters/hooks/useMasterPageRoute';

const tariffRoute: MasterPageRouteProps = {
  resourceKey: 'tariffs',
  routePrefix: '/quotations/tariff-master',
  backHref: '/quotations',
  backLabel: 'Quotations',
};

/** Quotations → Online Tariff Master (same API as Masters → tariffs). */
export function OnlineTariffListPage() {
  return <MasterResourceListPage {...tariffRoute} />;
}

export function OnlineTariffCreatePage() {
  return <MasterResourceFormPage {...tariffRoute} />;
}

export function OnlineTariffDetailPage() {
  return <MasterResourceDetailPage {...tariffRoute} />;
}

export function OnlineTariffEditPage() {
  return <MasterResourceFormPage {...tariffRoute} />;
}

/** @deprecated Prefer named pages; kept for older imports. */
export default function OnlineTariffMasterPage() {
  return <OnlineTariffListPage />;
}
