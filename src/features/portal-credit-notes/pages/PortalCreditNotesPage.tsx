import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Download, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  ATTACHMENT_UPLOAD_OPTIONS,
  handleValidatedFileInput,
} from '@/lib/fileUploadValidation';
import { isUuid } from '@/lib/isUuid';
import {
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalEmptyState,
  PortalFetchBar,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
  portalSelectClassName,
} from '@/features/portal-auth/components/portal-ui';
import { usePortalShipments } from '@/features/portal-shipments/hooks/usePortalShipments';
import {
  useCreatePortalDebitNote,
  useDownloadPortalCreditNotePdf,
  usePortalCreditNotes,
} from '../hooks/usePortalCreditNotes';
import type { PortalNoteKind } from '../services/portalCreditNotes.service';

const STATUSES = ['DRAFT', 'POSTED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'VOID'];

export default function PortalCreditNotesPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const kind: PortalNoteKind = location.pathname.includes('/debit-notes') ? 'debit' : 'credit';
  const basePath = kind === 'debit' ? '/portal/debit-notes' : '/portal/credit-notes';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const jobFromUrl = searchParams.get('job_id')?.trim() || '';

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      search: search.trim() || undefined,
      status: status || undefined,
      job_id: isUuid(jobFromUrl) ? jobFromUrl : undefined,
    }),
    [page, search, status, jobFromUrl],
  );
  const { data, isLoading, isError, error, refetch, isFetching } = usePortalCreditNotes(
    params,
    kind,
  );
  const download = useDownloadPortalCreditNotePdf();
  const createDebit = useCreatePortalDebitNote();
  const shipments = usePortalShipments({ page: 1, limit: 100 });
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMsg, setFormMsg] = useState<string | null>(null);
  const [jobId, setJobId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [remarks, setRemarks] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    if (isUuid(jobFromUrl)) setJobId(jobFromUrl);
  }, [jobFromUrl]);

  const items = data?.items ?? [];
  const meta = data?.meta;
  /** Prefer canonical job UUID when list row id is a shipment/wrapper id. */
  const jobOptions = (shipments.data?.items ?? [])
    .map((s) => {
      const value = (s.jobId && isUuid(s.jobId) ? s.jobId : null) || (isUuid(s.id) ? s.id : '');
      return value
        ? {
            value,
            label:
              `${s.jobNumber || s.reference || value.slice(0, 8).toUpperCase()}${
                s.origin || s.destination
                  ? ` — ${[s.origin, s.destination].filter(Boolean).join(' → ')}`
                  : ''
              }`,
          }
        : null;
    })
    .filter((o): o is { value: string; label: string } => Boolean(o))
    .filter((o, i, arr) => arr.findIndex((x) => x.value === o.value) === i);

  useEffect(() => {
    if (!isUuid(jobFromUrl)) return;
    // If URL used a shipment/wrapper id, remap to the canonical job UUID.
    const match = (shipments.data?.items ?? []).find(
      (s) => s.id === jobFromUrl || s.jobId === jobFromUrl,
    );
    const canonical = match?.jobId;
    if (canonical && isUuid(canonical)) setJobId(canonical);
  }, [jobFromUrl, shipments.data?.items]);

  const submitDebit = async () => {
    setFormError(null);
    setFormMsg(null);
    const amt = Math.round(Number(String(amount).replace(/,/g, '')) * 100) / 100;
    if (!isUuid(jobId)) {
      setFormError('Select the job this advance / charge belongs to.');
      return;
    }
    if (!Number.isFinite(amt) || amt < 0.01) {
      setFormError('Enter an amount of at least 0.01.');
      return;
    }
    try {
      const created = await createDebit.mutateAsync({
        job_id: jobId,
        amount: amt,
        currency_code: currency.trim().toUpperCase() || 'AED',
        remarks: remarks.trim() || undefined,
        file: attachment ?? undefined,
      });
      setFormMsg(`Debit note ${created.number} created for the job ledger.`);
      setAmount('');
      setRemarks('');
      setAttachment(null);
      void refetch();
    } catch (err) {
      setFormError(
        err instanceof PortalApiError || err instanceof Error
          ? err.message
          : 'Could not create debit note.',
      );
    }
  };

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title={kind === 'debit' ? 'Debit notes' : 'Credit notes'}
        description={
          kind === 'debit'
            ? 'Debit notes on your jobs — pay admin-issued notes, or create one with a payment proof for an advance.'
            : 'Credit notes applied to your account (including advances recorded by staff on a job).'
        }
        actions={
          <div className="flex gap-2">
            <Link
              to="/portal/credit-notes"
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                kind === 'credit'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]'
              }`}
            >
              Credit
            </Link>
            <Link
              to="/portal/debit-notes"
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                kind === 'debit'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]'
              }`}
            >
              Debit
            </Link>
          </div>
        }
      />

      {kind === 'debit' ? (
        <PortalPanel padded>
          <h2 className="mb-1 text-sm font-semibold text-[var(--color-neutral-900)]">
            New debit note (job ledger)
          </h2>
          <p className="mb-3 text-xs text-[var(--color-neutral-500)]">
            Record an advance payment you made on a job (no invoice required). Attach a receipt or
            proof — staff see it on the job ledger.
          </p>
          {formError ? (
            <p className="mb-2 text-sm text-[var(--color-danger-600)]" role="alert">
              {formError}
            </p>
          ) : null}
          {formMsg ? (
            <p className="mb-2 text-sm text-[var(--color-success-700)]" role="status">
              {formMsg}
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
                Job *
              </span>
              <select
                className={portalSelectClassName}
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
              >
                <option value="">Select job…</option>
                {jobOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Amount *"
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              maxLength={3}
            />
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
                Remarks
              </span>
              <textarea
                className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Advance payment for job — bank transfer proof attached"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
                Attachment (optional)
              </span>
              <input
                type="file"
                key={attachment ? attachment.name : 'dn-no-file'}
                className="block w-full text-sm text-[var(--color-neutral-700)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-neutral-100)] file:px-3 file:py-1.5 file:text-sm"
                onChange={(e) =>
                  handleValidatedFileInput(
                    e.target.files,
                    setAttachment,
                    undefined,
                    ATTACHMENT_UPLOAD_OPTIONS,
                  )
                }
              />
              {attachment ? (
                <p className="mt-1 text-xs text-[var(--color-neutral-500)]">{attachment.name}</p>
              ) : (
                <p className="mt-1 text-xs text-[var(--color-neutral-400)]">
                  Payment proof (PDF, image, or spreadsheet).
                </p>
              )}
            </label>
          </div>
          <div className="mt-3">
            <Button
              type="button"
              disabled={createDebit.isPending}
              onClick={() => void submitDebit()}
            >
              {createDebit.isPending ? 'Creating…' : 'Create debit note'}
            </Button>
          </div>
        </PortalPanel>
      ) : null}

      <PortalPanel padded>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Search"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Status
            </span>
            <select
              className={portalSelectClassName}
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
        {isUuid(jobFromUrl) ? (
          <p className="mt-2 text-xs text-[var(--color-neutral-500)]">
            Filtered to job {jobFromUrl.slice(0, 8).toUpperCase()}.{' '}
            <Link to={basePath} className="underline">
              Clear
            </Link>
          </p>
        ) : null}
      </PortalPanel>
      {pdfError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {pdfError}
        </p>
      ) : null}
      <PortalPanel>
        <PortalFetchBar active={isFetching && !isLoading} />
        {isLoading ? (
          <PortalLoadingState />
        ) : isError ? (
          <div className="p-6 space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]">
              {error instanceof PortalApiError || error instanceof Error
                ? error.message
                : 'Failed to load.'}
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <PortalEmptyState
            title={kind === 'debit' ? 'No debit notes' : 'No credit notes'}
            description={
              kind === 'debit'
                ? 'Create a debit note above for an advance, or wait for staff to issue one.'
                : 'Credit notes will appear here when issued on your account or job ledger.'
            }
            Icon={Receipt}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((cn) => (
              <PortalAnimatedListItem
                key={cn.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5"
              >
                <Link to={`${basePath}/${cn.id}`} className="min-w-0 flex-1 hover:opacity-80">
                  <div className="text-sm font-semibold truncate">{cn.number}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {[
                      cn.jobNumber ? `Job ${cn.jobNumber}` : null,
                      cn.creditedInvoiceNumber
                        ? `Invoice ${cn.creditedInvoiceNumber}`
                        : null,
                      cn.creditDate,
                      cn.currencyCode,
                      cn.totalAmount != null ? cn.totalAmount.toLocaleString() : null,
                    ]
                      .filter((v) => v != null && v !== '')
                      .join(' · ') || '—'}
                  </div>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  {cn.status ? (
                    <Badge variant="info">{cn.status.replaceAll('_', ' ')}</Badge>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={download.isPending}
                    onClick={() => {
                      setPdfError(null);
                      void download
                        .mutateAsync({
                          id: cn.id,
                          kind,
                          name: `${cn.number || kind}.pdf`,
                        })
                        .catch((err) => {
                          setPdfError(
                            err instanceof PortalApiError || err instanceof Error
                              ? err.message
                              : 'Could not download PDF.',
                          );
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
      {meta && meta.totalPages > 1 && (
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
      )}
    </div>
  );
}
