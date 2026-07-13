import MasterResourceListPage from '@/features/masters/pages/MasterResourceListPage';
import MasterResourceFormPage from '@/features/masters/pages/MasterResourceFormPage';
import MasterResourceDetailPage from '@/features/masters/pages/MasterResourceDetailPage';
import type { MasterPageRouteProps } from '@/features/masters/hooks/useMasterPageRoute';

const zipRoute: MasterPageRouteProps = {
  resourceKey: 'zip-distances',
  routePrefix: '/quotations/zip-distance-master',
  backHref: '/quotations',
  backLabel: 'Quotations',
};

/** Quotations → Zip Distance Master (same API as Masters → zip-distances). */
export function ZipDistanceListPage() {
  return <MasterResourceListPage {...zipRoute} />;
}

export function ZipDistanceCreatePage() {
  return <MasterResourceFormPage {...zipRoute} />;
}

export function ZipDistanceDetailPage() {
  return <MasterResourceDetailPage {...zipRoute} />;
}

export function ZipDistanceEditPage() {
  return <MasterResourceFormPage {...zipRoute} />;
}

/** @deprecated Prefer named pages; kept for older imports. */
export default function ZipDistanceMasterPage() {
  return <ZipDistanceListPage />;
}
