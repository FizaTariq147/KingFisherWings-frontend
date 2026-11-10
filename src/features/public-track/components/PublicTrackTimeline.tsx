import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  Anchor,
  ArrowLeft,
  Check,
  ChevronUp,
  Clock3,
  Container,
  Leaf,
  MapPin,
  Plane,
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
import { LiveTrackingCard } from './LiveTrackingCard';
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

function formatDetailValue(value: unknown): string {
  if (value == null || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Y' : 'N';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return '-';
  }
}

function humanizeDetailKey(key: string): string {
  return key
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** YQN-style dense 3-column label/value grid for Detailed Data. */
function YqnDetailDataGrid({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([, v]) => v != null && v !== '');
  if (!entries.length) {
    return (
      <div
        className="flex items-center justify-center border py-10 text-[13px]"
        style={{ borderColor: C.border, color: C.sub, backgroundColor: '#FAFBFC' }}
      >
        No Data
      </div>
    );
  }
  return (
    <div
      className="grid grid-cols-1 gap-x-6 gap-y-3 border p-3 sm:grid-cols-2 lg:grid-cols-3"
      style={{ borderColor: C.border }}
    >
      {entries.map(([key, value]) => (
        <div key={key} className="min-w-0 border-b border-dashed pb-2" style={{ borderColor: C.rowBorder }}>
          <p className="text-[11px]" style={{ color: C.muted }}>
            {humanizeDetailKey(key)}
          </p>
          <p className="mt-0.5 break-words text-[13px] font-medium" style={{ color: C.navy }}>
            {formatDetailValue(value)}
          </p>
        </div>
      ))}
    </div>
  );
}

function YqnSectionTitle({ children }: { children: string }) {
  return (
    <p
      className="mb-2 border-l-[3px] pl-2 text-[13px] font-semibold"
      style={{ borderColor: C.badge, color: C.navy }}
    >
      {children}
    </p>
  );
}

/** YQN-style bordered data table — headers always visible; empty → centered No Data. */
function YqnDataTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string; render: (row: Record<string, unknown>) => string }[];
  rows: Record<string, unknown>[];
}) {
  return (
    <div className="overflow-x-auto border" style={{ borderColor: C.border }}>
      <table className="min-w-full border-collapse text-left text-[12px]">
        <thead>
          <tr style={{ backgroundColor: '#F5F7FA' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap border-b px-2.5 py-2.5 font-semibold"
                style={{ borderColor: C.border, color: C.sub }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-2.5 py-10 text-center text-[13px]"
                style={{ color: C.sub }}
              >
                No Data
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={String(row.id ?? i)}
                style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFBFC' }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="whitespace-nowrap border-b px-2.5 py-2.5"
                    style={{ borderColor: C.rowBorder, color: C.text }}
                  >
                    {col.render(row) || '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function dashWhen(value?: string | null): string {
  if (!value?.trim()) return '-';
  const formatted = formatWhenShort(value);
  return formatted === '—' ? '-' : formatted;
}

function buildTrackPrintHtml(result: PublicTrackResult, status: string): string {
  const history = (result.milestones ?? []).filter((m) => trackMilestoneTone(m) !== 'pending');
  const rows = history
    .map((m) => {
      const when = parseWhen(m.completedAt || m.occurredAt);
      const move = m.move || m.label || '—';
      const descText = m.description || m.summary;
      const desc = descText
        ? `<div style="font-weight:400;color:#64748b;margin-top:2px">${descText}</div>`
        : '';
      const loc = [m.location, m.terminal].filter(Boolean).join('<br/>') || '—';
      const vessel =
        [m.flightNumber ? `FLT ${m.flightNumber}` : null, m.vessel, m.voyage ? `(${m.voyage})` : null]
          .filter(Boolean)
          .join(' ') || '';
      return `<tr><td>${when ? `${when.date}<br/>${when.time}` : '—'}</td><td><strong>${move}</strong>${desc}</td><td>${loc}</td><td>${vessel}</td></tr>`;
    })
    .join('');

  return `<!doctype html><html><head><title>Tracking ${result.reference}</title>
<style>body{font-family:system-ui,sans-serif;padding:24px;color:#0A2942}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #E2E8F0;padding:8px;text-align:left;font-size:12px}</style>
</head><body>
<h1>Track & Trace — ${result.reference}</h1>
<p>Status: ${status || '—'}</p>
<table><thead><tr><th>Date</th><th>Milestone</th><th>Location</th><th>Vessel / Flight</th></tr></thead><tbody>${rows}</tbody></table>
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
  // Tick so ATD→ETA progress advances between live refreshes.
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [result.reference]);
  const metrics = useMemo(() => computeTrackMetrics(result, nowMs), [result, nowMs]);
  const route = result.route;
  const cargoInfo = result.cargoInfo;
  const preManifest = result.preManifest ?? [];
  const qtyGwVol = result.qtyGwVol;

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

  const isAir = /AIR|COURIER/i.test(String(result.jobType ?? ''));

  const vesselRows = useMemo(() => {
    type VesselFlightRow = {
      id: string;
      vessel?: string;
      voyage?: string;
      flightNumber?: string;
      arrivalFlightNumber?: string;
      mawbNumber?: string;
      hawbNumber?: string;
      imo?: string;
      label?: string;
      etd?: string;
      eta?: string;
      air?: boolean;
    };

    const fromLegs = (route?.legs ?? [])
      .filter(
        (l) =>
          l.vessel ||
          l.voyage ||
          l.imo ||
          l.flightNumber ||
          l.arrivalFlightNumber ||
          l.mawbNumber ||
          l.hawbNumber,
      )
      .map((l, i): VesselFlightRow => ({
        id: l.id || `leg-${i}`,
        vessel: l.vessel,
        voyage: l.voyage,
        flightNumber: l.flightNumber,
        arrivalFlightNumber: l.arrivalFlightNumber,
        mawbNumber: l.mawbNumber,
        hawbNumber: l.hawbNumber,
        imo: l.imo,
        label: l.label || [l.from, l.to].filter(Boolean).join(' → '),
        etd: l.etd,
        eta: l.eta,
        air: isAir || Boolean(l.flightNumber || l.mawbNumber || l.hawbNumber),
      }));
    if (fromLegs.length) return fromLegs;

    if (
      isAir &&
      (result.flightNumber || result.mawbNumber || result.hawbNumber || result.arrivalFlightNumber)
    ) {
      return [
        {
          id: 'air-top',
          vessel: route?.legs?.[0]?.vessel,
          flightNumber: result.flightNumber,
          arrivalFlightNumber: result.arrivalFlightNumber,
          mawbNumber: result.mawbNumber,
          hawbNumber: result.hawbNumber,
          label: [result.origin, result.destination].filter(Boolean).join(' → '),
          etd: metrics.etd,
          eta: metrics.eta,
          air: true,
        },
      ];
    }

    const fromPoc = (route?.portOfCall ?? [])
      .filter((p) => p.vesselName || p.voyageNumber || p.flightNumber)
      .map((p, i): VesselFlightRow => ({
        id: p.id || `poc-v-${i}`,
        vessel: p.vesselName,
        voyage: p.voyageNumber,
        flightNumber: p.flightNumber,
        arrivalFlightNumber: p.arrivalFlightNumber,
        mawbNumber: p.mawbNumber,
        hawbNumber: p.hawbNumber,
        imo: undefined,
        label: [p.role, p.name].filter(Boolean).join(' · '),
        etd: p.etd,
        eta: p.eta,
        air: isAir || Boolean(p.flightNumber),
      }));
    if (fromPoc.length) return fromPoc;
    const seen = new Set<string>();
    const fromMoves: VesselFlightRow[] = [];
    for (const m of history) {
      if (!m.vessel && !m.voyage && !m.flightNumber) continue;
      const key = `${m.vessel ?? ''}|${m.voyage ?? ''}|${m.flightNumber ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      fromMoves.push({
        id: m.id,
        vessel: m.vessel,
        voyage: m.voyage,
        flightNumber: m.flightNumber,
        mawbNumber: m.mawbNumber,
        hawbNumber: m.hawbNumber,
        imo: undefined,
        label: m.location || m.move || m.label,
        etd: undefined,
        eta: undefined,
        air: isAir || Boolean(m.flightNumber),
      });
    }
    return fromMoves;
  }, [
    route?.legs,
    route?.portOfCall,
    history,
    isAir,
    result.flightNumber,
    result.mawbNumber,
    result.hawbNumber,
    result.arrivalFlightNumber,
    result.origin,
    result.destination,
    metrics.etd,
    metrics.eta,
  ]);

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
    // YQN layout: Cargo Info / Pre-manifest / QTY always present (empty → No Data).
    return [
      { id: 'route' as const, label: 'Route', count: history.length || undefined },
      { id: 'vessel' as const, label: 'Vessel/Flight', count: vesselRows.length || undefined },
      { id: 'eta' as const, label: 'ETD / ETA History', count: etaHistory.length || undefined },
      { id: 'cargo' as const, label: 'Cargo Info' },
      {
        id: 'pre_manifest' as const,
        label: 'Pre-manifest',
        count: preManifest.length || undefined,
      },
      { id: 'qty' as const, label: 'QTY/G.W./VOL' },
    ];
  }, [history.length, vesselRows.length, etaHistory.length, preManifest.length]);

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
  const progressPct = Math.max(0, Math.min(100, metrics.progressPct));

  const isOverlay = variant === 'overlay';

  return (
    <div
      className={cn(
        'flex w-full flex-col bg-white text-[#1E293B]',
        // Overlay card: one continuous top→bottom scroll (header + tabs + body).
        isOverlay &&
          'track-overlay-scrollbar h-full min-h-0 max-h-full overflow-y-auto overscroll-contain rounded-2xl shadow-2xl',
        !isOverlay && 'overflow-hidden',
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

        {result.liveTracking ? (
          <div className="mt-4">
            <LiveTrackingCard card={result.liveTracking} className="px-3 py-2.5 shadow-none" />
          </div>
        ) : null}

        {/* POL → POD progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between gap-3 text-[13px] font-semibold" style={{ color: C.navy }}>
            <span className="min-w-0 truncate">{originLabel}</span>
            <span className="min-w-0 truncate text-right">{destLabel}</span>
          </div>
          <div className="relative mt-3 h-1.5 rounded-full" style={{ backgroundColor: C.chip }}>
            <div
              className="absolute left-0 top-0 h-1.5 rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${C.green}, ${C.badge})`,
              }}
            />
            <span
              className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white shadow transition-[left] duration-700 ease-out"
              style={{
                left:
                  progressPct <= 0
                    ? '0px'
                    : progressPct >= 100
                      ? 'calc(100% - 14px)'
                      : `calc(${progressPct}% - 7px)`,
                backgroundColor: metrics.delivered ? C.green : C.badge,
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

      {/* Body — overlay scrolls on the whole card; panel keeps an inner scroll region */}
      <div
        className={cn(
          'px-4 py-4 sm:px-5',
          isOverlay ? 'shrink-0' : 'min-h-0 flex-1 overflow-y-auto',
        )}
      >
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

            {(result.containers?.length ?? 0) > 0 ? (
              <div className="mb-5 space-y-2">
                <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
                  Containers
                </p>
                <ul className="space-y-1.5">
                  {result.containers!.map((c) => (
                    <li
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2"
                      style={{ backgroundColor: C.chip }}
                    >
                      <span className="text-[13px] font-semibold" style={{ color: C.navy }}>
                        {c.containerNumber || '—'}
                        {c.containerType ? (
                          <span className="ms-2 text-[11px] font-medium" style={{ color: C.sub }}>
                            {c.containerType}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-[11px] font-medium" style={{ color: C.sub }}>
                        {[c.kind, c.statusLabel || c.status].filter(Boolean).join(' · ') || '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

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
                          {m.description || m.summary ? (
                            <p className="mt-1 text-[12px] leading-snug" style={{ color: C.sub }}>
                              {m.description || m.summary}
                            </p>
                          ) : null}
                          {m.flightNumber || m.mawbNumber || m.hawbNumber ? (
                            <p className="mt-1 text-[12px]" style={{ color: C.text }}>
                              {[
                                m.flightNumber ? `FLT ${m.flightNumber}` : null,
                                m.mawbNumber ? `MAWB ${m.mawbNumber}` : null,
                                m.hawbNumber ? `HAWB ${m.hawbNumber}` : null,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          ) : m.vessel || m.voyage ? (
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
                            {m.containerNumber
                              ? m.containerNumber
                              : isActual
                                ? 'Done'
                                : 'Pending'}
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
                <YqnDataTable
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
                      label: isAir ? 'Flight' : 'Vessel',
                      render: (r) =>
                        String(
                          (isAir
                            ? r.flightNumber || r.arrivalFlightNumber
                            : r.vesselName) ?? '',
                        ),
                    },
                    {
                      key: 'voyage',
                      label: isAir ? 'MAWB / HAWB' : 'Voyage',
                      render: (r) =>
                        isAir
                          ? [r.mawbNumber, r.hawbNumber].filter(Boolean).join(' / ')
                          : String(r.voyageNumber ?? ''),
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
                      {row.air || row.flightNumber ? (
                        <Plane className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.badge }} />
                      ) : (
                        <Ship className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.badge }} />
                      )}
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold" style={{ color: C.navy }}>
                          {row.flightNumber
                            ? `Flight ${row.flightNumber}`
                            : row.vessel || 'Vessel / Flight'}
                        </p>
                        {row.flightNumber && row.vessel ? (
                          <p className="text-[13px]" style={{ color: C.text }}>
                            {row.vessel}
                          </p>
                        ) : null}
                        {row.arrivalFlightNumber ? (
                          <p className="text-[13px] font-medium" style={{ color: C.badge }}>
                            Arrival FLT {row.arrivalFlightNumber}
                          </p>
                        ) : null}
                        {row.mawbNumber || row.hawbNumber ? (
                          <p className="text-[13px]" style={{ color: C.text }}>
                            {[
                              row.mawbNumber ? `MAWB ${row.mawbNumber}` : null,
                              row.hawbNumber ? `HAWB ${row.hawbNumber}` : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        ) : null}
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

        {/* CARGO INFO — YQN layout */}
        {activeTab === 'cargo' ? (
          <div className="space-y-5">
            {result.containerNumber || result.currentStatus ? (
              <div
                className="inline-flex flex-wrap items-center gap-2 rounded-sm border px-3 py-1.5 text-[13px] font-medium"
                style={{ borderColor: C.border, backgroundColor: '#F5F7FA', color: C.navy }}
              >
                <Container className="h-3.5 w-3.5" style={{ color: C.badge }} />
                <span>{result.containerNumber || '—'}</span>
                {result.currentStatus || result.status ? (
                  <>
                    <span style={{ color: C.muted }}>|</span>
                    <span style={{ color: C.sub }}>
                      {formatStatusLabel(result.currentStatus || result.status)
                        .toLowerCase()
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </>
                ) : null}
              </div>
            ) : null}

            <div>
              <YqnSectionTitle>Arrival Report Status</YqnSectionTitle>
              <YqnDataTable
                columns={[
                  { key: 'status', label: 'Status', render: (r) => String(r.status ?? '') },
                  {
                    key: 'sending',
                    label: 'Sending Time',
                    render: (r) => dashWhen(String(r.sendingTime ?? '')),
                  },
                  {
                    key: 'receipt',
                    label: 'Receipt Receiving Time',
                    render: (r) => dashWhen(String(r.receiptTime ?? '')),
                  },
                  {
                    key: 'container',
                    label: 'Container No.',
                    render: (r) => String(r.containerNo ?? ''),
                  },
                  {
                    key: 'sub',
                    label: 'Sub Customs No.',
                    render: (r) => String(r.subContainerNo ?? ''),
                  },
                  {
                    key: 'vessel',
                    label: 'Vessel Name',
                    render: (r) => String(r.vesselName ?? ''),
                  },
                  {
                    key: 'voyage',
                    label: 'Voyage No.',
                    render: (r) => String(r.voyageNo ?? ''),
                  },
                  { key: 'imo', label: 'IMO', render: (r) => String(r.imo ?? '') },
                ]}
                rows={(cargoInfo?.arrivalReport ?? []).map((r) => ({ ...r }))}
              />
            </div>

            <div>
              <YqnSectionTitle>Customs Status</YqnSectionTitle>
              <YqnDataTable
                columns={[
                  {
                    key: 'carrier',
                    label: 'Carrier Operator',
                    render: (r) => String(r.carrierOperator ?? ''),
                  },
                  {
                    key: 'released',
                    label: 'Customs Released',
                    render: (r) =>
                      r.customsReleased == null
                        ? ''
                        : r.customsReleased
                          ? 'Y (Customs Declared)'
                          : 'N',
                  },
                  {
                    key: 'sub',
                    label: 'Sub Customs No.',
                    render: (r) => String(r.subCustomsNo ?? ''),
                  },
                  {
                    key: 'qty',
                    label: 'Quantity',
                    render: (r) => (r.quantity != null ? String(r.quantity) : ''),
                  },
                  {
                    key: 'weight',
                    label: 'Weight(KG)',
                    render: (r) => (r.weight != null ? String(r.weight) : ''),
                  },
                  {
                    key: 'volume',
                    label: 'Volume(m³)',
                    render: (r) => (r.volume != null ? String(r.volume) : ''),
                  },
                  {
                    key: 'decl',
                    label: 'Customs declaration No.',
                    render: (r) => String(r.customsDeclarationNo ?? ''),
                  },
                  {
                    key: 'insp',
                    label: 'Customs inspection status',
                    render: (r) => String(r.customsInspectionStatus ?? ''),
                  },
                  {
                    key: 'inspTime',
                    label: 'Customs inspection time',
                    render: (r) => dashWhen(String(r.customsInspectionTime ?? '')),
                  },
                ]}
                rows={(cargoInfo?.customsStatus ?? []).map((r) => ({ ...r }))}
              />
            </div>

            <div>
              <YqnSectionTitle>Detailed Data</YqnSectionTitle>
              <YqnDetailDataGrid data={cargoInfo?.detailedData ?? {}} />
            </div>
          </div>
        ) : null}

        {/* PRE-MANIFEST — YQN layout */}
        {activeTab === 'pre_manifest' ? (
          <div className="space-y-5">
            <div>
              <YqnSectionTitle>Manifest Status</YqnSectionTitle>
              <YqnDataTable
                columns={[
                  {
                    key: 'sub',
                    label: 'Sub Customs No.',
                    render: (r) => String(r.subCustomsNo ?? ''),
                  },
                  { key: 'status', label: 'Status', render: (r) => String(r.status ?? '') },
                  {
                    key: 'sending',
                    label: 'Sending Time',
                    render: (r) => dashWhen(String(r.sendingTime ?? '')),
                  },
                  {
                    key: 'receipt',
                    label: 'Receipt Receiving Time',
                    render: (r) => dashWhen(String(r.receiptReceivingTime ?? '')),
                  },
                  {
                    key: 'container',
                    label: 'Container No.',
                    render: (r) => String(r.containerNo ?? ''),
                  },
                  {
                    key: 'vessel',
                    label: 'Vessel Name',
                    render: (r) => String(r.vesselName ?? ''),
                  },
                  {
                    key: 'voyage',
                    label: 'Voyage No.',
                    render: (r) => String(r.voyageNo ?? ''),
                  },
                  { key: 'imo', label: 'IMO', render: (r) => String(r.imo ?? '') },
                ]}
                rows={preManifest.map((r) => ({ ...r }))}
              />
            </div>
          </div>
        ) : null}

        {/* QTY / G.W. / VOL — YQN layout */}
        {activeTab === 'qty' ? (
          <div className="space-y-5">
            <div>
              <YqnSectionTitle>QTY / G.W. / VOL</YqnSectionTitle>
              <YqnDataTable
                columns={[
                  {
                    key: 'qty',
                    label: `Quantity${qtyGwVol?.qtyUnit ? ` (${qtyGwVol.qtyUnit})` : ''}`,
                    render: (r) => String(r.quantity ?? ''),
                  },
                  {
                    key: 'gw',
                    label: `Gross Weight${qtyGwVol?.weightUnit ? `(${qtyGwVol.weightUnit})` : '(KG)'}`,
                    render: (r) => String(r.grossWeight ?? ''),
                  },
                  {
                    key: 'nw',
                    label: `Net Weight${qtyGwVol?.weightUnit ? `(${qtyGwVol.weightUnit})` : '(KG)'}`,
                    render: (r) => String(r.netWeight ?? ''),
                  },
                  {
                    key: 'vol',
                    label: `Volume${qtyGwVol?.volumeUnit ? `(${qtyGwVol.volumeUnit})` : '(m³)'}`,
                    render: (r) => String(r.volume ?? ''),
                  },
                  {
                    key: 'cw',
                    label: `Chargeable Weight${qtyGwVol?.weightUnit ? `(${qtyGwVol.weightUnit})` : '(KG)'}`,
                    render: (r) => String(r.chargeableWeight ?? ''),
                  },
                ]}
                rows={
                  hasQty && qtyGwVol
                    ? [
                        {
                          id: 'qty-summary',
                          quantity: qtyGwVol.quantity ?? qtyGwVol.qty ?? '',
                          grossWeight: qtyGwVol.grossWeight ?? qtyGwVol.gw ?? '',
                          netWeight: qtyGwVol.netWeight ?? '',
                          volume: qtyGwVol.volume ?? qtyGwVol.vol ?? '',
                          chargeableWeight: qtyGwVol.chargeableWeight ?? '',
                        },
                      ]
                    : []
                }
              />
            </div>
            {qtyGwVol && qtyGwVol.lines.length > 0 ? (
              <div>
                <YqnSectionTitle>Lines</YqnSectionTitle>
                <YqnDataTable
                  columns={Array.from(
                    qtyGwVol.lines.reduce((keys, line) => {
                      Object.keys(line).forEach((k) => keys.add(k));
                      return keys;
                    }, new Set<string>()),
                  ).map((key) => ({
                    key,
                    label: humanizeDetailKey(key),
                    render: (r) => formatDetailValue(r[key]),
                  }))}
                  rows={qtyGwVol.lines.map((line, i) => ({ id: `line-${i}`, ...line }))}
                />
              </div>
            ) : null}
            {qtyGwVol && Object.keys(qtyGwVol.extras).length > 0 ? (
              <div>
                <YqnSectionTitle>Additional</YqnSectionTitle>
                <YqnDetailDataGrid data={qtyGwVol.extras} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
