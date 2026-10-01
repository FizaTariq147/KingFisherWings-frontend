import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { useTenantsList } from '@/features/tenants/hooks/useTenants';
import {
  useCreatePlatformInvoice,
  usePlatformInvoices,
  useSendPlatformInvoice,
} from '../hooks/usePlatformBilling';
import { PlatformBillingErrorAlert } from '../components/PlatformBillingErrorAlert';
import { PlatformBillingListPager } from '../components/PlatformBillingListPager';
import { formatBillingScalar, statusBadgeVariant } from '../utils/platformBillingUi';
import type { CreatePlatformInvoiceDto, CreatePlatformInvoiceLineDto } from '../types/platformBilling.types';

const PAGE_SIZE = 20;

type LineDraft = {
  description: string;
  quantity: string;
  unit_price: string;
};

const emptyLine = (): LineDraft => ({ description: '', quantity: '1', unit_price: '' });

export default function PlatformBillingInvoicesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const [currencyCode, setCurrencyCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [sendAfterCreate, setSendAfterCreate] = useState(true);
  const [sendToEmail, setSendToEmail] = useState('');
  const [sendMessage, setSendMessage] = useState('');

  const { data, isLoading, isError, error, refetch } = usePlatformInvoices({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    status: status.trim() || undefined,
  });
  const tenants = useTenantsList({ page: 1, limit: 200, status: 'active' });
  const createInvoice = useCreatePlatformInvoice();
  const sendInvoice = useSendPlatformInvoice();

  const invoices = data?.items ?? [];
  const tenantNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of tenants.data?.tenants ?? []) {
      const label = t.display_name || t.code || t.id;
      if (t.id) map.set(t.id, label);
    }
    return map;
  }, [tenants.data?.tenants]);

  const resolveTenantLabel = (tenantIdValue?: string, tenantName?: string) => {
    if (tenantName?.trim()) return tenantName.trim();
    if (tenantIdValue && tenantNameById.has(tenantIdValue)) {
      return tenantNameById.get(tenantIdValue)!;
    }
    return tenantIdValue ? formatBillingScalar(tenantIdValue) : '—';
  };

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const inv of invoices) {
      if (inv.status?.trim()) set.add(inv.status.trim());
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [invoices]);

  const currencyOptions = useMemo(() => {
    const set = new Set<string>();
    for (const inv of invoices) {
      if (inv.currencyCode?.trim()) set.add(inv.currencyCode.trim().toUpperCase());
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [invoices]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!tenantId.trim()) {
      setCreateError('Select a tenant.');
      return;
    }
    const dtoLines: CreatePlatformInvoiceLineDto[] = [];
    for (const line of lines) {
      const description = line.description.trim();
      const unitPrice = Number(line.unit_price);
      const quantity = line.quantity.trim() ? Number(line.quantity) : 1;
      if (!description) continue;
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        setCreateError('Each line needs a valid unit price.');
        return;
      }
      dtoLines.push({
        description,
        unit_price: unitPrice,
        quantity: Number.isFinite(quantity) && quantity >= 1 ? quantity : 1,
      });
    }
    if (dtoLines.length === 0) {
      setCreateError('Add at least one invoice line.');
      return;
    }

    const dto: CreatePlatformInvoiceDto = {
      tenant_id: tenantId.trim(),
      lines: dtoLines,
    };
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
    if (notes.trim()) dto.notes = notes.trim();

    try {
      const created = await createInvoice.mutateAsync(dto);
      if (sendAfterCreate && created?.id) {
        await sendInvoice.mutateAsync({
          id: created.id,
          body: {
            deliver_email: true,
            to_email: sendToEmail.trim() || undefined,
            message: sendMessage.trim() || undefined,
            include_payment_link: true,
          },
        });
      }
      setShowCreate(false);
      setTenantId('');
      setCurrencyCode('');
      setDiscountAmount('');
      setTaxRate('');
      setDueDate('');
      setNotes('');
      setLines([emptyLine()]);
      setSendToEmail('');
      setSendMessage('');
      if (created?.id) {
        navigate(`/superadmin/billing/invoices/${created.id}`);
      } else {
        void refetch();
      }
    } catch (err) {
      setCreateError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <PageBackLink to="/superadmin/billing" label="Back to billing hub" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Platform invoices</h2>
          <p className="text-sm text-[var(--color-neutral-400)]">
            Send, collect, and reconcile tenant invoices
          </p>
        </div>
        <Button type="button" size="sm" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? 'Hide form' : 'New invoice'}
        </Button>
      </div>

      {showCreate && (
        <Card className="p-4 space-y-4">
          <CardHeader className="p-0 mb-0">
            <CardTitle className="text-base">Create draft invoice</CardTitle>
          </CardHeader>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => void handleCreate(e)}>
            <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)] sm:col-span-2">
              Tenant
              <select
                className="w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                required
              >
                <option value="">Select tenant…</option>
                {(tenants.data?.tenants ?? []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.display_name || t.code || t.id}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
              Currency (optional — defaults to tenant base)
              <Input
                list="platform-invoice-currency-options"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                maxLength={3}
                placeholder="e.g. USD"
              />
              <datalist id="platform-invoice-currency-options">
                {currencyOptions.map((code) => (
                  <option key={code} value={code} />
                ))}
              </datalist>
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

            <div className="sm:col-span-2 space-y-2 rounded-md border border-[var(--color-neutral-200)] p-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sendAfterCreate}
                  onChange={(e) => setSendAfterCreate(e.target.checked)}
                />
                Send by email after create (finalize — leaves draft)
              </label>
              {sendAfterCreate && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
                    Email to (optional — defaults to tenant contacts)
                    <Input
                      type="email"
                      value={sendToEmail}
                      onChange={(e) => setSendToEmail(e.target.value)}
                      placeholder="billing@tenant.com"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
                    Message (optional)
                    <Input value={sendMessage} onChange={(e) => setSendMessage(e.target.value)} />
                  </label>
                </div>
              )}
            </div>

            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[var(--color-neutral-500)]">Lines</p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setLines((prev) => [...prev, emptyLine()])}
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
                      required={index === 0}
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
                      required={index === 0}
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

            {createError && (
              <p className="text-sm text-[var(--color-danger-700)] sm:col-span-2" role="alert">
                {createError}
              </p>
            )}
            <div className="sm:col-span-2">
              <Button
                type="submit"
                size="sm"
                disabled={createInvoice.isPending || sendInvoice.isPending}
              >
                {createInvoice.isPending || sendInvoice.isPending
                  ? sendAfterCreate
                    ? 'Creating & sending…'
                    : 'Creating…'
                  : sendAfterCreate
                    ? 'Create & send'
                    : 'Create draft'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <label className="flex flex-col gap-1 text-xs text-[var(--color-neutral-500)]">
          Status
          <Input
            list="platform-invoice-status-options"
            placeholder="Status filter"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="max-w-xs"
          />
          <datalist id="platform-invoice-status-options">
            {statusOptions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
      </div>

      {isError && <PlatformBillingErrorAlert error={error} onRetry={() => refetch()} />}
      {isLoading && <p className="text-sm text-[var(--color-neutral-500)]">Loading invoices…</p>}

      <div className="space-y-2">
        {invoices.map((inv) => (
          <Card key={inv.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Link
                  to={`/superadmin/billing/invoices/${inv.id}`}
                  className="text-sm font-semibold text-[var(--color-primary-600)] hover:underline"
                >
                  {inv.number || inv.id}
                </Link>
                <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                  {resolveTenantLabel(inv.tenantId, inv.tenantName)} ·{' '}
                  {formatBillingScalar(inv.totalAmount)}{' '}
                  {formatBillingScalar(inv.currencyCode)}
                </p>
              </div>
              {inv.status && <Badge variant={statusBadgeVariant(inv.status)}>{inv.status}</Badge>}
            </div>
          </Card>
        ))}
        {invoices.length === 0 && !isLoading && !isError && (
          <Card className="p-4 text-sm text-[var(--color-neutral-500)]">No invoices found.</Card>
        )}
      </div>

      <PlatformBillingListPager meta={data?.meta} page={page} onPageChange={setPage} />
    </div>
  );
}
