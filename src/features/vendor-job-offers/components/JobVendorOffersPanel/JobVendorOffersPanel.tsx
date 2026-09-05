import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useParties } from '@/features/parties/hooks/useParties';
import { NegotiationPricingCard } from '@/features/quotations/components/NegotiationPricingCard';
import {
  getNegotiationSettlement,
  getPendingCustomerCounterTotal,
  isNegotiationClosed,
  sortNegotiationEvents,
} from '@/features/quotations/utils/negotiationActions';
import { isUuid } from '@/lib/isUuid';
import { getServerErrorMessage } from '@/lib/validation/mapApiErrors';
import { formatVendorMoney } from '@/features/vendor-shared/formatMoney';
import {
  useJobVendorOffers,
  usePassJobToVendor,
  useStaffVendorOfferActions,
  useStaffVendorOfferNegotiation,
} from '../../hooks/useVendorJobOffers';
import type { VendorJobOffer } from '../../types/vendorJobOffers.types';
import {
  canStaffApproveVendorOffer,
  canStaffRespondToVendorCounter,
  canStaffReviseVendorOffer,
  coerceVendorOfferStatus,
  vendorOfferStatusLabel,
  vendorStatusAsQuotationLike,
} from '../../utils/vendorOfferStatus';
import { VendorOfferNegotiationTimeline } from '../VendorOfferNegotiationTimeline';

interface JobVendorOffersPanelProps {
  jobId: string;
  currencyCode?: string;
}

function offerStatusVariant(
  status: string,
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const s = coerceVendorOfferStatus(status);
  if (s === 'APPROVED') return 'success';
  if (s === 'DISAPPROVED') return 'danger';
  if (s === 'NEGOTIATING') return 'warning';
  if (s === 'VENDOR_REVIEW' || s === 'SENT') return 'info';
  return 'neutral';
}

function StaffOfferRow({
  jobId,
  offer,
  busy,
  onBusyError,
  onBusySuccess,
}: {
  jobId: string;
  offer: VendorJobOffer;
  busy: boolean;
  onBusyError: (msg: string) => void;
  onBusySuccess: (msg: string) => void;
}) {
  const status = coerceVendorOfferStatus(offer.status);
  const actions = useStaffVendorOfferActions(jobId);
  const { data: timeline, isLoading: timelineLoading } = useStaffVendorOfferNegotiation(
    offer.id,
    true,
  );
  const events = useMemo(
    () => sortNegotiationEvents(timeline?.events ?? []),
    [timeline?.events],
  );
  const quoteLikeStatus = vendorStatusAsQuotationLike(status);
  const closed = isNegotiationClosed(quoteLikeStatus, events);
  const pricing = timeline?.pricing ?? offer.negotiationPricing;
  const pendingCounter = getPendingCustomerCounterTotal(pricing, events, closed);
  const settlement = getNegotiationSettlement({
    status: quoteLikeStatus,
    events,
    pricing,
    revenueTotal: offer.costTotal ?? offer.totalAmount,
  });

  const [reviseMessage, setReviseMessage] = useState('');
  const [proposedTotal, setProposedTotal] = useState(
    String(pricing?.tenantProposedTotal ?? offer.costTotal ?? offer.totalAmount ?? ''),
  );
  const [acceptComments, setAcceptComments] = useState('');
  const [rejectMessage, setRejectMessage] = useState('');
  const [terminalReject, setTerminalReject] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  const canRevise = canStaffReviseVendorOffer(status) && !closed;
  const canRespondCounter =
    canStaffRespondToVendorCounter(status) && pendingCounter != null && !closed;
  const canApprove = canStaffApproveVendorOffer(status) && !closed;

  const run = async (fn: () => Promise<unknown>, success: string) => {
    try {
      await fn();
      onBusySuccess(success);
    } catch (err) {
      onBusyError(getServerErrorMessage(err));
    }
  };

  return (
    <div className="rounded-md border border-[var(--color-neutral-100)] p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">
            {offer.vendorPartyName || offer.vendorPartyId || offer.id}
          </div>
          <div className="text-xs text-[var(--color-neutral-500)]">
            {[
              formatVendorMoney(offer.costTotal ?? offer.totalAmount, offer.currencyCode),
              offer.updatedAt ? `Updated ${offer.updatedAt}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>
        <Badge variant={offerStatusVariant(status)}>{vendorOfferStatusLabel(status)}</Badge>
      </div>

      {offer.notes ? (
        <p className="text-xs text-[var(--color-neutral-600)] whitespace-pre-wrap">
          Pass notes: {offer.notes}
        </p>
      ) : null}

      <NegotiationPricingCard
        title="Cost negotiation"
        pricing={pricing}
        currencyCode={offer.currencyCode}
        tenantOfferLabel="Tenant cost offer"
        counterOfferLabel="Vendor counter"
        counterLinesLabel="Vendor proposed lines"
        emptyTenantHint="Seed a cost when passing, or revise and send a total."
        settlement={settlement}
        settlementAcceptLabels={{
          counterpartyAcceptedTenant: 'Vendor accepted the tenant cost offer',
          tenantAcceptedCounter: 'Tenant accepted the vendor counter',
        }}
      />

      <VendorOfferNegotiationTimeline events={events} isLoading={timelineLoading} />

      {closed ? (
        <p className="text-xs text-[var(--color-neutral-600)]">
          Negotiation closed —{' '}
          {status === 'APPROVED' ? 'approved.' : status === 'DISAPPROVED' ? 'disapproved.' : 'done.'}
        </p>
      ) : null}

      {canRespondCounter ? (
        <div className="space-y-2 border-t border-[var(--color-neutral-100)] pt-2">
          <p className="text-xs font-medium text-[var(--color-neutral-700)]">
            Vendor counter pending ({pendingCounter})
          </p>
          <Input
            value={acceptComments}
            onChange={(e) => setAcceptComments(e.target.value)}
            placeholder="Comments when accepting (optional)"
            disabled={busy}
          />
          <Input
            value={rejectMessage}
            onChange={(e) => setRejectMessage(e.target.value)}
            placeholder="Reject message (required to reject)"
            disabled={busy}
          />
          <label className="flex items-center gap-2 text-xs text-[var(--color-neutral-600)]">
            <input
              type="checkbox"
              checked={terminalReject}
              onChange={(e) => setTerminalReject(e.target.checked)}
              disabled={busy}
            />
            Terminal reject (DISAPPROVED)
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={busy || actions.acceptCounter.isPending}
              onClick={() =>
                void run(
                  () =>
                    actions.acceptCounter.mutateAsync({
                      offerId: offer.id,
                      dto: acceptComments.trim()
                        ? { comments: acceptComments.trim() }
                        : undefined,
                    }),
                  'Vendor counter accepted — offer APPROVED.',
                )
              }
            >
              Accept counter
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy || !rejectMessage.trim() || actions.rejectCounter.isPending}
              onClick={() =>
                void run(
                  () =>
                    actions.rejectCounter.mutateAsync({
                      offerId: offer.id,
                      dto: { message: rejectMessage.trim(), terminal: terminalReject },
                    }),
                  terminalReject
                    ? 'Offer disapproved.'
                    : 'Counter rejected — returned to vendor review.',
                )
              }
            >
              Reject counter
            </Button>
          </div>
        </div>
      ) : null}

      {canRevise ? (
        <div className="space-y-2 border-t border-[var(--color-neutral-100)] pt-2">
          <p className="text-xs font-medium text-[var(--color-neutral-700)]">Revise and send</p>
          <Input
            value={reviseMessage}
            onChange={(e) => setReviseMessage(e.target.value)}
            placeholder="Message to vendor (required)"
            disabled={busy}
          />
          <Input
            type="number"
            min={0}
            step="any"
            value={proposedTotal}
            onChange={(e) => setProposedTotal(e.target.value)}
            placeholder="Proposed cost total"
            disabled={busy}
          />
          <Button
            type="button"
            size="sm"
            disabled={busy || !reviseMessage.trim() || actions.reviseAndSend.isPending}
            onClick={() => {
              const total = Number(proposedTotal);
              void run(
                () =>
                  actions.reviseAndSend.mutateAsync({
                    offerId: offer.id,
                    dto: {
                      message: reviseMessage.trim(),
                      ...(Number.isFinite(total) && total >= 0
                        ? { proposed_total: total }
                        : {}),
                    },
                  }),
                'Revised offer sent — status VENDOR_REVIEW.',
              );
            }}
          >
            Revise and send
          </Button>
        </div>
      ) : null}

      {canApprove ? (
        <div className="space-y-2 border-t border-[var(--color-neutral-100)] pt-2">
          <Input
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Review notes (required to disapprove)"
            disabled={busy}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={busy || actions.approve.isPending}
              onClick={() =>
                void run(
                  () =>
                    actions.approve.mutateAsync({
                      offerId: offer.id,
                      dto: { review_notes: reviewNotes.trim() || undefined },
                    }),
                  'Offer approved.',
                )
              }
            >
              Approve
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy || !reviewNotes.trim() || actions.disapprove.isPending}
              onClick={() =>
                void run(
                  () =>
                    actions.disapprove.mutateAsync({
                      offerId: offer.id,
                      dto: { review_notes: reviewNotes.trim() },
                    }),
                  'Offer disapproved.',
                )
              }
            >
              Disapprove
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function JobVendorOffersPanel({ jobId, currencyCode }: JobVendorOffersPanelProps) {
  const { data: offers = [], isLoading, isError, error, refetch, isFetching } =
    useJobVendorOffers(jobId);
  const passToVendor = usePassJobToVendor(jobId);

  const { data: vendorPartiesResult } = useParties({
    page: 1,
    limit: 200,
    party_type: 'VENDOR',
    order: 'asc',
  });
  const { data: supplierPartiesResult } = useParties({
    page: 1,
    limit: 200,
    party_type: 'SUPPLIER',
    order: 'asc',
  });

  const vendorParties = useMemo(() => {
    const byId = new Map<string, { id: string; label: string; kind: string }>();
    for (const p of vendorPartiesResult?.parties ?? []) {
      if (!isUuid(p.id)) continue;
      byId.set(p.id, {
        id: p.id,
        kind: 'VENDOR',
        label: [p.code, p.name, 'Vendor'].filter(Boolean).join(' — ') || p.id,
      });
    }
    for (const p of supplierPartiesResult?.parties ?? []) {
      if (!isUuid(p.id) || byId.has(p.id)) continue;
      byId.set(p.id, {
        id: p.id,
        kind: 'SUPPLIER',
        label: [p.code, p.name, 'Supplier'].filter(Boolean).join(' — ') || p.id,
      });
    }
    return Array.from(byId.values()).sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'VENDOR' ? -1 : 1;
      return a.label.localeCompare(b.label);
    });
  }, [vendorPartiesResult?.parties, supplierPartiesResult?.parties]);

  const [vendorPartyId, setVendorPartyId] = useState('');
  const [passNotes, setPassNotes] = useState('');
  const [proposedTotal, setProposedTotal] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const busy = passToVendor.isPending || isFetching;

  const handlePass = () => {
    if (!isUuid(vendorPartyId)) {
      setActionError('Select a vendor party.');
      return;
    }
    const trimmedPrice = proposedTotal.trim();
    let price: number | undefined;
    if (trimmedPrice) {
      price = Number(trimmedPrice);
      if (!Number.isFinite(price) || price < 0) {
        setActionError('Enter a valid vendor price (0 or greater), or leave it blank.');
        return;
      }
    }
    setActionError(null);
    setMsg(null);
    void passToVendor
      .mutateAsync({
        vendor_party_id: vendorPartyId,
        notes: passNotes.trim() || undefined,
        currency_code: currencyCode?.trim() || undefined,
        proposed_total: price,
      })
      .then(() => {
        setMsg(
          price != null
            ? `Job sent to vendor with cost offer ${price.toLocaleString()}${currencyCode ? ` ${currencyCode}` : ''}. Vendor sees this price on the job.`
            : 'Job sent to vendor. Vendor can submit their cost price next.',
        );
        setPassNotes('');
        setProposedTotal('');
        void refetch();
      })
      .catch((err) => setActionError(getServerErrorMessage(err)));
  };

  return (
    <div className="space-y-4">
      {(actionError || (isError && error)) && (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {actionError || getServerErrorMessage(error)}
        </p>
      )}
      {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Send to vendor</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-[var(--color-neutral-500)]">
            Sends via <code className="text-[10px]">POST /jobs/:id/send-to-vendor</code>. Optional{' '}
            <code className="text-[10px]">proposed_total</code> sets the tenant cost offer (
            <code className="text-[10px]">cost_total</code>) shown on the vendor job. Customer
            sell/revenue prices are never shared.
          </p>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-neutral-600)]">Vendor party</span>
            <select
              className="w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
              value={vendorPartyId}
              onChange={(e) => setVendorPartyId(e.target.value)}
              disabled={busy}
            >
              <option value="">Select vendor…</option>
              {vendorParties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-neutral-600)]">
              Vendor price / cost offer{currencyCode ? ` (${currencyCode})` : ''}
            </span>
            <input
              type="number"
              min={0}
              step="any"
              className="w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
              value={proposedTotal}
              onChange={(e) => setProposedTotal(e.target.value)}
              disabled={busy}
              placeholder="e.g. 1250"
            />
            <span className="text-[11px] text-[var(--color-neutral-500)]">
              Shown to the vendor as the tenant cost offer on their job description.
            </span>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-neutral-600)]">
              Notes / instructions (optional)
            </span>
            <textarea
              className="w-full min-h-[72px] rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
              value={passNotes}
              onChange={(e) => setPassNotes(e.target.value)}
              disabled={busy}
              maxLength={2000}
              placeholder="Instructions for the vendor"
            />
          </label>
          <Button
            type="button"
            size="sm"
            disabled={busy || !vendorPartyId}
            onClick={handlePass}
          >
            {passToVendor.isPending ? 'Sending…' : 'Send to vendor'}
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendor offers</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-3">
          {isLoading ? (
            <p className="text-sm text-[var(--color-neutral-400)]">Loading offers…</p>
          ) : offers.length === 0 ? (
            <p className="text-sm text-[var(--color-neutral-400)]">
              No vendor offers yet. Pass this job with a seeded cost to start negotiation.
            </p>
          ) : (
            offers.map((offer) => (
              <StaffOfferRow
                key={offer.id}
                jobId={jobId}
                offer={offer}
                busy={busy}
                onBusyError={setActionError}
                onBusySuccess={setMsg}
              />
            ))
          )}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => void refetch()}
          >
            Refresh offers
          </Button>
        </div>
      </Card>
    </div>
  );
}
