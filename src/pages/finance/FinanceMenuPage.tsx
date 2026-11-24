import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { financeMenu } from '../../features/invoices/config/financeMenu';
import { resolveInvoiceListVisibility } from '../../features/invoices/utils/invoiceListVisibility';
import { ModuleMenuShell } from '../../components/widgets/ModuleMenuShell';

export default function FinanceMenuPage() {
  const { user } = useAuth();
  const vis = resolveInvoiceListVisibility(user);

  const tiles = useMemo(
    () =>
      financeMenu.filter((tile) => {
        if (tile.id === 'all-invoices' || tile.id === 'overdue-invoices') {
          return vis.canSeeSaleInvoices;
        }
        if (tile.id === 'all-debit-notes') return vis.canSeeDebitNotes;
        if (tile.id === 'all-purchase-invoices') return vis.canSeePurchaseInvoices;
        if (tile.id === 'all-credit-notes') return vis.canSeeCreditNotes;
        return true;
      }),
    [vis.canSeeSaleInvoices, vis.canSeePurchaseInvoices, vis.canSeeDebitNotes, vis.canSeeCreditNotes],
  );

  return <ModuleMenuShell title="Finance" tiles={tiles} />;
}
