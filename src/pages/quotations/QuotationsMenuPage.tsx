import { quotationsMenu, reportsQuotationTile } from '../../features/quotations/config/quotationsMenu';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';

export default function QuotationsMenuPage() {
  return (
    <ModuleMenuShell
      title="Quotations"
      tiles={quotationsMenu}
      featuredTile={reportsQuotationTile}
    />
  );
}
