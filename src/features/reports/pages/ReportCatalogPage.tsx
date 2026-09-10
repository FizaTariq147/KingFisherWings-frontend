import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageBackLink } from '@/components/ui/PageBackLink';
import {
  ACTIVE_REPORT_ROLLOUT_PHASE,
  REPORT_FAMILY_ROLLOUT,
  ROLLOUT_PHASE_LABELS,
} from '../constants/reportRollout.constants';
import { buildReportGapMatrix } from '../data/fresaReportRegistry';
import { useReportTemplates } from '../hooks/useReportCatalog';
import type { ReportFamily, ReportTemplate } from '../types/reportCatalog.types';
import { REPORT_CONTEXT_LABELS, REPORT_FAMILY_LABELS } from '../types/reportCatalog.types';
import { ReportGeneratePanel } from '../components/ReportCatalog/ReportGeneratePanel';

const FAMILIES: Array<ReportFamily | 'all'> = [
  'all',
  'ops_list',
  'sea_docs',
  'air_docs',
  'commercial',
  'finance',
  'wms',
  'quotation',
  'other',
];

export default function ReportCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const contextFilter = searchParams.get('context') || 'all';
  const jobId = searchParams.get('job_id') || undefined;
  const quotationId = searchParams.get('quotation_id') || undefined;
  const invoiceId = searchParams.get('invoice_id') || undefined;
  const partyId = searchParams.get('party_id') || undefined;

  const [search, setSearch] = useState('');
  const [family, setFamily] = useState<ReportFamily | 'all'>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ReportTemplate | null>(null);
  const [showGap, setShowGap] = useState(false);

  const query = useReportTemplates({
    page,
    limit: 40,
    search: search.trim() || undefined,
    family,
    context: contextFilter,
    rolloutPhase: searchParams.get('rollout') === 'active'
      ? ACTIVE_REPORT_ROLLOUT_PHASE
      : searchParams.get('phase')
        ? Number(searchParams.get('phase'))
        : undefined,
  });

  const gapMatrix = useMemo(() => buildReportGapMatrix(), []);
  const items = query.data?.items ?? [];
  const meta = query.data?.meta;
  const backendUnavailable = query.data?.backendUnavailable;

  const contextPayload = {
    ...(jobId ? { job_id: jobId } : {}),
    ...(quotationId ? { quotation_id: quotationId } : {}),
    ...(invoiceId ? { invoice_id: invoiceId } : {}),
    ...(partyId ? { party_id: partyId } : {}),
  };

  return (
    <div className="space-y-4">
      <PageBackLink to="/reports" label="Back to Reports" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">
            Report catalog
          </h2>
          <p className="mt-0.5 text-sm text-[var(--color-neutral-500)]">
            FRESA-aligned sample formats ({meta?.total ?? '…'} templates). Existing module analytics
            and quotation/invoice PDFs stay unchanged.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => setShowGap((v) => !v)}>
            {showGap ? 'Hide gap matrix' : 'Gap matrix'}
          </Button>
          {([1, 2, 3, 4, 5, 6] as const).map((phase) => {
            const active =
              searchParams.get('rollout') === 'active'
                ? phase <= ACTIVE_REPORT_ROLLOUT_PHASE
                : searchParams.get('phase') === String(phase);
            return (
              <button
                key={phase}
                type="button"
                className={[
                  'rounded-full border px-3 py-1 text-[11px] font-medium',
                  active
                    ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50,#eff6ff)] text-[var(--color-primary-700)]'
                    : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-600)]',
                ].join(' ')}
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.delete('rollout');
                  if (searchParams.get('phase') === String(phase)) next.delete('phase');
                  else next.set('phase', String(phase));
                  setSearchParams(next);
                  setPage(1);
                }}
              >
                {ROLLOUT_PHASE_LABELS[phase] ?? `Phase ${phase}`}
              </button>
            );
          })}
          <Link
            to="/reports/catalog?rollout=active"
            className="inline-flex items-center rounded-md border border-[var(--color-neutral-200)] px-3 py-1.5 text-xs font-medium"
          >
            Active through: {ROLLOUT_PHASE_LABELS[ACTIVE_REPORT_ROLLOUT_PHASE]}
            {ACTIVE_REPORT_ROLLOUT_PHASE >= REPORT_FAMILY_ROLLOUT.phase6 ? ' (all)' : ''}
          </Link>
        </div>
      </div>

      {backendUnavailable ? (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Report registry API is not available yet — showing the local FRESA taxonomy. Generate will
          work once <span className="font-mono">POST /reports/generate</span> is implemented.
          Quotation and invoice document PDFs continue to use their existing flows.
        </div>
      ) : null}

      {showGap ? (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-neutral-200)] bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--color-neutral-50)] text-left text-xs text-[var(--color-neutral-500)]">
              <tr>
                <th className="px-3 py-2">Family</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Net new</th>
                <th className="px-3 py-2">Partial analytics</th>
                <th className="px-3 py-2">Partial doc PDF</th>
              </tr>
            </thead>
            <tbody>
              {gapMatrix.map((row) => (
                <tr key={row.family} className="border-t border-[var(--color-neutral-100)]">
                  <td className="px-3 py-2 font-medium">{REPORT_FAMILY_LABELS[row.family]}</td>
                  <td className="px-3 py-2 font-mono">{row.total}</td>
                  <td className="px-3 py-2 font-mono">{row.net_new}</td>
                  <td className="px-3 py-2 font-mono">{row.partial_analytics}</td>
                  <td className="px-3 py-2 font-mono">{row.partial_document_pdf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 lg:flex-row lg:items-end">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <Input
            className="pl-9"
            placeholder="Search FRESA report name or code…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--color-neutral-500)]" htmlFor="family">
            Family
          </label>
          <select
            id="family"
            className="h-9 rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm"
            value={family}
            onChange={(e) => {
              setFamily(e.target.value as ReportFamily | 'all');
              setPage(1);
            }}
          >
            {FAMILIES.map((f) => (
              <option key={f} value={f}>
                {f === 'all' ? 'All families' : REPORT_FAMILY_LABELS[f]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--color-neutral-500)]" htmlFor="context">
            Context
          </label>
          <select
            id="context"
            className="h-9 rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm"
            value={contextFilter}
            onChange={(e) => {
              const next = new URLSearchParams(searchParams);
              if (e.target.value === 'all') next.delete('context');
              else next.set('context', e.target.value);
              setSearchParams(next);
              setPage(1);
            }}
          >
            <option value="all">All contexts</option>
            {Object.entries(REPORT_CONTEXT_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(jobId || quotationId || invoiceId) && (
        <p className="text-xs text-[var(--color-neutral-500)]">
          Context locked:{' '}
          {[
            jobId ? `job ${jobId}` : null,
            quotationId ? `quotation ${quotationId}` : null,
            invoiceId ? `invoice ${invoiceId}` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <div className="overflow-hidden rounded-xl border border-[var(--color-neutral-200)] bg-white">
          {query.isLoading ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--color-neutral-400)]">
              Loading catalog…
            </p>
          ) : items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--color-neutral-400)]">
              No templates match these filters.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-neutral-100)]">
              {items.map((t) => {
                const active = selected?.code === t.code;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      className={[
                        'flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors',
                        active ? 'bg-[var(--color-primary-50,#eff6ff)]' : 'hover:bg-[var(--color-neutral-50)]',
                      ].join(' ')}
                      onClick={() => setSelected(t)}
                    >
                      <span className="text-sm font-medium text-[var(--color-neutral-900)]">
                        {t.name}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--color-neutral-400)]">
                        {t.code}
                      </span>
                      <span className="text-[11px] text-[var(--color-neutral-500)]">
                        {REPORT_FAMILY_LABELS[t.family]} · phase {t.rolloutPhase ?? '—'} ·{' '}
                        {t.formats.join(', ')}
                        {t.gapStatus ? ` · ${t.gapStatus.replaceAll('_', ' ')}` : ''}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {meta && meta.totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-[var(--color-neutral-100)] px-4 py-2 text-xs">
              <Button
                type="button"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span>
                Page {meta.page} / {meta.totalPages}
              </span>
              <Button
                type="button"
                variant="secondary"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-4">
          {selected ? (
            <ReportGeneratePanel
              template={selected}
              context={Object.keys(contextPayload).length ? contextPayload : undefined}
              onClose={() => setSelected(null)}
            />
          ) : (
            <p className="py-10 text-center text-sm text-[var(--color-neutral-400)]">
              Select a report template to view parameters and generate.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
