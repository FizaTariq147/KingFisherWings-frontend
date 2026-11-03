import { erpTable } from '@/lib/erpTypography';
import type { QuoteLineItem } from '../types/adminQuoteRequests.types';

function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return String(value);
}

function formatPrice(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function QuoteLineItemsTable({ items }: { items: QuoteLineItem[] }) {
  if (!items.length) {
    return (
      <p className="text-sm text-[var(--color-neutral-500)]">No line items on this request.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className={erpTable.th}>Product</th>
            <th className={erpTable.th}>SKU</th>
            <th className={erpTable.th}>Qty</th>
            <th className={erpTable.th}>Unit</th>
            <th className={erpTable.th}>Pcs/carton</th>
            <th className={erpTable.th}>Total pcs</th>
            <th className={erpTable.th}>Price</th>
            <th className={erpTable.th}>Currency</th>
            <th className={erpTable.th}>Categories</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const key = `${item.product_id ?? item.sku ?? item.name ?? 'item'}-${index}`;
            const nameNode = item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--color-primary,#0A2942)] underline-offset-2 hover:underline"
              >
                {item.name || 'Product'}
              </a>
            ) : (
              <span className="font-medium">{item.name || '—'}</span>
            );

            return (
              <tr key={key} className={erpTable.row}>
                <td className={erpTable.td}>
                  <div className="flex items-start gap-2">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded object-cover"
                      />
                    ) : null}
                    <div>
                      {nameNode}
                      {item.variation ? (
                        <div className="text-xs text-[var(--color-neutral-500)]">
                          {item.variation}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className={erpTable.td}>{item.sku || '—'}</td>
                <td className={erpTable.td}>{formatNumber(item.quantity)}</td>
                <td className={erpTable.td}>{item.unit || '—'}</td>
                <td className={erpTable.td}>{formatNumber(item.pcs_per_carton)}</td>
                <td className={erpTable.td}>{formatNumber(item.total_pieces)}</td>
                <td className={erpTable.td}>{formatPrice(item.price)}</td>
                <td className={erpTable.td}>{item.currency || '—'}</td>
                <td className={erpTable.td}>
                  {(item.categories ?? []).length
                    ? (item.categories ?? []).join(', ')
                    : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
