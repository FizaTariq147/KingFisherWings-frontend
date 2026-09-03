import type { PortalServiceCatalogItem } from '../types/portalQuotations.types';

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
