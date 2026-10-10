import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FormPageHeader } from '@/components/ui/FormPageHeader';
import { useReturnNavigation } from '@/lib/navigation/returnNavigation';
import { INVOICE_ROUTE_PREFIX } from '../api/invoice.api';
import { InvoiceForm } from '../components/InvoiceForm';
import { useInvoice, useUpdateInvoice } from '../hooks/useInvoices';
import type { UpdateInvoiceFormValues } from '../types/invoice.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { invoiceToFormValues } from '../utils/invoiceToFormValues';

export default function InvoiceEditPage() {
  const { id = '' } = useParams();
  const detailPath = `${INVOICE_ROUTE_PREFIX}/${id}`;
  const { goBack } = useReturnNavigation(detailPath);
  const { data: invoice, isLoading, isError, error } = useInvoice(id);
  const update = useUpdateInvoice(id);
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }

  if (isError || !invoice) {
    return (
      <p className="text-sm text-[var(--color-danger-600)]">
        {getErrorMessage(error) || 'Invoice not found.'}
      </p>
    );
  }

  if (invoice.status !== 'DRAFT') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-neutral-600)]">
          Only DRAFT invoices can be edited. Current status: {invoice.status}.
        </p>
        <button
          type="button"
          className="text-sm text-[var(--color-primary-600)]"
          onClick={() => goBack()}
        >
          ← Back to detail
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormPageHeader
        title="Edit invoice"
        subtitle="Update header fields. Lines are managed on the detail page."
        onBack={goBack}
      />
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
      <InvoiceForm
        mode="edit"
        defaultValues={invoiceToFormValues(invoice)}
        isSubmitting={update.isPending}
        onCancel={goBack}
        onSubmit={async (values) => {
          setFormError(null);
          try {
            await update.mutateAsync(values as UpdateInvoiceFormValues);
            goBack();
          } catch (err) {
            setFormError(getErrorMessage(err));
            throw err;
          }
        }}
      />
    </div>
  );
}
