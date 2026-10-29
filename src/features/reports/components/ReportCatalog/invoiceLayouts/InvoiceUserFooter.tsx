import type { CSSProperties } from 'react';
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
  /**
   * `bar` — Fresa ASN / many ops samples: navy|orange|red with white on-bar text.
   * `plain` — some invoice/HBL samples: printed-by meta only (no color blocks).
   */
  variant?: 'bar' | 'plain';
};

/**
 * Sample-style invoice footer. Variant follows layout `colorfulFooter.variant`
 * so shared chrome can match Fresa without forcing one footer on every format.
 */
export function InvoiceUserFooter({
  className = '',
  theme,
  pageLabel = 'Page 1 of 1',
  poweredBy = 'KingFisher Logistic',
  variant = 'bar',
}: Props) {
  const email =
    useAuthStore((s) => s.user?.email?.trim()) || getInvoiceFooterUserEmail();
  const printed = formatInvoicePrintedAt();
  const navy = theme?.primary || FRESA_UI.navy;
  const orange = theme?.orange || FRESA_UI.orange;
  const red = theme?.red || FRESA_UI.red;
  const panel = theme?.panel || FRESA_UI.panel;
  const ink = theme?.ink || FRESA_UI.ink;
  const white = theme?.white || FRESA_UI.white || '#FFFFFF';

  if (variant === 'plain') {
    return (
      <footer
        className={`w-full shrink-0 ${className}`}
        data-invoice-colorful-footer="plain"
        style={{ color: ink, fontSize: 8, lineHeight: 1.35 }}
      >
        <div style={{ borderTop: `1px solid ${navy}` }} />
        <div
          style={{
            display: 'flex',
            flexWrap: 'nowrap',
            gap: 16,
            padding: '8px 12px',
            backgroundColor: panel,
            alignItems: 'baseline',
          }}
        >
          <span>
            <strong style={{ color: navy }}>Printed By :</strong> {email}
          </span>
          <span>
            <strong style={{ color: navy }}>Printed Date :</strong> {printed}
          </span>
          <span>
            <strong style={{ color: navy }}>Powered By :</strong> {poweredBy}
          </span>
          <span style={{ marginLeft: 'auto', fontWeight: 700, color: orange }}>{pageLabel}</span>
        </div>
      </footer>
    );
  }

  const cell: CSSProperties = {
    color: white,
    fontSize: 8,
    lineHeight: 1.25,
    padding: '6px 8px',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  };

  return (
    <footer
      className={`w-full shrink-0 overflow-hidden ${className}`}
      data-invoice-colorful-footer="bar"
      style={{ color: white }}
    >
      <div style={{ display: 'flex', width: '100%', flexWrap: 'nowrap' }}>
        <div style={{ ...cell, flex: '1 1 40%', backgroundColor: navy }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {/* Fresa ASN / Job Houses / arrival samples use "User :" on the navy bar */}
            <strong>User :</strong> {email}
          </span>
        </div>
        <div
          style={{
            ...cell,
            flex: '1 1 30%',
            backgroundColor: orange,
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {printed}
          </span>
        </div>
        <div
          style={{
            ...cell,
            flex: '1 1 30%',
            backgroundColor: red,
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <strong>Powered by</strong> {poweredBy}
          </span>
          <span style={{ flexShrink: 0, fontWeight: 700 }}>{pageLabel}</span>
        </div>
      </div>
    </footer>
  );
}
