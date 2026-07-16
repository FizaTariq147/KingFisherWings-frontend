import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AccountsCreatePageLayout } from '@/features/accounts/components';
import { useAuth } from '@/hooks/useAuth';
import { isTenantUserManagerRole, resolveAuthRoleSlug } from '@/features/users/constants/userPermissions';
import { GL_PAYMENT_ROUTE_PREFIX } from '../api/glPayment.api';
import { GlPaymentForm } from '../components/GlPaymentForm';
import type { PaymentDirection } from '../constants/glPayment.constants';
import { useCreateGlPayment } from '../hooks/useGlPayments';
import type { CreateGlPaymentFormValues } from '../types/glPayment.types';
import {
  canManageGlPayments,
  formatGlPaymentPermissionError,
  GL_MANAGE_PAYMENTS_DENIED_MESSAGE,
} from '../utils/paymentPermissions';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function GlPaymentCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const create = useCreateGlPayment();
  const [error, setError] = useState<string | null>(null);

  const directionParam = searchParams.get('direction')?.toUpperCase();
  const initialDirection: PaymentDirection =
    directionParam === 'PAYMENT' ? 'PAYMENT' : 'RECEIPT';

  const isTenantAdmin = isTenantUserManagerRole(resolveAuthRoleSlug(user?.role));
  const permissionBlocked = !canManageGlPayments({
    permissions: user?.permissions,
    role: user?.role,
  });

  const isVendorPayment = initialDirection === 'PAYMENT';

  return (
    <AccountsCreatePageLayout
      backLabel="Back to payments"
      backTo={GL_PAYMENT_ROUTE_PREFIX}
      title={isVendorPayment ? 'New vendor payment' : 'New customer receipt'}
      subtitle={
        isVendorPayment
          ? 'Draft an accounts payable payment to a vendor or carrier.'
          : 'Draft an accounts receivable receipt from a customer.'
      }
      banner={permissionBlocked ? GL_MANAGE_PAYMENTS_DENIED_MESSAGE : undefined}
      error={error}
    >
      <GlPaymentForm
        key={initialDirection}
        mode="create"
        defaultValues={{ direction: initialDirection }}
        isSubmitting={create.isPending || permissionBlocked}
        onCancel={() => navigate(GL_PAYMENT_ROUTE_PREFIX)}
        onSubmit={async (values) => {
          setError(null);
          if (permissionBlocked) {
            setError(GL_MANAGE_PAYMENTS_DENIED_MESSAGE);
            return;
          }
          try {
            const created = await create.mutateAsync(values as CreateGlPaymentFormValues);
            navigate(`${GL_PAYMENT_ROUTE_PREFIX}/${created.id}`);
          } catch (err) {
            setError(
              formatGlPaymentPermissionError(getErrorMessage(err), { isTenantAdmin }),
            );
          }
        }}
      />
    </AccountsCreatePageLayout>
  );
}
