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
  const code = pickString(record.code);
  const name = pickString(record.name);
  if (!code || !name) return null;
  return {
    code,
    name,
    jobType: pickString(record.job_type, record.jobType) || undefined,
    pricingBasis: pickString(record.pricing_basis, record.pricingBasis) || undefined,
    unitPrice: pickNumber(record.unit_price, record.unitPrice),
    currencyCode: pickString(record.currency_code, record.currencyCode) || undefined,
    raw: record,
  };
}

export function normalizePortalServiceCatalog(raw: unknown): PortalServiceCatalogItem[] {
  const { items } = unwrapList(raw, ['items', 'services', 'catalog', 'results']);
  return items
    .map(normalizePortalServiceCatalogItem)
    .filter((item): item is PortalServiceCatalogItem => Boolean(item));
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
