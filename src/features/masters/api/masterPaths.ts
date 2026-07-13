/** Master REST path helpers — Swagger tags "Masters — *". */

export const MASTER_PATHS = {
  airlines: '/masters/airlines',
  airports: '/masters/airports',
  banks: '/masters/banks',
  branches: '/masters/branches',
  'charge-codes': '/masters/charge-codes',
  'container-types': '/masters/container-types',
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
} as const;

export type MasterResourceKey = keyof typeof MASTER_PATHS;

export function masterById(basePath: string, id: string): string {
  return `${basePath}/${id}`;
}

export function exchangeRateLatest(currencyId: string): string {
  return `/masters/exchange-rates/latest/${currencyId}`;
}
