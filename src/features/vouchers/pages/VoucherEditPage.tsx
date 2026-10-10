import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FormPageHeader } from '@/components/ui/FormPageHeader';
import { useReturnNavigation } from '@/lib/navigation/returnNavigation';
import { VOUCHER_ROUTE_PREFIX } from '../api/voucher.api';
import { VoucherForm } from '../components/VoucherForm';
import { useUpdateVoucher, useVoucher } from '../hooks/useVouchers';
import type { UpdateVoucherFormValues } from '../types/voucher.types';
import { voucherToFormValues } from '../utils/voucherToFormValues';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function VoucherEditPage() {
  const { id = '' } = useParams();
  const { goBack } = useReturnNavigation(`${VOUCHER_ROUTE_PREFIX}/${id}`);
  const { data: voucher, isLoading, isError, error } = useVoucher(id);
  const update = useUpdateVoucher(id);
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !voucher) {
    return (
      <p className="text-sm text-[var(--color-danger-600)]">
        {getErrorMessage(error) || 'Voucher not found.'}
      </p>
    );
  }

  if (voucher.status !== 'DRAFT') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          Only draft vouchers can be edited.
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
        title="Edit voucher header"
        subtitle={`${voucher.voucher_number || id.slice(0, 8)} — manage lines on the detail page.`}
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
      <VoucherForm
        mode="edit"
        defaultValues={voucherToFormValues(voucher as never)}
        isSubmitting={update.isPending}
        onCancel={goBack}
        onSubmit={async (values) => {
          setFormError(null);
          try {
            await update.mutateAsync(values as UpdateVoucherFormValues);
            goBack();
          } catch (err) {
            setFormError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
