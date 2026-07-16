import type { JobType } from '@/features/jobs/constants/job.constants';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import { AWB_STOCK_ROUTE_PREFIX } from '@/features/awbStock/api/awbStock.api';
import { SEARCH_TYPE_LABELS } from '../constants/search.constants';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(r: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const v = r[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return undefined;
}

function normalizeType(raw: unknown): string {
  const t = String(raw || '')
    .trim()
    .toLowerCase();
  if (t === 'job') return 'jobs';
  if (t === 'quotation') return 'quotations';
  if (t === 'party' || t === 'customer' || t === 'shipper' || t === 'consignee')
    return 'parties';
  if (t === 'invoice') return 'invoices';
  return t || 'other';
}

export function searchGroupLabel(type: string): string {
  return SEARCH_TYPE_LABELS[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

/** Resolve detail route for a search hit. */
export function resolveSearchHref(
  type: string,
  id: string,
  raw: Record<string, unknown> = {},
): string {
  const t = normalizeType(type);
  switch (t) {
    case 'jobs': {
      const jobType = (pickString(raw, 'job_type', 'jobType') || 'AIR_EXPORT') as JobType;
      return jobDetailPath({ id, job_type: jobType });
    }
    case 'quotations':
      return `/quotations/${id}`;
    case 'parties':
      return `/parties/${id}`;
    case 'invoices':
      return `/invoices/${id}`;
    case 'awb_stock':
    case 'awb-stock':
    case 'awb_stock_batches':
      return `${AWB_STOCK_ROUTE_PREFIX}/${id}`;
    default:
      return '#';
  }
}

export function hitTitle(type: string, raw: Record<string, unknown>, id: string): string {
  const t = normalizeType(type);
  if (t === 'jobs') {
    return pickString(raw, 'job_number', 'jobNumber', 'title', 'name') || `Job ${id.slice(0, 8)}`;
  }
  if (t === 'quotations') {
    return (
      pickString(raw, 'quotation_number', 'quotationNumber', 'number', 'title', 'name') ||
      `Quotation ${id.slice(0, 8)}`
    );
  }
  if (t === 'parties') {
    return (
      pickString(raw, 'name', 'party_name', 'partyName', 'code', 'title') ||
      `Party ${id.slice(0, 8)}`
    );
  }
  if (t === 'invoices') {
    return (
      pickString(raw, 'invoice_number', 'invoiceNumber', 'number', 'title') ||
      `Invoice ${id.slice(0, 8)}`
    );
  }
  return pickString(raw, 'title', 'name', 'label', 'code', 'number') || id.slice(0, 8);
}

export function hitSubtitle(type: string, raw: Record<string, unknown>): string | undefined {
  const t = normalizeType(type);
  const parts: string[] = [];
  if (t === 'jobs') {
    const jobType = pickString(raw, 'job_type', 'jobType');
    const shipper = pickString(raw, 'shipper_name', 'shipperName', 'customer_name');
    if (jobType) parts.push(jobType.replace(/_/g, ' '));
    if (shipper) parts.push(shipper);
  } else if (t === 'quotations') {
    const customer = pickString(raw, 'customer_name', 'customerName', 'party_name');
    const jobType = pickString(raw, 'job_type', 'jobType');
    if (customer) parts.push(customer);
    if (jobType) parts.push(jobType.replace(/_/g, ' '));
  } else if (t === 'parties') {
    const code = pickString(raw, 'code', 'party_code');
    const partyType = pickString(raw, 'party_type', 'partyType', 'type');
    if (code) parts.push(code);
    if (partyType) parts.push(partyType.replace(/_/g, ' '));
  } else if (t === 'invoices') {
    const party = pickString(raw, 'party_name', 'customer_name');
    if (party) parts.push(party);
  }
  const status = pickString(raw, 'status');
  if (status && !parts.includes(status)) parts.push(status);
  return parts.length ? parts.join(' · ') : undefined;
}

export { normalizeType };
