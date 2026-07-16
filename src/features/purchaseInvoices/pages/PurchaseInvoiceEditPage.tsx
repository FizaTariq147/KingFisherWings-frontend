import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PURCHASE_INVOICE_ROUTE_PREFIX } from '../api/purchaseInvoice.api';
import { PurchaseInvoiceForm } from '../components/PurchaseInvoiceForm';
import {
  usePurchaseInvoice,
  useUpdatePurchaseInvoice,
} from '../hooks/usePurchaseInvoices';
import type { UpdatePurchaseInvoiceFormValues } from '../types/purchaseInvoice.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { purchaseInvoiceToFormValues } from '../utils/purchaseInvoiceToFormValues';

export default function PurchaseInvoiceEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: invoice, isLoading, isError, error } = usePurchaseInvoice(id);
  const update = useUpdatePurchaseInvoice(id);
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }

  if (isError || !invoice) {
    return (
      <p className="text-sm text-[var(--color-danger-600)]">
        {getErrorMessage(error) || 'Purchase invoice not found.'}
      </p>
    );
  }

  if (invoice.status !== 'DRAFT') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-neutral-600)]">
          Only DRAFT purchase invoices can be edited. Current status: {invoice.status}.
        </p>
        <button
          type="button"
          className="text-sm text-[var(--color-primary-600)]"
          onClick={() => navigate(`${PURCHASE_INVOICE_ROUTE_PREFIX}/${id}`)}
        >
          ← Back to detail
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(`${PURCHASE_INVOICE_ROUTE_PREFIX}/${id}`)}
      >
        ← Back to detail
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
          Edit purchase invoice
        </h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Update header fields (UpdateInvoiceDto).
        </p>
      </div>
      {formError && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {formError}
        </div>
      )}
      <PurchaseInvoiceForm
        mode="edit"
        defaultValues={purchaseInvoiceToFormValues(invoice)}
        isSubmitting={update.isPending}
        onCancel={() => navigate(`${PURCHASE_INVOICE_ROUTE_PREFIX}/${id}`)}
        onSubmit={async (values) => {
          setFormError(null);
          try {
            await update.mutateAsync(values as UpdatePurchaseInvoiceFormValues);
            navigate(`${PURCHASE_INVOICE_ROUTE_PREFIX}/${id}`);
          } catch (err) {
            setFormError(getErrorMessage(err));
            throw err;
          }
        }}
      />
    </div>
  );
}
