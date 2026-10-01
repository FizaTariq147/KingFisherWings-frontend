import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getErrorMessage } from '@/features/invoices/utils/getErrorMessage';
import { PlatformBillingErrorAlert } from '@/features/platform-billing/components/PlatformBillingErrorAlert';
import { PlatformBillingFieldGrid } from '@/features/platform-billing/components/PlatformBillingFieldGrid';
import { openBillingCheckoutUrl, statusBadgeVariant } from '@/features/platform-billing/utils/platformBillingUi';
import {
  useCreateInvoicePaymentLink,
  useInvoiceOnlinePayments,
  useInvoiceOnlinePaymentStatus,
  useInvoicePaymentHistory,
  useInvoicePaymentLinks,
  usePayInvoiceOnline,
  useRevokeInvoicePaymentLink,
} from '../hooks/useOnlinePayments';

type InvoiceOnlinePaymentsPanelProps = {
  invoiceId: string;
};

export function InvoiceOnlinePaymentsPanel({ invoiceId }: InvoiceOnlinePaymentsPanelProps) {
  const paymentStatus = useInvoiceOnlinePaymentStatus(invoiceId);
  const payments = useInvoiceOnlinePayments(invoiceId);
  const paymentLinks = useInvoicePaymentLinks(invoiceId);
  const invoiceHistory = useInvoicePaymentHistory(invoiceId, { page: 1, limit: 20 });
  const payOnline = usePayInvoiceOnline(invoiceId);
  const createLink = useCreateInvoicePaymentLink(invoiceId);
  const revokeLink = useRevokeInvoicePaymentLink(invoiceId);

  const [linkEmail, setLinkEmail] = useState('');
  const [linkExpiresDays, setLinkExpiresDays] = useState('');
  const [linkMessage, setLinkMessage] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setActionError(null);
    setActionMessage(null);
    try {
      const result = await fn();
      setActionMessage(`${label} completed.`);
      await paymentStatus.refetch();
      await payments.refetch();
      await paymentLinks.refetch();
      return result;
    } catch (err) {
      setActionError(getErrorMessage(err));
      return null;
    }
  };

  return (
    <div className="space-y-4 p-4 pt-0">
      {actionError && (
        <p className="text-sm text-[var(--color-danger-700)]" role="alert">
          {actionError}
        </p>
      )}
      {actionMessage && (
        <p className="text-sm text-emerald-700" role="status">
          {actionMessage}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={payOnline.isPending}
          onClick={() =>
            void run('Pay now', async () => {
              const res = await payOnline.mutateAsync({});
              openBillingCheckoutUrl(res);
              return res;
            })
          }
        >
          Pay now
        </Button>
      </div>

      <div className="border-t pt-3 space-y-2">
        <p className="text-xs font-medium text-[var(--color-neutral-500)]">Create payment link</p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
            Email to (optional)
            <Input value={linkEmail} onChange={(e) => setLinkEmail(e.target.value)} className="min-w-[180px]" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
            Expires in days (optional)
            <Input
              type="number"
              min={1}
              value={linkExpiresDays}
              onChange={(e) => setLinkExpiresDays(e.target.value)}
              className="min-w-[120px]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)] flex-1 min-w-[200px]">
            Message (optional)
            <Input value={linkMessage} onChange={(e) => setLinkMessage(e.target.value)} />
          </label>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={createLink.isPending}
            onClick={() =>
              void run('Payment link', async () => {
                const expires = linkExpiresDays.trim() ? Number(linkExpiresDays) : undefined;
                const res = await createLink.mutateAsync({
                  email_to: linkEmail.trim() || undefined,
                  expires_in_days:
                    expires != null && Number.isFinite(expires) ? expires : undefined,
                  message: linkMessage.trim() || undefined,
                });
                openBillingCheckoutUrl(res);
                return res;
              })
            }
          >
            Create payment link
          </Button>
        </div>
      </div>

      <div className="border-t pt-3 space-y-2">
        <p className="text-xs font-medium text-[var(--color-neutral-500)]">Payment links</p>
        {paymentLinks.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>}
        {paymentLinks.isError && (
          <PlatformBillingErrorAlert error={paymentLinks.error} onRetry={() => paymentLinks.refetch()} />
        )}
        {(paymentLinks.data ?? []).map((link) => (
          <div
            key={link.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium truncate">{link.id}</p>
              {link.url && (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--color-primary-600)] hover:underline break-all"
                >
                  {link.url}
                </a>
              )}
              {link.expiresAt && (
                <p className="text-xs text-[var(--color-neutral-500)]">Expires: {link.expiresAt}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {link.status && <Badge variant={statusBadgeVariant(link.status)}>{link.status}</Badge>}
              <Button
                type="button"
                size="sm"
                variant="danger"
                disabled={revokeLink.isPending}
                onClick={() => void run('Revoke link', () => revokeLink.mutateAsync(link.id))}
              >
                Revoke
              </Button>
            </div>
          </div>
        ))}
        {(paymentLinks.data?.length ?? 0) === 0 && !paymentLinks.isLoading && (
          <p className="text-sm text-[var(--color-neutral-500)]">No payment links.</p>
        )}
      </div>

      <div className="border-t pt-3 space-y-2">
        <p className="text-xs font-medium text-[var(--color-neutral-500)]">Payment status</p>
        {paymentStatus.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>}
        {paymentStatus.isError && (
          <PlatformBillingErrorAlert error={paymentStatus.error} onRetry={() => paymentStatus.refetch()} />
        )}
        {paymentStatus.data && (
          <PlatformBillingFieldGrid
            normalized={paymentStatus.data as unknown as Record<string, unknown>}
            raw={paymentStatus.data.raw}
          />
        )}
      </div>

      <div className="border-t pt-3 space-y-2">
        <p className="text-xs font-medium text-[var(--color-neutral-500)]">Linked online payments</p>
        {payments.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>}
        {payments.isError && (
          <PlatformBillingErrorAlert error={payments.error} onRetry={() => payments.refetch()} />
        )}
        {(payments.data ?? []).map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
          >
            <Link
              to={`/finance/online-payments/${p.id}`}
              className="font-medium text-[var(--color-primary-600)] hover:underline"
            >
              {p.id}
            </Link>
            {p.status && <Badge variant={statusBadgeVariant(p.status)}>{p.status}</Badge>}
          </div>
        ))}
        {(payments.data?.length ?? 0) === 0 && !payments.isLoading && (
          <p className="text-sm text-[var(--color-neutral-500)]">No online payments linked yet.</p>
        )}
      </div>

      <div className="border-t pt-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium text-[var(--color-neutral-500)]">Invoice payment history</p>
          <Link
            to={`/finance/online-payments/history?scope=invoice&invoice_id=${encodeURIComponent(invoiceId)}`}
            className="text-xs text-[var(--color-primary-600)] hover:underline"
          >
            Open full history
          </Link>
        </div>
        {invoiceHistory.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>}
        {invoiceHistory.isError && (
          <PlatformBillingErrorAlert
            error={invoiceHistory.error}
            onRetry={() => invoiceHistory.refetch()}
          />
        )}
        {(invoiceHistory.data?.items ?? []).map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
          >
            <Link
              to={`/finance/online-payments/${p.id}`}
              className="font-medium text-[var(--color-primary-600)] hover:underline"
            >
              {p.id}
            </Link>
            <span className="text-[var(--color-neutral-500)] text-xs">
              {p.amount != null ? String(p.amount) : ''} {p.currencyCode ?? ''}
            </span>
            {p.status && <Badge variant={statusBadgeVariant(p.status)}>{p.status}</Badge>}
          </div>
        ))}
        {(invoiceHistory.data?.items.length ?? 0) === 0 && !invoiceHistory.isLoading && (
          <p className="text-sm text-[var(--color-neutral-500)]">No posted history for this invoice.</p>
        )}
      </div>
    </div>
  );
}
