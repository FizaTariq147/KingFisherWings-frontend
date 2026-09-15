import { getInvoiceFormatPreview } from '../../data/invoiceFormatPreviews';
import { isInvoiceReportFormatCode } from '../../types/invoiceFormatPreview.types';
import { InvoiceFormatLayoutByKind } from './invoiceLayouts';

type InvoiceFormatPreviewPanelProps = {
  code: string;
  className?: string;
};

/** Quiet KingFisher layout preview (no debug blurbs). */
export function InvoiceFormatPreviewPanel({ code, className = '' }: InvoiceFormatPreviewPanelProps) {
  const preview = isInvoiceReportFormatCode(code) ? getInvoiceFormatPreview(code) : undefined;
  if (!preview) return null;

  return (
    <div
      className={`max-h-[520px] overflow-y-auto rounded border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-3 ${className}`}
    >
      <InvoiceFormatLayoutByKind preview={preview} />
    </div>
  );
}
