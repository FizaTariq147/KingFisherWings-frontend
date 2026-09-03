import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
} from '@/features/portal-auth/components/portal-ui';
import { NegotiationPricingCard } from '@/features/quotations/components/NegotiationPricingCard';
import {
  getNegotiationSettlement,
  isNegotiationClosed,
  sortNegotiationEvents,
} from '@/features/quotations/utils/negotiationActions';
import { formatVendorMoney } from '@/features/vendor-shared/formatMoney';
import { VendorQueryError } from '@/features/vendor-shared/VendorQueryError';
import { vendorErrorMessage } from '@/features/vendor-shared/vendorUnavailable';
import { VendorOfferNegotiationTimeline } from '../components/VendorOfferNegotiationTimeline';
import {
  useVendorPortalJob,
  useVendorPortalJobPricing,
  useVendorPortalOfferActions,
  useVendorPortalOfferNegotiation,
} from '../hooks/useVendorJobOffers';
import {
  canVendorRespondToOffer,
  coerceVendorOfferStatus,
  isVendorOfferTerminal,
  vendorOfferStatusLabel,
  vendorStatusAsQuotationLike,
} from '../utils/vendorOfferStatus';

function statusVariant(status?: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const s = coerceVendorOfferStatus(status);
  if (s === 'APPROVED') return 'success';
  if (s === 'DISAPPROVED') return 'danger';
  if (s === 'NEGOTIATING') return 'warning';
  if (s === 'VENDOR_REVIEW' || s === 'SENT') return 'info';
  return 'neutral';
}

export default function VendorJobDetailPage() {
  const { id = '' } = useParams();
  const jobQuery = useVendorPortalJob(id);
  const pricingQuery = useVendorPortalJobPricing(id);
  const negotiationQuery = useVendorPortalOfferNegotiation(id, Boolean(id));
  const actions = useVendorPortalOfferActions(id);

  const job = jobQuery.data;
  const pricing = pricingQuery.data;

  const [acceptMessage, setAcceptMessage] = useState('');
  const [rejectMessage, setRejectMessage] = useState('');
  const [terminalReject, setTerminalReject] = useState(true);
  const [counterMessage, setCounterMessage] = useState('');
  const [counterTotal, setCounterTotal] = useState('');
  const [showCounter, setShowCounter] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const offerStatus = coerceVendorOfferStatus(
    pricing?.status || job?.offerStatus || 'SENT',
  );
  const events = useMemo(
    () => sortNegotiationEvents(negotiationQuery.data?.events ?? []),
    [negotiationQuery.data?.events],
  );
  const negotiationPricing =
    negotiationQuery.data?.pricing ?? pricing?.negotiationPricing ?? job?.negotiationPricing;
  const quoteLike = vendorStatusAsQuotationLike(offerStatus);
  const closed =
    isVendorOfferTerminal(offerStatus) || isNegotiationClosed(quoteLike, events);
  const canRespond = canVendorRespondToOffer(offerStatus) && !closed;
  const settlement = getNegotiationSettlement({
    status: quoteLike,
    events,
    pricing: negotiationPricing,
    revenueTotal: pricing?.costTotal ?? job?.costTotal ?? pricing?.totalAmount,
  });

  useEffect(() => {
    const seed =
      negotiationPricing?.customerProposedTotal ??
      pricing?.costTotal ??
      job?.costTotal ??
      negotiationPricing?.tenantProposedTotal;
    if (seed != null && !counterTotal) setCounterTotal(String(seed));
  }, [job?.costTotal, negotiationPricing, pricing?.costTotal, counterTotal]);

  if (jobQuery.isLoading) return <PortalLoadingState label="Loading job…" />;
  if (jobQuery.isError || !job) {
    return (
      <div className="space-y-2">
        <VendorQueryError error={jobQuery.error} onRetry={() => void jobQuery.refetch()} />
        <Link to="/vendor/jobs" className="text-sm underline">
          Back to jobs
        </Link>
      </div>
    );
  }

  const displayCurrency = pricing?.currencyCode || job.currencyCode;
  const costTotal =
    pricing?.costTotal ?? job.costTotal ?? pricing?.totalAmount ?? job.totalAmount;

  const refreshAll = () => {
    void jobQuery.refetch();
    void pricingQuery.refetch();
    void negotiationQuery.refetch();
  };

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setFormError(null);
    setFormMsg(null);
    try {
      await fn();
      setFormMsg(success);
      refreshAll();
    } catch (err) {
      setFormError(vendorErrorMessage(err, 'Request failed.'));
    }
  };

  return (
    <div className="space-y-5">
      <Link
        to="/vendor/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary)]"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to jobs
      </Link>
      <PortalPageHeader
        title={job.jobNumber || job.id}
        description={
          [
            job.jobType?.replaceAll('_', ' '),
            [job.origin, job.destination].filter(Boolean).join(' → ') || null,
          ]
            .filter(Boolean)
            .join(' · ') || 'Job pricing'
        }
        actions={
          <Badge variant={statusVariant(offerStatus)}>
            {vendorOfferStatusLabel(offerStatus)}
          </Badge>
        }
      />

      <PortalPanel padded className="space-y-3 text-sm">
        <p className="text-sm text-[var(--color-neutral-700)]">
          Cost pricing only — customer revenue / sell prices are not available on this portal.
        </p>
        {job.notes ? (
          <div className="space-y-1">
            <p className="text-xs font-medium text-[var(--color-neutral-600)]">Instructions</p>
            <p className="whitespace-pre-wrap break-words text-sm text-[var(--color-neutral-900)]">
              {job.notes}
            </p>
          </div>
        ) : null}
      </PortalPanel>

      <PortalPanel padded className="space-y-3">
        <NegotiationPricingCard
          title="Cost negotiation"
          pricing={negotiationPricing}
          currencyCode={displayCurrency}
          tenantOfferLabel="Tenant cost offer"
          counterOfferLabel="Your counter"
          counterLinesLabel="Your proposed lines"
          emptyTenantHint="Waiting for the forwarder cost offer."
          settlement={settlement}
          settlementAcceptLabels={{
            counterpartyAcceptedTenant: 'You accepted the tenant cost offer',
            tenantAcceptedCounter: 'Forwarder accepted your counter',
          }}
        />
        {costTotal != null ? (
          <p className="text-sm">
            <span className="text-[var(--color-neutral-500)]">Current cost total: </span>
            {formatVendorMoney(costTotal, displayCurrency)}
          </p>
        ) : null}
        <VendorOfferNegotiationTimeline
          events={events}
          isLoading={negotiationQuery.isLoading}
        />
      </PortalPanel>

      {formError ? (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {formError}
        </p>
      ) : null}
      {formMsg ? <p className="text-sm text-[var(--color-success-700)]">{formMsg}</p> : null}

      {canRespond ? (
        <PortalPanel padded className="space-y-4">
          <h3 className="text-sm font-semibold">Your decision</h3>
          <p className="text-xs text-[var(--color-neutral-500)]">
            Accept the tenant cost, reject it, or counter — a counter updates cost_total
            immediately and moves status to Negotiating.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={actions.accept.isPending}
              onClick={() =>
                void run(
                  () =>
                    actions.accept.mutateAsync(
                      acceptMessage.trim() ? { message: acceptMessage.trim() } : {},
                    ),
                  'Cost offer accepted (APPROVED).',
                )
              }
            >
              {actions.accept.isPending ? 'Accepting…' : 'Accept offer'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={actions.reject.isPending}
              onClick={() => setShowCounter((v) => !v)}
            >
              Counter
            </Button>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-neutral-600)]">
              Accept message (optional)
            </span>
            <Input
              value={acceptMessage}
              onChange={(e) => setAcceptMessage(e.target.value)}
              disabled={actions.accept.isPending}
            />
          </label>

          <div className="space-y-2 border-t border-[var(--color-neutral-100)] pt-3">
            <p className="text-xs font-medium text-[var(--color-neutral-700)]">Reject offer</p>
            <Input
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              placeholder="Reject message (required)"
              disabled={actions.reject.isPending}
            />
            <label className="flex items-center gap-2 text-xs text-[var(--color-neutral-600)]">
              <input
                type="checkbox"
                checked={terminalReject}
                onChange={(e) => setTerminalReject(e.target.checked)}
                disabled={actions.reject.isPending}
              />
              Close as Disapproved (terminal)
            </label>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={actions.reject.isPending || !rejectMessage.trim()}
              onClick={() =>
                void run(
                  () =>
                    actions.reject.mutateAsync({
                      message: rejectMessage.trim(),
                      terminal: terminalReject,
                    }),
                  terminalReject
                    ? 'Offer rejected (DISAPPROVED).'
                    : 'Offer rejected — waiting for forwarder revise.',
                )
              }
            >
              {actions.reject.isPending ? 'Rejecting…' : 'Reject'}
            </Button>
          </div>

          {showCounter ? (
            <div className="space-y-2 border-t border-[var(--color-neutral-100)] pt-3">
              <p className="text-xs font-medium text-[var(--color-neutral-700)]">Counter-offer</p>
              <Input
                value={counterMessage}
                onChange={(e) => setCounterMessage(e.target.value)}
                placeholder="Message (required)"
                disabled={actions.counterOffer.isPending}
              />
              <Input
                type="number"
                min={0}
                step="any"
                value={counterTotal}
                onChange={(e) => setCounterTotal(e.target.value)}
                placeholder="Proposed cost total (required)"
                disabled={actions.counterOffer.isPending}
              />
              <Button
                type="button"
                size="sm"
                disabled={
                  actions.counterOffer.isPending ||
                  !counterMessage.trim() ||
                  !Number.isFinite(Number(counterTotal))
                }
                onClick={() => {
                  const total = Number(counterTotal);
                  if (!Number.isFinite(total) || total < 0) {
                    setFormError('Enter a valid proposed total.');
                    return;
                  }
                  void run(
                    () =>
                      actions.counterOffer.mutateAsync({
                        message: counterMessage.trim(),
                        proposed_total: total,
                      }),
                    'Counter submitted — cost_total updated (NEGOTIATING).',
                  );
                }}
              >
                {actions.counterOffer.isPending ? 'Sending…' : 'Submit counter'}
              </Button>
            </div>
          ) : null}
        </PortalPanel>
      ) : null}

      <Button type="button" size="sm" variant="secondary" onClick={refreshAll}>
        Refresh
      </Button>
    </div>
  );
}
