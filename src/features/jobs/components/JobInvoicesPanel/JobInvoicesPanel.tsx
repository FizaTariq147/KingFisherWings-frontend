import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { INVOICE_ROUTE_PREFIX } from '@/features/invoices/api/invoice.api';
import { useInvoices } from '@/features/invoices/hooks/useInvoices';
import { InvoiceStatusBadge } from '@/features/invoices/components/InvoiceStatusBadge';
import { invoiceService } from '@/features/invoices/services/invoice.service';
import { invoiceDisplayNumber } from '@/features/invoices/utils/normalizeInvoice';
import type { Invoice } from '@/features/invoices/types/invoice.types';
import { PURCHASE_INVOICE_ROUTE_PREFIX } from '@/features/purchaseInvoices/api/purchaseInvoice.api';
import { usePurchaseInvoices } from '@/features/purchaseInvoices/hooks/usePurchaseInvoices';
import { purchaseInvoiceDisplayNumber } from '@/features/purchaseInvoices/utils/normalizePurchaseInvoice';
import type { Job } from '@/features/jobs/types/job.types';
import { isUuid } from '@/lib/isUuid';
import {
  JobInvoiceFormModal,
  type JobInvoiceFormSource,
} from '../JobInvoiceFormModal';

interface JobInvoicesPanelProps {
  jobId: string;
  /** Optional full job — used to generate/link invoices from quotation charges. */
  job?: Job;
  /** Optional highlight after auto-create (Mark complete). */
  highlightInvoiceId?: string;
}

type JobInvoiceRow = {
  kind: 'sale' | 'purchase';
  id: string;
  label: string;
  status: string;
  currency_code?: string;
  total_amount?: number;
  linesCount?: number;
  job_id?: string;
};

export function JobInvoicesPanel({
  jobId,
  job,
  highlightInvoiceId,
}: JobInvoicesPanelProps) {
  const enabled = isUuid(jobId);
  const { data, isLoading, isFetching, isError, error, refetch } = useInvoices({
    job_id: enabled ? jobId : undefined,
    page: 1,
    limit: 20,
  });
  const {
    data: purchaseData,
    isLoading: purchaseLoading,
    isFetching: purchaseFetching,
    isError: purchaseError,
    error: purchaseErr,
    refetch: refetchPurchase,
  } = usePurchaseInvoices({
    job_id: enabled ? jobId : undefined,
    page: 1,
    limit: 20,
  });
  const [extraInvoices, setExtraInvoices] = useState<Invoice[]>([]);
  const [busy, setBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saleFormSource, setSaleFormSource] = useState<JobInvoiceFormSource | null>(
    null,
  );

  const shipperId = job?.shipper_id || job?.billing_party_id;

  const invoicesFromJob = data?.invoices ?? [];
  const purchaseFromJob = purchaseData?.purchaseInvoices ?? [];

  const salesMerged = useMemo(() => {
    const map = new Map<string, Invoice>();
    for (const inv of [...invoicesFromJob, ...extraInvoices]) {
      if (inv?.id && isUuid(inv.id)) map.set(inv.id, inv);
    }
    return Array.from(map.values());
  }, [invoicesFromJob, extraInvoices]);

  const rows: JobInvoiceRow[] = useMemo(() => {
    const saleRows: JobInvoiceRow[] = salesMerged.map((inv) => ({
      kind: 'sale',
      id: inv.id,
      label: invoiceDisplayNumber(inv),
      status: String(inv.status ?? ''),
      currency_code: inv.currency_code,
      total_amount: inv.total_amount,
      linesCount: inv.lines?.length,
      job_id: inv.job_id,
    }));
    const purchaseRows: JobInvoiceRow[] = purchaseFromJob
      .filter((inv) => isUuid(inv.id))
      .map((inv) => ({
        kind: 'purchase' as const,
        id: inv.id,
        label: purchaseInvoiceDisplayNumber(inv),
        status: String(inv.status ?? ''),
        currency_code: inv.currency_code,
        total_amount: inv.total_amount,
        linesCount: inv.lines?.length,
        job_id: inv.job_id,
      }));
    return [...saleRows, ...purchaseRows];
  }, [salesMerged, purchaseFromJob]);

  const linkInvoice = useCallback(
    async (invoiceId: string) => {
      if (!isUuid(invoiceId) || !isUuid(jobId)) return;
      try {
        const inv = await invoiceService.getById(invoiceId);
        if (inv.job_id === jobId) return inv;
        return await invoiceService.update(invoiceId, {
          party_id: inv.party_id,
          job_id: jobId,
          currency_code: inv.currency_code,
          exchange_rate: inv.exchange_rate,
          vat_rate: inv.vat_rate,
        });
      } catch {
        return null;
      }
    },
    [jobId],
  );

  /** Find party invoices missing job_id (created at booking Mark complete before convert). */
  const recoverOrphanInvoices = useCallback(async () => {
    if (!enabled || !shipperId || !isUuid(shipperId)) return;
    try {
      const listed = await invoiceService.list({
        party_id: shipperId,
        page: 1,
        limit: 30,
      });
      const candidates = listed.invoices.filter((inv) => {
        if (!isUuid(inv.id)) return false;
        if (inv.job_id && inv.job_id === jobId) return true;
        if (!inv.job_id) return true;
        return false;
      });
      const linked: Invoice[] = [];
      for (const inv of candidates.slice(0, 8)) {
        if (inv.job_id === jobId) {
          linked.push(inv);
          continue;
        }
        if (!inv.job_id) {
          const updated = await linkInvoice(inv.id);
          if (updated) linked.push(updated);
          else linked.push(inv);
        }
      }
      if (linked.length) {
        setExtraInvoices(linked);
        await refetch();
      }
    } catch {
      /* ignore recover errors */
    }
  }, [enabled, shipperId, jobId, linkInvoice, refetch]);

  useEffect(() => {
    if (!enabled) return;
    if (invoicesFromJob.length > 0) return;
    void recoverOrphanInvoices();
  }, [enabled, invoicesFromJob.length, recoverOrphanInvoices]);

  const openSaleForm = (source: JobInvoiceFormSource) => {
    if (!enabled) return;
    setActionError(null);
    setActionMsg(null);
    setSaleFormSource(source);
  };

  const refreshAll = () => {
    void recoverOrphanInvoices();
    void refetch();
    void refetchPurchase();
  };

  const listLoading = (isLoading || purchaseLoading) && rows.length === 0;
  const listError = (isError || purchaseError) && rows.length === 0;
  const listFetching = isFetching || purchaseFetching;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Invoices</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!enabled || busy || Boolean(saleFormSource)}
            title="GET /invoices/sale/form?source=quotation → POST with source=quotation"
            onClick={() => openSaleForm('quotation')}
          >
            Generate from quotation
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!enabled || busy || Boolean(saleFormSource)}
            title="GET /invoices/sale/form?source=job → POST with source=job (costing sale amounts; no quotation fallback)"
            onClick={() => openSaleForm('job')}
          >
            Generate from job
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!enabled || listFetching || busy}
            onClick={refreshAll}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${listFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <div className="space-y-3 px-4 pb-4">
        <p className="text-xs text-[var(--color-neutral-500)]">
          Sales and purchase invoices linked to this job. Generate from quotation uses quotation
          revenue lines; generate from job uses costing sale amounts only. Purchase invoices from
          the Costing tab also appear here.
        </p>
        {actionMsg ? (
          <p className="text-sm text-[var(--color-success-700)]">{actionMsg}</p>
        ) : null}
        {actionError ? (
          <p className="text-sm text-[var(--color-danger-600)]">{actionError}</p>
        ) : null}
        {!enabled ? (
          <p className="text-sm text-[var(--color-neutral-400)]">Invalid job id.</p>
        ) : listLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)]">Loading invoices…</p>
        ) : listError ? (
          <p className="text-sm text-[var(--color-danger-600)]">
            {(error instanceof Error ? error.message : null) ||
              (purchaseErr instanceof Error ? purchaseErr.message : null) ||
              'Could not load invoices.'}
          </p>
        ) : rows.length === 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-[var(--color-neutral-400)]">
              No invoices for this job yet.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={busy || Boolean(saleFormSource)}
                onClick={() => openSaleForm('quotation')}
              >
                Generate from quotation
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={busy || Boolean(saleFormSource)}
                onClick={() => openSaleForm('job')}
              >
                Generate from job
              </Button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-neutral-100)] rounded-md border border-[var(--color-neutral-200)]">
            {rows.map((inv) => {
              const highlighted =
                highlightInvoiceId && isUuid(highlightInvoiceId) && inv.id === highlightInvoiceId;
              const href =
                inv.kind === 'purchase'
                  ? `${PURCHASE_INVOICE_ROUTE_PREFIX}/${inv.id}`
                  : `${INVOICE_ROUTE_PREFIX}/${inv.id}`;
              return (
                <li
                  key={`${inv.kind}-${inv.id}`}
                  className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm ${
                    highlighted ? 'bg-emerald-50' : 'bg-white'
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={href}
                        className="font-medium text-[var(--color-primary-600)] underline"
                      >
                        {inv.label}
                      </Link>
                      <span className="rounded-sm bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-600)]">
                        {inv.kind === 'purchase' ? 'Purchase' : 'Sales'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-neutral-500)]">
                      <InvoiceStatusBadge status={inv.status} />
                      {inv.currency_code && inv.total_amount != null ? (
                        <span>
                          {inv.currency_code}{' '}
                          {Number(inv.total_amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      ) : null}
                      {inv.linesCount ? (
                        <span>
                          {inv.linesCount} line{inv.linesCount === 1 ? '' : 's'}
                        </span>
                      ) : null}
                      {inv.kind === 'sale' && !inv.job_id ? (
                        <span className="text-amber-700">Not linked to job yet</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {inv.kind === 'sale' && (!inv.job_id || inv.job_id !== jobId) ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void (async () => {
                            setBusy(true);
                            try {
                              await linkInvoice(inv.id);
                              await refetch();
                              await recoverOrphanInvoices();
                            } finally {
                              setBusy(false);
                            }
                          })()
                        }
                      >
                        Link to job
                      </Button>
                    ) : null}
                    <Link
                      to={href}
                      className="text-xs font-medium text-[var(--color-primary-600)] underline"
                    >
                      Open
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {enabled ? (
        <JobInvoiceFormModal
          open={Boolean(saleFormSource)}
          onClose={() => setSaleFormSource(null)}
          jobId={jobId}
          kind="sale"
          source={saleFormSource ?? 'quotation'}
          onSaved={() => {
            setActionMsg(
              saleFormSource === 'job'
                ? 'Sales invoice draft saved from job costing sale amounts.'
                : 'Sales invoice draft saved from quotation.',
            );
            setActionError(null);
            void refetch();
            void refetchPurchase();
            void recoverOrphanInvoices();
          }}
        />
      ) : null}
    </Card>
  );
}
