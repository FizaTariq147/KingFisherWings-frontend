/**
 * WMS REST paths — mapped 1:1 to Swagger tags:
 * WMS Settings / Items / ASN / GRN / GDO / Stock / Storage
 * Source: https://kingfisherwings-backend.onrender.com/docs
 *
 * Method map:
 * GET/PUT    /wms/settings
 * GET/POST   /wms/items
 * GET/PATCH/DELETE /wms/items/{id}
 * GET/POST   /wms/asns
 * GET        /wms/asns/{id}
 * POST       /wms/asns/{id}/confirm|cancel
 * GET/POST   /wms/grns
 * GET        /wms/grns/{id}
 * POST       /wms/grns/{id}/post|cancel
 * GET/POST   /wms/gdos
 * GET        /wms/gdos/{id}
 * POST       /wms/gdos/{id}/post|cancel
 * GET        /wms/stock/on-hand|movements|low-stock|lot-aging
 * POST       /wms/stock/adjust
 * GET/POST   /wms/transfers
 * GET        /wms/transfers/{id}
 * POST       /wms/transfers/{id}/post
 * POST       /wms/storage/calculate|invoice
 * GET        /wms/storage/charges (query: party_id*, status*)
 *
 * Related (masters, not under /wms): GET/POST/PATCH/DELETE /masters/warehouses
 */
export const WMS_API = {
  settings: '/wms/settings',
  items: '/wms/items',
  item: (id: string) => `/wms/items/${id}`,
  asns: '/wms/asns',
  asn: (id: string) => `/wms/asns/${id}`,
  asnConfirm: (id: string) => `/wms/asns/${id}/confirm`,
  asnCancel: (id: string) => `/wms/asns/${id}/cancel`,
  grns: '/wms/grns',
  grn: (id: string) => `/wms/grns/${id}`,
  grnPost: (id: string) => `/wms/grns/${id}/post`,
  grnCancel: (id: string) => `/wms/grns/${id}/cancel`,
  gdos: '/wms/gdos',
  gdo: (id: string) => `/wms/gdos/${id}`,
  gdoPost: (id: string) => `/wms/gdos/${id}/post`,
  gdoCancel: (id: string) => `/wms/gdos/${id}/cancel`,
  stockOnHand: '/wms/stock/on-hand',
  stockMovements: '/wms/stock/movements',
  stockLowStock: '/wms/stock/low-stock',
  stockLotAging: '/wms/stock/lot-aging',
  stockAdjust: '/wms/stock/adjust',
  transfers: '/wms/transfers',
  transfer: (id: string) => `/wms/transfers/${id}`,
  transferPost: (id: string) => `/wms/transfers/${id}/post`,
  storageCalculate: '/wms/storage/calculate',
  storageCharges: '/wms/storage/charges',
  storageInvoice: '/wms/storage/invoice',
} as const;

export const WMS_ROUTE_PREFIX = '/warehouse';

/** Swagger-required status values used by GET /wms/storage/charges (string, no enum in docs). */
export const WMS_STORAGE_CHARGE_STATUSES = ['OPEN', 'INVOICED', 'CANCELLED'] as const;
export type WmsStorageChargeStatus = (typeof WMS_STORAGE_CHARGE_STATUSES)[number];
