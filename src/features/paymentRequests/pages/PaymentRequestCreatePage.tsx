import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isUuid } from '@/lib/isUuid';
import { PAYMENT_REQUEST_ROUTE_PREFIX } from '../api/paymentRequest.api';
import { PaymentRequestForm } from '../components/PaymentRequestForm';
import { useCreatePaymentRequest } from '../hooks/usePaymentRequests';
import type { CreatePaymentRequestFormValues } from '../types/paymentRequest.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function PaymentRequestCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const create = useCreatePaymentRequest();
  const [error, setError] = useState<string | null>(null);

  const invoicePrefill = searchParams.get('invoice')?.trim() ?? '';
  const jobPrefill = searchParams.get('job')?.trim() ?? '';
  const defaultValues =
    (invoicePrefill && isUuid(invoicePrefill)) || (jobPrefill && isUuid(jobPrefill))
      ? {
          ...(invoicePrefill && isUuid(invoicePrefill) ? { invoice_id: invoicePrefill } : {}),
          ...(jobPrefill && isUuid(jobPrefill) ? { job_id: jobPrefill } : {}),
        }
      : undefined;

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(PAYMENT_REQUEST_ROUTE_PREFIX)}
      >
        ← Back to payment requests
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
          New payment request
        </h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Required: party, amount (≥ 0.01), and currency. Backend also needs an active{' '}
          <strong>VOUCHER</strong> number format under Organization → Number Formats.
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

      <PaymentRequestForm
        mode="create"
        defaultValues={defaultValues}
        isSubmitting={create.isPending}
        onCancel={() => navigate(PAYMENT_REQUEST_ROUTE_PREFIX)}
        onSubmit={async (values) => {
          setError(null);
          try {
            const created = await create.mutateAsync(values as CreatePaymentRequestFormValues);
            navigate(`${PAYMENT_REQUEST_ROUTE_PREFIX}/${created.id}`);
          } catch (err) {
            setError(getErrorMessage(err));
            throw err;
          }
        }}
      />
    </div>
  );
}
