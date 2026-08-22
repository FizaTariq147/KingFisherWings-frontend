import { resolveDateRangePreset } from '@/features/management/utils/managementFilters';
import type {
  CustomerEnquiryFilters,
  CustomerPricingFilters,
  CustomerShipmentFilters,
} from '../types/customerService.types';

function monthRange() {
  return resolveDateRangePreset('this_month');
}

export function defaultCustomerShipmentFilters(
  extra: Partial<CustomerShipmentFilters> = {},
): CustomerShipmentFilters {
  const range = monthRange();
  return {
    from_date: range?.from_date,
    to_date: range?.to_date,
    limit: 100,
    ...extra,
  };
}

export function defaultCustomerEnquiryFilters(
  extra: Partial<CustomerEnquiryFilters> = {},
): CustomerEnquiryFilters {
  const range = monthRange();
  return {
    from_date: range?.from_date,
    to_date: range?.to_date,
    limit: 100,
    ...extra,
  };
}

export function defaultCustomerPricingFilters(
  extra: Partial<CustomerPricingFilters> = {},
): CustomerPricingFilters {
  return {
    ...defaultCustomerEnquiryFilters(),
    tab: 'open_enquiries',
    ...extra,
  };
}
