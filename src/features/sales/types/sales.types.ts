import type { CustomerShipmentFilters, CustomerShipmentRow } from '@/features/customers/types/customerService.types';

export interface SalesClientListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface SalesClientRow {
  id: string;
  createdBy: string;
  code: string;
  name: string;
  status: string;
  type: string;
  category: string;
  port: string;
  website: string;
  vendorCode: string;
  remarks: string;
}

export interface SalesTariffListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface SalesTariffRow {
  id: string;
  owner: string;
  client: string;
  service: string;
  origin: string;
  destination: string;
  charge: string;
  currency: string;
  saleRate: number;
  costRate: number;
  validFrom: string;
  validTo: string;
  active: string;
}

export interface SalesVisitingCardParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface SalesVisitingCardRow {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  createdAt: string;
}

export type SalesShipmentFilters = CustomerShipmentFilters;
export type SalesShipmentRow = CustomerShipmentRow;
