import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronUp,
  Clock3,
  Container,
  MapPin,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { appType } from '@/lib/erpTypography';
import { cn } from '@/lib/utils';
import type { PublicTrackMilestone, PublicTrackResult } from '../types/publicTrack.types';

/** Reference palette (rail / badges) — title uses system appType */
const C = {
  navy: '#0A2942',
  badge: '#1E7AB8',
  line: '#0A2942',
  red: '#E31B23',
  muted: '#8B95A1',
  text: '#1E293B',
  sub: '#64748B',
  chip: '#EEF1F4',
  border: '#D8DEE6',
  rowBorder: '#EEF2F6',
} as const;

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

function legBadge(code: string): string {
  const u = code.toUpperCase();
  if (u === 'POL' || u === 'ORIGIN') return 'POL';
  if (u === 'POD' || u === 'DEST' || u === 'DESTINATION') return 'POD';
  if (u === 'PTS' || u === 'TS' || u === 'TRANSSHIPMENT') return 'PTS';
  return u.slice(0, 3) || 'PTS';
}

function buildTrackPrintHtml(result: PublicTrackResult, status: string): string {
  const history = result.milestones ?? [];
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
    <style>
      @page { margin: 16mm; }
      body{font-family:Arial,Helvetica,sans-serif;color:${C.navy};padding:28px;margin:0}
      h1{font-size:20px;margin:0;color:#1E293B;font-weight:500;display:inline-block}
      .badge{display:inline-block;background:${C.badge};color:#fff;padding:6px 12px;border-radius:999px;font-size:11px;font-weight:700;margin-left:12px;vertical-align:middle}
      .meta{color:${C.text};font-size:14px;margin:12px 0 20px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th,td{border-bottom:1px solid #E5E7EB;padding:10px 8px;text-align:left;vertical-align:top}
      th{color:${C.muted};font-size:11px;text-transform:uppercase;letter-spacing:.06em}
      .note{color:${C.sub};font-size:11px;margin-top:14px}
    </style></head><body>
    <div><h1>Tracking details</h1>${status ? `<span class="badge">${status}</span>` : ''}</div>
    <p class="meta">Container <strong>${result.containerNumber || '—'}</strong>${
      result.containerType ? ` &nbsp; ${result.containerType}` : ''
    } &nbsp;·&nbsp; Ref ${result.reference}</p>
    <table><thead><tr><th>Date</th><th>Moves</th><th>Location/Terminal</th><th>Vessel (Voyage)</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="4">No history</td></tr>'}</tbody></table>
    <p class="note">Times reflected are local Times</p>
    </body></html>`;
}

/** Print via hidden iframe — avoids popup blockers that break window.open(). */
function exportPdf(result: PublicTrackResult, status: string) {
  const html = buildTrackPrintHtml(result, status);

  const cleanupExisting = document.getElementById('track-export-print-frame');
  cleanupExisting?.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'track-export-print-frame';
  iframe.setAttribute('title', 'Track export');
  // Non-zero size helps some browsers render before print; keep off-screen.
  iframe.style.cssText =
    'position:fixed;top:0;left:0;width:800px;height:1100px;border:0;opacity:0;pointer-events:none;z-index:-1';
  document.body.appendChild(iframe);

  const cleanup = () => {
    window.setTimeout(() => {
      try {
        iframe.remove();
      } catch {
        /* ignore */
      }
    }, 1500);
  };

  const triggerPrint = () => {
    const win = iframe.contentWindow;
    if (!win) {
      cleanup();
      return;
    }
    try {
      win.focus();
      win.print();
    } finally {
      cleanup();
    }
  };

  iframe.onload = () => {
    window.setTimeout(triggerPrint, 150);
  };

  // srcdoc avoids document.write quirks / CSP issues with about:blank
  try {
    iframe.srcdoc = html;
  } catch {
    const win = iframe.contentWindow;
    const doc = win?.document;
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
}

/**
 * Shared Track & Trace details UI — public / portal / admin.
 * Visual contract matches the product reference (status, container, POL–POD rail, history).
 */
export function PublicTrackTimeline({
  result,
  onNewSearch,
  className,
}: {
  result: PublicTrackResult;
  onNewSearch?: () => void;
  className?: string;
  /** @deprecated Ignored — same chrome everywhere. */
  compact?: boolean;
}) {
  const [showPrevious, setShowPrevious] = useState(false);

  const status = formatStatusLabel(result.currentStatus || result.status);
  const legs = result.progressLegs ?? [];
  const history = result.milestones ?? [];

  const { latest, previous } = useMemo(() => {
    if (history.length <= 1) return { latest: history, previous: [] as PublicTrackMilestone[] };
    return { latest: history.slice(0, 1), previous: history.slice(1) };
  }, [history]);

  const visibleRows = showPrevious ? history : latest;

  return (
    <div className={cn('w-full bg-white text-[#1E293B]', className)}>
      {/* —— Header —— */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className={cn(appType.pageTitle, 'leading-none')}>Tracking details</h2>
            {status ? (
              <span
                className="inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.03em] text-white"
                style={{ backgroundColor: C.badge }}
              >
                {status}
              </span>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]">
            <span style={{ color: C.text }}>
              Container{' '}
              <strong className="font-bold" style={{ color: C.navy }}>
                {result.containerNumber || '—'}
              </strong>
            </span>
            {result.containerType ? (
              <span
                className="inline-flex items-center gap-1.5 font-semibold"
                style={{ color: C.navy }}
              >
                <Container className="h-4 w-4" style={{ color: C.red }} strokeWidth={2.25} aria-hidden />
                {result.containerType}
              </span>
            ) : null}
            {onNewSearch ? (
              <button
                type="button"
                onClick={onNewSearch}
                className="text-[14px] font-medium hover:underline"
                style={{ color: C.badge }}
              >
                New search
              </button>
            ) : null}
          </div>
          {result.containers && result.containers.length > 1 ? (
            <ul className="mt-2 flex flex-wrap gap-2 text-[12px]" style={{ color: C.sub }}>
              {result.containers.map((c) => (
                <li
                  key={c.id}
                  className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1"
                  style={{ backgroundColor: C.chip, border: `1px solid ${C.border}` }}
                >
                  <span className="font-semibold" style={{ color: C.navy }}>
                    {c.containerNumber || 'Container'}
                  </span>
                  {c.statusLabel || c.status ? (
                    <span className="uppercase tracking-wide">
                      {formatStatusLabel(c.statusLabel || c.status)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : result.containers?.[0]?.statusLabel || result.containers?.[0]?.status ? (
            <p className="mt-1 text-[12px]" style={{ color: C.sub }}>
              Status{' '}
              <span className="font-semibold uppercase tracking-wide" style={{ color: C.navy }}>
                {formatStatusLabel(
                  result.containers[0].statusLabel || result.containers[0].status,
                )}
              </span>
            </p>
          ) : null}
        </div>

        <Button
          type="button"
          onClick={() => exportPdf(result, status)}
          className="h-10 shrink-0 px-5"
        >
          Export PDF
        </Button>
      </div>

      {result.matches && result.matches.length > 1 ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
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

      {/* —— Progress rail —— */}
      {legs.length > 0 ? (
        <div className="mt-10 overflow-x-auto pb-1">
          <div
            className="relative mx-auto px-2"
            style={{ minWidth: Math.max(640, legs.length * 130) }}
          >
            <div
              className="absolute left-10 right-10 top-[44px] h-[3px]"
              style={{ backgroundColor: C.line }}
            />
            <ol className="relative flex w-full items-start justify-between">
              {legs.map((leg, index) => {
                const isLast = index === legs.length - 1;
                return (
                  <li
                    key={leg.id}
                    className="relative z-[1] flex flex-1 flex-col items-center"
                  >
                    <span
                      className="mb-2 rounded-[3px] px-1.5 py-[3px] text-[9px] font-bold uppercase leading-none tracking-wide"
                      style={{ backgroundColor: C.chip, color: C.muted }}
                    >
                      {legBadge(leg.code)}
                    </span>
                    {isLast ? (
                      <span className="-mt-1 flex h-6 w-6 items-center justify-center bg-white">
                        <MapPin
                          className="h-[22px] w-[22px]"
                          style={{ color: C.red }}
                          fill={C.red}
                          aria-hidden
                        />
                      </span>
                    ) : (
                      <span
                        className="mt-1 h-3.5 w-3.5 rounded-full ring-[3px] ring-white"
                        style={{ backgroundColor: C.red }}
                      />
                    )}
                    <p
                      className="mt-2.5 max-w-[8.5rem] text-center text-[11px] font-bold uppercase leading-snug"
                      style={{ color: C.text }}
                    >
                      {leg.name}
                      {leg.country ? ` (${leg.country})` : ''}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      ) : null}

      {/* —— History table —— */}
      <div className="mt-10">
        <div
          className="grid grid-cols-1 gap-2 border-b pb-2 sm:grid-cols-[1.15fr_1.15fr_1.35fr_1fr] sm:gap-3"
          style={{ borderColor: C.border }}
        >
          {['Date', 'Moves', 'Location/Terminal', 'Vessel (Voyage)'].map((h) => (
            <div
              key={h}
              className="hidden text-[11px] font-semibold uppercase tracking-[0.08em] sm:block"
              style={{ color: C.muted }}
            >
              {h}
            </div>
          ))}
        </div>

        {previous.length > 0 ? (
          <div
            className="flex justify-end border-b py-2.5"
            style={{ borderColor: C.rowBorder }}
          >
            <button
              type="button"
              onClick={() => setShowPrevious((v) => !v)}
              className="inline-flex items-center gap-1 text-[13px] font-medium"
              style={{ color: C.badge }}
            >
              {showPrevious ? 'Hide previous moves' : 'Display Previous Moves'}
              <ChevronUp
                className={cn('h-4 w-4 transition-transform', !showPrevious && 'rotate-180')}
                aria-hidden
              />
            </button>
          </div>
        ) : null}

        {history.length === 0 ? (
          <p className="py-8 text-sm" style={{ color: C.sub }}>
            No history returned for this reference yet.
          </p>
        ) : (
          <ul>
            {visibleRows.map((m) => {
              const when = parseWhen(m.completedAt || m.occurredAt);
              const move = m.move || m.label;
              const vesselLine = [m.vessel, m.voyage ? `(${m.voyage})` : null]
                .filter(Boolean)
                .join(' ');
              return (
                <li
                  key={m.id}
                  className="grid grid-cols-1 gap-3 border-b py-4 sm:grid-cols-[1.15fr_1.15fr_1.35fr_1fr] sm:gap-3"
                  style={{ borderColor: C.rowBorder }}
                >
                  <div className="flex items-start gap-2.5">
                    <Truck
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: C.red }}
                      aria-hidden
                    />
                    <div>
                      <p className="text-[13px] font-bold" style={{ color: C.navy }}>
                        {when?.date || (m.pending ? 'Pending' : '—')}
                      </p>
                      {when?.time ? (
                        <p
                          className="mt-1 inline-flex items-center gap-1 text-[12px]"
                          style={{ color: C.sub }}
                        >
                          <Clock3 className="h-3.5 w-3.5" aria-hidden />
                          {when.time}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <span
                      className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.03em] text-white"
                      style={{ backgroundColor: C.badge }}
                    >
                      {move}
                    </span>
                  </div>

                  <div>
                    <p className="text-[13px] font-bold uppercase" style={{ color: C.navy }}>
                      {m.location || '—'}
                    </p>
                    {m.terminal ? (
                      <p className="mt-0.5 text-[12px]" style={{ color: C.sub }}>
                        {m.terminal}
                      </p>
                    ) : null}
                  </div>

                  <div className="text-[13px]" style={{ color: C.text }}>
                    {vesselLine || '\u00A0'}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-3 inline-flex items-center gap-1.5 text-[11px]" style={{ color: C.sub }}>
          <AlertTriangle className="h-3.5 w-3.5" style={{ color: '#F59E0B' }} aria-hidden />
          Times reflected are local Times
        </p>
      </div>
    </div>
  );
}
