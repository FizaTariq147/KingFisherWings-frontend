/**
 * Lifecycle continuum — same sequence on Enquiry / Quotation / Shipment / Job:
 * Enquiry → Quotation → Verified → Approved → Shipment → Job
 * (optional Party prefix when a party id is present).
 */
export type ContinuumStepKey =
  | 'party'
  | 'enquiry'
  | 'quotation'
  | 'verified'
  | 'approved'
  | 'shipment'
  | 'job';

export interface ContinuumStep {
  key: ContinuumStepKey;
  label: string;
  done: boolean;
  current?: boolean;
  /** Terminal failure (cancelled / lost) at this step. */
  blocked?: boolean;
  href?: string;
}

const DEFAULT_LABELS: Record<ContinuumStepKey, string> = {
  party: 'Party',
  enquiry: 'Enquiry',
  quotation: 'Quotation',
  verified: 'Verified',
  approved: 'Approved',
  shipment: 'Shipment',
  job: 'Job',
};

const ORDER: ContinuumStepKey[] = [
  'party',
  'enquiry',
  'quotation',
  'verified',
  'approved',
  'shipment',
  'job',
];

/** Shared Verified gate — same rules on every detail page in the lifecycle. */
export function continuumVerified(input: {
  verified?: boolean;
  quotationStatus?: string | null;
  enquiryStatus?: string | null;
  hasShipment?: boolean;
  hasJob?: boolean;
}): boolean {
  if (input.verified === true) return true;
  if (input.hasShipment || input.hasJob) return true;
  const qs = String(input.quotationStatus ?? '')
    .trim()
    .toUpperCase();
  if (
    qs === 'VERIFIED' ||
    qs === 'INTERNALLY_APPROVED' ||
    qs === 'SENT' ||
    qs === 'CUSTOMER_REVIEW' ||
    qs === 'NEGOTIATING' ||
    qs === 'APPROVED' ||
    qs === 'CONVERTED' ||
    qs === 'WON'
  ) {
    return true;
  }
  const es = String(input.enquiryStatus ?? '')
    .trim()
    .toUpperCase();
  return es === 'QUOTED' || es === 'BOOKED';
}

/** Shared Approved gate — same rules on every detail page in the lifecycle. */
export function continuumApproved(input: {
  approved?: boolean;
  quotationStatus?: string | null;
  enquiryStatus?: string | null;
  hasShipment?: boolean;
  hasJob?: boolean;
}): boolean {
  if (input.approved === true) return true;
  if (input.hasShipment || input.hasJob) return true;
  const qs = String(input.quotationStatus ?? '')
    .trim()
    .toUpperCase();
  if (qs === 'APPROVED' || qs === 'CONVERTED' || qs === 'WON') return true;
  const es = String(input.enquiryStatus ?? '')
    .trim()
    .toUpperCase();
  return es === 'BOOKED';
}

export function buildFclContinuumSteps(input: {
  partyId?: string | null;
  partyHref?: string;
  enquiryId?: string | null;
  enquiryHref?: string;
  quotationId?: string | null;
  quotationHref?: string;
  verified?: boolean;
  approved?: boolean;
  /** Used when verified/approved not passed explicitly — keeps pages in sync. */
  quotationStatus?: string | null;
  enquiryStatus?: string | null;
  shipmentId?: string | null;
  shipmentHref?: string;
  jobId?: string | null;
  jobHref?: string;
  /** When true, the first incomplete step is marked blocked (e.g. cancelled enquiry). */
  workflowBlocked?: boolean;
  /** When false, hide Party even if partyId is set (default: show when partyId present). */
  includeParty?: boolean;
}): ContinuumStep[] {
  const hasShipment = Boolean(input.shipmentId);
  const hasJob = Boolean(input.jobId);
  const verified = continuumVerified({
    verified: input.verified,
    quotationStatus: input.quotationStatus,
    enquiryStatus: input.enquiryStatus,
    hasShipment,
    hasJob,
  });
  const approved = continuumApproved({
    approved: input.approved,
    quotationStatus: input.quotationStatus,
    enquiryStatus: input.enquiryStatus,
    hasShipment,
    hasJob,
  });

  const flags: Record<ContinuumStepKey, boolean> = {
    party: Boolean(input.partyId),
    enquiry: Boolean(input.enquiryId),
    quotation: Boolean(input.quotationId),
    verified,
    approved,
    shipment: hasShipment,
    job: hasJob,
  };
  const hrefs: Partial<Record<ContinuumStepKey, string | undefined>> = {
    party: input.partyId
      ? input.partyHref ?? `/parties/${input.partyId}`
      : undefined,
    enquiry: input.enquiryId
      ? input.enquiryHref ?? `/sales/enquiries/${input.enquiryId}`
      : undefined,
    quotation: input.quotationId
      ? input.quotationHref ?? `/quotations/${input.quotationId}`
      : undefined,
    shipment: input.shipmentId
      ? input.shipmentHref ?? `/operations/shipments/${input.shipmentId}`
      : undefined,
    job: input.jobId ? input.jobHref : undefined,
  };

  const includeParty = input.includeParty !== false && Boolean(input.partyId);
  const order = includeParty
    ? ORDER
    : (ORDER.filter((k) => k !== 'party') as ContinuumStepKey[]);

  let currentKey: ContinuumStepKey = order[0] ?? 'enquiry';
  for (const key of order) {
    if (!flags[key]) {
      currentKey = key;
      break;
    }
    currentKey = key;
  }

  const blockedKey = input.workflowBlocked
    ? order.find((key) => !flags[key]) ?? currentKey
    : undefined;

  return order.map((key) => {
    const done = flags[key];
    const blocked = Boolean(blockedKey && key === blockedKey && !done);
    const current =
      !blocked &&
      (key === currentKey && !done
        ? true
        : key === currentKey && done && key === 'job');
    return {
      key,
      label: DEFAULT_LABELS[key],
      done,
      current,
      blocked,
      href: hrefs[key],
    };
  });
}
