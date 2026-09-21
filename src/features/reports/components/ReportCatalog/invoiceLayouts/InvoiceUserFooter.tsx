import { useAuthStore } from '@/store/authStore';
import { FRESA_UI } from '../../../constants/fresaInvoiceColors';
import { KINGFISHER_TC_HEADER_FOOTER as TC } from '../../../constants/kingfisherTermsBrandColors';
import {
  formatInvoicePrintedAt,
  getInvoiceFooterUserEmail,
} from '../../../utils/invoiceUserFooter';
import type { InvoiceFormatUiTheme } from '../../../types/invoiceFormatUiLayout.types';

type Props = {
  className?: string;
  theme?: Partial<InvoiceFormatUiTheme>;
  pageLabel?: string;
  poweredBy?: string;
};

/**
 * Sample-style invoice footer:
 * color bar + Printed By / Printed Date / Powered By / Page.
 * Sticky at page bottom via parent flex layout.
 * Header/footer bar colors match KingFisher Terms & Conditions PDF.
 */
export function InvoiceUserFooter({
  className = '',
  theme,
  pageLabel = 'Page 1 of 1',
  poweredBy = 'KingFisher Logistic',
}: Props) {
  const email =
    useAuthStore((s) => s.user?.email?.trim()) || getInvoiceFooterUserEmail();
  const printed = formatInvoicePrintedAt();
  const panel = theme?.panel || FRESA_UI.panel;
  const ink = theme?.ink || FRESA_UI.ink;

  return (
    <footer
      className={`w-full shrink-0 overflow-hidden text-[8px] leading-normal ${className}`}
      style={{ color: ink }}
    >
      <div className="flex h-1.5 w-full">
        <div className="w-[68%]" style={{ backgroundColor: TC.navy }} />
        <div className="w-[32%]" style={{ backgroundColor: TC.orange }} />
      </div>
      <div className="px-3 py-2.5" style={{ backgroundColor: panel }}>
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <span>
            <span className="font-semibold" style={{ color: TC.navy }}>
              Printed By :
            </span>{' '}
            {email}
          </span>
          <span>
            <span className="font-semibold" style={{ color: TC.navy }}>
              Printed Date :
            </span>{' '}
            {printed}
          </span>
          <span>
            <span className="font-semibold" style={{ color: TC.navy }}>
              Powered By :
            </span>{' '}
            {poweredBy}
          </span>
          <span className="ml-auto font-semibold" style={{ color: TC.orange }}>
            {pageLabel}
          </span>
        </div>
      </div>
    </footer>
  );
}
