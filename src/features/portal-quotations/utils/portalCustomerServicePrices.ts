import type {
  PortalCustomerLineDto,
  PortalEstimateSnapshotDto,
  PortalServiceCatalogItem,
} from '../types/portalQuotations.types';

export type PortalCustomerServicePriceDraft = {
  code: string;
  /** Customer-entered unit price (string for controlled input). */
  unit_price: string;
};

export interface PortalServiceQtyInputs {
  chargeableWeightKg?: number;
  grossWeightKg?: number;
  volumeCbm?: number;
  pieces?: number;
  containerCount?: number;
}

function normalizeBasis(value?: string): string {
  return (value || 'FLAT').trim().toUpperCase().replace(/\s+/g, '_');
}

/** Quantity used for customer line amount from catalog pricing basis. */
export function portalServiceQuantity(
  pricingBasis: string | undefined,
  inputs: PortalServiceQtyInputs,
): number {
  switch (normalizeBasis(pricingBasis)) {
    case 'PER_KG':
      return Math.max(0, inputs.chargeableWeightKg ?? inputs.grossWeightKg ?? 0);
    case 'PER_CBM':
      return Math.max(0, inputs.volumeCbm ?? 0);
    case 'PER_PIECE':
    case 'PER_PCS':
      return Math.max(0, inputs.pieces ?? 0);
    case 'PER_CONTAINER':
      return Math.max(1, inputs.containerCount ?? 1);
    case 'FLAT':
    default:
      return 1;
  }
}

export function parseCustomerUnitPrice(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function calcCustomerServiceLineAmount(
  unitPrice: number,
  pricingBasis: string | undefined,
  inputs: PortalServiceQtyInputs,
): number {
  const qty = portalServiceQuantity(pricingBasis, inputs);
  return Math.round(unitPrice * qty * 100) / 100;
}

export function buildCustomerPriceNote(
  selected: PortalCustomerServicePriceDraft[],
  catalogByCode: Map<string, PortalServiceCatalogItem>,
  currency: string,
  inputs: PortalServiceQtyInputs,
): string | undefined {
  const lines: string[] = [];
  let total = 0;
  for (const row of selected) {
    const price = parseCustomerUnitPrice(row.unit_price);
    if (price == null) continue;
    const item = catalogByCode.get(row.code);
    const amount = calcCustomerServiceLineAmount(price, item?.pricingBasis, inputs);
    total += amount;
    const name = item?.name || row.code;
    const basis = item?.pricingBasis || 'FLAT';
    lines.push(`${name} (${row.code}): ${currency} ${price} × ${basis} = ${currency} ${amount}`);
  }
  if (!lines.length) return undefined;
  return [
    'Customer proposed prices:',
    ...lines,
    `Customer proposed total: ${currency} ${Math.round(total * 100) / 100}`,
  ].join('\n');
}

/** Structured customer_lines for estimate/request (preferred over special_requirements notes). */
export function buildPortalCustomerLines(
  selected: PortalCustomerServicePriceDraft[],
  catalogByCode: Map<string, PortalServiceCatalogItem>,
  inputs: PortalServiceQtyInputs,
): PortalCustomerLineDto[] {
  const lines: PortalCustomerLineDto[] = [];
  for (const row of selected) {
    const unitPrice = parseCustomerUnitPrice(row.unit_price);
    if (unitPrice == null) continue;
    const item = catalogByCode.get(row.code);
    const quantity = portalServiceQuantity(item?.pricingBasis, inputs);
    const chargeCodeId =
      item?.chargeCodeId ||
      (typeof item?.raw?.charge_code_id === 'string' ? item.raw.charge_code_id : undefined) ||
      (typeof item?.raw?.chargeCodeId === 'string' ? item.raw.chargeCodeId : undefined);
    lines.push({
      ...(chargeCodeId ? { charge_code_id: chargeCodeId } : {}),
      code: row.code,
      description: item?.name || row.code,
      quantity,
      unit_price: unitPrice,
      unit: item?.pricingBasis || 'FLAT',
      source: item?.source === 'TARIFF' || item?.source === 'CATALOG' ? item.source : 'CUSTOMER_PROPOSED',
    });
  }
  return lines;
}

export function buildPortalEstimateSnapshot(
  currency: string,
  estimatedTotal?: number,
): PortalEstimateSnapshotDto | undefined {
  if (estimatedTotal == null || !Number.isFinite(estimatedTotal)) return undefined;
  return {
    currency_code: currency,
    estimated_total: estimatedTotal,
    captured_at: new Date().toISOString(),
  };
}
