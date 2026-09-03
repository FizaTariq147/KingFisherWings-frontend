import type { NegotiationPricing } from '../types/quotationExtended.types';
import type { NegotiationSettlement } from '../utils/negotiationActions';

function money(value: number | undefined, currency?: string) {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${currency ? `${currency} ` : ''}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

interface NegotiationPricingCardProps {
  pricing?: NegotiationPricing | null;
  currencyCode?: string;
  title?: string;
  /** When negotiation is closed, show settled total instead of a live counter. */
  settlement?: NegotiationSettlement | null;
}

/** Displays tenant offer vs customer counter from negotiation_pricing. */
export function NegotiationPricingCard({
  pricing,
  currencyCode,
  title = 'Negotiation pricing',
  settlement,
}: NegotiationPricingCardProps) {
  if (!pricing && !settlement?.closed) return null;
  const currency = pricing?.currencyCode || currencyCode;
  const tenantOffer = pricing?.tenantProposedTotal ?? pricing?.revenueTotal;
  const closed = Boolean(settlement?.closed);
  const showLiveCounter = !closed && pricing?.customerProposedTotal != null;

  return (
    <div className="rounded-md border border-[var(--color-neutral-200)] p-3 space-y-3 text-sm">
      <p className="font-medium text-[var(--color-neutral-900)]">{title}</p>

      {closed ? (
        <div className="space-y-2">
          <div>
            <p className="text-xs text-[var(--color-neutral-500)]">Agreed total</p>
            <p className="font-semibold tabular-nums text-[var(--color-success-700)]">
              {money(settlement?.finalTotal ?? tenantOffer, currency)}
            </p>
          </div>
          {settlement?.acceptedBy === 'CUSTOMER' ? (
            <p className="text-xs text-[var(--color-neutral-600)]">
              Customer accepted the tenant offer
              {settlement.customerAbandonedCounter && settlement.lastCustomerCounter != null
                ? ` (their counter of ${money(settlement.lastCustomerCounter, currency)} was not applied).`
                : '.'}
            </p>
          ) : null}
          {settlement?.acceptedBy === 'TENANT' ? (
            <p className="text-xs text-[var(--color-neutral-600)]">
              Tenant accepted the customer counter
              {settlement.lastCustomerCounter != null
                ? ` of ${money(settlement.lastCustomerCounter, currency)}.`
                : '.'}
            </p>
          ) : null}
          {settlement?.acceptedBy == null && settlement?.lastCustomerCounter != null ? (
            <p className="text-xs text-[var(--color-neutral-500)]">
              Last customer counter (not pending):{' '}
              {money(settlement.lastCustomerCounter, currency)}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs text-[var(--color-neutral-500)]">Tenant offer (revenue)</p>
            <p className="font-semibold tabular-nums">{money(tenantOffer, currency)}</p>
            {tenantOffer == null ? (
              <p className="text-xs text-[var(--color-neutral-400)] mt-0.5">
                No priced total yet — update charge lines, then revise and send.
              </p>
            ) : null}
          </div>
          <div>
            <p className="text-xs text-[var(--color-neutral-500)]">Customer counter</p>
            <p className="font-semibold tabular-nums">
              {money(showLiveCounter ? pricing?.customerProposedTotal : undefined, currency)}
            </p>
            {showLiveCounter && pricing?.customerProposedAt ? (
              <p className="text-xs text-[var(--color-neutral-400)] mt-0.5">
                {pricing.customerProposedAt}
              </p>
            ) : null}
          </div>
        </div>
      )}

      {!closed && pricing?.customerProposedLines?.length ? (
        <div>
          <p className="text-xs font-medium text-[var(--color-neutral-600)] mb-1">
            Customer proposed lines
          </p>
          <ul className="space-y-1">
            {pricing.customerProposedLines.map((line, i) => (
              <li
                key={line.lineId ?? `${line.description}-${i}`}
                className="flex justify-between gap-2 text-xs text-[var(--color-neutral-700)]"
              >
                <span className="truncate">{line.description || 'Line'}</span>
                <span className="tabular-nums shrink-0">
                  {money(
                    line.amount ??
                      (line.unitPrice != null && line.quantity != null
                        ? line.unitPrice * line.quantity
                        : line.unitPrice),
                    currency,
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
