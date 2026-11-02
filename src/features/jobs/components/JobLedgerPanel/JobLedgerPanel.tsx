import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CREDIT_NOTE_ROUTE_PREFIX } from '@/features/creditNotes/api/creditNote.api';
import { DEBIT_NOTE_ROUTE_PREFIX } from '@/features/debitNotes/api/debitNote.api';
import { INVOICE_ROUTE_PREFIX } from '@/features/invoices/api/invoice.api';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { jobKeys } from '../../hooks/useJobs';
import { jobService } from '../../services/job.service';
import { getErrorMessage } from '../../utils/getErrorMessage';

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function pickStr(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function unwrapList(raw: unknown, ...keys: string[]): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw
      .map((row) => asRecord(row))
      .filter((r): r is Record<string, unknown> => Boolean(r));
  }
  const rec = asRecord(raw);
  if (!rec) return [];
  for (const key of keys) {
    const nested = rec[key];
    if (Array.isArray(nested)) return unwrapList(nested);
  }
  for (const key of ['data', 'items', 'results']) {
    const nested = rec[key];
    if (nested != null) {
      const list = unwrapList(nested, ...keys);
      if (list.length) return list;
    }
  }
  return [];
}

type LedgerRow = {
  id: string;
  kind: 'invoice' | 'credit_note' | 'debit_note' | 'other';
  label: string;
  status?: string;
  amount?: string;
  href?: string;
};

function normalizeLedger(raw: unknown): LedgerRow[] {
  const root = asRecord(raw) ?? {};
  const invoices = unwrapList(raw, 'invoices', 'invoice');
  const creditNotes = unwrapList(raw, 'credit_notes', 'creditNotes', 'credits');
  const debitNotes = unwrapList(raw, 'debit_notes', 'debitNotes', 'debits');
  const mixed = unwrapList(raw, 'entries', 'lines', 'ledger', 'items');

  const rows: LedgerRow[] = [];

  const push = (
    row: Record<string, unknown>,
    kind: LedgerRow['kind'],
    hrefPrefix?: string,
  ) => {
    const id = pickStr(row.id);
    if (!id || !isUuid(id)) return;
    const number = pickStr(
      row.invoice_number,
      row.credit_note_number,
      row.debit_note_number,
      row.number,
      row.document_number,
      row.reference,
    );
    const currency = pickStr(row.currency_code, row.currency);
    const total = row.total_amount ?? row.total ?? row.amount;
    const amount =
      total != null && Number.isFinite(Number(total))
        ? `${currency ? `${currency} ` : ''}${Number(total).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : undefined;
    rows.push({
      id,
      kind,
      label: number || `${kind.replace('_', ' ')} ${id.slice(0, 8).toUpperCase()}`,
      status: pickStr(row.status) || undefined,
      amount,
      href: hrefPrefix ? `${hrefPrefix}/${id}` : undefined,
    });
  };

  for (const inv of invoices) push(inv, 'invoice', INVOICE_ROUTE_PREFIX);
  for (const cn of creditNotes) push(cn, 'credit_note', CREDIT_NOTE_ROUTE_PREFIX);
  for (const dn of debitNotes) push(dn, 'debit_note', DEBIT_NOTE_ROUTE_PREFIX);

  if (!rows.length) {
    for (const row of mixed) {
      const type = pickStr(row.type, row.kind, row.document_type, row.doc_type).toLowerCase();
      if (type.includes('credit')) push(row, 'credit_note', CREDIT_NOTE_ROUTE_PREFIX);
      else if (type.includes('debit')) push(row, 'debit_note', DEBIT_NOTE_ROUTE_PREFIX);
      else if (type.includes('invoice') || isUuid(pickStr(row.id))) {
        push(row, type.includes('invoice') ? 'invoice' : 'other', INVOICE_ROUTE_PREFIX);
      }
    }
  }

  // Deduplicate by id
  const map = new Map<string, LedgerRow>();
  for (const row of rows) map.set(row.id, row);
  void root;
  return Array.from(map.values());
}

interface JobLedgerPanelProps {
  jobId: string;
  partyId?: string;
}

/** GET /jobs/:id/ledger — invoices + CN/DN for the job. */
export function JobLedgerPanel({ jobId, partyId }: JobLedgerPanelProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const enabled = Boolean(accessToken) && isUuid(jobId);

  const query = useQuery({
    queryKey: [...jobKeys.all, 'ledger', jobId] as const,
    queryFn: () => jobService.getLedger(jobId),
    enabled,
  });

  const rows = normalizeLedger(query.data);
  const createCnHref =
    isUuid(jobId) && partyId && isUuid(partyId)
      ? `${CREDIT_NOTE_ROUTE_PREFIX}/new?job=${jobId}&party=${partyId}`
      : `${CREDIT_NOTE_ROUTE_PREFIX}/new${isUuid(jobId) ? `?job=${jobId}` : ''}`;
  const createDnHref =
    isUuid(jobId) && partyId && isUuid(partyId)
      ? `${DEBIT_NOTE_ROUTE_PREFIX}/new?job=${jobId}&party=${partyId}`
      : `${DEBIT_NOTE_ROUTE_PREFIX}/new${isUuid(jobId) ? `?job=${jobId}` : ''}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Job ledger</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={createCnHref}
            className="text-xs font-medium text-[var(--color-primary-600)] underline"
          >
            New credit note
          </Link>
          <Link
            to={createDnHref}
            className="text-xs font-medium text-[var(--color-primary-600)] underline"
          >
            New debit note
          </Link>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!enabled || query.isFetching}
            onClick={() => void query.refetch()}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${query.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <div className="space-y-3 px-4 pb-4">
        <p className="text-xs text-[var(--color-neutral-500)]">
          Invoices and credit/debit notes linked to this job (CN/DN can be created with job + party,
          no invoice required).
        </p>
        {query.isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)]">Loading ledger…</p>
        ) : null}
        {query.isError ? (
          <p className="text-sm text-[var(--color-danger-600)]">
            {getErrorMessage(query.error)}
          </p>
        ) : null}
        {!query.isLoading && !query.isError && rows.length === 0 ? (
          <p className="text-sm text-[var(--color-neutral-400)]">No ledger entries yet.</p>
        ) : null}
        {rows.length ? (
          <ul className="divide-y divide-[var(--color-neutral-100)] rounded-md border border-[var(--color-neutral-200)]">
            {rows.map((row) => (
              <li
                key={`${row.kind}-${row.id}`}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
              >
                <div className="min-w-0 space-y-0.5">
                  {row.href ? (
                    <Link
                      to={row.href}
                      className="font-medium text-[var(--color-primary-600)] underline"
                    >
                      {row.label}
                    </Link>
                  ) : (
                    <span className="font-medium">{row.label}</span>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-[var(--color-neutral-500)]">
                    <span className="uppercase tracking-wide">
                      {row.kind.replace('_', ' ')}
                    </span>
                    {row.status ? <span>{row.status}</span> : null}
                    {row.amount ? <span>{row.amount}</span> : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Card>
  );
}
