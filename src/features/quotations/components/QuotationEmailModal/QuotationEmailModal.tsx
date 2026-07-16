import { useEffect } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAppForm } from '@/lib/validation';
import { PDF_MODES } from '../../constants/quotation.constants';
import { sendQuotationEmailSchema } from '../../schemas/quotation.schema';
import type {
  SendQuotationEmailDto,
  SendQuotationEmailFormValues,
} from '../../types/quotation.types';

interface QuotationEmailModalProps {
  open: boolean;
  isPending?: boolean;
  defaultTo?: string;
  onClose: () => void;
  onSend: (dto: SendQuotationEmailDto) => void | Promise<void>;
}

export function QuotationEmailModal({
  open,
  isPending,
  defaultTo = '',
  onClose,
  onSend,
}: QuotationEmailModalProps) {
  const {
    register,
    handleValidatedSubmit,
    reset,
    applyApiErrors,
    formState: { errors },
  } = useAppForm<SendQuotationEmailFormValues>({
    resolver: zodResolver(sendQuotationEmailSchema) as Resolver<SendQuotationEmailFormValues>,
    defaultValues: {
      to_email: defaultTo,
      cc_email: '',
      pdf_mode: 'CUSTOMER',
      message: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      to_email: defaultTo,
      cc_email: '',
      pdf_mode: 'CUSTOMER',
      message: '',
    });
  }, [open, defaultTo, reset]);

  return (
    <Modal open={open} onClose={onClose} title="Email quotation PDF">
      <form
        className="space-y-3"
        onSubmit={handleValidatedSubmit(async (values) => {
          try {
            await onSend({
              to_email: values.to_email,
              cc_email: values.cc_email || undefined,
              pdf_mode: values.pdf_mode,
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
        <Input
          label="CC email"
          type="email"
          error={errors.cc_email?.message as string | undefined}
          {...register('cc_email')}
        />
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--color-neutral-500)]">PDF mode</span>
          <select
            className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            {...register('pdf_mode')}
          >
            {PDF_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
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
