import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PAYMENT_REQUEST_ROUTE_PREFIX } from '../api/paymentRequest.api';
import { PaymentRequestForm } from '../components/PaymentRequestForm';
import {
  usePaymentRequest,
  useUpdatePaymentRequest,
} from '../hooks/usePaymentRequests';
import type { UpdatePaymentRequestFormValues } from '../types/paymentRequest.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { paymentRequestToFormValues } from '../utils/paymentRequestToFormValues';

export default function PaymentRequestEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: pr, isLoading, isError, error, refetch } = usePaymentRequest(id);
  const update = useUpdatePaymentRequest(id);
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !pr) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Payment request not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  if (pr.status !== 'PENDING') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-neutral-600)]">
          Only PENDING payment requests can be edited.
        </p>
        <button
          type="button"
          className="text-sm underline"
          onClick={() => navigate(`${PAYMENT_REQUEST_ROUTE_PREFIX}/${id}`)}
        >
          Back to detail
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(`${PAYMENT_REQUEST_ROUTE_PREFIX}/${id}`)}
      >
        ← Back
      </button>
      <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
        Edit payment request
      </h2>

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

      <PaymentRequestForm
        mode="edit"
        defaultValues={paymentRequestToFormValues(pr)}
        isSubmitting={update.isPending}
        onCancel={() => navigate(`${PAYMENT_REQUEST_ROUTE_PREFIX}/${id}`)}
        onSubmit={async (values) => {
          setFormError(null);
          try {
            await update.mutateAsync(values as UpdatePaymentRequestFormValues);
            navigate(`${PAYMENT_REQUEST_ROUTE_PREFIX}/${id}`);
          } catch (err) {
            setFormError(getErrorMessage(err));
            throw err;
          }
        }}
      />
    </div>
  );
}
