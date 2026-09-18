import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';

/** Map permanent JSON layouts into catalogue strip rows. */
export function specsFromUiLayouts<T extends { code: string; name: string; sortOrder: number }>(
  layouts: InvoiceFormatUiLayout[],
  mapRow: (layout: InvoiceFormatUiLayout, index: number) => T,
): T[] {
  return layouts
    .map((layout, index) => mapRow(layout, index))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}
