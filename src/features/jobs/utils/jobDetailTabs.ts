import { JOB_DETAIL_TABS, type JobDetailTabKey } from '../api/job.api';
import type { Job, JobDetailTab } from '../types/job.types';

export function jobDetailTabLabel(key: string): string {
  const api = toApiDetailTabKey(key);
  switch (api) {
    case 'show_all':
      return 'Show All';
    case 'info':
      return 'Info';
    case 'organization':
      return 'Party';
    case 'dimensions':
      return 'Dimensions';
    case 'planned_container':
      return 'Planned containers';
    case 'actual_container':
      return 'Actual containers';
    case 'costing':
      return 'Costing';
    case 'history':
      return 'History';
    case 'shipments':
      return 'Shipments';
    case 'department':
      return 'Department';
    case 'ex_rate':
      return 'Exchange rate';
    case 'routing':
      return 'Routing';
    case 'customs':
      return 'Customs';
    case 'shipping_bill_boe':
      return 'Shipping bill / BOE';
    case 'booking_form':
      return 'Booking form';
    default:
      return key.replaceAll('_', ' ');
  }
}

/**
 * Map FE / legacy aliases → exact backend DETAIL_TABS key.
 */
export function toApiDetailTabKey(value: string): string {
  const norm = value.trim().toLowerCase().replace(/-/g, '_');
  if (!norm) return norm;

  if (norm === 'show_all' || norm === 'showall') return 'show_all';
  if (norm === 'info' || norm === 'information' || norm === 'overview') return 'info';
  if (norm === 'organization' || norm === 'organisation' || norm === 'party') {
    return 'organization';
  }
  if (norm === 'dimensions' || norm === 'dimension') return 'dimensions';
  if (
    norm === 'planned_container' ||
    norm === 'planned_containers' ||
    norm === 'planned_consignment'
  ) {
    return 'planned_container';
  }
  if (
    norm === 'actual_container' ||
    norm === 'actual_containers' ||
    norm === 'actual_consignment'
  ) {
    return 'actual_container';
  }
  if (norm === 'costing' || norm === 'charges') return 'costing';
  if (norm === 'history' || norm === 'audit') return 'history';
  if (norm === 'shipments' || norm === 'shipment') return 'shipments';
  if (norm === 'department' || norm === 'dept') return 'department';
  if (norm === 'ex_rate' || norm === 'exchange_rate' || norm === 'exrate') {
    return 'ex_rate';
  }
  if (norm === 'routing' || norm === 'route') return 'routing';
  if (
    norm === 'customs' ||
    norm === 'customs_sb_boe' ||
    norm === 'customs_shipping_bill'
  ) {
    return 'customs';
  }
  if (
    norm === 'shipping_bill_boe' ||
    norm === 'shipping_bill' ||
    norm === 'boe'
  ) {
    return 'shipping_bill_boe';
  }
  if (norm === 'booking_form' || norm === 'ops') return 'booking_form';

  return norm;
}

/** Panels that are NOT `/jobs/:id/detail/:tab` — shown from the Actions toolbar. */
export const JOB_ACTION_PANEL_KEYS = [
  'documents',
  'invoices',
  'pnl',
  'milestones',
  'notes',
  'vendor-offers',
  'logistics',
  'gpum',
  'cargo',
  'bl',
  'stuffing',
  'sea-scans',
  'house',
  'cc-details',
  'cc-lines',
  'cc-checklist',
  'cc-declaration',
  'cc-queries',
  'cc-finance',
] as const;

export type JobActionPanelKey = (typeof JOB_ACTION_PANEL_KEYS)[number];

export function isJobActionPanelKey(value: string): value is JobActionPanelKey {
  return (JOB_ACTION_PANEL_KEYS as readonly string[]).includes(value);
}

export function isJobDetailTabKey(value: string): boolean {
  const key = toApiDetailTabKey(value);
  return (JOB_DETAIL_TABS as readonly string[]).includes(key);
}

export function normalizeJobDetailTabKey(value: string): string {
  return toApiDetailTabKey(value);
}

export function jobActionPanelLabel(key: JobActionPanelKey): string {
  switch (key) {
    case 'documents':
      return 'Documents';
    case 'invoices':
      return 'Invoices';
    case 'pnl':
      return 'P&L';
    case 'milestones':
      return 'Milestones';
    case 'notes':
      return 'Notes';
    case 'vendor-offers':
      return 'Vendor offers';
    case 'logistics':
      return 'Logistics';
    case 'gpum':
      return 'GPUM';
    case 'cargo':
      return 'Cargo';
    case 'bl':
      return 'Bills of lading';
    case 'stuffing':
      return 'Stuffing';
    case 'sea-scans':
      return 'Sea scans';
    case 'house':
      return 'House jobs';
    case 'cc-details':
      return 'CC Details';
    case 'cc-lines':
      return 'CC Lines';
    case 'cc-checklist':
      return 'Checklist';
    case 'cc-declaration':
      return 'Declaration';
    case 'cc-queries':
      return 'Queries';
    case 'cc-finance':
      return 'CC Finance';
    default:
      return key;
  }
}

/**
 * Resolve tab strip from GET /jobs/:id/detail `tabs` + full DETAIL_TABS fallback.
 * Always normalize to backend keys; Party label for organization.
 */
export function resolveJobDetailTabs(job: Job): JobDetailTab[] {
  const known = new Set<string>(JOB_DETAIL_TABS as readonly string[]);
  const seen = new Set<string>();
  const out: JobDetailTab[] = [];

  const push = (rawKey: string) => {
    const key = toApiDetailTabKey(rawKey);
    if (!known.has(key) || seen.has(key)) return;
    if (isJobActionPanelKey(key)) return;
    seen.add(key);
    out.push({ key, label: jobDetailTabLabel(key) });
  };

  for (const t of job.tabs ?? []) {
    if (t?.key) push(t.key);
  }
  for (const key of JOB_DETAIL_TABS) {
    push(key);
  }

  return out;
}

export function defaultJobDetailTabKey(
  job: Job,
  preferBookingForm: boolean,
): JobDetailTabKey | string {
  const tabs = resolveJobDetailTabs(job);
  if (preferBookingForm) {
    const booking = tabs.find((t) => toApiDetailTabKey(t.key) === 'booking_form');
    if (booking) return booking.key;
  }
  const info = tabs.find((t) => toApiDetailTabKey(t.key) === 'info');
  return info?.key ?? tabs[0]?.key ?? 'info';
}
