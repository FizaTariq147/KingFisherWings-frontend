import { isAirJobType } from '@/features/jobs/constants/job.constants';
import type { PortalQuotationDetail } from '../types/portalQuotations.types';
import {
  normalizePortalQuoteStatus,
  portalQuoteShowsBookingForm,
} from '../utils/portalQuotationStatus';
import {
  canPortalCustomerRespond as canRespondCanonical,
  isCustomerApprovedStatus,
} from '@/features/quotations/utils/quotationStatus';
import { getCustomerQuoteDecision } from '@/features/quotations/utils/customerQuoteDecision';

export type PortalCommercialStepId =
  | 'quote-sent'
  | 'customer-accepted'
  | 'booking-form'
  | 'invoice-sent';

type Step = {
  id: PortalCommercialStepId;
  label: string;
  owner: string;
  detail?: string;
};

const STEPS: readonly Step[] = [
  {
    id: 'quote-sent',
    label: 'Quote sent',
    owner: 'SALES',
    detail: 'Review charges from your forwarder',
  },
  {
    id: 'customer-accepted',
    label: 'You accept',
    owner: 'CUSTOMER',
    detail: 'Approve the quotation',
  },
  {
    id: 'booking-form',
    label: 'Booking form',
    owner: 'CUSTOMER',
    detail: 'Complete the compliance booking form',
  },
  {
    id: 'invoice-sent',
    label: 'Invoice',
    owner: 'SALES',
    detail: 'Forwarder sends invoice next',
  },
] as const;

export function usesPortalCommercialFlow(jobType?: string): boolean {
  const jt = String(jobType ?? '')
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  return isAirJobType(jt) || jt.startsWith('AIR') || jt.startsWith('NVOCC');
}

function resolveCurrentStep(
  quote: PortalQuotationDetail,
  formSubmitted: boolean,
): PortalCommercialStepId {
  if (formSubmitted) return 'invoice-sent';

  const showsForm = portalQuoteShowsBookingForm(quote);
  if (showsForm) return 'booking-form';

  const s = normalizePortalQuoteStatus(quote.status);
  const decided = getCustomerQuoteDecision(quote.id) === 'APPROVED';
  if (isCustomerApprovedStatus(s) || decided || s === 'CONVERTED' || s === 'ACCEPTED') {
    return 'booking-form';
  }

  if (canRespondCanonical(s) || s === 'CUSTOMER_REVIEW' || s === 'NEGOTIATING') {
    return 'customer-accepted';
  }

  return 'quote-sent';
}

interface PortalCommercialFlowRailProps {
  quote: PortalQuotationDetail;
  /** True after customer submitted the compliance booking form. */
  formSubmitted?: boolean;
}

/** Customer-facing shared commercial rail (Air + NVOCC) matching the flowchart. */
export function PortalCommercialFlowRail({
  quote,
  formSubmitted = false,
}: PortalCommercialFlowRailProps) {
  if (!usesPortalCommercialFlow(quote.jobType)) return null;

  const isAir =
    isAirJobType(quote.jobType) ||
    String(quote.jobType ?? '')
      .toUpperCase()
      .startsWith('AIR');
  const current = resolveCurrentStep(quote, formSubmitted);
  const currentIdx = STEPS.findIndex((s) => s.id === current);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-[var(--color-neutral-800)]">
          {isAir ? 'Air freight' : 'NVOCC'} · Shared commercial
        </p>
        <p className="text-xs text-[var(--color-neutral-500)]">
          Accept → booking form → invoice
        </p>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => {
          const completed = currentIdx >= 0 && index < currentIdx;
          const active = step.id === current;
          return (
            <li
              key={step.id}
              className={[
                'rounded-md border px-3 py-2 text-left',
                active
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-[0_0_0_2px_rgba(10,41,66,0.12)]'
                  : completed
                    ? 'border-emerald-200 bg-emerald-50/60 opacity-90'
                    : 'border-[var(--color-neutral-200)] bg-white',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                  {index + 1}. {step.owner}
                </span>
                {completed ? (
                  <span className="text-[10px] font-semibold uppercase text-emerald-700">Done</span>
                ) : active ? (
                  <span className="text-[10px] font-semibold uppercase text-[var(--color-primary)]">
                    Now
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm font-medium text-[var(--color-neutral-900)]">{step.label}</p>
              {step.detail ? (
                <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-neutral-500)]">
                  {step.detail}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
