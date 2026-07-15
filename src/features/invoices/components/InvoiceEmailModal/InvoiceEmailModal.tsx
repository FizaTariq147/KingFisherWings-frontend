import { useEffect } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAppForm } from '@/lib/validation';
import { sendInvoiceEmailSchema } from '../../schemas/invoice.schema';
import type { SendInvoiceEmailDto, SendInvoiceEmailFormValues } from '../../types/invoice.types';

interface InvoiceEmailModalProps {
  open: boolean;
  isPending?: boolean;
  defaultTo?: string;
  onClose: () => void;
  onSend: (dto: SendInvoiceEmailDto) => void | Promise<void>;
}

export function InvoiceEmailModal({
  open,
  isPending,
  defaultTo = '',
  onClose,
  onSend,
}: InvoiceEmailModalProps) {
  const {
    register,
    handleValidatedSubmit,
    reset,
    applyApiErrors,
    formState: { errors },
  } = useAppForm<SendInvoiceEmailFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(sendInvoiceEmailSchema) as Resolver<SendInvoiceEmailFormValues>,
    defaultValues: { to_email: defaultTo, message: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset({ to_email: defaultTo, message: '' });
  }, [open, defaultTo, reset]);

  return (
    <Modal open={open} onClose={onClose} title="Email invoice PDF">
      <form
        className="space-y-3"
        onSubmit={handleValidatedSubmit(async (values) => {
          try {
            await onSend({
              to_email: values.to_email,
              message: values.message || undefined,
            });
          } catch (err) {
            applyApiErrors(err);
            throw err;
          }
        })}
      >
        <Input
          label="To email *"
          type="email"
          error={errors.to_email?.message as string | undefined}
          {...register('to_email')}
        />
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--color-neutral-500)]">Message</span>
          <textarea
            className="min-h-[80px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            maxLength={500}
            {...register('message')}
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Sending…' : 'Send email'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
