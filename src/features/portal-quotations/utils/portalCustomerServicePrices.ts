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

/**
 * Customer-proposed line tied to a dynamic catalog/costing-options code.
 * Backend requires charge_code_id or code on every customer_lines entry.
 */
export type PortalCustomPriceDraft = {
  localId: string;
  /** Service / charge code from costing-options or catalog (required). */
  code: string;
  description: string;
  unit_price: string;
  quantity: string;
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

function resolveChargeCodeId(item?: PortalServiceCatalogItem): string | undefined {
  if (!item) return undefined;
  return (
    item.chargeCodeId ||
    (typeof item.raw?.charge_code_id === 'string' ? item.raw.charge_code_id : undefined) ||
    (typeof item.raw?.chargeCodeId === 'string' ? item.raw.chargeCodeId : undefined) ||
    undefined
  );
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

export function emptyCustomPriceDraft(): PortalCustomPriceDraft {
  return {
    localId: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    description: '',
    code: '',
    unit_price: '',
    quantity: '1',
  };
}

/**
 * Backend: each customer_lines entry must include charge_code_id or code.
 * Drop incomplete rows; never invent static charge codes.
 */
export function sanitizePortalCustomerLines(
  lines: PortalCustomerLineDto[],
): PortalCustomerLineDto[] {
  const out: PortalCustomerLineDto[] = [];
  for (const line of lines) {
    const code = typeof line.code === 'string' ? line.code.trim() : '';
    const chargeCodeId =
      typeof line.charge_code_id === 'string' ? line.charge_code_id.trim() : '';
    if (!code && !chargeCodeId) continue;
    out.push({
      ...line,
      ...(chargeCodeId ? { charge_code_id: chargeCodeId } : { charge_code_id: undefined }),
      ...(code ? { code } : { code: undefined }),
      unit_price: line.unit_price,
      source: line.source ?? 'CUSTOMER_PROPOSED',
    });
  }
  return out.map((line) => {
    const next: PortalCustomerLineDto = {
      unit_price: line.unit_price,
      source: line.source ?? 'CUSTOMER_PROPOSED',
    };
    if (line.charge_code_id) next.charge_code_id = line.charge_code_id;
    if (line.code) next.code = line.code;
    if (line.description) next.description = line.description;
    if (line.quantity != null) next.quantity = line.quantity;
    if (line.unit) next.unit = line.unit;
    return next;
  });
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

/** Structured customer_lines for estimate/request from selected catalog/tariff services. */
export function buildPortalCustomerLines(
  selected: PortalCustomerServicePriceDraft[],
  catalogByCode: Map<string, PortalServiceCatalogItem>,
  inputs: PortalServiceQtyInputs,
): PortalCustomerLineDto[] {
  const lines: PortalCustomerLineDto[] = [];
  for (const row of selected) {
    const unitPrice = parseCustomerUnitPrice(row.unit_price);
    if (unitPrice == null) continue;
    const code = row.code.trim();
    const item = catalogByCode.get(code);
    const chargeCodeId = resolveChargeCodeId(item);
    // API requires charge_code_id or code — skip incomplete dynamic rows.
    if (!code && !chargeCodeId) continue;

    const quantity = portalServiceQuantity(item?.pricingBasis, inputs);
    const catalogPrice = item?.unitPrice;
    const overridden =
      catalogPrice == null || !Number.isFinite(catalogPrice) || catalogPrice !== unitPrice;

    const line: PortalCustomerLineDto = {
      unit_price: unitPrice,
      quantity,
      description: item?.name || code,
      unit: item?.pricingBasis || 'FLAT',
      source: overridden
        ? 'CUSTOMER_PROPOSED'
        : item?.source === 'TARIFF'
          ? 'TARIFF'
          : item?.source === 'CATALOG'
            ? 'CATALOG'
            : 'CUSTOMER_PROPOSED',
    };
    if (chargeCodeId) line.charge_code_id = chargeCodeId;
    if (code) line.code = code;
    lines.push(line);
  }
  return sanitizePortalCustomerLines(lines);
}

/**
 * Customer-proposed lines: code must come from costing-options/catalog (or typed code).
 * Resolves charge_code_id dynamically when the code matches a catalog item.
 */
export function buildCustomPortalCustomerLines(
  drafts: PortalCustomPriceDraft[],
  catalogByCode: Map<string, PortalServiceCatalogItem> = new Map(),
): PortalCustomerLineDto[] {
  const lines: PortalCustomerLineDto[] = [];
  for (const draft of drafts) {
    const unitPrice = parseCustomerUnitPrice(draft.unit_price);
    if (unitPrice == null) continue;

    const code = draft.code.trim();
    const item = code ? catalogByCode.get(code) : undefined;
    const chargeCodeId = resolveChargeCodeId(item);
    if (!code && !chargeCodeId) continue;

    const quantityRaw = Number(draft.quantity);
    const quantity = Number.isFinite(quantityRaw) && quantityRaw >= 0 ? quantityRaw : 1;
    const description =
      draft.description.trim() || item?.name || code || 'Customer proposed charge';

    const line: PortalCustomerLineDto = {
      unit_price: unitPrice,
      quantity,
      description,
      unit: item?.pricingBasis || 'FLAT',
      source: 'CUSTOMER_PROPOSED',
    };
    if (chargeCodeId) line.charge_code_id = chargeCodeId;
    if (code) line.code = code;
    lines.push(line);
  }
  return sanitizePortalCustomerLines(lines);
}

export function calcCustomPriceDraftAmount(draft: PortalCustomPriceDraft): number | undefined {
  const unitPrice = parseCustomerUnitPrice(draft.unit_price);
  if (unitPrice == null) return undefined;
  const quantityRaw = Number(draft.quantity);
  const quantity = Number.isFinite(quantityRaw) && quantityRaw >= 0 ? quantityRaw : 1;
  return Math.round(unitPrice * quantity * 100) / 100;
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
