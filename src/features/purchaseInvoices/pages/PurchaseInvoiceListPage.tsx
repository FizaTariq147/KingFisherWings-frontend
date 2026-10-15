import { useEffect, useMemo, useState } from 'react';
import { appType, listShell } from '@/lib/erpTypography';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/erp';
import { PURCHASE_INVOICE_ROUTE_PREFIX } from '../api/purchaseInvoice.api';
import {
  PurchaseInvoiceFilters,
  purchaseInvoiceFilterDraftToListParams,
  usePurchaseInvoiceFilterDraft,
} from '../components/PurchaseInvoiceFilters';
import { PurchaseInvoiceTable } from '../components/PurchaseInvoiceTable';
import { DEFAULT_PURCHASE_INVOICE_PAGE_SIZE } from '../constants/purchaseInvoice.constants';
import { usePurchaseInvoices } from '../hooks/usePurchaseInvoices';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function PurchaseInvoiceListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { draft, setDraft, applied, submit } = usePurchaseInvoiceFilterDraft(
    DEFAULT_PURCHASE_INVOICE_PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [applied]);

  const listParams = useMemo(
    () => purchaseInvoiceFilterDraftToListParams(applied, page),
    [applied, page],
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    usePurchaseInvoices(listParams);
  const purchaseInvoices = data?.purchaseInvoices ?? [];
  const meta = data?.meta;

  return (
    <div className={listShell.page}>
      <div className={listShell.card}>
        <div className={listShell.header}>
          <div className="min-w-0">
            <button
              type="button"
              className={appType.backLink}
              onClick={() => navigate('/finance')}
            >
              ← Finance
            </button>
            <h2 className={`${appType.pageTitle} mt-0.5`}>All Purchase Invoices</h2>
            <p className={appType.pageSubtitle}>
              Search and filter vendor purchase invoices.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="create"
              size="sm"
              leftIcon={<Plus />}
              onClick={() => navigate(`${PURCHASE_INVOICE_ROUTE_PREFIX}/new`)}
            >
              Create
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className={isFetching ? 'animate-spin' : undefined} />}
              onClick={() => refetch()}
              disabled={isFetching}
            >
              Refresh
            </Button>
          </div>
        </div>

        <PurchaseInvoiceFilters
          draft={draft}
          onDraftChange={setDraft}
          onSubmit={() => {
            setPage(1);
            submit();
          }}
          isSubmitting={isFetching}
        />

        {isError ? (
          <div className="px-3 py-3">
            <ErrorState
              message={getErrorMessage(error) || 'Failed to load purchase invoices.'}
              onRetry={() => refetch()}
            />
          </div>
        ) : isLoading ? (
          <div className="space-y-1.5 px-3 py-4" aria-busy>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-sm bg-[#eef2f6]" />
            ))}
          </div>
        ) : purchaseInvoices.length === 0 ? (
          <EmptyState
            title="No purchase invoices found."
            description="Adjust filters and click Submit, or create a new purchase invoice."
          />
        ) : (
          <PurchaseInvoiceTable
            purchaseInvoices={purchaseInvoices}
            isFetching={isFetching}
            meta={meta}
            onPage={setPage}
            onView={(inv) => navigate(`${PURCHASE_INVOICE_ROUTE_PREFIX}/${inv.id}`)}
          />
        )}
      </div>
    </div>
  );
}
