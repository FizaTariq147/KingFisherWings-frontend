import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { VOUCHER_ROUTE_PREFIX } from '../api/voucher.api';
import { VoucherForm } from '../components/VoucherForm';
import { useUpdateVoucher, useVoucher } from '../hooks/useVouchers';
import type { UpdateVoucherFormValues } from '../types/voucher.types';
import { voucherToFormValues } from '../utils/voucherToFormValues';
import { getErrorMessage } from '../utils/getErrorMessage';

export default function VoucherEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
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
          className="text-sm underline"
          onClick={() => navigate(`${VOUCHER_ROUTE_PREFIX}/${id}`)}
        >
          Back to voucher
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(`${VOUCHER_ROUTE_PREFIX}/${id}`)}
      >
        ← Back to voucher
      </button>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
          Edit voucher header
        </h2>
        <p className="text-sm text-[var(--color-neutral-400)] mt-0.5">
          {voucher.voucher_number || id.slice(0, 8)} — manage lines on the detail page.
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
      <VoucherForm
        mode="edit"
        defaultValues={voucherToFormValues(voucher)}
        isSubmitting={update.isPending}
        onCancel={() => navigate(`${VOUCHER_ROUTE_PREFIX}/${id}`)}
        onSubmit={async (values) => {
          setFormError(null);
          try {
            await update.mutateAsync(values as UpdateVoucherFormValues);
            navigate(`${VOUCHER_ROUTE_PREFIX}/${id}`);
          } catch (err) {
            setFormError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
