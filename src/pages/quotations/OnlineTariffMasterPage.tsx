import TariffListPage from '@/features/tariffs/pages/TariffListPage';
import TariffCreatePage from '@/features/tariffs/pages/TariffCreatePage';
import TariffDetailPage from '@/features/tariffs/pages/TariffDetailPage';
import TariffEditPage from '@/features/tariffs/pages/TariffEditPage';

/** Quotations → Online Tariff Master — dedicated feature module. */
export function OnlineTariffListPage() {
  return <TariffListPage />;
}

export function OnlineTariffCreatePage() {
  return <TariffCreatePage />;
}

export function OnlineTariffDetailPage() {
  return <TariffDetailPage />;
}

export function OnlineTariffEditPage() {
  return <TariffEditPage />;
}

/** @deprecated Prefer named pages; kept for older imports. */
export default function OnlineTariffMasterPage() {
  return <OnlineTariffListPage />;
}
