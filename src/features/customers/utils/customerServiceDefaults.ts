import type {
  CustomerEnquiryFilters,
  CustomerPricingFilters,
  CustomerShipmentFilters,
} from '../types/customerService.types';

export function defaultCustomerShipmentFilters(
  extra: Partial<CustomerShipmentFilters> = {},
): CustomerShipmentFilters {
  return {
    limit: 100,
    ...extra,
  };
}

export function defaultCustomerEnquiryFilters(
  extra: Partial<CustomerEnquiryFilters> = {},
): CustomerEnquiryFilters {
  return {
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
