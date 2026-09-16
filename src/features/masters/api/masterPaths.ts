/** Master REST path helpers — Swagger tags "Masters — *". */

export const MASTER_PATHS = {
  airlines: '/masters/airlines',
  airports: '/masters/airports',
  banks: '/masters/banks',
  branches: '/masters/branches',
  'charge-codes': '/masters/charge-codes',
  'container-types': '/masters/container-types',
  'courier-vendors': '/masters/courier-vendors',
  countries: '/masters/countries',
  currencies: '/masters/currencies',
  departments: '/masters/departments',
  designations: '/masters/designations',
  'exchange-rates': '/masters/exchange-rates',
  holidays: '/masters/holidays',
  'hs-codes': '/masters/hs-codes',
  ports: '/masters/ports',
  'shipping-lines': '/masters/shipping-lines',
  'tax-rates': '/masters/tax-rates',
  truckers: '/masters/truckers',
  'units-of-measure': '/masters/units-of-measure',
  vessels: '/masters/vessels',
  warehouses: '/masters/warehouses',
  tariffs: '/quotations/tariffs',
  'zip-distances': '/quotations/zip-distances',

  // Newly published Swagger masters
  activities: '/masters/activities',
  'address-search': '/masters/address-search',
  'attachments-search': '/masters/attachments-search',
  categories: '/masters/categories',
  cities: '/masters/cities',
  clauses: '/masters/clauses',
  commodities: '/masters/commodities',
  'contacts-search': '/masters/contacts-search',
  'container-inventory': '/masters/container-inventory',
  'custom-reports': '/masters/custom-reports',
  divisions: '/masters/divisions',
  favorites: '/masters/favorites',
  notifications: '/masters/notifications',
  organization: '/masters/organization',
  'organization-groups': '/masters/organization-groups',
  packs: '/masters/packs',
  'port-clause-maps': '/masters/port-clause-maps',
  'rate-bases': '/masters/rate-bases',
  regions: '/masters/regions',
  'sales-call-activities': '/masters/sales-call-activities',
  'storage-slabs': '/masters/storage-slabs',
  'tracking-users': '/masters/tracking-users',
  voyages: '/masters/voyages',
  'whatsapp-sms-history': '/masters/whatsapp-sms-history',
  zones: '/masters/zones',
} as const;

export type MasterResourceKey = keyof typeof MASTER_PATHS;

export function masterById(basePath: string, id: string): string {
  return `${basePath}/${id}`;
}

export function exchangeRateLatest(currencyId: string): string {
  return `/masters/exchange-rates/latest/${currencyId}`;
}
