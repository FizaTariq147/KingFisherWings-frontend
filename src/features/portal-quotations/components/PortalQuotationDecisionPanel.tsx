import { useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getServerErrorMessage } from '@/lib/validation/mapApiErrors';
import { PortalPanel, portalSelectClassName } from '@/features/portal-auth/components/portal-ui';
import { PORTAL_QUOTATION_REJECT_REASONS } from '../api/portalQuotations.api';
import {
  useAcceptPortalQuotation,
  useRejectPortalQuotation,
} from '../hooks/usePortalQuotations';
import type { PortalQuotationDetail } from '../types/portalQuotations.types';
import {
  canPortalCustomerRespondToQuote,
  formatPortalQuotationActionError,
  portalQuoteStatusMessage,
  portalQuoteTotalAmount,
} from '../utils/portalQuotationStatus';

interface PortalQuotationDecisionPanelProps {
  quote: PortalQuotationDetail;
  /** Compact layout for list rows; default is full panel on detail page. */
  variant?: 'panel' | 'inline';
  onSuccess?: (message: string) => void;
}

export function PortalQuotationDecisionPanel({
  quote,
  variant = 'panel',
  onSuccess,
}: PortalQuotationDecisionPanelProps) {
  const acceptQuote = useAcceptPortalQuotation();
  const rejectQuote = useRejectPortalQuotation();
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<(typeof PORTAL_QUOTATION_REJECT_REASONS)[number]>(
    PORTAL_QUOTATION_REJECT_REASONS[0],
  );
  const [rejectNotes, setRejectNotes] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [confirmAccept, setConfirmAccept] = useState(false);

  const canRespond = canPortalCustomerRespondToQuote(quote.status, quote);
  const actionPending = acceptQuote.isPending || rejectQuote.isPending;
  const total = portalQuoteTotalAmount(quote);
  const currency = quote.currencyCode || 'AED';
  const statusMessage = portalQuoteStatusMessage(quote.status, quote);
  const customerCounter = quote.negotiationPricing?.customerProposedTotal;
  const isNegotiating =
    (quote.status || '').toUpperCase().replace(/\s+/g, '_') === 'NEGOTIATING';

  const runAccept = () => {
    setActionError(null);
    if (!confirmAccept) {
      setConfirmAccept(true);
      setShowReject(false);
      return;
    }
    void acceptQuote
      .mutateAsync(quote.id)
      .then(() => {
        setConfirmAccept(false);
        onSuccess?.(
          isNegotiating && customerCounter != null
            ? 'Quotation approved at the forwarder’s offer (your counter was not applied).'
            : 'Quotation approved. Your forwarder will proceed with booking.',
        );
      })
      .catch((err) => {
        setActionError(formatPortalQuotationActionError(getServerErrorMessage(err)));
      });
  };

  const runReject = () => {
    setActionError(null);
    void rejectQuote
      .mutateAsync({
        id: quote.id,
        dto: {
          reason: rejectReason,
          notes: rejectNotes.trim() || undefined,
        },
      })
      .then(() => {
        setShowReject(false);
        onSuccess?.('Quotation rejected.');
      })
      .catch((err) => {
        setActionError(formatPortalQuotationActionError(getServerErrorMessage(err)));
      });
  };

  if (!canRespond && variant === 'inline') return null;

  const actionButtons = (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        disabled={actionPending}
        onClick={runAccept}
      >
        <ThumbsUp size={14} aria-hidden="true" />
        {acceptQuote.isPending
          ? 'Approving…'
          : confirmAccept
            ? isNegotiating && customerCounter != null
              ? 'Confirm: accept their offer'
              : 'Confirm approve'
            : 'Approve quote'}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={actionPending}
        onClick={() => {
          setConfirmAccept(false);
          setShowReject((v) => !v);
        }}
      >
        <ThumbsDown size={14} aria-hidden="true" />
        Reject
      </Button>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className="space-y-2" onClick={(e) => e.preventDefault()}>
        {actionButtons}
        {actionError ? (
          <p className="text-xs text-[var(--color-danger-600)]" role="alert">
            {actionError}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <PortalPanel
      padded
      className={
        canRespond
          ? 'border-[var(--color-secondary-200)] bg-[var(--color-secondary-50)]/40'
          : undefined
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">
            {canRespond ? 'Your decision' : 'Quotation status'}
          </h2>
          {statusMessage ? (
            <p className="text-sm text-[var(--color-neutral-600)]">{statusMessage}</p>
          ) : null}
          {total != null ? (
            <p className="text-sm font-medium text-[var(--color-neutral-800)]">
              Total: {currency} {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          ) : null}
        </div>
        {canRespond ? actionButtons : null}
      </div>

      {actionError ? (
        <p className="mt-3 text-sm text-[var(--color-danger-600)]" role="alert">
          {actionError}
        </p>
      ) : null}

      {canRespond && showReject ? (
        <div className="mt-4 space-y-3 border-t border-[var(--color-neutral-200)] pt-4">
          <p className="text-sm font-medium text-[var(--color-neutral-800)]">Reject this quotation</p>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Reason
            </span>
            <select
              className={portalSelectClassName}
              value={rejectReason}
              onChange={(e) =>
                setRejectReason(e.target.value as (typeof PORTAL_QUOTATION_REJECT_REASONS)[number])
              }
            >
              {PORTAL_QUOTATION_REJECT_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Notes (optional)
            </span>
            <textarea
              className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              maxLength={500}
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
            />
          </label>
          <Button type="button" size="sm" disabled={actionPending} onClick={runReject}>
            {rejectQuote.isPending ? 'Rejecting…' : 'Confirm reject'}
          </Button>
        </div>
      ) : null}
    </PortalPanel>
  );
}
