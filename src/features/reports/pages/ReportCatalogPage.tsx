import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
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
  useReportTemplatesBrowse,
} from '../hooks/useReportCatalog';
import { useReportFavorites } from '../hooks/useReportFavorites';
import type { ReportFamily, ReportTemplate } from '../types/reportCatalog.types';
import { reportContextLabel, reportFamilyLabel } from '../types/reportCatalog.types';
import { metaToTemplate } from '../utils/normalizeReportCatalog';
import { ReportCatalogBrowseList } from '../components/ReportCatalog/ReportCatalogBrowseList';
import { ReportGeneratePanel } from '../components/ReportCatalog/ReportGeneratePanel';

const CATALOG_STATE_KEY = 'kfg-report-catalog-url';

/**
 * FRESA-aligned sample report formats catalog.
 * Live list is API-driven (sectioned by family). Layouts/PDF rendering live on the
 * backend via Puppeteer packs — FE never hardcodes per-report Jasper UIs.
 */
export default function ReportCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const browseFresa = searchParams.get('browse') === 'fresa';
  const favoritesOnly = searchParams.get('favorites') === '1';
  const includeInactive = searchParams.get('inactive') !== '0';
  const contextFilter = searchParams.get('context') || 'all';
  const jobId = searchParams.get('job_id') || undefined;
  const quotationId = searchParams.get('quotation_id') || undefined;
  const invoiceId = searchParams.get('invoice_id') || undefined;
  const partyId = searchParams.get('party_id') || undefined;
  const selectedCode = (searchParams.get('code') || '').trim();
  const selectedPack = (searchParams.get('pack') || '').trim();
  const family = ((searchParams.get('family') as ReportFamily) || 'all') as ReportFamily | 'all';

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
        (key === 'context' && value === 'all') ||
        (key === 'inactive' && value === '1')
      ) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    setSearchParams(next, { replace });
  };

  useEffect(() => {
    if (restoredOnce) return;
    setRestoredOnce(true);
    const hasBrowseState =
      Boolean(searchParams.get('code')) ||
      Boolean(searchParams.get('q')) ||
      Boolean(searchParams.get('page')) ||
      Boolean(searchParams.get('pack')) ||
      searchParams.has('inactive') ||
      Boolean(searchParams.get('family')) ||
      Boolean(searchParams.get('favorites')) ||
      Boolean(searchParams.get('browse'));
    if (hasBrowseState) return;
    try {
      const saved =
        localStorage.getItem(CATALOG_STATE_KEY) || sessionStorage.getItem(CATALOG_STATE_KEY);
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

  useEffect(() => {
    try {
      const serialized = searchParams.toString();
      localStorage.setItem(CATALOG_STATE_KEY, serialized);
      sessionStorage.setItem(CATALOG_STATE_KEY, serialized);
    } catch {
      /* ignore */
    }
  }, [searchParams]);

  useEffect(() => {
    setSearchInput(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    const current = searchParams.get('q') || '';
    if (deferredSearch === current) return;
    patchParams({ q: deferredSearch || null, page: '1' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredSearch]);

  const browseParams = useMemo(
    () => ({
      search: deferredSearch || undefined,
      family,
      context: contextFilter,
      includeInactive,
      rolloutPhase,
    }),
    [deferredSearch, family, contextFilter, includeInactive, rolloutPhase],
  );

  const liveBrowse = useReportTemplatesBrowse(browseParams, !browseFresa);
  const selectedDetail = useReportTemplate(selectedCode, Boolean(selectedCode) && !browseFresa);

  const discoveryItems = useMemo(() => {
    if (!browseFresa) return [] as ReportTemplate[];
    const filtered = filterRegistry({
      search: deferredSearch || undefined,
      family,
      context: contextFilter,
      rolloutPhase,
    });
    const favFiltered = favoritesOnly
      ? filtered.filter((t) => isFavorite(t.code))
      : filtered;
    return favFiltered.map((meta, i) => metaToTemplate(meta, i));
  }, [
    browseFresa,
    deferredSearch,
    family,
    contextFilter,
    rolloutPhase,
    favoritesOnly,
    isFavorite,
  ]);

  const gapMatrix = useMemo(() => buildReportGapMatrix(), []);

  const liveItems = liveBrowse.data?.items ?? [];
  const items = browseFresa ? discoveryItems : liveItems;
  const metaTotal = browseFresa ? discoveryItems.length : liveBrowse.data?.meta.total;
  const listLoading = browseFresa ? false : liveBrowse.isLoading;
  const backendUnavailable = liveBrowse.data?.backendUnavailable;
  const fromLocalRegistry = liveBrowse.data?.fromLocalRegistry;
  const liveConnected = Boolean(
    !browseFresa && liveBrowse.data && !backendUnavailable && !fromLocalRegistry,
  );

  const familyOptions = useMemo(() => {
    const fromApi = new Set<string>();
    for (const t of items) fromApi.add(t.family);
    const base = fromApi.size > 0 ? [...fromApi].sort() : [...REPORT_TEMPLATE_FAMILY_ENUM];
    return ['all', ...base];
  }, [items]);

  const displayedItems = useMemo(() => {
    if (browseFresa || !favoritesOnly) return items;
    return items.filter((t) => isFavorite(t.code));
  }, [browseFresa, favoritesOnly, items, isFavorite]);

  const packReadyCount = useMemo(
    () =>
      displayedItems.filter(
        (t) =>
          t.is_active &&
          t.renderer_key &&
          !/^pending($|[_.-])/i.test(t.renderer_key) &&
          t.renderer_key.toLowerCase() !== 'pending',
      ).length,
    [displayedItems],
  );

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
        inactive: null,
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
            Sample report formats
          </h2>
          <p className="mt-0.5 max-w-2xl text-sm text-[var(--color-neutral-500)]">
            FRESA-aligned catalog of essential shipping and finance report formats. Names and
            parameter schemas come from the live API; PDF layout is rendered by backend Puppeteer
            packs (bind a pack, Activate, then Generate). Showing {metaTotal ?? '…'} template
            {metaTotal === 1 ? '' : 's'}
            {includeInactive ? ' (including inactive)' : ' (active only)'}
            {!browseFresa && liveConnected ? ` · ${packReadyCount} pack-ready` : ''}.
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
            Local taxonomy
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={
              importRegistry.isPending ||
              Boolean(backendUnavailable && !browseFresa && liveBrowse.isError)
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
                  inactive: includeInactive ? '0' : null,
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

      {!browseFresa && liveBrowse.isError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {liveBrowse.error instanceof Error
            ? liveBrowse.error.message
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
          Connected to Reports — Catalog. Select a format, bind a Puppeteer pack if needed, Activate,
          then Generate (PDF opens in a ready popup — no page redirect).
          {!includeInactive ? (
            <>
              {' '}
              Viewing <strong>active only</strong>. Turn on <strong>Include inactive</strong> for
              the full imported registry.
            </>
          ) : (
            <> Imported templates stay inactive until a pack is bound and activated.</>
          )}
        </div>
      ) : null}

      {browseFresa ? (
        <div
          role="status"
          className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950"
        >
          Local FRESA taxonomy for discovery only. Prefer <strong>Import registry</strong>, then
          browse Live API.
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
            Local taxonomy
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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
        <div className="overflow-hidden rounded-xl border border-[var(--color-neutral-200)] bg-white">
          <ReportCatalogBrowseList
            items={displayedItems}
            selectedCode={selectedCode}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onSelect={selectTemplate}
            loading={listLoading}
            emptyHint={
              !browseFresa
                ? 'No templates match. Try Include inactive or Import registry.'
                : 'No local taxonomy rows match these filters.'
            }
          />
          {!browseFresa &&
          liveBrowse.data &&
          liveBrowse.data.meta.totalPages > 10 &&
          displayedItems.length < liveBrowse.data.meta.total ? (
            <p className="border-t border-[var(--color-neutral-100)] px-4 py-2 text-[11px] text-[var(--color-neutral-500)]">
              Showing {displayedItems.length} of {liveBrowse.data.meta.total} (browse capped for
              performance). Narrow family/search to load the rest.
            </p>
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
              Select a sample format to load its parameter schema, bind a Puppeteer pack if needed,
              and generate.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
