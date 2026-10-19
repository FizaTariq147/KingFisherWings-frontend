import { isCcJobType } from '@/features/customs-clearance/constants/ccWorkflow';
import type { JobDetailTabKey } from '../api/job.api';
import type { Job, JobDetailTab } from '../types/job.types';

/** API metadata tabs — never shown in detail form / Show All (right rail owns continuum). */
export function isOpsContinuumMetaTab(key: string): boolean {
  const n = key.trim().toLowerCase().replace(/[-_\s]/g, '');
  return (
    n === 'opscontinuum' ||
    n === 'continuum' ||
    n === 'pathhints' ||
    n === 'pathhint' ||
    n === 'hints'
  );
}

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
    case 'acknowledgement':
      return 'Delivery acknowledgement';
    case 'section_files':
      return 'Section files';
    default:
      return key
        .trim()
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

/** True when the API tab key is the Show All aggregate tab. */
export function isJobShowAllTab(key: string): boolean {
  const k = key.trim().toLowerCase().replace(/-/g, '_');
  return k === 'show_all' || k === 'showall';
}

/**
 * Exact path segment for GET /jobs/:id/detail/:tab.
 * Prefer the key from GET /jobs/:id/detail `tabs` as-is (trimmed + light aliases only).
 * URL legacy aliases (ops→booking_form, charges→costing) stay in JobDetailPage only.
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
  if (norm === 'ex_rate' || norm === 'exchange_rate' || norm === 'exrate') {
    return 'ex_rate';
  }
  if (norm === 'shipping_bill' || norm === 'boe') return 'shipping_bill_boe';
  if (norm === 'dept') return 'department';

  // Pass through unknown API keys unchanged (backend is source of truth).
  return norm;
}

/** Panels that are NOT `/jobs/:id/detail/:tab` — shown from the Actions toolbar. */
export const JOB_ACTION_PANEL_KEYS = [
  'documents',
  'invoices',
  'pnl',
  'milestones',
  'notes',
  /** @deprecated Use OpsContinuumRail (right-side icons) instead of Actions toolbar. */
  'ops-continuum',
  'vendor-offers',
  'logistics',
  'gpum',
  'vouchers',
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
  if ((JOB_ACTION_PANEL_KEYS as readonly string[]).includes(value)) return true;
  const n = value.trim().toLowerCase().replace(/_/g, '-');
  return (JOB_ACTION_PANEL_KEYS as readonly string[]).includes(n);
}

/** True for any detail/{tab} key (not an Actions-toolbar panel). */
export function isJobDetailTabKey(value: string): boolean {
  const key = toApiDetailTabKey(value);
  return Boolean(key) && !isJobActionPanelKey(key);
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
    case 'ops-continuum':
      return 'Ops continuum';
    case 'vendor-offers':
      return 'Vendor offers';
    case 'logistics':
      return 'Logistics';
    case 'gpum':
      return 'GPUM';
    case 'vouchers':
      return 'Vouchers';
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

/** Action-panel → GET /jobs/:id/detail `actions` can_* flags (OpenAPI Fresa chrome). */
const JOB_ACTION_PANEL_FLAGS: Record<JobActionPanelKey, string[]> = {
  documents: ['can_documents', 'can_docs', 'can_document'],
  invoices: ['can_invoices', 'can_invoice'],
  pnl: ['can_pnl', 'can_profit_loss'],
  milestones: ['can_milestones', 'can_milestone'],
  notes: ['can_notes', 'can_note'],
  'ops-continuum': [
    'can_ops_continuum',
    'can_continuum',
    'can_comments',
    'can_follow_ups',
  ],
  'vendor-offers': ['can_vendor_offers', 'can_vendor_offers_panel', 'can_job_offers'],
  logistics: ['can_logistics'],
  gpum: ['can_gpum'],
  vouchers: ['can_vouchers', 'can_voucher'],
  cargo: ['can_cargo'],
  bl: ['can_bl', 'can_bills_of_lading', 'can_bl_entry'],
  stuffing: ['can_stuffing'],
  'sea-scans': ['can_sea_scans', 'can_sea_scan'],
  house: ['can_house', 'can_house_jobs'],
  'cc-details': ['can_cc_details', 'can_cc'],
  'cc-lines': ['can_cc_lines'],
  'cc-checklist': ['can_cc_checklist'],
  'cc-declaration': ['can_cc_declaration'],
  'cc-queries': ['can_cc_queries'],
  'cc-finance': ['can_cc_finance'],
};

function actionFlagTrue(
  actions: Record<string, unknown> | undefined,
  flags: string[],
): boolean | undefined {
  if (!actions) return undefined;
  for (const f of flags) {
    const v = actions[f];
    if (typeof v === 'boolean') return v;
  }
  return undefined;
}

/** Heuristic Actions panels when detail.actions omits (or only partially covers) can_* flags. */
function heuristicJobActionPanels(
  job: Job,
  houseCount: number,
): JobActionPanelKey[] {
  const jobType = job.job_type || '';
  const out: JobActionPanelKey[] = [
    'documents',
    'invoices',
    'pnl',
    'milestones',
    'notes',
    'vendor-offers',
    'logistics',
    'gpum',
    'vouchers',
  ];
  if (
    jobType === 'SEA_FCL_EXPORT' ||
    jobType === 'SEA_FCL_IMPORT' ||
    jobType === 'SEA_LCL_EXPORT' ||
    jobType === 'SEA_LCL_IMPORT' ||
    jobType.includes('NVOCC')
  ) {
    out.push('cargo', 'bl');
  }
  if (jobType === 'SEA_FCL_EXPORT' || jobType === 'SEA_FCL_IMPORT') {
    out.push('stuffing');
  }
  if (jobType.includes('SEA') || jobType.includes('NVOCC')) {
    out.push('sea-scans');
  }
  if (houseCount > 0) out.push('house');
  if (isCcJobType(jobType)) {
    out.push(
      'cc-details',
      'cc-lines',
      'cc-checklist',
      'cc-declaration',
      'cc-queries',
      'cc-finance',
    );
  }
  return out;
}

/**
 * Actions toolbar panels — prefer GET /jobs/:id/detail `actions` can_* flags.
 * When the detail envelope only sets a subset of panel flags, merge with heuristics
 * so missing flags do not hide OpenAPI-backed panels (explicit false still hides).
 */
export function resolveJobActionPanels(
  job: Job,
  opts: { houseJobsCount?: number } = {},
): JobActionPanelKey[] {
  const actions = job.actions as Record<string, unknown> | undefined;
  const houseCount = opts.houseJobsCount ?? 0;
  const heuristic = heuristicJobActionPanels(job, houseCount);
  const heuristicSet = new Set(heuristic);

  const out: JobActionPanelKey[] = [];
  for (const key of JOB_ACTION_PANEL_KEYS) {
    // Continuum lives on the fixed right-side icon rail, not the Actions toolbar.
    if (key === 'ops-continuum') continue;
    if (key === 'house' && houseCount <= 0) continue;
    const flag = actionFlagTrue(actions, JOB_ACTION_PANEL_FLAGS[key]);
    if (flag === false) continue;
    if (flag === true || heuristicSet.has(key)) out.push(key);
  }
  return out;
}

/**
 * Tab strip = only keys from GET /jobs/:id/detail `tabs`.
 * Each key is passed as-is (normalized) to GET /jobs/:id/detail/:tab — no hardcoded fallback.
 */
export function resolveJobDetailTabs(job: Job): JobDetailTab[] {
  const apiTabs = job.tabs;
  if (!apiTabs?.length) return [];

  const seen = new Set<string>();
  const out: JobDetailTab[] = [];

  for (const t of apiTabs) {
    if (!t?.key) continue;
    const key = toApiDetailTabKey(t.key);
    if (!key || seen.has(key) || isJobActionPanelKey(key) || isOpsContinuumMetaTab(key)) {
      continue;
    }
    seen.add(key);
    const apiLabel = t.label?.trim();
    const lower = apiLabel?.toLowerCase() ?? '';
    // Prefer mapped labels; never show raw snake_case keys (underscores) in the strip.
    const label =
      apiLabel &&
      !/[_-]/.test(apiLabel) &&
      lower !== 'organization' &&
      lower !== 'organisation'
        ? apiLabel
        : jobDetailTabLabel(key);
    out.push({ key, label });
  }

  return out;
}

/**
 * Default tab when opening a job: Show All (GET /jobs/:id/detail/show_all).
 * Falls back to info, then first API tab. Optional preferBookingForm for deep-links.
 */
export function defaultJobDetailTabKey(
  job: Job,
  preferBookingForm = false,
): JobDetailTabKey | string {
  const tabs = resolveJobDetailTabs(job);
  if (!tabs.length) return '';
  if (preferBookingForm) {
    const booking = tabs.find((t) => toApiDetailTabKey(t.key) === 'booking_form');
    if (booking) return booking.key;
  }
  const showAll = tabs.find((t) => isJobShowAllTab(t.key));
  if (showAll) return showAll.key;
  const info = tabs.find((t) => toApiDetailTabKey(t.key) === 'info');
  return info?.key ?? tabs[0]!.key;
}
