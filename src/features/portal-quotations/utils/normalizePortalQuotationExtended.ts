import {
  asRecord,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type {
  PortalQuotationEstimateResult,
  PortalServiceCatalogItem,
} from '../types/portalQuotations.types';

export function normalizePortalServiceCatalogItem(raw: unknown): PortalServiceCatalogItem | null {
  const record = asRecord(raw);
  if (!record) return null;
  const code = pickString(record.code, record.service_code, record.serviceCode);
  if (!code) return null;
  const name =
    pickString(record.name, record.description, record.label, record.title) || code;
  return {
    code,
    name,
    jobType: pickString(record.job_type, record.jobType) || undefined,
    pricingBasis: pickString(record.pricing_basis, record.pricingBasis, record.unit) || undefined,
    unitPrice: pickNumber(
      record.unit_price,
      record.unitPrice,
      record.sale_rate,
      record.saleRate,
      record.rate,
      record.price,
    ),
    currencyCode: pickString(record.currency_code, record.currencyCode) || undefined,
    chargeCodeId: pickString(record.charge_code_id, record.chargeCodeId) || undefined,
    source: pickString(record.source, record.pricing_source, record.pricingSource) || undefined,
    raw: record,
  };
}

export function normalizePortalServiceCatalog(raw: unknown): PortalServiceCatalogItem[] {
  const { items } = unwrapList(raw, ['items', 'services', 'catalog', 'results']);
  return items
    .map(normalizePortalServiceCatalogItem)
    .filter((item): item is PortalServiceCatalogItem => Boolean(item));
}

function normalizeJobTypeKey(value?: string): string {
  return (value || '').trim().toUpperCase().replace(/\s+/g, '_');
}

/**
 * Portal APIs sometimes ignore ?job_type= and return every portal-visible row.
 * Keep only items that match the quote job type so Air Import cannot pick Air Export prices.
 * When `allowMissingJobType` is true (costing-options are already scoped by request body),
 * items without a job type are kept.
 */
export function filterPortalServiceCatalogByJobType(
  items: PortalServiceCatalogItem[],
  jobType?: string,
  options?: { allowMissingJobType?: boolean },
): PortalServiceCatalogItem[] {
  const wanted = normalizeJobTypeKey(jobType);
  if (!wanted) return items;
  const allowMissing = options?.allowMissingJobType === true;
  return items.filter((item) => {
    const itemType = normalizeJobTypeKey(item.jobType);
    if (!itemType) return allowMissing;
    return itemType === wanted;
  });
}

export function normalizePortalEstimate(raw: unknown): PortalQuotationEstimateResult {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const linesRaw = data.lines ?? data.charge_lines ?? data.items ?? data.priced_lines;
  const lines = Array.isArray(linesRaw)
    ? linesRaw
        .map((line) => {
          const r = asRecord(line);
          if (!r) return null;
          return {
            code: pickString(r.code, r.service_code) || undefined,
            description: pickString(r.description, r.name, r.service_name) || 'Line',
            amount: pickNumber(r.amount, r.total, r.line_total),
            currencyCode: pickString(r.currency_code, r.currencyCode) || undefined,
            pricingSource: pickString(r.pricing_source, r.pricingSource, r.source) || undefined,
            unitPrice: pickNumber(r.unit_price, r.unitPrice),
            quantity: pickNumber(r.quantity, r.qty),
          };
        })
        .filter((l): l is NonNullable<typeof l> => Boolean(l))
    : [];
  return {
    volumeCbm: pickNumber(data.volume_cbm, data.volumeCbm, data.total_cbm),
    chargeableWeight: pickNumber(data.chargeable_weight, data.chargeableWeight),
    lines,
    total: pickNumber(data.total, data.total_amount, data.grand_total),
    currencyCode: pickString(data.currency_code, data.currencyCode) || undefined,
    raw: data,
  };
}

/** POST /portal/quotations/costing-options — catalog + tariff sale options for a lane. */
export function normalizePortalCostingOptions(raw: unknown): PortalServiceCatalogItem[] {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const nested =
    data.options ??
    data.items ??
    data.services ??
    data.catalog ??
    data.results ??
    data.costing_options ??
    data.costingOptions;
  if (Array.isArray(nested)) {
    return nested
      .map(normalizePortalServiceCatalogItem)
      .filter((item): item is PortalServiceCatalogItem => Boolean(item));
  }
  return normalizePortalServiceCatalog(raw);
}
