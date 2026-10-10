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

export function buildFclContinuumSteps(input: {
  partyId?: string | null;
  partyHref?: string;
  enquiryId?: string | null;
  enquiryHref?: string;
  quotationId?: string | null;
  quotationHref?: string;
  verified?: boolean;
  approved?: boolean;
  shipmentId?: string | null;
  shipmentHref?: string;
  jobId?: string | null;
  jobHref?: string;
  /** When true, the first incomplete step is marked blocked (e.g. cancelled enquiry). */
  workflowBlocked?: boolean;
}): ContinuumStep[] {
  const flags: Record<ContinuumStepKey, boolean> = {
    party: Boolean(input.partyId),
    enquiry: Boolean(input.enquiryId),
    quotation: Boolean(input.quotationId),
    verified: Boolean(input.verified),
    approved: Boolean(input.approved),
    shipment: Boolean(input.shipmentId),
    job: Boolean(input.jobId),
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

  let currentKey: ContinuumStepKey = 'party';
  for (const key of ORDER) {
    if (!flags[key]) {
      currentKey = key;
      break;
    }
    currentKey = key;
  }

  const blockedKey = input.workflowBlocked
    ? ORDER.find((key) => !flags[key]) ?? currentKey
    : undefined;

  return ORDER.map((key) => {
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
