import { asRecord, pickNumber, pickString } from '@/features/portal-shared/normalize';
import type { JobType } from '@/features/quotations/constants/quotation.constants';
import { JOB_TYPES } from '@/features/quotations/constants/quotation.constants';
import type { PortalBookQuoteFormValues } from '../schemas/portalQuotation.schema';
import type { PortalQuotationDetail } from '../types/portalQuotations.types';
import {
  emptyPortalPackageDraft,
  type PortalPackageDraft,
} from './buildPortalEstimatePackages';

function pickPortValue(quote: PortalQuotationDetail, side: 'origin' | 'dest'): string {
  const raw = quote.raw ?? {};
  const nested =
    asRecord(raw[`${side}_port`]) ||
    asRecord(raw[side === 'dest' ? 'destination_port' : 'origin_port']) ||
    asRecord(raw[side]);
  const id = pickString(
    raw[`${side}_port_id`],
    raw[side === 'dest' ? 'dest_port_id' : 'origin_port_id'],
    raw[side === 'dest' ? 'destPortId' : 'originPortId'],
    nested?.id,
  );
  if (id) return id;
  const label = side === 'origin' ? quote.origin : quote.destination;
  return label?.trim() || '';
}

function isJobType(value: string): value is JobType {
  return (JOB_TYPES as readonly string[]).includes(value);
}

/** Map GET portal quotation detail → Book wizard form + packages + service prices. */
export function portalQuoteToBookFormState(quote: PortalQuotationDetail): {
  values: PortalBookQuoteFormValues;
  packages: PortalPackageDraft[];
  selectedServices: string[];
  servicePrices: Record<string, string>;
  countryHint?: string;
} {
  const raw = quote.raw ?? {};
  const jobTypeRaw = String(quote.jobType || pickString(raw.job_type, raw.jobType) || 'AIR_EXPORT')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  const job_type: JobType = isJobType(jobTypeRaw) ? jobTypeRaw : 'AIR_EXPORT';

  const packages: PortalPackageDraft[] =
    quote.packages && quote.packages.length > 0
      ? quote.packages.map((pkg) => ({
          length_cm: pkg.lengthCm != null ? String(pkg.lengthCm) : '',
          width_cm: pkg.widthCm != null ? String(pkg.widthCm) : '',
          height_cm: pkg.heightCm != null ? String(pkg.heightCm) : '',
          gross_weight_kg: pkg.grossWeightKg != null ? String(pkg.grossWeightKg) : '',
          pieces: pkg.pieces != null ? String(pkg.pieces) : '1',
        }))
      : [emptyPortalPackageDraft()];

  // If no structured packages but cargo totals exist, seed one package row.
  if (
    packages.length === 1 &&
    !packages[0].gross_weight_kg &&
    quote.grossWeight != null
  ) {
    packages[0] = {
      ...packages[0],
      gross_weight_kg: String(quote.grossWeight),
      pieces: quote.pieces != null ? String(quote.pieces) : packages[0].pieces,
    };
  }

  const selectedServices: string[] = [];
  const servicePrices: Record<string, string> = {};
  for (const line of quote.lines ?? []) {
    const code = line.chargeCode?.trim();
    if (!code) continue;
    if (!selectedServices.includes(code)) selectedServices.push(code);
    const price =
      line.unitPrice != null
        ? line.unitPrice
        : line.amount != null && (line.quantity ?? 1) > 0
          ? line.amount / (line.quantity ?? 1)
          : undefined;
    if (price != null && Number.isFinite(price) && servicePrices[code] == null) {
      servicePrices[code] = String(price);
    }
  }

  const countryHint =
    pickString(
      raw.country_code,
      raw.countryCode,
      asRecord(raw.customer)?.country_code,
      asRecord(raw.customer)?.countryCode,
    ) || undefined;

  const values: PortalBookQuoteFormValues = {
    job_type,
    currency_code: (quote.currencyCode || pickString(raw.currency_code, raw.currency) || '').toUpperCase(),
    origin_port: pickPortValue(quote, 'origin'),
    dest_port: pickPortValue(quote, 'dest'),
    commodity: quote.commodity ?? '',
    gross_weight: quote.grossWeight,
    chargeable_weight: quote.chargeableWeight,
    volume_cbm: quote.volumeCbm,
    pieces: quote.pieces,
    special_requirements: quote.specialRequirements ?? '',
    valid_until: quote.validUntil?.slice(0, 10) ?? '',
  };

  // Silence unused — container count may appear on raw for costing later.
  void pickNumber(raw.container_count, raw.containerCount);

  return { values, packages, selectedServices, servicePrices, countryHint };
}
