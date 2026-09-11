import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageBackLink } from '@/components/ui/PageBackLink';
import {
  REPORT_TEMPLATE_CONTEXT_ENUM,
  REPORT_TEMPLATE_FAMILY_ENUM,
} from '../api/reportCatalog.api';
import {
  ACTIVE_REPORT_ROLLOUT_PHASE,
  REPORT_FAMILY_ROLLOUT,
  ROLLOUT_PHASE_LABELS,
} from '../constants/reportRollout.constants';
import { buildReportGapMatrix, filterRegistry } from '../data/fresaReportRegistry';
import {
  useImportReportTemplates,
  useReportTemplate,
  useReportTemplates,
} from '../hooks/useReportCatalog';
import { useReportFavorites } from '../hooks/useReportFavorites';
import type { ReportFamily, ReportTemplate } from '../types/reportCatalog.types';
import { reportContextLabel, reportFamilyLabel } from '../types/reportCatalog.types';
import { metaToTemplate } from '../utils/normalizeReportCatalog';
import { ReportGeneratePanel } from '../components/ReportCatalog/ReportGeneratePanel';

const CATALOG_STATE_KEY = 'kfg-report-catalog-url';

/**
 * Dynamic report catalog: layouts live on the backend.
 * Filters / selected template / pack are kept in the URL (+ session restore)
 * so Back / re-open does not force starting over.
 */
export default function ReportCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const browseFresa = searchParams.get('browse') === 'fresa';
  const favoritesOnly = searchParams.get('favorites') === '1';
  const includeInactive = searchParams.get('inactive') === '1';
  const contextFilter = searchParams.get('context') || 'all';
  const jobId = searchParams.get('job_id') || undefined;
  const quotationId = searchParams.get('quotation_id') || undefined;
  const invoiceId = searchParams.get('invoice_id') || undefined;
  const partyId = searchParams.get('party_id') || undefined;
  const selectedCode = (searchParams.get('code') || '').trim();
  const selectedPack = (searchParams.get('pack') || '').trim();
  const family = ((searchParams.get('family') as ReportFamily) || 'all') as ReportFamily | 'all';
  const page = Math.max(1, Number(searchParams.get('page') || 1) || 1);

  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [showGap, setShowGap] = useState(false);
  const [adminMsg, setAdminMsg] = useState<string | null>(null);
  const [adminErr, setAdminErr] = useState<string | null>(null);
  const [restoredOnce, setRestoredOnce] = useState(false);
  const { isFavorite, toggleFavorite } = useReportFavorites();
  const importRegistry = useImportReportTemplates();

  const rolloutPhase =
    searchParams.get('rollout') === 'active'
      ? ACTIVE_REPORT_ROLLOUT_PHASE
      : searchParams.get('phase')
        ? Number(searchParams.get('phase'))
        : undefined;

  const patchParams = (updates: Record<string, string | null | undefined>, replace = true) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (
        value == null ||
        value === '' ||
        (key === 'page' && value === '1') ||
        (key === 'family' && value === 'all') ||
        (key === 'context' && value === 'all')
      ) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    setSearchParams(next, { replace });
  };

  // Restore last catalog URL when re-opening without state (e.g. Back to Reports → Catalog).
  useEffect(() => {
    if (restoredOnce) return;
    setRestoredOnce(true);
    const hasBrowseState =
      Boolean(searchParams.get('code')) ||
      Boolean(searchParams.get('q')) ||
      Boolean(searchParams.get('page')) ||
      Boolean(searchParams.get('pack')) ||
      Boolean(searchParams.get('inactive')) ||
      Boolean(searchParams.get('family')) ||
      Boolean(searchParams.get('favorites')) ||
      Boolean(searchParams.get('browse'));
    if (hasBrowseState) return;
    try {
      const saved = sessionStorage.getItem(CATALOG_STATE_KEY);
      if (!saved) return;
      const restored = new URLSearchParams(saved);
      for (const key of ['job_id', 'quotation_id', 'invoice_id', 'party_id', 'context'] as const) {
        const current = searchParams.get(key);
        if (current) restored.set(key, current);
      }
      if ([...restored.keys()].length === 0) return;
      setSearchParams(restored, { replace: true });
    } catch {
      /* ignore */
    }
  }, [restoredOnce, searchParams, setSearchParams]);

  // Persist catalog query for next visit.
  useEffect(() => {
    try {
      sessionStorage.setItem(CATALOG_STATE_KEY, searchParams.toString());
    } catch {
      /* ignore */
    }
  }, [searchParams]);

  // Keep search input in sync when URL changes (restore / back).
  useEffect(() => {
    setSearchInput(searchParams.get('q') || '');
  }, [searchParams]);

  // Debounced search → URL
  useEffect(() => {
    const current = searchParams.get('q') || '';
    if (deferredSearch === current) return;
    patchParams({ q: deferredSearch || null, page: '1' });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when deferred search changes
  }, [deferredSearch]);

  const liveQuery = useReportTemplates(
    {
      page,
      limit: 40,
      search: deferredSearch || undefined,
      family,
      context: contextFilter,
      includeInactive,
      rolloutPhase,
    },
    !browseFresa,
  );

  const selectedDetail = useReportTemplate(selectedCode, Boolean(selectedCode) && !browseFresa);

  const discoveryItems = useMemo(() => {
    if (!browseFresa) {
      return {
        items: [] as ReportTemplate[],
        meta: { page: 1, limit: 40, total: 0, totalPages: 1 },
      };
    }
    const filtered = filterRegistry({
      search: deferredSearch || undefined,
      family,
      context: contextFilter,
      rolloutPhase,
    });
    const favFiltered = favoritesOnly
      ? filtered.filter((t) => isFavorite(t.code))
      : filtered;
    const limit = 40;
    const start = (page - 1) * limit;
    return {
      items: favFiltered.slice(start, start + limit).map((meta, i) => metaToTemplate(meta, start + i)),
      meta: {
        page,
        limit,
        total: favFiltered.length,
        totalPages: Math.max(1, Math.ceil(favFiltered.length / limit)),
      },
    };
  }, [
    browseFresa,
    deferredSearch,
    family,
    contextFilter,
    rolloutPhase,
    page,
    favoritesOnly,
    isFavorite,
  ]);

  const gapMatrix = useMemo(() => buildReportGapMatrix(), []);

  const items = browseFresa ? discoveryItems.items : (liveQuery.data?.items ?? []);
  const meta = browseFresa ? discoveryItems.meta : liveQuery.data?.meta;
  const listLoading = browseFresa ? false : liveQuery.isLoading;
  const backendUnavailable = liveQuery.data?.backendUnavailable;
  const fromLocalRegistry = liveQuery.data?.fromLocalRegistry;
  const liveConnected = Boolean(
    !browseFresa && liveQuery.data && !backendUnavailable && !fromLocalRegistry,
  );

  const familyOptions = useMemo(() => {
    const fromApi = new Set<string>();
    for (const t of liveQuery.data?.items ?? []) fromApi.add(t.family);
    const base = fromApi.size > 0 ? [...fromApi].sort() : [...REPORT_TEMPLATE_FAMILY_ENUM];
    return ['all', ...base];
  }, [liveQuery.data?.items]);

  const displayedItems = useMemo(() => {
    if (browseFresa || !favoritesOnly) return items;
    return items.filter((t) => isFavorite(t.code));
  }, [browseFresa, favoritesOnly, items, isFavorite]);

  const selected = useMemo(() => {
    if (!selectedCode) return null;
    const fromList = displayedItems.find((t) => t.code === selectedCode);
    if (fromList) return fromList;
    if (browseFresa) {
      const meta = filterRegistry({}).find((t) => t.code === selectedCode);
      return meta ? metaToTemplate(meta, 0) : null;
    }
    return selectedDetail.data ?? null;
  }, [selectedCode, displayedItems, browseFresa, selectedDetail.data]);

  const contextPayload = {
    ...(jobId ? { job_id: jobId } : {}),
    ...(quotationId ? { quotation_id: quotationId } : {}),
    ...(invoiceId ? { invoice_id: invoiceId } : {}),
    ...(partyId ? { party_id: partyId } : {}),
  };

  const setBrowse = (mode: 'live' | 'fresa') => {
    patchParams({
      browse: mode === 'fresa' ? 'fresa' : null,
      page: '1',
      code: null,
      pack: null,
    });
    setAdminMsg(null);
    setAdminErr(null);
  };

  const selectTemplate = (t: ReportTemplate) => {
    patchParams(
      {
        code: t.code,
        ...(t.code === selectedCode ? {} : { pack: null }),
      },
      false,
    );
  };

  const clearSelection = () => {
    patchParams({ code: null, pack: null });
  };

  const onImportRegistry = async () => {
    setAdminMsg(null);
    setAdminErr(null);
    try {
      const result = await importRegistry.mutateAsync((done, total) => {
        setAdminMsg(`Importing… ${done} / ${total}`);
      });
      setAdminMsg(
        result.message ||
          `Import complete — inserted ${result.inserted}, updated ${result.updated}, skipped ${result.skipped} (total ${result.total}). Templates stay inactive until activated.`,
      );
      patchParams({
        browse: null,
        inactive: '1',
        page: '1',
        code: null,
        pack: null,
      });
    } catch (err) {
      setAdminErr(err instanceof Error ? err.message : 'Import failed.');
    }
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
            Live backend templates ({meta?.total ?? '…'}). Selection and filters are kept when you
            leave and come back.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={!browseFresa ? 'primary' : 'secondary'}
            onClick={() => setBrowse('live')}
          >
            Live API
          </Button>
          <Button
            type="button"
            variant={browseFresa ? 'primary' : 'secondary'}
            onClick={() => setBrowse('fresa')}
          >
            All FRESA samples
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={
              importRegistry.isPending ||
              Boolean(backendUnavailable && !browseFresa && liveQuery.isError)
            }
            onClick={() => void onImportRegistry()}
          >
            {importRegistry.isPending ? 'Importing…' : 'Import registry'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setShowGap((v) => !v)}>
            {showGap ? 'Hide gap matrix' : 'Gap matrix'}
          </Button>
          <Button
            type="button"
            variant={favoritesOnly ? 'primary' : 'secondary'}
            onClick={() => {
              patchParams({
                favorites: favoritesOnly ? null : '1',
                page: '1',
              });
            }}
          >
            Favorites
          </Button>
          {!browseFresa ? (
            <Button
              type="button"
              variant={includeInactive ? 'primary' : 'secondary'}
              onClick={() => {
                patchParams({
                  inactive: includeInactive ? null : '1',
                  page: '1',
                });
              }}
            >
              Include inactive
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
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
                next.delete('page');
                setSearchParams(next, { replace: true });
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

      {!browseFresa && liveQuery.isError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {liveQuery.error instanceof Error
            ? liveQuery.error.message
            : 'Could not load report templates.'}
        </div>
      ) : null}

      {adminErr ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {adminErr}
        </div>
      ) : null}
      {adminMsg ? (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          {adminMsg}
        </div>
      ) : null}

      {liveConnected ? (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          Connected to Reports — Catalog. Bind a Puppeteer pack from the dropdown, then Activate /
          Generate. Your filters and selection are restored when you return.
        </div>
      ) : null}

      {browseFresa ? (
        <div
          role="status"
          className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950"
        >
          FRESA discovery — local taxonomy for browse. Prefer Import registry, then bind packs on
          Live API.
        </div>
      ) : null}

      {!browseFresa && backendUnavailable ? (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Report catalog API unreachable — local taxonomy only. Restore{' '}
          <span className="font-mono">GET /reports/templates</span> or browse{' '}
          <button type="button" className="underline" onClick={() => setBrowse('fresa')}>
            All FRESA samples
          </button>
          .
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
                  <td className="px-3 py-2 font-medium">{reportFamilyLabel(row.family)}</td>
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
            placeholder="Search report name or code…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
              patchParams({
                family: e.target.value,
                page: '1',
              });
            }}
          >
            {familyOptions.map((f) => (
              <option key={f} value={f}>
                {f === 'all' ? 'All families' : reportFamilyLabel(f)}
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
              patchParams({
                context: e.target.value,
                page: '1',
              });
            }}
          >
            <option value="all">All contexts</option>
            {REPORT_TEMPLATE_CONTEXT_ENUM.map((k) => (
              <option key={k} value={k}>
                {reportContextLabel(k)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(jobId || quotationId || invoiceId || partyId) && (
        <p className="text-xs text-[var(--color-neutral-500)]">
          Context locked:{' '}
          {[
            jobId ? `job ${jobId}` : null,
            quotationId ? `quotation ${quotationId}` : null,
            invoiceId ? `invoice ${invoiceId}` : null,
            partyId ? `party ${partyId}` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <div className="overflow-hidden rounded-xl border border-[var(--color-neutral-200)] bg-white">
          {listLoading ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--color-neutral-400)]">
              Loading catalog…
            </p>
          ) : displayedItems.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--color-neutral-400)]">
              No templates match these filters.
              {!browseFresa ? ' Try Include inactive or Import registry.' : null}
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-neutral-100)]">
              {displayedItems.map((t) => {
                const rowActive = selectedCode === t.code;
                const fav = isFavorite(t.code);
                return (
                  <li key={`${t.id}-${t.code}`} className="flex items-stretch">
                    <button
                      type="button"
                      className="shrink-0 px-3 text-[var(--color-neutral-400)] hover:text-amber-500"
                      aria-label={fav ? 'Remove favorite' : 'Add favorite'}
                      onClick={() => toggleFavorite(t.code)}
                    >
                      <Star
                        className="h-4 w-4"
                        fill={fav ? 'currentColor' : 'none'}
                        strokeWidth={1.75}
                      />
                    </button>
                    <button
                      type="button"
                      className={[
                        'flex min-w-0 flex-1 flex-col gap-1 px-2 py-3 pr-4 text-left transition-colors',
                        rowActive
                          ? 'bg-[var(--color-primary-50,#eff6ff)]'
                          : 'hover:bg-[var(--color-neutral-50)]',
                      ].join(' ')}
                      onClick={() => selectTemplate(t)}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-neutral-900)]">
                        {t.name}
                        {!t.is_active ? (
                          <span className="rounded bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[10px] font-normal text-[var(--color-neutral-500)]">
                            inactive
                          </span>
                        ) : null}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--color-neutral-400)]">
                        {t.code}
                      </span>
                      <span className="text-[11px] text-[var(--color-neutral-500)]">
                        {reportFamilyLabel(t.family)} · {t.formats.join(', ')}
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
                onClick={() => patchParams({ page: String(Math.max(1, page - 1)) })}
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
                onClick={() => patchParams({ page: String(page + 1) })}
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
              discoveryMode={browseFresa}
              selectedPack={selectedPack}
              onSelectedPackChange={(pack) => patchParams({ pack: pack || null })}
              onClose={clearSelection}
              onTemplateUpdated={(t) => {
                patchParams({
                  code: t.code,
                  ...(t.renderer_key &&
                  !/^pending($|[_.-])/i.test(t.renderer_key) &&
                  t.renderer_key.toLowerCase() !== 'pending'
                    ? { pack: t.renderer_key }
                    : {}),
                });
              }}
            />
          ) : selectedCode && selectedDetail.isLoading ? (
            <p className="py-10 text-center text-sm text-[var(--color-neutral-400)]">
              Restoring selected template…
            </p>
          ) : (
            <p className="py-10 text-center text-sm text-[var(--color-neutral-400)]">
              Select a report template to load its dynamic parameter schema and generate.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
