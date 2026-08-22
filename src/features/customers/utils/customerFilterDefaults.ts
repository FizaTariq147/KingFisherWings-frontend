import type { CustomerFilterOption } from '../types/customerFilter.types';

export const FILTER_ALL: CustomerFilterOption[] = [{ value: 'All', label: 'All' }];
export const FILTER_SELECT: CustomerFilterOption[] = [{ value: '-Select-', label: '-Select-' }];

export function filterOptionsOrFallback(
  options: CustomerFilterOption[] | undefined,
  fallback: CustomerFilterOption[] = FILTER_ALL,
): CustomerFilterOption[] {
  return options?.length ? options : fallback;
}
