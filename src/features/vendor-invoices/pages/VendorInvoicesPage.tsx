import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PDF_UPLOAD_OPTIONS, handleValidatedFileInput } from '@/lib/fileUploadValidation';
import { Download, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  PortalAnimatedGrid,
  PortalAnimatedGridItem,
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalEmptyState,
  PortalFetchBar,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
  portalSelectClassName,
} from '@/features/portal-auth/components/portal-ui';
import { VendorQueryError } from '@/features/vendor-shared/VendorQueryError';
import { formatVendorMoney } from '@/features/vendor-shared/formatMoney';
import { vendorErrorMessage, vendorInvoicePdfErrorMessage } from '@/features/vendor-shared/vendorUnavailable';
import { VENDOR_INVOICE_STATUSES } from '../api/vendorInvoices.api';
import {
  useDownloadVendorInvoicePdf,
  useExportVendorInvoicesCsv,
  useSubmitVendorInvoice,
  useVendorInvoiceSummary,
  useVendorInvoices,
} from '../hooks/useVendorInvoices';

export default function VendorInvoicesPage() {
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(
    () => (location.state as { search?: string } | null)?.search?.trim() ?? '',
  );
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [amount, setAmount] = useState('');
  const [currencyCode, setCurrencyCode] = useState('AED');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reference, setReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      search: search.trim() || undefined,
      status: status || undefined,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    }),
    [page, search, status, fromDate, toDate],
  );

  const summary = useVendorInvoiceSummary();
  const { data, isLoading, isError, error, refetch, isFetching } = useVendorInvoices(params);
  const download = useDownloadVendorInvoicePdf();
  const exportCsv = useExportVendorInvoicesCsv();
  const submit = useSubmitVendorInvoice();
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Invoices"
        description="Purchase invoices for your vendor account."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={exportCsv.isPending}
            onClick={() => {
              setExportError(null);
              void exportCsv.mutateAsync(params).catch((err) => {
                setExportError(vendorErrorMessage(err, 'Could not export CSV.'));
              });
            }}
          >
            <Download size={14} aria-hidden="true" />
            {exportCsv.isPending ? 'Exporting…' : 'Export CSV'}
          </Button>
        }
      />

      {exportError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {exportError}
        </p>
      ) : null}
      {pdfError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {pdfError}
        </p>
      ) : null}

      <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalAnimatedGridItem>
          <PortalStatCard label="Total" value={summary.data?.total ?? (summary.isLoading ? '…' : 0)} Icon={FileText} />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard
            label="Outstanding"
            value={summary.data?.outstanding ?? (summary.isLoading ? '…' : 0)}
          />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard label="Overdue" value={summary.data?.overdue ?? (summary.isLoading ? '…' : 0)} />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard
            label="Paid"
            value={summary.data?.paid ?? (summary.isLoading ? '…' : 0)}
            tone="accent"
          />
        </PortalAnimatedGridItem>
      </PortalAnimatedGrid>

      <PortalPanel padded className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">Submit a draft invoice</h2>
          <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
            Send currency, total amount, and optional PDF / dates / reference. Staff will post the
            purchase invoice in ERP.
          </p>
        </div>
        {submitError ? (
          <p className="text-sm text-[var(--color-danger-600)]" role="alert">
            {submitError}
          </p>
        ) : null}
        {submitMsg ? (
          <p className="text-sm text-[var(--color-success-600)]" role="status">
            {submitMsg}
          </p>
        ) : null}
        <form
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitError(null);
            setSubmitMsg(null);
            const total = Number(amount);
            if (!currencyCode.trim() || !Number.isFinite(total) || total < 0.01) {
              setSubmitError('Currency and total amount (min 0.01) are required.');
              return;
            }
            void submit
              .mutateAsync({
                currency_code: currencyCode.trim().toUpperCase(),
                total_amount: total,
                invoice_date: invoiceDate || undefined,
                due_date: dueDate || undefined,
                reference: reference.trim() || undefined,
                remarks: remarks.trim() || undefined,
                file: file ?? undefined,
              })
              .then(() => {
                setSubmitMsg('Draft invoice submitted. Staff will post it in ERP.');
                setAmount('');
                setInvoiceDate('');
                setDueDate('');
                setReference('');
                setRemarks('');
                setFile(null);
              })
              .catch((err) => {
                setSubmitError(vendorErrorMessage(err, 'Could not submit invoice.'));
              });
          }}
        >
          <Input
            label="Total amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            label="Currency"
            maxLength={3}
            required
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
          />
          <Input
            label="Invoice date"
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
          />
          <Input
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Input label="Reference" value={reference} onChange={(e) => setReference(e.target.value)} />
          <Input label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          <label className="block text-sm sm:col-span-2 lg:col-span-3">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              PDF (optional)
            </span>
            <input
              type="file"
              accept="application/pdf"
              key={file ? file.name : 'invoice-no-file'}
              className="block w-full text-sm text-[var(--color-neutral-700)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-neutral-100)] file:px-3 file:py-1.5 file:text-sm"
              onChange={(e) =>
                handleValidatedFileInput(e.target.files, setFile, undefined, PDF_UPLOAD_OPTIONS)
              }
            />
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <Button type="submit" disabled={submit.isPending}>
              {submit.isPending ? 'Submitting…' : 'Submit draft PI'}
            </Button>
          </div>
        </form>
      </PortalPanel>

      <PortalPanel padded>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Search"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">Status</span>
            <select
              className={portalSelectClassName}
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">All</option>
              {VENDOR_INVOICE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="From"
            type="date"
            value={fromDate}
            onChange={(e) => {
              setPage(1);
              setFromDate(e.target.value);
            }}
          />
          <Input
            label="To"
            type="date"
            value={toDate}
            onChange={(e) => {
              setPage(1);
              setToDate(e.target.value);
            }}
          />
        </div>
      </PortalPanel>

      <PortalPanel>
        <PortalFetchBar active={isFetching && !isLoading} />
        {isLoading ? (
          <PortalLoadingState label="Loading invoices…" />
        ) : isError ? (
          <VendorQueryError error={error} onRetry={() => void refetch()} />
        ) : items.length === 0 ? (
          <PortalEmptyState
            title="No invoices"
            description="Invoices appear here once they are created for your vendor account."
            Icon={FileText}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((inv) => (
              <PortalAnimatedListItem key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <Link to={`/vendor/invoices/${inv.id}`} className="min-w-0 flex-1 hover:opacity-80">
                  <div className="text-sm font-semibold truncate">{inv.number}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {[
                      inv.invoiceDate,
                      inv.dueDate ? `Due ${inv.dueDate}` : null,
                      formatVendorMoney(inv.totalAmount, inv.currencyCode),
                    ]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </div>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  {inv.status ? <Badge variant="info">{inv.status.replaceAll('_', ' ')}</Badge> : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={download.isPending}
                    onClick={() => {
                      setPdfError(null);
                      void download
                        .mutateAsync({ id: inv.id, name: `${inv.number}.pdf` })
                        .catch((err) => {
                          setPdfError(vendorInvoicePdfErrorMessage(err));
                        });
                    }}
                  >
                    <Download size={14} aria-hidden="true" />
                    {download.isPending ? 'Downloading…' : 'PDF'}
                  </Button>
                </div>
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-neutral-500)]">
            Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
