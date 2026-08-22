import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import {
  ArrowRight,
  Minus,
  Plane,
  Ship,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import type { MasterRecord } from '@/features/masters/types/master.types';
import { isUuid } from '@/lib/isUuid';
import { DashCard, DashCardHeader, DashEmpty, DashSkeleton } from './DashCard';
import {
  asRecord,
  compactMoney,
  pickNumber,
  pickString,
  sanitizeDisplayLabel,
} from '../utils/dashboardFormat';
import { cn } from '@/lib/utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const NAVY = '#0A2942';
const ORANGE = '#FF751F';
const STEEL = '#2C557A';

const CUSTOMER_BAR_COLORS = ['#0A2942', '#8B2942', '#5B3E8C', '#1F8A8A', '#1F8A57'];

function monthIndex(label: string): number | null {
  const n = Number(label);
  if (n >= 1 && n <= 12) return n - 1;
  const i = MONTHS.findIndex((m) => label.toLowerCase().startsWith(m.toLowerCase()));
  return i >= 0 ? i : null;
}

function lastSixMonths(now = new Date()) {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { monthIndex: d.getMonth(), label: MONTHS[d.getMonth()] };
  });
}

function daysLeftInMonth(now = new Date()) {
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(0, daysInMonth - now.getDate());
}

function planBadgeTone(pct: number): string {
  if (pct >= 100) return 'bg-[#E7F6EC] text-[#3BA066]';
  if (pct >= 90) return 'bg-[#FDECDC] text-[#E07A2F]';
  return 'bg-[#FCE8EA] text-[#C6303E]';
}

function shareBadgeTone(pct: number): string {
  if (pct >= 20) return 'bg-[#E7F6EC] text-[#3BA066]';
  if (pct >= 15) return 'bg-[#E8EEF4] text-[#2C557A]';
  return 'bg-[#FCE8EA] text-[#C6303E]';
}

function marginTone(margin: number): string {
  if (margin >= 22) return 'text-[#3BA066]';
  if (margin >= 16) return 'text-[#E07A2F]';
  return 'text-[#C6303E]';
}

function marginBarColor(margin: number): string {
  if (margin >= 22) return '#3BA066';
  if (margin >= 16) return ORANGE;
  return '#C6303E';
}

function marginTrend(margin: number, row: Record<string, unknown>): 'up' | 'down' | 'flat' {
  const delta = pickNumber(row, ['trend', 'margin_trend', 'change', 'delta', 'margin_change']);
  if (delta != null) {
    if (delta > 0.5) return 'up';
    if (delta < -0.5) return 'down';
    return 'flat';
  }
  if (margin >= 22) return 'up';
  if (margin < 14) return 'down';
  return 'flat';
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <TrendingUp className="h-3 w-3 text-[#3BA066]" aria-hidden />;
  if (trend === 'down') return <TrendingDown className="h-3 w-3 text-[#C6303E]" aria-hidden />;
  return <Minus className="h-3 w-3 text-[#E07A2F]" aria-hidden />;
}

export function RevenueVsTargetPanel({
  monthlyRows,
  customerRows,
  isLoading,
  isError,
}: {
  monthlyRows: Record<string, unknown>[];
  customerRows: Record<string, unknown>[];
  isLoading: boolean;
  isError: boolean;
}) {
  const now = new Date();
  const months = lastSixMonths(now);
  const currentMonthIndex = now.getMonth();

  const bars = months.map(({ monthIndex: mi, label }, idx) => {
    const row = monthlyRows.find((r) => {
      const raw = pickString(r, ['month', 'period', 'label', 'name', 'month_name', 'month_label']) ?? '';
      const parsed = monthIndex(raw);
      return parsed === mi || raw.toLowerCase() === label.toLowerCase();
    });
    const value =
      pickNumber(row ?? {}, ['revenue', 'amount', 'actual', 'total', 'sales', 'value', 'gross_revenue']) ?? 0;
    const target =
      pickNumber(row ?? {}, ['target', 'plan', 'budget', 'monthly_target', 'revenue_target']) ?? undefined;
    return {
      label,
      value,
      target,
      isCurrent: mi === currentMonthIndex && idx === months.length - 1,
    };
  });

  const hasBars = bars.some((b) => b.value > 0);
  const totalRevenue = bars.reduce((sum, b) => sum + b.value, 0);
  const totalTarget = bars.reduce((sum, b) => sum + (b.target ?? 0), 0);
  const monthlyTarget =
    bars.find((b) => b.target != null && b.target > 0)?.target ??
    (totalTarget > 0 ? Math.round(totalTarget / Math.max(bars.filter((b) => b.target).length, 1)) : undefined);
  const planPct =
    totalTarget > 0 ? Math.round((totalRevenue / totalTarget) * 100) : monthlyTarget && totalRevenue > 0
      ? Math.round((totalRevenue / (monthlyTarget! * bars.length)) * 100)
      : null;

  const chartMax = Math.max(...bars.map((b) => b.value), monthlyTarget ?? 0, 1);
  const currentBar = bars[bars.length - 1];

  const customers = customerRows.slice(0, 5).map((row, i) => {
    const rawName =
      pickString(row, ['customer', 'customer_name', 'name', 'party', 'party_name', 'shipper', 'label']) ||
      `Customer ${i + 1}`;
    return {
      name: sanitizeDisplayLabel(rawName) ?? `Customer ${i + 1}`,
      amount: pickNumber(row, ['revenue', 'amount', 'total', 'sales', 'value']) ?? 0,
      jobs: pickNumber(row, ['jobs', 'job_count', 'count', 'shipments', 'volume']),
    };
  });
  const customerTotal = customers.reduce((sum, c) => sum + c.amount, 0);
  const customerMax = Math.max(...customers.map((c) => c.amount), 1);

  return (
    <DashCard>
      <DashCardHeader
        title="Revenue vs target"
        subtitle="Last 6 months · gross revenue in USD"
        action={
          hasBars ? (
            <div className="text-right">
              <p className="text-xl font-semibold tabular-nums text-[var(--color-neutral-900)]">
                {compactMoney(totalRevenue)}
              </p>
              {planPct != null ? (
                <span
                  className={cn(
                    'mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    planBadgeTone(planPct),
                  )}
                >
                  {planPct}% of plan
                </span>
              ) : null}
            </div>
          ) : null
        }
      />

      {isLoading ? (
        <DashSkeleton className="h-44" />
      ) : isError ? (
        <DashEmpty>Unable to load revenue report.</DashEmpty>
      ) : !hasBars ? (
        <DashEmpty>No monthly revenue rows for this period.</DashEmpty>
      ) : (
        <>
          <div className="relative h-44 pt-2">
            {monthlyTarget != null && monthlyTarget > 0 ? (
              <div
                className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                style={{ bottom: `${Math.max(8, Math.round((monthlyTarget / chartMax) * 100))}%` }}
              >
                <div className="w-full border-t border-dashed border-[var(--color-neutral-300)]" />
              </div>
            ) : null}

            <div className="relative z-0 flex h-full items-end gap-2 sm:gap-3">
              {bars.map((bar) => {
                const heightPct = Math.max(6, Math.round((bar.value / chartMax) * 100));
                const meetsTarget =
                  bar.target != null ? bar.value >= bar.target : monthlyTarget != null ? bar.value >= monthlyTarget : true;
                const barColor = bar.isCurrent
                  ? undefined
                  : meetsTarget
                    ? NAVY
                    : ORANGE;

                return (
                  <div key={bar.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                    <span className="text-[10px] font-medium tabular-nums text-[var(--color-neutral-500)]">
                      {bar.value > 0 ? compactMoney(bar.value) : ''}
                    </span>
                    <span
                      className="w-full max-w-[52px] rounded-t-md transition-[height] duration-300"
                      style={{
                        height: `${heightPct}%`,
                        background: bar.isCurrent
                          ? `linear-gradient(180deg, rgba(44, 85, 122, 0.35) 0%, rgba(10, 41, 66, 0.9) 100%)`
                          : barColor,
                        opacity: bar.isCurrent && bar.value === 0 ? 0.35 : 1,
                      }}
                    />
                    <span className="text-[10px] font-medium text-[var(--color-neutral-400)]">{bar.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {monthlyTarget != null && monthlyTarget > 0 ? (
            <p className="mt-2 text-[10px] leading-relaxed text-[var(--color-neutral-400)]">
              <span className="mr-1 inline-block w-4 border-t border-dashed border-[var(--color-neutral-300)] align-middle" />
              Monthly target {compactMoney(monthlyTarget)}
              {currentBar.isCurrent && currentBar.value > 0 ? (
                <>
                  {' '}
                  · {MONTHS[currentMonthIndex]} tracking at {compactMoney(currentBar.value)} of a{' '}
                  {compactMoney(monthlyTarget)} target · {daysLeftInMonth(now)} days left
                </>
              ) : null}
            </p>
          ) : null}
        </>
      )}

      <div className="mt-6 border-t border-[var(--color-neutral-100)] pt-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
            Top customers
          </p>
          <Link
            to="/sales/sales-dashboard"
            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#FF751F] hover:underline"
          >
            All accounts
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <DashSkeleton className="h-28" />
        ) : customers.length === 0 ? (
          <DashEmpty>No customer revenue breakdown for this period.</DashEmpty>
        ) : (
          <ul className="space-y-3">
            {customers.map((customer, i) => {
              const share = customerTotal > 0 ? Math.round((customer.amount / customerTotal) * 100) : 0;
              return (
                <li key={`${customer.name}-${i}`} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-neutral-100)] text-[10px] font-semibold text-[var(--color-neutral-500)]">
                    {i + 1}
                  </span>
                  <div className="min-w-0 w-[108px] shrink-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-neutral-800)]">{customer.name}</p>
                    {customer.jobs != null ? (
                      <p className="text-[10px] text-[var(--color-neutral-400)]">{customer.jobs} jobs</p>
                    ) : null}
                  </div>
                  <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.max(4, Math.round((customer.amount / customerMax) * 100))}%`,
                        background: CUSTOMER_BAR_COLORS[i % CUSTOMER_BAR_COLORS.length],
                      }}
                    />
                  </span>
                  <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums">
                    {compactMoney(customer.amount)}
                  </span>
                  <span
                    className={cn(
                      'inline-flex w-10 shrink-0 justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                      shareBadgeTone(share),
                    )}
                  >
                    {share}%
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashCard>
  );
}

function laneModeMeta(row: Record<string, unknown>) {
  const modeRaw =
    pickString(row, ['mode', 'transport_mode', 'service_mode', 'shipment_mode', 'freight_mode']) ?? '';
  const service =
    pickString(row, ['service', 'service_type', 'load_type', 'equipment', 'cargo_type']) ?? '';
  const transit = pickNumber(row, ['transit_days', 'transit', 'tt', 'lead_time', 'transit_time']);
  const combined = `${modeRaw} ${service}`.toLowerCase();
  const isAir = /\bair\b/.test(combined);
  let detail = '';
  if (isAir) {
    detail = 'Air';
  } else {
    const load = /\blcl\b/.test(combined) ? 'LCL' : /\bfcl\b/.test(combined) ? 'FCL' : service || 'FCL';
    detail = service && !/\bfcl\b|\blcl\b|\bsea\b/i.test(service) ? `Sea ${service}` : `Sea ${load}`;
  }
  const suffix = transit != null ? ` · ${transit} d` : '';
  return {
    isAir,
    subtext: `${detail}${suffix}`.trim() || undefined,
  };
}

function portLabelFromMaster(port: MasterRecord): string | undefined {
  const code = pickString(port, ['un_locode', 'code', 'port_code', 'iata_code']);
  const name = pickString(port, ['name', 'city']);
  const label = sanitizeDisplayLabel(code) ?? sanitizeDisplayLabel(name);
  return label;
}

function buildPortLookup(ports: MasterRecord[]): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const port of ports) {
    const label = portLabelFromMaster(port);
    if (label && port.id) lookup.set(port.id, label);
  }
  return lookup;
}

function resolvePortLabel(value: string | undefined, lookup: Map<string, string>): string | undefined {
  if (!value?.trim()) return undefined;
  const trimmed = value.trim();
  if (lookup.has(trimmed)) return lookup.get(trimmed);
  return sanitizeDisplayLabel(trimmed);
}

function nestedPortLabel(row: Record<string, unknown>, side: 'origin' | 'dest'): string | undefined {
  const nested =
    asRecord(row[`${side}_port`]) ??
    asRecord(row[side === 'dest' ? 'destination_port' : 'origin_port']) ??
    asRecord(row[side === 'dest' ? 'destination' : 'origin']);
  if (!nested) return undefined;
  const code = pickString(nested, ['un_locode', 'code', 'port_code', 'iata_code', 'unlocode']);
  const name = pickString(nested, ['name', 'city']);
  return sanitizeDisplayLabel(code) ?? sanitizeDisplayLabel(name);
}

function extractPortIds(row: Record<string, unknown>): { originId?: string; destId?: string } {
  const originId =
    pickString(row, ['origin_port_id', 'pol_id', 'from_port_id']) ??
    (() => {
      const raw = pickString(row, ['origin', 'pol', 'from']);
      return raw && isUuid(raw) ? raw : undefined;
    })();
  const destId =
    pickString(row, ['dest_port_id', 'destination_port_id', 'pod_id', 'to_port_id']) ??
    (() => {
      const raw = pickString(row, ['dest', 'destination', 'pod', 'to']);
      return raw && isUuid(raw) ? raw : undefined;
    })();

  const laneRaw = pickString(row, ['lane', 'trade_lane', 'route', 'corridor']);
  if (laneRaw) {
    const parts = laneRaw.split(/[>→]|(?:\s*->\s*)/).map((part) => part.trim()).filter(Boolean);
    if (parts.length === 2 && isUuid(parts[0]) && isUuid(parts[1])) {
      return { originId: parts[0], destId: parts[1] };
    }
  }

  return { originId, destId };
}

function formatLane(row: Record<string, unknown>, index: number, portLookup: Map<string, string>): string {
  const { originId, destId } = extractPortIds(row);

  const origin =
    nestedPortLabel(row, 'origin') ??
    resolvePortLabel(
      pickString(row, [
        'origin_port_code',
        'origin_code',
        'pol_code',
        'pol',
        'origin_port_name',
        'origin_name',
        'from_code',
      ]),
      portLookup,
    ) ??
    (originId ? portLookup.get(originId) : undefined);

  const dest =
    nestedPortLabel(row, 'dest') ??
    resolvePortLabel(
      pickString(row, [
        'dest_port_code',
        'destination_port_code',
        'dest_code',
        'pod_code',
        'pod',
        'dest_port_name',
        'dest_name',
        'destination_name',
        'to_code',
      ]),
      portLookup,
    ) ??
    (destId ? portLookup.get(destId) : undefined);

  if (origin && dest) return `${origin} → ${dest}`;
  if (origin) return `${origin} → —`;
  if (dest) return `— → ${dest}`;

  const direct = sanitizeDisplayLabel(
    pickString(row, ['lane', 'trade_lane', 'route', 'corridor', 'name', 'origin_dest', 'label']),
  );
  if (direct) return direct;

  return `Lane ${index + 1}`;
}

export function TradeLanePanel({
  rows,
  isLoading,
  isError,
}: {
  rows: Record<string, unknown>[];
  isLoading: boolean;
  isError: boolean;
}) {
  const { data: ports = [] } = useMasterOptions('ports', MASTER_PATHS.ports, rows.length > 0);
  const portLookup = useMemo(() => buildPortLookup(ports), [ports]);

  const lanes = rows.slice(0, 5).map((row, i) => {
    const lane = formatLane(row, i, portLookup);
    const jobs = pickNumber(row, ['jobs', 'job_count', 'count', 'shipments', 'volume']);
    const revenue = pickNumber(row, ['revenue', 'amount', 'sales', 'total']);
    const margin =
      pickNumber(row, ['margin', 'gp_percent', 'gp', 'margin_percent', 'gross_margin', 'margin_pct']) ??
      undefined;
    const { isAir, subtext } = laneModeMeta(row);
    return { lane, jobs, revenue, margin, isAir, subtext, row };
  });

  const maxMargin = Math.max(...lanes.map((l) => l.margin ?? 0), 1);

  return (
    <DashCard>
      <DashCardHeader
        title="Trade lane performance"
        subtitle="Rolling 90 days · revenue and gross margin"
        action={
          <Link
            to="/sales/sales-dashboard"
            className="inline-flex shrink-0 items-center rounded-lg border border-[#FF751F]/40 bg-[#FFF4ED] px-3 py-1.5 text-[11px] font-semibold text-[#FF751F] hover:bg-[#FFEBDD]"
          >
            Full report
          </Link>
        }
      />

      {isLoading ? (
        <DashSkeleton className="h-40" />
      ) : isError ? (
        <DashEmpty>Unable to load trade lane report.</DashEmpty>
      ) : lanes.length === 0 ? (
        <DashEmpty>No trade lane rows for this period.</DashEmpty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
                <th className="pb-3 pr-3 font-semibold">Lane</th>
                <th className="pb-3 pr-3 font-semibold">Jobs</th>
                <th className="pb-3 pr-3 font-semibold">Revenue</th>
                <th className="pb-3 font-semibold">Margin</th>
              </tr>
            </thead>
            <tbody>
              {lanes.map(({ lane, jobs, revenue, margin, isAir, subtext, row }, i) => {
                const trend = margin != null ? marginTrend(margin, row) : 'flat';
                const barColor = margin != null ? marginBarColor(margin) : STEEL;
                return (
                  <tr key={`${lane}-${i}`} className="border-t border-[var(--color-neutral-100)]">
                    <td className="py-3 pr-3">
                      <div className="flex items-start gap-2.5">
                        <span
                          className={cn(
                            'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                            isAir ? 'bg-[#FFF4ED] text-[#FF751F]' : 'bg-[#E8F4F8] text-[#1F8A8A]',
                          )}
                        >
                          {isAir ? <Plane className="h-3.5 w-3.5" /> : <Ship className="h-3.5 w-3.5" />}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--color-neutral-900)]">{lane}</p>
                          {subtext ? (
                            <p className="text-[10px] text-[var(--color-neutral-400)]">{subtext}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-sm tabular-nums text-[var(--color-neutral-700)]">
                      {jobs ?? '—'}
                    </td>
                    <td className="py-3 pr-3 text-sm font-semibold tabular-nums text-[var(--color-neutral-900)]">
                      {compactMoney(revenue)}
                    </td>
                    <td className="py-3">
                      {margin == null ? (
                        <span className="text-sm text-[var(--color-neutral-400)]">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-10 overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
                            <span
                              className="block h-full rounded-full"
                              style={{
                                width: `${Math.max(12, Math.round((margin / maxMargin) * 100))}%`,
                                background: barColor,
                              }}
                            />
                          </span>
                          <span className={cn('text-sm font-semibold tabular-nums', marginTone(margin))}>
                            {Math.round(margin)}%
                          </span>
                          <TrendIcon trend={trend} />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashCard>
  );
}
