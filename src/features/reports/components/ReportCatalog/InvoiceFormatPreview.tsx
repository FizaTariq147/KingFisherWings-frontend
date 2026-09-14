import { getInvoiceFormatPreview } from '../../data/invoiceFormatPreviews';
import type { InvoiceFormatPreview } from '../../types/invoiceFormatPreview.types';
import { isInvoiceReportFormatCode } from '../../types/invoiceFormatPreview.types';
import { InvoiceFormatLayoutByKind } from './invoiceLayouts';

type InvoiceFormatPreviewPanelProps = {
  code: string;
  className?: string;
};

const LAYOUT_BLURB: Record<InvoiceFormatPreview['layoutKind'], string> = {
  tax_india: 'India GST tax invoice — shipment grid, SAC / CGST / SGST columns',
  summary: 'Summary invoice — compact totals-first layout',
  simple: 'Simple tax invoice — centered header, charge table, VAT, bank box',
  arabic_rtl: 'Bilingual Arabic / English RTL invoice',
  usa: 'USA commercial invoice — Letter, numbered fields',
  land: 'Land freight — route / truck focused',
  preprinted: 'Pre-printed letterhead form with dashed boxes',
  warehouse: 'Warehouse & storage billing layout',
  debit_vietnam: 'Vietnam debit note — USD / VND dual totals',
  generic: 'Commercial invoice — KingFisher branded chrome',
};

/**
 * Catalog-only KingFisher layout preview for Invoice Report Format-*.
 * Each layoutKind renders a distinct Fresa-inspired shell (not one shared chrome).
 */
export function InvoiceFormatPreviewPanel({ code, className = '' }: InvoiceFormatPreviewPanelProps) {
  const preview = isInvoiceReportFormatCode(code) ? getInvoiceFormatPreview(code) : undefined;

  if (!preview) return null;

  return (
    <div
      className={`space-y-2 rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-3 ${className}`}
    >
      <div>
        <p className="text-xs font-semibold text-[var(--color-neutral-800)]">
          KingFisher layout preview · Format-{preview.formatNumber}
        </p>
        <p className="text-[11px] text-[var(--color-neutral-500)]">
          {preview.name.replace(/Fresa/gi, 'KingFisher')}. {LAYOUT_BLURB[preview.layoutKind]}.
        </p>
      </div>

      <div className="max-h-[520px] overflow-y-auto rounded border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-3">
        <InvoiceFormatLayoutByKind preview={preview} />
      </div>
    </div>
  );
}
