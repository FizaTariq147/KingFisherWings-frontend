import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAppForm } from '@/lib/validation';
import { rejectPaymentRequestSchema } from '../../schemas/paymentRequest.schema';
import type { RejectPaymentRequestFormValues } from '../../types/paymentRequest.types';

interface PaymentRequestRejectModalProps {
  open: boolean;
  isPending?: boolean;
  onClose: () => void;
  onReject: (dto: RejectPaymentRequestFormValues) => void | Promise<void>;
}

export function PaymentRequestRejectModal({
  open,
  isPending,
  onClose,
  onReject,
}: PaymentRequestRejectModalProps) {
  const {
    register,
    handleValidatedSubmit,
    reset,
    formState: { errors },
  } = useAppForm<RejectPaymentRequestFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(rejectPaymentRequestSchema) as Resolver<RejectPaymentRequestFormValues>,
    defaultValues: { rejected_reason: '' },
  });

  return (
    <Modal
      open={open}
      onClose={() => {
        reset({ rejected_reason: '' });
        onClose();
      }}
      title="Reject payment request"
    >
      <form
        className="space-y-4"
        noValidate
        onSubmit={handleValidatedSubmit(async (values) => {
          await onReject(values);
          reset({ rejected_reason: '' });
        })}
      >
        <div>
          <Input
            label="Rejection reason *"
            {...register('rejected_reason')}
            maxLength={500}
          />
          {errors.rejected_reason?.message && (
            <p className="text-xs text-[var(--color-danger-500)] mt-1">
              {errors.rejected_reason.message}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" disabled={isPending}>
            {isPending ? 'Rejecting…' : 'Reject'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
