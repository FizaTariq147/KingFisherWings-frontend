import { getInvoiceFormatPreview } from '../../data/invoiceFormatPreviews';
import { isInvoiceReportFormatCode } from '../../types/invoiceFormatPreview.types';
import { InvoiceFormatLayoutByKindLive } from './invoiceLayouts';

type InvoiceFormatPreviewPanelProps = {
  code: string;
  className?: string;
};

/** Quiet layout preview with registered company name/logo (no debug blurbs). */
export function InvoiceFormatPreviewPanel({ code, className = '' }: InvoiceFormatPreviewPanelProps) {
  const preview = isInvoiceReportFormatCode(code) ? getInvoiceFormatPreview(code) : undefined;
  if (!preview) return null;

  return (
    <div
      className={`max-h-[520px] overflow-y-auto rounded border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-4 ${className}`}
    >
      <div className="mx-auto w-fit max-w-full shadow-sm">
        <InvoiceFormatLayoutByKindLive preview={preview} />
      </div>
    </div>
  );
}
