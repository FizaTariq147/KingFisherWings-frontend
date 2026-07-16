import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountsCreatePageLayout } from '@/features/accounts/components';
import { VOUCHER_ROUTE_PREFIX } from '../api/voucher.api';
import { VoucherForm } from '../components/VoucherForm';
import { useCreateVoucher } from '../hooks/useVouchers';
import type { CreateVoucherFormValues } from '../types/voucher.types';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function VoucherCreatePage() {
  const navigate = useNavigate();
  const create = useCreateVoucher();
  const [error, setError] = useState<string | null>(null);

  return (
    <AccountsCreatePageLayout
      backLabel="Back to vouchers"
      backTo={VOUCHER_ROUTE_PREFIX}
      title="Create voucher"
      subtitle="Draft a journal entry. Posting needs an active voucher number series."
      error={error}
    >
      <VoucherForm
        mode="create"
        isSubmitting={create.isPending}
        onCancel={() => navigate(VOUCHER_ROUTE_PREFIX)}
        onSubmit={async (values) => {
          setError(null);
          try {
            const created = await create.mutateAsync(values as CreateVoucherFormValues);
            navigate(`${VOUCHER_ROUTE_PREFIX}/${created.id}`);
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      />
    </AccountsCreatePageLayout>
  );
}
