import FeatureZipDistanceListPage from '@/features/zipDistances/pages/ZipDistanceListPage';
import FeatureZipDistanceCreatePage from '@/features/zipDistances/pages/ZipDistanceCreatePage';
import FeatureZipDistanceDetailPage from '@/features/zipDistances/pages/ZipDistanceDetailPage';
import FeatureZipDistanceEditPage from '@/features/zipDistances/pages/ZipDistanceEditPage';

/** Quotations → Zip Distance Master — dedicated feature module. */
export function ZipDistanceListPage() {
  return <FeatureZipDistanceListPage />;
}

export function ZipDistanceCreatePage() {
  return <FeatureZipDistanceCreatePage />;
}

export function ZipDistanceDetailPage() {
  return <FeatureZipDistanceDetailPage />;
}

export function ZipDistanceEditPage() {
  return <FeatureZipDistanceEditPage />;
}

/** @deprecated Prefer named pages; kept for older imports. */
export default function ZipDistanceMasterPage() {
  return <ZipDistanceListPage />;
}
