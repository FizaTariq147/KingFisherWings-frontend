import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PURCHASE_INVOICE_ROUTE_PREFIX } from '../api/purchaseInvoice.api';
import { PurchaseInvoiceForm } from '../components/PurchaseInvoiceForm';
import { useCreatePurchaseInvoice } from '../hooks/usePurchaseInvoices';
import type { CreatePurchaseInvoiceFormValues } from '../types/purchaseInvoice.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function PurchaseInvoiceCreatePage() {
  const navigate = useNavigate();
  const create = useCreatePurchaseInvoice();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(PURCHASE_INVOICE_ROUTE_PREFIX)}
      >
        ← Back to purchase invoices
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
          New purchase invoice
        </h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Creates a DRAFT purchase invoice. Required: vendor/supplier party and currency.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {error}
        </div>
      )}

      <PurchaseInvoiceForm
        mode="create"
        isSubmitting={create.isPending}
        onCancel={() => navigate(PURCHASE_INVOICE_ROUTE_PREFIX)}
        onSubmit={async (values) => {
          setError(null);
          try {
            const created = await create.mutateAsync(values as CreatePurchaseInvoiceFormValues);
            navigate(`${PURCHASE_INVOICE_ROUTE_PREFIX}/${created.id}`);
          } catch (err) {
            setError(getErrorMessage(err));
            throw err;
          }
        }}
      />
    </div>
  );
}
