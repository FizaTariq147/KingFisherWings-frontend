import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { getServerErrorMessage } from '@/lib/validation/mapApiErrors';
import {
  useQuotationNegotiation,
  useQuotationNegotiationActions,
} from '../hooks/useQuotationNegotiation';
import type { QuotationLine } from '../types/quotation.types';
import type { NegotiationPricing, ReviseAndSendLineDto } from '../types/quotationExtended.types';
import {
  canStaffRespondToCounter,
  canStaffReviseOffer,
  getNegotiationSettlement,
  getPendingCustomerCounterTotal,
  isNegotiationClosed,
  sortNegotiationEvents,
} from '../utils/negotiationActions';
import { coerceQuotationStatus } from '../utils/quotationStatus';
import { fallbackNegotiationPricing } from '../utils/normalizeQuotationExtended';
import { NegotiationPricingCard } from './NegotiationPricingCard';

interface QuotationNegotiationPanelProps {
  quotationId: string;
  status: string;
  currencyCode?: string;
  /** Current charge lines — optionally sent with revise-and-send */
  lines?: QuotationLine[];
  /** Pricing from GET /quotations/:id when timeline omits it */
  pricingFromQuote?: NegotiationPricing | null;
  revenueTotal?: number;
  onUpdated?: () => void;
}

const PANEL_STATUSES = new Set([
  'NEGOTIATING',
  'CUSTOMER_REVIEW',
  'SENT',
  'INTERNALLY_APPROVED',
  'APPROVED',
  'DISAPPROVED',
  'WON',
  'LOST',
]);

function linesToReviseDto(
  lines: QuotationLine[],
  targetTotal?: number,
): ReviseAndSendLineDto[] {
  const mapped = lines.map((line) => ({
    line_id: line.id,
    description: line.description,
    quantity: line.quantity,
    unit_price: line.unit_price,
    amount: line.line_total ?? line.quantity * line.unit_price,
  }));

  if (targetTotal == null || !Number.isFinite(targetTotal) || targetTotal < 0 || !mapped.length) {
    return mapped;
  }

  const currentSum = mapped.reduce((sum, line) => sum + (line.amount ?? 0), 0);
  if (currentSum <= 0) {
    const first = mapped[0];
    const qty = first.quantity && first.quantity > 0 ? first.quantity : 1;
    first.quantity = qty;
    first.amount = targetTotal;
    first.unit_price = targetTotal / qty;
    return mapped;
  }

  if (Math.abs(currentSum - targetTotal) < 0.005) return mapped;

  const factor = targetTotal / currentSum;
  let allocated = 0;
  return mapped.map((line, index) => {
    const qty = line.quantity && line.quantity > 0 ? line.quantity : 1;
    if (index === mapped.length - 1) {
      const amount = Math.round((targetTotal - allocated) * 100) / 100;
      return {
        ...line,
        quantity: qty,
        amount,
        unit_price: Math.round((amount / qty) * 10000) / 10000,
      };
    }
    const amount = Math.round((line.amount ?? 0) * factor * 100) / 100;
    allocated += amount;
    return {
      ...line,
      quantity: qty,
      amount,
      unit_price: Math.round((amount / qty) * 10000) / 10000,
    };
  });
}

export function QuotationNegotiationPanel({
  quotationId,
  status,
  currencyCode,
  lines = [],
  pricingFromQuote,
  revenueTotal,
  onUpdated,
}: QuotationNegotiationPanelProps) {
  const { hasPermission } = useAuth();
  const canNegotiate = hasPermission('quotations.negotiate');
  const normalizedStatus = coerceQuotationStatus(status);
  const showPanel = PANEL_STATUSES.has(normalizedStatus);

  const { data: timeline, isLoading, isError, error, refetch } = useQuotationNegotiation(
    quotationId,
    showPanel,
  );
  const actions = useQuotationNegotiationActions(quotationId);
  const [reviseMessage, setReviseMessage] = useState('');
  const [proposedTotal, setProposedTotal] = useState('');
  const [includeLines, setIncludeLines] = useState(true);
  const [rejectMessage, setRejectMessage] = useState('');
  const [acceptComments, setAcceptComments] = useState('');
  const [terminalReject, setTerminalReject] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const events = useMemo(
    () => sortNegotiationEvents(timeline?.events ?? []),
    [timeline?.events],
  );
  const negotiationClosed = isNegotiationClosed(normalizedStatus, events);

  const pricing = useMemo(() => {
    const fromApi = timeline?.pricing ?? pricingFromQuote ?? undefined;
    const pendingFromEvents = getPendingCustomerCounterTotal(fromApi, events, negotiationClosed);
    const fallback = fallbackNegotiationPricing({
      currencyCode,
      revenueTotal: fromApi?.tenantProposedTotal ?? fromApi?.revenueTotal ?? revenueTotal,
      totalAmount: revenueTotal,
      // Do not keep a live customer counter once negotiation is closed.
      customerProposedTotal: negotiationClosed
        ? undefined
        : (fromApi?.customerProposedTotal ?? pendingFromEvents),
      lines,
    });
    if (!fromApi && !fallback && pendingFromEvents == null && !negotiationClosed) return undefined;
    return {
      ...fallback,
      ...fromApi,
      tenantProposedTotal:
        fromApi?.tenantProposedTotal ??
        fromApi?.revenueTotal ??
        fallback?.tenantProposedTotal,
      revenueTotal:
        fromApi?.revenueTotal ?? fromApi?.tenantProposedTotal ?? fallback?.revenueTotal,
      customerProposedTotal: negotiationClosed
        ? undefined
        : (fromApi?.customerProposedTotal ?? pendingFromEvents ?? fallback?.customerProposedTotal),
      customerProposedLines: negotiationClosed
        ? undefined
        : (fromApi?.customerProposedLines ?? fallback?.customerProposedLines),
      currencyCode: fromApi?.currencyCode ?? fallback?.currencyCode ?? currencyCode,
    } satisfies NegotiationPricing;
  }, [
    timeline?.pricing,
    pricingFromQuote,
    revenueTotal,
    currencyCode,
    lines,
    events,
    negotiationClosed,
  ]);

  const settlement = useMemo(
    () =>
      getNegotiationSettlement({
        status: normalizedStatus,
        events,
        pricing: timeline?.pricing ?? pricingFromQuote ?? pricing,
        revenueTotal,
      }),
    [normalizedStatus, events, timeline?.pricing, pricingFromQuote, pricing, revenueTotal],
  );

  const pendingCustomerTotal = getPendingCustomerCounterTotal(
    pricing,
    events,
    negotiationClosed,
  );
  const canRespondToCounter =
    canNegotiate && canStaffRespondToCounter(normalizedStatus, pendingCustomerTotal, negotiationClosed);
  const canRevise = canNegotiate && canStaffReviseOffer(normalizedStatus, negotiationClosed);

  const defaultTotalHint = useMemo(() => {
    const fromPricing = pricing?.tenantProposedTotal ?? pricing?.revenueTotal;
    if (fromPricing != null) return String(fromPricing);
    if (revenueTotal != null) return String(revenueTotal);
    if (!lines.length) return '';
    const sum = lines.reduce((acc, line) => acc + (line.line_total ?? line.quantity * line.unit_price), 0);
    return sum > 0 ? String(sum) : '';
  }, [pricing, revenueTotal, lines]);

  // Prefill so users edit the real value (not a placeholder that never gets submitted).
  useEffect(() => {
    if (!proposedTotal && defaultTotalHint) {
      setProposedTotal(defaultTotalHint);
    }
  }, [defaultTotalHint, proposedTotal]);

  const lineSum = useMemo(
    () => lines.reduce((acc, line) => acc + (line.line_total ?? line.quantity * line.unit_price), 0),
    [lines],
  );

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setBannerError(null);
    setMessage(null);
    try {
      await fn();
      setMessage(success);
      setReviseMessage('');
      setProposedTotal('');
      setRejectMessage('');
      setAcceptComments('');
      onUpdated?.();
      void refetch();
    } catch (err) {
      setBannerError(getServerErrorMessage(err));
    }
  };

  if (!showPanel) return null;

  return (
    <div className="space-y-4">
      {!canNegotiate ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          You can view the negotiation timeline, but revise / accept / reject need the{' '}
          <code className="text-xs">quotations.negotiate</code> permission in your JWT. Ask Super
          Admin to sync tenant permissions, then sign out and sign back in.
        </p>
      ) : null}

      {bannerError ? <p className="text-sm text-[var(--color-danger-600)]">{bannerError}</p> : null}
      {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}

      <NegotiationPricingCard
        pricing={pricing}
        currencyCode={currencyCode}
        settlement={settlement}
      />

      {negotiationClosed ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
          Negotiation is closed
          {normalizedStatus === 'APPROVED' || normalizedStatus === 'CONVERTED'
            ? ' — quotation approved.'
            : normalizedStatus === 'REJECTED' || normalizedStatus === 'DISAPPROVED'
              ? ' — quotation rejected.'
              : ' (see ACCEPT in the timeline). Refresh if the header status has not updated yet.'}
          {settlement.acceptedBy === 'CUSTOMER' && settlement.customerAbandonedCounter
            ? ` Totals stay at the tenant offer (${settlement.finalTotal ?? '—'}); the customer counter was not applied.`
            : ''}
        </p>
      ) : null}

      {timeline?.round != null ? (
        <p className="text-sm text-[var(--color-neutral-600)]">
          Negotiation round: <strong>{timeline.round}</strong>
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-[var(--color-neutral-400)]">Loading negotiation timeline…</p>
      ) : isError ? (
        <div className="space-y-2">
          <p className="text-sm text-[var(--color-danger-600)]">{getServerErrorMessage(error)}</p>
          <Button type="button" size="sm" variant="secondary" onClick={() => void refetch()}>
            Retry timeline
          </Button>
        </div>
      ) : !events.length ? (
        <p className="text-sm text-[var(--color-neutral-400)]">No negotiation events yet.</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">
                  {(event.eventType || 'Event').replaceAll('_', ' ')}
                  {event.actor ? ` · ${event.actor}` : ''}
                </span>
                {event.status ? (
                  <Badge variant="neutral" dot={false}>
                    {event.status.replaceAll('_', ' ')}
                  </Badge>
                ) : null}
              </div>
              {event.message ? (
                <p className="text-[var(--color-neutral-600)] mt-1">{event.message}</p>
              ) : null}
              {event.proposedTotal != null ? (
                <p className="text-xs text-[var(--color-neutral-500)] mt-1">
                  Proposed total: {event.proposedTotal}
                </p>
              ) : null}
              {event.createdAt ? (
                <p className="text-xs text-[var(--color-neutral-400)] mt-1">{event.createdAt}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {canRespondToCounter ? (
        <div className="rounded-md border border-[var(--color-secondary-200)] bg-[var(--color-secondary-50)]/40 p-3 space-y-3">
          <p className="text-sm font-medium">Respond to customer counter-offer</p>
          <p className="text-xs text-[var(--color-neutral-500)]">
            Accept applies the customer&apos;s proposed total to revenue lines and marks the quote
            won. Reject clears or continues negotiation. Revise-and-send (below) sends a new tenant
            offer instead.
          </p>
          {pendingCustomerTotal != null ? (
            <p className="text-sm">
              Customer proposes:{' '}
              <strong className="tabular-nums">
                {currencyCode ? `${currencyCode} ` : ''}
                {pendingCustomerTotal}
              </strong>
            </p>
          ) : null}
          <Input
            placeholder="Comments when accepting (optional)"
            value={acceptComments}
            onChange={(e) => setAcceptComments(e.target.value)}
          />
          <Input
            placeholder="Message when rejecting *"
            value={rejectMessage}
            onChange={(e) => setRejectMessage(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={terminalReject}
              onChange={(e) => setTerminalReject(e.target.checked)}
            />
            Terminal reject (close negotiation)
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={actions.acceptCounterOffer.isPending}
              onClick={() =>
                void run(
                  () =>
                    actions.acceptCounterOffer.mutateAsync(
                      acceptComments.trim() ? { comments: acceptComments.trim() } : {},
                    ),
                  'Counter-offer accepted. Customer total applied to revenue lines.',
                )
              }
            >
              {actions.acceptCounterOffer.isPending ? 'Accepting…' : 'Accept counter-offer'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              disabled={!rejectMessage.trim() || actions.rejectCounterOffer.isPending}
              onClick={() =>
                void run(
                  () =>
                    actions.rejectCounterOffer.mutateAsync({
                      message: rejectMessage.trim(),
                      terminal: terminalReject,
                    }),
                  terminalReject ? 'Counter-offer rejected (terminal).' : 'Counter-offer rejected.',
                )
              }
            >
              {actions.rejectCounterOffer.isPending ? 'Rejecting…' : 'Reject counter-offer'}
            </Button>
          </div>
        </div>
      ) : null}

      {canRevise ? (
        <div className="rounded-md border border-[var(--color-neutral-200)] p-3 space-y-3">
          <p className="text-sm font-medium">Revise and send to customer</p>
          <p className="text-xs text-[var(--color-neutral-500)]">
            {pendingCustomerTotal != null
              ? 'Sends a new tenant offer and clears the pending customer counter. Prefer Accept counter-offer above if you agree to their total.'
              : 'Proposed total updates the tenant offer (revenue). Included charge lines are scaled to that total so an old line sum cannot override your new price.'}
          </p>
          <Input
            placeholder="Message to customer *"
            value={reviseMessage}
            onChange={(e) => setReviseMessage(e.target.value)}
          />
          <Input
            label="Proposed total"
            type="number"
            min={0}
            step="0.01"
            required
            hint="This becomes the tenant offer. Charge lines below are scaled to match when included."
            placeholder={defaultTotalHint ? `e.g. ${defaultTotalHint}` : 'Revised offer total'}
            value={proposedTotal}
            onChange={(e) => setProposedTotal(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeLines}
              onChange={(e) => setIncludeLines(e.target.checked)}
              disabled={!lines.length}
            />
            Include current charge lines ({lines.length}
            {lineSum > 0 ? `, sum ${currencyCode ? `${currencyCode} ` : ''}${lineSum}` : ''})
          </label>
          {includeLines &&
          proposedTotal.trim() &&
          Number.isFinite(Number(proposedTotal)) &&
          lineSum > 0 &&
          Math.abs(Number(proposedTotal) - lineSum) >= 0.005 ? (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
              Charge lines currently sum to {lineSum}, but proposed total is {proposedTotal}. Lines
              will be scaled to {proposedTotal} on send so the offer is not stuck at the old total.
            </p>
          ) : null}
          <Button
            type="button"
            size="sm"
            disabled={!reviseMessage.trim() || !proposedTotal.trim() || actions.reviseAndSend.isPending}
            onClick={() => {
              const totalRaw = proposedTotal.trim();
              const n = Number(totalRaw);
              if (!totalRaw || !Number.isFinite(n) || n < 0) {
                setBannerError('Proposed total is required and must be a number ≥ 0.');
                return;
              }
              const proposed_total = n;
              void run(
                () =>
                  actions.reviseAndSend.mutateAsync({
                    message: reviseMessage.trim(),
                    proposed_total,
                    ...(includeLines && lines.length
                      ? { lines: linesToReviseDto(lines, proposed_total) }
                      : {}),
                  }),
                'Revised quotation sent for customer review.',
              );
            }}
          >
            {actions.reviseAndSend.isPending ? 'Sending…' : 'Revise and send'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
