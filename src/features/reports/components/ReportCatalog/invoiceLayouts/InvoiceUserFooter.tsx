import { useAuthStore } from '@/store/authStore';
import { FRESA_UI } from '../../../constants/fresaInvoiceColors';
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
 * Sample-style invoice footer (Fresa Formats 1–20 family):
 * navy | cyan | orange | red color bar + Printed By / Date / Powered By / Page.
 * Sticky at page bottom via parent flex layout.
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
  const navy = theme?.primary || FRESA_UI.navy;
  const cyan = theme?.cyan || FRESA_UI.cyan;
  const orange = theme?.orange || FRESA_UI.orange;
  const red = theme?.red || FRESA_UI.red;

  return (
    <footer
      className={`w-full shrink-0 overflow-hidden text-[8px] leading-normal ${className}`}
      style={{ color: ink }}
    >
      <div className="flex h-1.5 w-full">
        <div className="w-[34%]" style={{ backgroundColor: navy }} />
        <div className="w-[22%]" style={{ backgroundColor: cyan }} />
        <div className="w-[22%]" style={{ backgroundColor: orange }} />
        <div className="w-[22%]" style={{ backgroundColor: red }} />
      </div>
      <div className="px-3 py-2.5" style={{ backgroundColor: panel }}>
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <span>
            <span className="font-semibold" style={{ color: navy }}>
              Printed By :
            </span>{' '}
            {email}
          </span>
          <span>
            <span className="font-semibold" style={{ color: navy }}>
              Printed Date :
            </span>{' '}
            {printed}
          </span>
          <span>
            <span className="font-semibold" style={{ color: navy }}>
              Powered By :
            </span>{' '}
            {poweredBy}
          </span>
          <span className="ml-auto font-semibold" style={{ color: orange }}>
            {pageLabel}
          </span>
        </div>
      </div>
    </footer>
  );
}
