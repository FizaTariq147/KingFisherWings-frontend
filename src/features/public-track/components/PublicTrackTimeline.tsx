import { useMemo, useState, type CSSProperties } from 'react';
import {
  Anchor,
  ArrowLeft,
  Check,
  ChevronUp,
  Clock3,
  Container,
  Leaf,
  MapPin,
  Ship,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { cn } from '@/lib/utils';
import type {
  PublicTrackMilestone,
  PublicTrackResult,
} from '../types/publicTrack.types';
import { resolveTrackStatusIcon } from '../utils/trackStatusIcon';
import {
  TRACK_TONE_COLORS,
  trackMilestoneTone,
  type TrackMilestoneTone,
} from '../utils/trackMilestoneTone';
import {
  computeTrackMetrics,
  formatTrackDateShort,
} from '../utils/trackMetrics';

type MainTab = 'route' | 'vessel' | 'eta' | 'cargo' | 'pre_manifest' | 'qty';

export type PublicTrackPdfSource =
  | { kind: 'public'; ref: string; tenantSlug?: string }
  | { kind: 'job'; jobId: string; container?: string }
  | { kind: 'portal'; shipmentId: string; container?: string };

const C = {
  navy: '#0A2942',
  badge: TRACK_TONE_COLORS.active,
  line: '#0A2942',
  red: TRACK_TONE_COLORS.hold,
  green: TRACK_TONE_COLORS.complete,
  muted: '#8B95A1',
  text: '#1E293B',
  sub: '#64748B',
  chip: '#EEF1F4',
  border: '#D8DEE6',
  rowBorder: '#EEF2F6',
  yellow: '#EAB308',
} as const;

function toneColor(tone: TrackMilestoneTone): string {
  if (tone === 'hold') return C.red;
  if (tone === 'complete') return C.green;
  return C.muted;
}

function headerStatusColor(status?: string): string {
  const blob = String(status ?? '').toUpperCase();
  if (blob.includes('HOLD')) return C.red;
  if (
    blob.includes('COMPLETE') ||
    blob.includes('DELIVER') ||
    blob === 'DONE' ||
    blob === 'ARRIVED'
  ) {
    return C.green;
  }
  if (blob.includes('TRANSIT') || blob.includes('SAILING')) return C.yellow;
  return C.badge;
}

function parseWhen(value?: string): { date: string; time: string } | null {
  if (!value?.trim()) return null;
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return { date: value, time: '' };
  const d = new Date(t);
  const parts = d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const m = parts.match(/^(\w+),\s+(\d{1,2})\s+(\w+)\s+(\d{4})$/);
  const date = m
    ? `${m[1]}, ${m[2]}-${m[3].toUpperCase()}-${m[4]}`
    : parts;
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return { date, time };
}

function formatStatusLabel(value?: string): string {
  if (!value?.trim()) return '';
  return value.replaceAll('_', ' ').trim().toUpperCase();
}

function formatWhenShort(value?: string): string {
  if (!value?.trim()) return '—';
  const parsed = parseWhen(value);
  if (!parsed) return value;
  return [parsed.date, parsed.time].filter(Boolean).join(' · ');
}

function modeIcon(move?: string, eventType?: string) {
  const blob = `${move ?? ''} ${eventType ?? ''}`.toUpperCase();
  if (blob.includes('GATE') || blob.includes('TRUCK') || blob.includes('ROAD')) return Truck;
  if (blob.includes('VESSEL') || blob.includes('SAIL') || blob.includes('LOAD') || blob.includes('DISCHARGE'))
    return Ship;
  if (blob.includes('PORT') || blob.includes('TERMINAL')) return Anchor;
  return MapPin;
}

function DetailDataList({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  if (!entries.length) return null;
  return (
    <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="rounded-sm px-2.5 py-2"
          style={{ backgroundColor: C.chip, border: `1px solid ${C.border}` }}
        >
          <dt className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
            {key.replaceAll('_', ' ')}
          </dt>
          <dd className="mt-0.5 text-[13px] font-medium" style={{ color: C.navy }}>
            {typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
              ? String(value)
              : value == null
                ? '—'
                : JSON.stringify(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function DataTable({
  columns,
  rows,
  emptyLabel,
}: {
  columns: { key: string; label: string; render: (row: Record<string, unknown>) => string }[];
  rows: Record<string, unknown>[];
  emptyLabel: string;
}) {
  if (!rows.length) {
    return (
      <p className="py-4 text-sm" style={{ color: C.sub }}>
        {emptyLabel}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-[12px]">
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide"
                style={{ color: C.muted }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={String(row.id ?? i)} style={{ borderBottom: `1px solid ${C.rowBorder}` }}>
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-2 py-2.5" style={{ color: C.text }}>
                  {col.render(row) || '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function buildTrackPrintHtml(result: PublicTrackResult, status: string): string {
  const history = (result.milestones ?? []).filter((m) => trackMilestoneTone(m) !== 'pending');
  const rows = history
    .map((m) => {
      const when = parseWhen(m.completedAt || m.occurredAt);
      const move = m.move || m.label || '—';
      const loc = [m.location, m.terminal].filter(Boolean).join('<br/>') || '—';
      const vessel = [m.vessel, m.voyage ? `(${m.voyage})` : null].filter(Boolean).join(' ') || '';
      return `<tr><td>${when ? `${when.date}<br/>${when.time}` : '—'}</td><td>${move}</td><td>${loc}</td><td>${vessel}</td></tr>`;
    })
    .join('');

  return `<!doctype html><html><head><title>Tracking ${result.reference}</title>
<style>body{font-family:system-ui,sans-serif;padding:24px;color:#0A2942}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #E2E8F0;padding:8px;text-align:left;font-size:12px}</style>
</head><body>
<h1>Track & Trace — ${result.reference}</h1>
<p>Status: ${status || '—'}</p>
<table><thead><tr><th>Date</th><th>Move</th><th>Location</th><th>Vessel</th></tr></thead><tbody>${rows}</tbody></table>
</body></html>`;
}

async function downloadServerPdf(
  source: PublicTrackPdfSource,
  filenameBase: string,
): Promise<boolean> {
  try {
    if (source.kind === 'public') {
      const { publicTrackService } = await import('../services/publicTrack.service');
      const blob = await publicTrackService.downloadPdf(source.ref, source.tenantSlug);
      triggerBlobDownload(blob, `${filenameBase}.pdf`);
      return true;
    }
    if (source.kind === 'job') {
      const { jobService } = await import('@/features/jobs/services/job.service');
      const blob = await jobService.downloadTrackingPdf(source.jobId, source.container);
      triggerBlobDownload(blob, `${filenameBase}.pdf`);
      return true;
    }
    if (source.kind === 'portal') {
      const { portalShipmentsService } = await import(
        '@/features/portal-shipments/services/portalShipments.service'
      );
      const blob = await portalShipmentsService.downloadTrackingPdf(
        source.shipmentId,
        source.container,
      );
      triggerBlobDownload(blob, `${filenameBase}.pdf`);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

function exportPdfClient(result: PublicTrackResult, status: string) {
  const html = buildTrackPrintHtml(result, status);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  const win = iframe.contentWindow;
  const doc = iframe.contentDocument || win?.document;
  const triggerPrint = () => {
    try {
      win?.focus();
      win?.print();
    } finally {
      window.setTimeout(() => iframe.remove(), 800);
    }
  };
  if (win && doc) {
    doc.open();
    doc.write(html);
    doc.close();
    window.setTimeout(triggerPrint, 250);
  } else {
    iframe.remove();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracking-${result.reference || 'export'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

/**
 * Track & Trace details card — used as map overlay (public) or embedded panel (staff/portal).
 * Shows all fetched sections: route timeline, vessel, ETA, cargo, pre-manifest, qty.
 */
export function PublicTrackTimeline({
  result,
  onNewSearch,
  className,
  pdfSource,
  variant = 'panel',
}: {
  result: PublicTrackResult;
  onNewSearch?: () => void;
  className?: string;
  pdfSource?: PublicTrackPdfSource;
  /** `overlay` = floating map card chrome; `panel` = embedded. */
  variant?: 'overlay' | 'panel';
  /** @deprecated Ignored. */
  compact?: boolean;
}) {
  const [showPrevious, setShowPrevious] = useState(true);
  const [pdfPending, setPdfPending] = useState(false);
  const [tab, setTab] = useState<MainTab>('route');

  const status = formatStatusLabel(result.currentStatus || result.status);
  const headerBadgeColor = headerStatusColor(result.currentStatus || result.status);
  const metrics = useMemo(() => computeTrackMetrics(result), [result]);
  const route = result.route;
  const cargoInfo = result.cargoInfo;
  const preManifest = result.preManifest ?? [];
  const qtyGwVol = result.qtyGwVol;

  const hasCargo = Boolean(
    cargoInfo &&
      (cargoInfo.arrivalReport.length ||
        cargoInfo.customsStatus.length ||
        Object.keys(cargoInfo.detailedData).length),
  );
  const hasPreManifest = preManifest.length > 0;
  const hasQty =
    Boolean(qtyGwVol) &&
    Boolean(
      qtyGwVol?.qty ||
        qtyGwVol?.gw ||
        qtyGwVol?.vol ||
        qtyGwVol?.quantity != null ||
        qtyGwVol?.grossWeight != null ||
        qtyGwVol?.volume != null ||
        qtyGwVol?.netWeight != null ||
        qtyGwVol?.chargeableWeight != null ||
        (qtyGwVol?.lines?.length ?? 0) > 0 ||
        (qtyGwVol && Object.keys(qtyGwVol.extras).length),
    );

  const history = useMemo(
    () => (result.milestones ?? []).filter((m) => trackMilestoneTone(m) !== 'pending'),
    [result.milestones],
  );

  const vesselRows = useMemo(() => {
    const fromLegs = (route?.legs ?? [])
      .filter((l) => l.vessel || l.voyage || l.imo)
      .map((l, i) => ({
        id: l.id || `leg-${i}`,
        vessel: l.vessel,
        voyage: l.voyage,
        imo: l.imo,
        label: l.label || [l.from, l.to].filter(Boolean).join(' → '),
        etd: l.etd,
        eta: l.eta,
      }));
    if (fromLegs.length) return fromLegs;
    const fromPoc = (route?.portOfCall ?? [])
      .filter((p) => p.vesselName || p.voyageNumber)
      .map((p, i) => ({
        id: p.id || `poc-v-${i}`,
        vessel: p.vesselName,
        voyage: p.voyageNumber,
        imo: undefined as string | undefined,
        label: [p.role, p.name].filter(Boolean).join(' · '),
        etd: p.etd,
        eta: p.eta,
      }));
    if (fromPoc.length) return fromPoc;
    const seen = new Set<string>();
    const fromMoves: typeof fromLegs = [];
    for (const m of history) {
      if (!m.vessel && !m.voyage) continue;
      const key = `${m.vessel ?? ''}|${m.voyage ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      fromMoves.push({
        id: m.id,
        vessel: m.vessel,
        voyage: m.voyage,
        imo: undefined,
        label: m.location || m.move || m.label,
        etd: undefined,
        eta: undefined,
      });
    }
    return fromMoves;
  }, [route?.legs, route?.portOfCall, history]);

  const etaHistory = useMemo(() => {
    const rows: Array<{ id: string; label: string; when?: string; note?: string }> = [];
    if (metrics.etd) {
      rows.push({ id: 'etd-current', label: 'Current ETD', when: metrics.etd });
    }
    if (metrics.eta) {
      rows.push({ id: 'eta-current', label: 'Current ETA', when: metrics.eta });
    }
    if (metrics.atd) {
      rows.push({ id: 'atd', label: 'ATD', when: metrics.atd });
    }
    for (const port of route?.portOfCall ?? []) {
      if (port.etd) {
        rows.push({
          id: `poc-etd-${port.id}`,
          label: `ETD · ${port.name || port.code || 'Port'}`,
          when: port.etd,
          note: port.atd ? `ATD ${formatTrackDateShort(port.atd)}` : undefined,
        });
      }
      if (port.eta) {
        rows.push({
          id: `poc-eta-${port.id}`,
          label: `ETA · ${port.name || port.code || 'Port'}`,
          when: port.eta,
          note: port.ata ? `ATA ${formatTrackDateShort(port.ata)}` : undefined,
        });
      }
    }
    for (const leg of route?.legs ?? []) {
      if (leg.etd) {
        rows.push({
          id: `leg-etd-${leg.id}`,
          label: `ETD · ${leg.label || leg.from || 'Leg'}`,
          when: leg.etd,
        });
      }
      if (leg.eta) {
        rows.push({
          id: `leg-eta-${leg.id}`,
          label: `ETA · ${leg.label || leg.to || 'Leg'}`,
          when: leg.eta,
        });
      }
    }
    return rows;
  }, [metrics.etd, metrics.eta, metrics.atd, route]);

  const tabs = useMemo(() => {
    const list: { id: MainTab; label: string; count?: number }[] = [
      { id: 'route', label: 'Route', count: history.length || undefined },
      { id: 'vessel', label: 'Vessel/Flight', count: vesselRows.length || undefined },
      { id: 'eta', label: 'ETD / ETA History', count: etaHistory.length || undefined },
    ];
    if (hasCargo) list.push({ id: 'cargo', label: 'Cargo Info' });
    if (hasPreManifest) list.push({ id: 'pre_manifest', label: 'Pre-manifest', count: preManifest.length });
    if (hasQty) list.push({ id: 'qty', label: 'QTY / G.W. / VOL.' });
    return list;
  }, [history.length, vesselRows.length, etaHistory.length, hasCargo, hasPreManifest, hasQty, preManifest.length]);

  const activeTab = tabs.some((t) => t.id === tab) ? tab : 'route';

  const { latest, previous } = useMemo(() => {
    if (history.length <= 1) return { latest: history, previous: [] as PublicTrackMilestone[] };
    return { latest: history.slice(0, 1), previous: history.slice(1) };
  }, [history]);
  const visibleRows = showPrevious ? history : latest;

  const handleExportPdf = async () => {
    setPdfPending(true);
    try {
      const source: PublicTrackPdfSource | undefined =
        pdfSource ??
        (result.reference ? { kind: 'public', ref: result.reference } : undefined);
      if (source) {
        const resolved: PublicTrackPdfSource =
          source.kind === 'job' || source.kind === 'portal'
            ? { ...source, container: source.container || result.containerNumber }
            : source;
        const ok = await downloadServerPdf(
          resolved,
          `tracking-${result.reference || result.containerNumber || 'export'}`,
        );
        if (ok) return;
      }
      exportPdfClient(result, status);
    } finally {
      setPdfPending(false);
    }
  };

  const originLabel = metrics.origin || 'Origin';
  const destLabel = metrics.destination || 'Destination';
  const progressPct = metrics.progressPct > 0 ? metrics.progressPct : 35;

  return (
    <div
      className={cn(
        'flex w-full flex-col bg-white text-[#1E293B]',
        variant === 'overlay' && 'max-h-[min(92vh,880px)] overflow-hidden rounded-2xl shadow-2xl',
        className,
      )}
    >
      {/* —— Header —— */}
      <div className="shrink-0 border-b px-4 pb-4 pt-4 sm:px-5" style={{ borderColor: C.border }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2">
            {onNewSearch ? (
              <button
                type="button"
                onClick={onNewSearch}
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100"
                aria-label="Back to search"
              >
                <ArrowLeft className="h-4 w-4" style={{ color: C.navy }} />
              </button>
            ) : null}
            <div className="min-w-0">
              <p
                className="truncate text-[20px] font-bold tracking-tight sm:text-[22px]"
                style={{ color: C.navy }}
              >
                {result.blNumber || result.reference}
              </p>
              <p className="mt-0.5 text-[12px]" style={{ color: C.sub }}>
                {[
                  result.blNumber && result.blNumber !== result.reference
                    ? `Ref ${result.reference}`
                    : null,
                  result.partyName,
                  route?.terminalCutoffAt
                    ? `Cut-off ${formatWhenShort(route.terminalCutoffAt)}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            {status ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ color: C.navy, backgroundColor: `${headerBadgeColor}22` }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: headerBadgeColor }}
                />
                {status
                  .toLowerCase()
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pdfPending}
              onClick={() => void handleExportPdf()}
            >
              {pdfPending ? 'PDF…' : 'Export PDF'}
            </Button>
          </div>
        </div>

        {/* POL → POD progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between gap-3 text-[13px] font-semibold" style={{ color: C.navy }}>
            <span className="min-w-0 truncate">{originLabel}</span>
            <span className="min-w-0 truncate text-right">{destLabel}</span>
          </div>
          <div className="relative mt-3 h-1.5 rounded-full" style={{ backgroundColor: C.chip }}>
            <div
              className="absolute left-0 top-0 h-1.5 rounded-full"
              style={{
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${C.green}, ${C.badge})`,
              }}
            />
            <span
              className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white shadow"
              style={{
                left: `calc(${progressPct}% - 7px)`,
                backgroundColor: C.badge,
              }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px]" style={{ color: C.sub }}>
            <span>
              {metrics.atd
                ? `ATD ${formatTrackDateShort(metrics.atd)}`
                : metrics.etd
                  ? `ETD ${formatTrackDateShort(metrics.etd)}`
                  : 'ETD —'}
            </span>
            <span>
              {metrics.eta ? `ETA ${formatTrackDateShort(metrics.eta)}` : 'ETA —'}
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'Containers', value: String(metrics.containerCount || '—') },
            { label: 'Transshipments', value: String(metrics.transshipments) },
            {
              label: 'Transit time',
              value: metrics.transitDays != null ? `${metrics.transitDays} days` : '—',
            },
            {
              label: 'CO₂',
              value: metrics.co2 || '—',
              icon: metrics.co2 ? Leaf : undefined,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl px-3 py-2.5"
              style={{ backgroundColor: C.chip }}
            >
              <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: C.muted }}>
                {item.label}
              </p>
              <p
                className="mt-1 flex items-center gap-1 text-[15px] font-bold"
                style={{ color: C.navy }}
              >
                {item.icon ? <item.icon className="h-3.5 w-3.5 text-emerald-600" /> : null}
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex shrink-0 gap-1 overflow-x-auto border-b px-3 sm:px-5"
        style={{ borderColor: C.border, backgroundColor: '#FAFBFC' }}
        role="tablist"
      >
        {tabs.map((t) => {
          const active = t.id === activeTab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                'shrink-0 border-b-2 px-3 py-2.5 text-[12px] font-semibold transition-colors',
                active ? 'border-[var(--tab)] text-[var(--navy)]' : 'border-transparent',
              )}
                style={
                {
                  ['--tab' as string]: C.badge,
                  ['--navy' as string]: C.navy,
                  color: active ? C.navy : C.sub,
                } as CSSProperties
              }
            >
              {t.label}
              {t.count != null ? (
                <span
                  className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                  style={{ backgroundColor: active ? C.badge : C.muted }}
                >
                  {t.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Scrollable body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        {result.matches && result.matches.length > 1 ? (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <p className="font-medium">Multiple matches</p>
            <ul className="mt-1 list-disc pl-5 text-[13px]">
              {result.matches.map((m) => (
                <li key={`${m.kind}-${m.reference}`}>
                  {m.reference}
                  {m.kind ? ` (${m.kind})` : ''}
                  {m.status ? ` · ${m.status}` : ''}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* ROUTE — vertical timeline */}
        {activeTab === 'route' ? (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <p className="text-[14px] font-bold" style={{ color: C.navy }}>
                {result.containerNumber || result.reference}
              </p>
              {result.containerType ? (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  style={{ backgroundColor: C.chip, color: C.sub }}
                >
                  <Container className="h-3 w-3" />
                  {result.containerType}
                </span>
              ) : null}
            </div>

            {route && (route.atBefore || route.terminalCutoffAt || route.legs.length || route.portOfCall.length) ? (
              <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {route.atBefore ? (
                  <div className="rounded-lg px-3 py-2" style={{ backgroundColor: C.chip }}>
                    <p className="text-[10px] font-semibold uppercase" style={{ color: C.muted }}>
                      AT before
                    </p>
                    <p className="text-[13px] font-semibold" style={{ color: C.navy }}>
                      {formatWhenShort(route.atBefore)}
                    </p>
                  </div>
                ) : null}
                {route.terminalCutoffAt ? (
                  <div className="rounded-lg px-3 py-2" style={{ backgroundColor: C.chip }}>
                    <p className="text-[10px] font-semibold uppercase" style={{ color: C.muted }}>
                      Terminal cutoff
                    </p>
                    <p className="text-[13px] font-semibold" style={{ color: C.navy }}>
                      {formatWhenShort(route.terminalCutoffAt)}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {previous.length > 0 ? (
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPrevious((v) => !v)}
                  className="inline-flex items-center gap-1 text-[12px] font-medium"
                  style={{ color: C.badge }}
                >
                  {showPrevious ? 'Hide previous moves' : 'Display previous moves'}
                  <ChevronUp
                    className={cn('h-3.5 w-3.5 transition-transform', !showPrevious && 'rotate-180')}
                  />
                </button>
              </div>
            ) : null}

            {history.length === 0 ? (
              <p className="py-8 text-sm" style={{ color: C.sub }}>
                No completed moves for this reference yet.
              </p>
            ) : (
              <ol className="relative ms-3 border-s-2 ps-5" style={{ borderColor: C.border }}>
                {visibleRows.map((m) => {
                  const when = parseWhen(m.completedAt || m.occurredAt);
                  const move = m.move || m.label;
                  const tone = trackMilestoneTone(m);
                  const accent = toneColor(tone);
                  const ModeIcon = modeIcon(m.move, m.eventType);
                  const isActual = tone === 'complete' || Boolean(m.completedAt);
                  return (
                    <li key={m.id} className="relative pb-6 last:pb-0">
                      <span
                        className="absolute -start-[1.4rem] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white"
                        style={{ backgroundColor: accent }}
                      >
                        {isActual ? <Check className="h-3 w-3 text-white" strokeWidth={3} /> : null}
                      </span>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px]" style={{ color: C.sub }}>
                            {[m.location || '—', when?.date].filter(Boolean).join(' · ')}
                          </p>
                          <p className="mt-0.5 text-[14px] font-semibold" style={{ color: C.navy }}>
                            {move}
                          </p>
                          {m.vessel || m.voyage ? (
                            <p className="mt-1 text-[12px]" style={{ color: C.text }}>
                              {m.vessel}
                              {m.voyage ? (
                                <span className="ms-1 font-medium" style={{ color: C.badge }}>
                                  VOY {m.voyage}
                                </span>
                              ) : null}
                            </p>
                          ) : null}
                          {m.terminal ? (
                            <p className="mt-0.5 text-[11px]" style={{ color: C.muted }}>
                              {m.terminal}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <ModeIcon className="h-4 w-4" style={{ color: C.muted }} />
                          <span
                            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                            style={{
                              color: isActual ? C.green : C.muted,
                              backgroundColor: isActual ? '#DCFCE7' : C.chip,
                            }}
                          >
                            {isActual ? <Check className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                            {isActual ? 'Actual' : 'Planned'}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            {route?.portOfCall?.length ? (
              <div className="mt-6">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                  Port of call
                </p>
                <DataTable
                  emptyLabel="No port of call rows."
                  columns={[
                    {
                      key: 'role',
                      label: 'Role',
                      render: (r) => String(r.role ?? ''),
                    },
                    {
                      key: 'port',
                      label: 'Port',
                      render: (r) =>
                        [r.name, r.code ? `(${r.code})` : null].filter(Boolean).join(' '),
                    },
                    {
                      key: 'vessel',
                      label: 'Vessel',
                      render: (r) => String(r.vesselName ?? ''),
                    },
                    {
                      key: 'voyage',
                      label: 'Voyage',
                      render: (r) => String(r.voyageNumber ?? ''),
                    },
                    {
                      key: 'eta',
                      label: 'ETA',
                      render: (r) => formatTrackDateShort(String(r.eta ?? '')) || '',
                    },
                    {
                      key: 'ata',
                      label: 'ATA',
                      render: (r) => formatTrackDateShort(String(r.ata ?? '')) || '',
                    },
                    {
                      key: 'etd',
                      label: 'ETD',
                      render: (r) => formatTrackDateShort(String(r.etd ?? '')) || '',
                    },
                    {
                      key: 'atd',
                      label: 'ATD',
                      render: (r) => formatTrackDateShort(String(r.atd ?? '')) || '',
                    },
                  ]}
                  rows={route.portOfCall.map((p) => ({ ...p }))}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {/* VESSEL / FLIGHT */}
        {activeTab === 'vessel' ? (
          <div>
            {vesselRows.length === 0 ? (
              <p className="py-8 text-sm" style={{ color: C.sub }}>
                No vessel / flight data in this tracking payload.
              </p>
            ) : (
              <ul className="space-y-3">
                {vesselRows.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-xl border px-4 py-3"
                    style={{ borderColor: C.border }}
                  >
                    <div className="flex items-start gap-3">
                      <Ship className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.badge }} />
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold" style={{ color: C.navy }}>
                          {row.vessel || 'Vessel / Flight'}
                        </p>
                        {row.voyage ? (
                          <p className="text-[13px] font-medium" style={{ color: C.badge }}>
                            VOY {row.voyage}
                          </p>
                        ) : null}
                        {row.imo ? (
                          <p className="text-[12px]" style={{ color: C.muted }}>
                            IMO {row.imo}
                          </p>
                        ) : null}
                        {row.label ? (
                          <p className="mt-1 text-[12px]" style={{ color: C.sub }}>
                            {row.label}
                          </p>
                        ) : null}
                        <p className="mt-1 text-[12px]" style={{ color: C.muted }}>
                          {[
                            row.etd ? `ETD ${formatTrackDateShort(row.etd)}` : null,
                            row.eta ? `ETA ${formatTrackDateShort(row.eta)}` : null,
                          ]
                            .filter(Boolean)
                            .join(' · ') || '\u00A0'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {/* ETD / ETA HISTORY */}
        {activeTab === 'eta' ? (
          <div>
            {etaHistory.length === 0 ? (
              <p className="py-8 text-sm" style={{ color: C.sub }}>
                No ETD / ETA history available.
              </p>
            ) : (
              <ul>
                {etaHistory.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b py-3"
                    style={{ borderColor: C.rowBorder }}
                  >
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: C.navy }}>
                        {row.label}
                      </p>
                      {row.note ? (
                        <p className="text-[11px]" style={{ color: C.muted }}>
                          {row.note}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-[13px] font-medium" style={{ color: C.text }}>
                      {formatTrackDateShort(row.when) || '—'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {/* CARGO */}
        {activeTab === 'cargo' && hasCargo && cargoInfo ? (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                Arrival report status
              </p>
              <DataTable
                emptyLabel="No arrival report rows."
                columns={[
                  { key: 'status', label: 'Status', render: (r) => String(r.status ?? '') },
                  {
                    key: 'sending',
                    label: 'Sending time',
                    render: (r) => formatWhenShort(String(r.sendingTime ?? '')),
                  },
                  {
                    key: 'receipt',
                    label: 'Receipt time',
                    render: (r) => formatWhenShort(String(r.receiptTime ?? '')),
                  },
                  {
                    key: 'container',
                    label: 'Container no',
                    render: (r) => String(r.containerNo ?? ''),
                  },
                  {
                    key: 'sub',
                    label: 'Sub container no',
                    render: (r) => String(r.subContainerNo ?? ''),
                  },
                  {
                    key: 'vessel',
                    label: 'Vessel',
                    render: (r) => String(r.vesselName ?? ''),
                  },
                  {
                    key: 'voyage',
                    label: 'Voyage no',
                    render: (r) => String(r.voyageNo ?? ''),
                  },
                  { key: 'imo', label: 'IMO', render: (r) => String(r.imo ?? '') },
                ]}
                rows={cargoInfo.arrivalReport.map((r) => ({ ...r }))}
              />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                Customs status
              </p>
              <DataTable
                emptyLabel="No customs status rows."
                columns={[
                  {
                    key: 'carrier',
                    label: 'Carrier operator',
                    render: (r) => String(r.carrierOperator ?? ''),
                  },
                  {
                    key: 'released',
                    label: 'Customs released',
                    render: (r) =>
                      r.customsReleased == null ? '' : r.customsReleased ? 'Yes' : 'No',
                  },
                  {
                    key: 'sub',
                    label: 'Sub customs no',
                    render: (r) => String(r.subCustomsNo ?? ''),
                  },
                  {
                    key: 'qty',
                    label: 'Quantity',
                    render: (r) => (r.quantity != null ? String(r.quantity) : ''),
                  },
                  {
                    key: 'weight',
                    label: 'Weight',
                    render: (r) => (r.weight != null ? String(r.weight) : ''),
                  },
                  {
                    key: 'volume',
                    label: 'Volume',
                    render: (r) => (r.volume != null ? String(r.volume) : ''),
                  },
                  {
                    key: 'decl',
                    label: 'Declaration no',
                    render: (r) => String(r.customsDeclarationNo ?? ''),
                  },
                  {
                    key: 'insp',
                    label: 'Inspection status',
                    render: (r) => String(r.customsInspectionStatus ?? ''),
                  },
                  {
                    key: 'inspTime',
                    label: 'Inspection time',
                    render: (r) => formatWhenShort(String(r.customsInspectionTime ?? '')),
                  },
                ]}
                rows={cargoInfo.customsStatus.map((r) => ({ ...r }))}
              />
            </div>
            {Object.keys(cargoInfo.detailedData).length ? (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                  Detailed data
                </p>
                <DetailDataList data={cargoInfo.detailedData} />
              </div>
            ) : null}
          </div>
        ) : null}

        {activeTab === 'pre_manifest' && hasPreManifest ? (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
              Manifest status
            </p>
            <DataTable
              emptyLabel="No pre-manifest rows."
              columns={[
                {
                  key: 'sub',
                  label: 'Sub customs no',
                  render: (r) => String(r.subCustomsNo ?? ''),
                },
                { key: 'status', label: 'Status', render: (r) => String(r.status ?? '') },
                {
                  key: 'sending',
                  label: 'Sending time',
                  render: (r) => formatWhenShort(String(r.sendingTime ?? '')),
                },
                {
                  key: 'receipt',
                  label: 'Receipt / receiving',
                  render: (r) => formatWhenShort(String(r.receiptReceivingTime ?? '')),
                },
                {
                  key: 'container',
                  label: 'Container no',
                  render: (r) => String(r.containerNo ?? ''),
                },
                {
                  key: 'vessel',
                  label: 'Vessel',
                  render: (r) => String(r.vesselName ?? ''),
                },
                {
                  key: 'voyage',
                  label: 'Voyage no',
                  render: (r) => String(r.voyageNo ?? ''),
                },
                { key: 'imo', label: 'IMO', render: (r) => String(r.imo ?? '') },
              ]}
              rows={preManifest.map((r) => ({ ...r }))}
            />
          </div>
        ) : null}

        {activeTab === 'qty' && hasQty && qtyGwVol ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: 'QTY', value: qtyGwVol.qty },
                { label: 'G.W.', value: qtyGwVol.gw },
                {
                  label: 'N.W.',
                  value:
                    qtyGwVol.netWeight != null
                      ? `${qtyGwVol.netWeight}${qtyGwVol.weightUnit ? ` ${qtyGwVol.weightUnit}` : ''}`
                      : undefined,
                },
                { label: 'VOL.', value: qtyGwVol.vol },
                {
                  label: 'Chg. wt',
                  value:
                    qtyGwVol.chargeableWeight != null
                      ? `${qtyGwVol.chargeableWeight}${qtyGwVol.weightUnit ? ` ${qtyGwVol.weightUnit}` : ''}`
                      : undefined,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl px-3 py-3"
                  style={{ backgroundColor: C.chip }}
                >
                  <p className="text-[10px] font-semibold uppercase" style={{ color: C.muted }}>
                    {item.label}
                  </p>
                  <p className="mt-1 text-[18px] font-bold" style={{ color: C.navy }}>
                    {item.value || '—'}
                  </p>
                </div>
              ))}
            </div>
            {qtyGwVol.lines.length ? (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                  Lines
                </p>
                <DetailDataList
                  data={Object.fromEntries(
                    qtyGwVol.lines.map((line, i) => [
                      `line_${i + 1}`,
                      Object.entries(line)
                        .map(([k, v]) => `${k}: ${String(v ?? '')}`)
                        .join(' · '),
                    ]),
                  )}
                />
              </div>
            ) : null}
            {Object.keys(qtyGwVol.extras).length ? (
              <DetailDataList data={qtyGwVol.extras} />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
