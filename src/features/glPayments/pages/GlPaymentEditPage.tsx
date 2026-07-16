import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isTenantUserManagerRole, resolveAuthRoleSlug } from '@/features/users/constants/userPermissions';
import { GL_PAYMENT_ROUTE_PREFIX } from '../api/glPayment.api';
import { GlPaymentForm } from '../components/GlPaymentForm';
import { useGlPayment, useUpdateGlPayment } from '../hooks/useGlPayments';
import type { UpdateGlPaymentFormValues } from '../types/glPayment.types';
import { glPaymentToFormValues } from '../utils/glPaymentToFormValues';
import {
  canManageGlPayments,
  formatGlPaymentPermissionError,
  GL_MANAGE_PAYMENTS_DENIED_MESSAGE,
} from '../utils/paymentPermissions';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function GlPaymentEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: payment, isLoading, isError, error } = useGlPayment(id);
  const update = useUpdateGlPayment(id);
  const [formError, setFormError] = useState<string | null>(null);

  const isTenantAdmin = isTenantUserManagerRole(resolveAuthRoleSlug(user?.role));
  const permissionBlocked = !canManageGlPayments({
    permissions: user?.permissions,
    role: user?.role,
  });

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !payment) {
    return (
      <p className="text-sm text-[var(--color-danger-600)]">
        {getErrorMessage(error) || 'Payment not found.'}
      </p>
    );
  }

  if (payment.status !== 'DRAFT') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          Only draft payments can be edited.
        </p>
        <button
          type="button"
          className="text-sm underline"
          onClick={() => navigate(`${GL_PAYMENT_ROUTE_PREFIX}/${id}`)}
        >
          Back to payment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(`${GL_PAYMENT_ROUTE_PREFIX}/${id}`)}
      >
        ← Back to payment
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Edit payment</h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          Manage allocations on the detail page.
        </p>
      </div>
      {permissionBlocked && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-warning-100, #FFFBEB)',
            borderColor: '#FDE68A',
            color: 'var(--color-warning-800, #92400E)',
          }}
        >
          {GL_MANAGE_PAYMENTS_DENIED_MESSAGE}
        </div>
      )}
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
      <GlPaymentForm
        mode="edit"
        defaultValues={glPaymentToFormValues(payment)}
        isSubmitting={update.isPending || permissionBlocked}
        onCancel={() => navigate(`${GL_PAYMENT_ROUTE_PREFIX}/${id}`)}
        onSubmit={async (values) => {
          setFormError(null);
          if (permissionBlocked) {
            setFormError(GL_MANAGE_PAYMENTS_DENIED_MESSAGE);
            return;
          }
          try {
            await update.mutateAsync(values as UpdateGlPaymentFormValues);
            navigate(`${GL_PAYMENT_ROUTE_PREFIX}/${id}`);
          } catch (err) {
            setFormError(
              formatGlPaymentPermissionError(getErrorMessage(err), { isTenantAdmin }),
            );
          }
        }}
      />
    </div>
  );
}
