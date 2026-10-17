import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PartyForm } from '@/features/parties/components/PartyForm';
import { useCreateParty, useParties } from '@/features/parties/hooks/useParties';
import { partyVendorService } from '@/features/parties/services/partyVendor.service';
import type { CreatePartyFormValues } from '@/features/parties/types/party.types';
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
  vendorDisplayName,
  busy,
  onBusyError,
  onBusySuccess,
}: {
  jobId: string;
  offer: VendorJobOffer;
  /** Resolved party name when API only returns vendor_party_id. */
  vendorDisplayName?: string;
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
            {vendorDisplayName ||
              (offer.vendorPartyName && !isUuid(offer.vendorPartyName)
                ? offer.vendorPartyName
                : null) ||
              'Vendor offer'}
          </div>
          <div className="text-xs text-[var(--color-neutral-500)]">
            {[
              formatVendorMoney(offer.costTotal ?? offer.totalAmount, offer.currencyCode),
              offer.updatedAt
                ? `Updated ${
                    Number.isFinite(Date.parse(offer.updatedAt))
                      ? new Date(offer.updatedAt).toLocaleString()
                      : offer.updatedAt
                  }`
                : null,
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

      <VendorOfferNegotiationTimeline
        events={events}
        isLoading={timelineLoading}
        currencyCode={offer.currencyCode}
      />

      {closed ? (
        <p className="text-xs text-[var(--color-neutral-600)]">
          Negotiation closed —{' '}
          {status === 'APPROVED' ? 'approved.' : status === 'DISAPPROVED' ? 'disapproved.' : 'done.'}
        </p>
      ) : null}

      {status === 'APPROVED' && (offer.purchaseInvoiceId || offer.invoiceId) ? (
        <p className="text-xs text-[var(--color-neutral-700)]">
          Purchase invoice:{' '}
          <Link
            to={`/purchase-invoices/${offer.purchaseInvoiceId || offer.invoiceId}`}
            className="font-medium text-[var(--color-primary)] underline"
          >
            Open PI
          </Link>
          . Vendor posts from the vendor portal; record payment proofs here on the admin side.
        </p>
      ) : status === 'APPROVED' ? (
        <p className="text-xs text-[var(--color-neutral-500)]">
          Vendor accepted — a draft invoice is created for the vendor to post. Check Purchase
          Invoices once posted; payment proofs are recorded on this admin side.
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
  const createParty = useCreateParty();

  const vendorPartiesQuery = useParties({
    page: 1,
    limit: 200,
    party_type: 'VENDOR',
    order: 'asc',
  });
  const supplierPartiesQuery = useParties({
    page: 1,
    limit: 200,
    party_type: 'SUPPLIER',
    order: 'asc',
  });
  /** Broader lookup so offer rows resolve names even if party type differs. */
  const allPartiesLookupQuery = useParties({
    page: 1,
    limit: 200,
    order: 'asc',
  });
  const vendorPartiesResult = vendorPartiesQuery.data;
  const supplierPartiesResult = supplierPartiesQuery.data;

  const vendorParties = useMemo(() => {
    const byId = new Map<string, { id: string; label: string; kind: string }>();
    for (const p of vendorPartiesResult?.parties ?? []) {
      if (!isUuid(p.id)) continue;
      byId.set(p.id, {
        id: p.id,
        kind: 'VENDOR',
        label: [p.code, p.name].filter(Boolean).join(' — ') || p.name || p.id,
      });
    }
    for (const p of supplierPartiesResult?.parties ?? []) {
      if (!isUuid(p.id) || byId.has(p.id)) continue;
      byId.set(p.id, {
        id: p.id,
        kind: 'SUPPLIER',
        label: [p.code, p.name].filter(Boolean).join(' — ') || p.name || p.id,
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
  const [addPartyOpen, setAddPartyOpen] = useState(false);
  const [portalInvitePending, setPortalInvitePending] = useState(false);
  const [tempPortalPassword, setTempPortalPassword] = useState<string | null>(null);
  const [partyFormKey, setPartyFormKey] = useState(0);

  const partyById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of allPartiesLookupQuery.data?.parties ?? []) {
      if (!isUuid(p.id)) continue;
      const label = [p.code, p.name].filter(Boolean).join(' — ') || p.name;
      if (label && !isUuid(label)) map.set(p.id, label);
    }
    for (const p of vendorParties) {
      if (!map.has(p.id)) map.set(p.id, p.label);
    }
    return map;
  }, [allPartiesLookupQuery.data?.parties, vendorParties]);

  const busy =
    passToVendor.isPending ||
    isFetching ||
    createParty.isPending ||
    portalInvitePending;

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

  const closeAddPartyModal = () => {
    if (createParty.isPending || portalInvitePending) return;
    setAddPartyOpen(false);
    setTempPortalPassword(null);
    setPartyFormKey((k) => k + 1);
  };

  const handleCreatePartyFromModal = async (
    values: CreatePartyFormValues,
  ) => {
    setActionError(null);
    setTempPortalPassword(null);
    const party = await createParty.mutateAsync(values);
    setVendorPartyId(party.id);

    let portalNote = '';
    let tempPw: string | null = null;
    const inviteEmail = String(values.email ?? '').trim().toLowerCase();
    if (values.portal_access && inviteEmail) {
      setPortalInvitePending(true);
      try {
        const created = await partyVendorService.createUser(party.id, {
          party_id: party.id,
          email: inviteEmail,
          full_name: party.name,
          phone: values.phone?.trim() || undefined,
          send_email: true,
          invite_mode: true,
        });
        if (created.temporaryPassword) {
          tempPw = created.temporaryPassword;
          portalNote = ' Vendor portal invite created.';
        } else {
          portalNote = ' Vendor portal invite sent.';
        }
      } catch (err) {
        portalNote = ` Party created, but portal invite failed: ${getServerErrorMessage(err)}`;
      } finally {
        setPortalInvitePending(false);
      }
    }

    setMsg(`Vendor party “${party.name}” created.${portalNote}`);
    await Promise.all([
      vendorPartiesQuery.refetch(),
      supplierPartiesQuery.refetch(),
      allPartiesLookupQuery.refetch(),
    ]);

    if (tempPw) {
      setTempPortalPassword(tempPw);
    } else {
      setAddPartyOpen(false);
      setPartyFormKey((k) => k + 1);
    }
  };

  return (
    <div className="space-y-4">
      {(actionError || (isError && error)) && (
        <p className="text-sm text-[var(--color-danger-600)]" role="alert">
          {actionError || getServerErrorMessage(error)}
        </p>
      )}
      {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}

      <Modal
        open={addPartyOpen}
        size="full"
        title="Create party"
        onClose={closeAddPartyModal}
        footer={
          tempPortalPassword ? (
            <div className="flex justify-end">
              <Button type="button" size="sm" variant="secondary" onClick={closeAddPartyModal}>
                Done
              </Button>
            </div>
          ) : undefined
        }
      >
        <div className="max-h-[min(78vh,720px)] space-y-3 overflow-y-auto pr-1">
          {tempPortalPassword ? (
            <div
              role="status"
              className="rounded-md border border-[var(--color-secondary-100)] bg-[var(--color-secondary-50)] px-3 py-2 text-sm"
            >
              Temporary vendor portal password (share once):{' '}
              <span className="font-mono font-semibold">{tempPortalPassword}</span>
              <button
                type="button"
                className="ml-3 text-xs underline text-[var(--color-primary)]"
                onClick={() => void navigator.clipboard.writeText(tempPortalPassword)}
              >
                Copy
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-[var(--color-neutral-500)]">
                Same create-party wizard as Parties. On save, the new party is selected for this
                vendor offer. Enable <strong>Portal access</strong> and set an email to invite a
                vendor portal login.
              </p>
              <PartyForm
                key={partyFormKey}
                mode="create"
                layout="wizard"
                isSubmitting={createParty.isPending || portalInvitePending}
                defaultValues={{
                  party_type: 'VENDOR',
                  currency_code: currencyCode?.trim() || 'AED',
                  portal_access: true,
                }}
                onCancel={closeAddPartyModal}
                onSubmit={async (values) => {
                  try {
                    await handleCreatePartyFromModal(values as CreatePartyFormValues);
                  } catch (err) {
                    setActionError(getServerErrorMessage(err));
                    throw err;
                  }
                }}
              />
            </>
          )}
        </div>
      </Modal>

      <Card>
        <CardHeader>
          <CardTitle>Send to vendor</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-[var(--color-neutral-500)]">
            Sends via <code className="text-[10px]">POST /jobs/:id/send-to-vendor</code>. Optional{' '}
            <code className="text-[10px]">proposed_total</code> sets the tenant cost offer (
            <code className="text-[10px]">cost_total</code>) shown on the vendor job. After send,
            both sides can negotiate: vendor accepts / rejects / counters; staff revises or accepts
            the vendor counter. Customer sell/revenue prices are never shared.
          </p>
          <div className="space-y-1">
            <span className="text-xs font-medium text-[var(--color-neutral-600)]">
              Vendor party
            </span>
            <div className="flex items-end gap-2">
              <label className="min-w-0 flex-1 block">
                <span className="sr-only">Vendor party</span>
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
              <button
                type="button"
                title="Add vendor party (POST /parties)"
                aria-label="Add vendor party"
                disabled={busy}
                onClick={() => {
                  setTempPortalPassword(null);
                  setPartyFormKey((k) => k + 1);
                  setAddPartyOpen(true);
                }}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] disabled:opacity-50"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <p className="text-[11px] text-[var(--color-neutral-500)]">
              Use + for the create-party wizard in this panel, or{' '}
              <Link
                className="font-medium underline"
                to="/parties/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                open Parties
              </Link>
              .
            </p>          </div>
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
            offers.map((offer) => {
              const resolvedName =
                (offer.vendorPartyName && !isUuid(offer.vendorPartyName)
                  ? offer.vendorPartyName
                  : null) ||
                (offer.vendorPartyId ? partyById.get(offer.vendorPartyId) : undefined);
              return (
                <StaffOfferRow
                  key={offer.id}
                  jobId={jobId}
                  offer={offer}
                  vendorDisplayName={resolvedName}
                  busy={busy}
                  onBusyError={setActionError}
                  onBusySuccess={setMsg}
                />
              );
            })
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
