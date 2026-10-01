import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import {
  useCancelPlatformInvoice,
  useCreatePlatformInvoicePaymentLink,
  useDeletePlatformInvoice,
  useDownloadPlatformInvoicePdf,
  usePlatformInvoice,
  usePlatformInvoicePayments,
  usePlatformInvoicePaymentStatus,
  useRecordPlatformManualPayment,
  useSendPlatformInvoice,
  useUpdatePlatformInvoice,
} from '../hooks/usePlatformBilling';
import { PlatformBillingErrorAlert } from '../components/PlatformBillingErrorAlert';
import { PlatformBillingFieldGrid } from '../components/PlatformBillingFieldGrid';
import { openBillingCheckoutUrl, statusBadgeVariant } from '../utils/platformBillingUi';
import type {
  CreatePlatformInvoiceLineDto,
  PlatformPaymentSummary,
  UpdatePlatformInvoiceDto,
} from '../types/platformBilling.types';

type LineDraft = {
  description: string;
  quantity: string;
  unit_price: string;
};

function linesFromRaw(raw: Record<string, unknown> | undefined): LineDraft[] {
  const source = raw?.lines ?? raw?.line_items ?? raw?.items;
  if (!Array.isArray(source) || source.length === 0) {
    return [{ description: '', quantity: '1', unit_price: '' }];
  }
  return source.map((row) => {
    const r = (row && typeof row === 'object' ? row : {}) as Record<string, unknown>;
    return {
      description: String(r.description ?? r.name ?? ''),
      quantity: String(r.quantity ?? 1),
      unit_price: String(r.unit_price ?? r.unitPrice ?? r.amount ?? ''),
    };
  });
}

export default function PlatformBillingInvoiceDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const invoice = usePlatformInvoice(id);
  const paymentStatus = usePlatformInvoicePaymentStatus(id);
  const payments = usePlatformInvoicePayments(id);
  const sendInvoice = useSendPlatformInvoice();
  const paymentLink = useCreatePlatformInvoicePaymentLink();
  const cancelInvoice = useCancelPlatformInvoice();
  const deleteInvoice = useDeletePlatformInvoice();
  const updateInvoice = useUpdatePlatformInvoice(id);
  const downloadPdf = useDownloadPlatformInvoicePdf();
  const manualPayment = useRecordPlatformManualPayment(id);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [manualAmount, setManualAmount] = useState('');
  const [manualReference, setManualReference] = useState('');
  const [linkEmail, setLinkEmail] = useState('');
  const [sendEmail, setSendEmail] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [deliverEmail, setDeliverEmail] = useState(true);
  const [includePaymentLink, setIncludePaymentLink] = useState(true);
  const [editing, setEditing] = useState(false);
  const [currencyCode, setCurrencyCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineDraft[]>([
    { description: '', quantity: '1', unit_price: '' },
  ]);

  const inv = invoice.data;
  const statusUpper = (inv?.status ?? '').toUpperCase();
  const canEdit = Boolean(inv && !['PAID', 'CANCELLED', 'CANCELED', 'VOID'].includes(statusUpper));
  const canDelete = Boolean(inv && statusUpper === 'DRAFT');

  useEffect(() => {
    if (!inv) return;
    setCurrencyCode(inv.currencyCode ?? '');
    setDueDate(inv.dueDate?.slice(0, 10) ?? '');
    const raw = inv.raw ?? {};
    setDiscountAmount(
      raw.discount_amount != null || raw.discountAmount != null
        ? String(raw.discount_amount ?? raw.discountAmount)
        : '',
    );
    setTaxRate(
      raw.tax_rate != null || raw.taxRate != null ? String(raw.tax_rate ?? raw.taxRate) : '',
    );
    setNotes(String(raw.notes ?? ''));
    setLines(linesFromRaw(raw));
  }, [inv]);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setActionError(null);
    setActionMessage(null);
    try {
      const result = await fn();
      setActionMessage(`${label} completed.`);
      await invoice.refetch();
      return result;
    } catch (err) {
      setActionError(getErrorMessage(err));
      return null;
    }
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dtoLines: CreatePlatformInvoiceLineDto[] = [];
    for (const line of lines) {
      const description = line.description.trim();
      if (!description) continue;
      const unitPrice = Number(line.unit_price);
      const quantity = line.quantity.trim() ? Number(line.quantity) : 1;
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        setActionError('Each line needs a valid unit price.');
        return;
      }
      dtoLines.push({
        description,
        unit_price: unitPrice,
        quantity: Number.isFinite(quantity) && quantity >= 1 ? quantity : 1,
      });
    }
    if (dtoLines.length === 0) {
      setActionError('Add at least one invoice line.');
      return;
    }
    const dto: UpdatePlatformInvoiceDto = { lines: dtoLines };
    if (currencyCode.trim()) dto.currency_code = currencyCode.trim().toUpperCase();
    if (discountAmount.trim()) {
      const n = Number(discountAmount);
      if (Number.isFinite(n) && n >= 0) dto.discount_amount = n;
    }
    if (taxRate.trim()) {
      const n = Number(taxRate);
      if (Number.isFinite(n) && n >= 0) dto.tax_rate = n;
    }
    if (dueDate.trim()) dto.due_date = dueDate.trim();
    dto.notes = notes.trim() || undefined;
    await run('Update', () => updateInvoice.mutateAsync(dto));
    setEditing(false);
  };

  const invoicePayments = useMemo(
    () => (payments.data ?? []).filter((p): p is PlatformPaymentSummary => p != null),
    [payments.data],
  );

  if (invoice.isLoading) {
    return <p className="text-sm text-[var(--color-neutral-500)]">Loading invoice…</p>;
  }

  if (invoice.isError || !invoice.data) {
    return (
      <div className="space-y-4">
        <PageBackLink to="/superadmin/billing/invoices" label="Back to invoices" />
        <PlatformBillingErrorAlert error={invoice.error} onRetry={() => invoice.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageBackLink to="/superadmin/billing/invoices" label="Back to invoices" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
            Invoice {inv!.number || inv!.id}
          </h2>
          {(inv!.tenantName || inv!.tenantId) && (
            <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
              {inv!.tenantName || inv!.tenantId}
            </p>
          )}
          {inv!.status && <Badge variant={statusBadgeVariant(inv!.status)}>{inv!.status}</Badge>}
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Button type="button" size="sm" variant="secondary" onClick={() => setEditing((v) => !v)}>
              {editing ? 'Close editor' : 'Edit'}
            </Button>
          )}
          {canDelete && (
            <Button
              type="button"
              size="sm"
              variant="danger"
              disabled={deleteInvoice.isPending}
              onClick={() =>
                void run('Delete', async () => {
                  await deleteInvoice.mutateAsync(id);
                  navigate('/superadmin/billing/invoices');
                })
              }
            >
              Delete draft
            </Button>
          )}
        </div>
      </div>

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

      {editing && (
        <Card className="p-4 space-y-3">
          <CardHeader className="p-0 mb-0">
            <CardTitle className="text-base">Edit invoice</CardTitle>
          </CardHeader>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => void saveEdit(e)}>
            <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
              Currency
              <Input
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                maxLength={3}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
              Due date
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
              Discount amount
              <Input
                type="number"
                step="0.01"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
              Tax rate (%)
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)] sm:col-span-2">
              Notes
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[var(--color-neutral-500)]">Lines</p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setLines((prev) => [...prev, { description: '', quantity: '1', unit_price: '' }])
                  }
                >
                  Add line
                </Button>
              </div>
              {lines.map((line, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-6 items-end">
                  <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)] sm:col-span-3">
                    Description
                    <Input
                      value={line.description}
                      onChange={(e) =>
                        setLines((prev) =>
                          prev.map((row, i) =>
                            i === index ? { ...row, description: e.target.value } : row,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
                    Qty
                    <Input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) =>
                        setLines((prev) =>
                          prev.map((row, i) =>
                            i === index ? { ...row, quantity: e.target.value } : row,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
                    Unit price
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.unit_price}
                      onChange={(e) =>
                        setLines((prev) =>
                          prev.map((row, i) =>
                            i === index ? { ...row, unit_price: e.target.value } : row,
                          ),
                        )
                      }
                    />
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={lines.length <= 1}
                    onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm" disabled={updateInvoice.isPending}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <PlatformBillingFieldGrid normalized={inv! as unknown as Record<string, unknown>} raw={inv!.raw} />
      </Card>

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={cancelInvoice.isPending}
            onClick={() => void run('Cancel', () => cancelInvoice.mutateAsync({ id }))}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={downloadPdf.isPending}
            onClick={() =>
              void run('PDF download', () =>
                downloadPdf.mutateAsync({ id, fileName: `invoice-${inv!.number ?? id}.pdf` }),
              )
            }
          >
            Download PDF
          </Button>
        </div>
        <form
          className="flex flex-col gap-3 pt-2 border-t"
          onSubmit={(e) => {
            e.preventDefault();
            void run('Send by email', () =>
              sendInvoice.mutateAsync({
                id,
                body: {
                  deliver_email: deliverEmail,
                  to_email: sendEmail.trim() || undefined,
                  message: sendMessage.trim() || undefined,
                  include_payment_link: includePaymentLink,
                },
              }),
            );
          }}
        >
          <p className="text-xs font-medium text-[var(--color-neutral-500)]">
            Send / finalize invoice (moves it out of draft when delivered)
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
              Email to (optional — defaults to tenant contacts)
              <Input
                type="email"
                value={sendEmail}
                onChange={(e) => setSendEmail(e.target.value)}
                className="min-w-[220px]"
                placeholder="billing@tenant.com"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)] flex-1 min-w-[200px]">
              Message (optional)
              <Input value={sendMessage} onChange={(e) => setSendMessage(e.target.value)} />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={deliverEmail}
                onChange={(e) => setDeliverEmail(e.target.checked)}
              />
              Deliver by email
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includePaymentLink}
                onChange={(e) => setIncludePaymentLink(e.target.checked)}
              />
              Include Pay Now link
            </label>
            <Button type="submit" size="sm" disabled={sendInvoice.isPending}>
              {sendInvoice.isPending ? 'Sending…' : 'Send invoice'}
            </Button>
          </div>
        </form>
        <div className="flex flex-wrap items-end gap-2 pt-2 border-t">
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
            Payment link email (optional)
            <Input value={linkEmail} onChange={(e) => setLinkEmail(e.target.value)} className="min-w-[200px]" />
          </label>
          <Button
            type="button"
            size="sm"
            disabled={paymentLink.isPending}
            onClick={() =>
              void run('Payment link', async () => {
                const res = await paymentLink.mutateAsync({
                  id,
                  dto: linkEmail.trim() ? { email_to: linkEmail.trim() } : undefined,
                });
                openBillingCheckoutUrl(res);
                return res;
              })
            }
          >
            Create payment link
          </Button>
        </div>
        <form
          className="flex flex-wrap items-end gap-2 pt-2 border-t"
          onSubmit={(e) => {
            e.preventDefault();
            const amount = Number(manualAmount);
            if (!Number.isFinite(amount) || amount <= 0) {
              setActionError('Enter a valid manual payment amount.');
              return;
            }
            void run('Manual payment', () =>
              manualPayment.mutateAsync({
                amount,
                reference: manualReference.trim() || undefined,
              }),
            );
          }}
        >
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
            Manual amount
            <Input
              type="number"
              step="0.01"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
            Reference
            <Input value={manualReference} onChange={(e) => setManualReference(e.target.value)} />
          </label>
          <Button type="submit" size="sm" disabled={manualPayment.isPending}>
            Record manual payment
          </Button>
        </form>
      </Card>

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Payment status</CardTitle>
        </CardHeader>
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
      </Card>

      <Card className="p-4 space-y-3">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-base">Payments on invoice</CardTitle>
        </CardHeader>
        {payments.isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading…</p>}
        {payments.isError && (
          <PlatformBillingErrorAlert error={payments.error} onRetry={() => payments.refetch()} />
        )}
        <div className="space-y-2">
          {invoicePayments.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            >
              <Link
                to={`/superadmin/billing/payments/${p.id}`}
                className="font-medium text-[var(--color-primary-600)] hover:underline"
              >
                {p.id}
              </Link>
              {p.status && <Badge variant={statusBadgeVariant(p.status)}>{p.status}</Badge>}
            </div>
          ))}
          {invoicePayments.length === 0 && !payments.isLoading && (
            <p className="text-sm text-[var(--color-neutral-500)]">No payments linked yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
