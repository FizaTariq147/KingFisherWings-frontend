import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { INVOICE_ROUTE_PREFIX } from '../api/invoice.api';
import { InvoiceForm } from '../components/InvoiceForm';
import { useCreateInvoiceFromJob } from '../hooks/useInvoiceActions';
import { useCreateInvoice } from '../hooks/useInvoices';
import type { CreateInvoiceFormValues } from '../types/invoice.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function InvoiceCreatePage() {
  const navigate = useNavigate();
  const create = useCreateInvoice();
  const createFromJob = useCreateInvoiceFromJob();
  const [error, setError] = useState<string | null>(null);
  const busy = create.isPending || createFromJob.isPending;

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(INVOICE_ROUTE_PREFIX)}
      >
        ← Back to invoices
      </button>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Create Invoice</h2>
      </div>

      {error && (
        <div
          role="alert"
          className="mx-auto max-w-5xl rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {error}
        </div>
      )}

      <InvoiceForm
        mode="create"
        layout="wizard"
        isSubmitting={busy}
        onCancel={() => navigate(INVOICE_ROUTE_PREFIX)}
        onCreateFromJob={async (jobId) => {
          setError(null);
          try {
            const inv = await createFromJob.mutateAsync(jobId);
            navigate(`${INVOICE_ROUTE_PREFIX}/${inv.id}`);
          } catch (err) {
            setError(getErrorMessage(err));
            throw err;
          }
        }}
        onSubmit={async (values) => {
          setError(null);
          try {
            const created = await create.mutateAsync(values as CreateInvoiceFormValues);
            navigate(`${INVOICE_ROUTE_PREFIX}/${created.id}`);
          } catch (err) {
            setError(getErrorMessage(err));
            throw err;
          }
        }}
      />
    </div>
  );
}
