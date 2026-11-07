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
  poweredBy = 'KingFisher Wings',
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
    // Fresa tax/standard invoices: single meta row (not the navy|orange|red bar).
    return (
      <footer
        className={className}
        data-invoice-colorful-footer="plain"
        style={{
          width: '100%',
          flexShrink: 0,
          color: ink,
          fontSize: 8,
          lineHeight: 1.35,
          backgroundColor: white,
        }}
      >
        <div style={{ borderTop: `1px solid ${navy}` }} />
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px 14px',
            padding: '8px 10px',
            backgroundColor: panel,
            alignItems: 'baseline',
            boxSizing: 'border-box',
            width: '100%',
            border: `1px solid ${navy}33`,
            lineHeight: 1.4,
          }}
        >
          <span style={{ wordBreak: 'break-word', minWidth: 0 }}>
            <strong style={{ color: navy }}>Printed By :</strong> {email}
          </span>
          <span style={{ wordBreak: 'break-word' }}>
            <strong style={{ color: navy }}>Printed Date :</strong> {printed}
          </span>
          <span style={{ wordBreak: 'break-word', minWidth: 0 }}>
            <strong style={{ color: navy }}>Powered By :</strong> {poweredBy}
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontWeight: 700,
              color: orange,
              whiteSpace: 'nowrap',
            }}
          >
            {pageLabel}
          </span>
        </div>
      </footer>
    );
  }

  const cell: CSSProperties = {
    color: white,
    fontSize: 8,
    lineHeight: 1.25,
    padding: '7px 8px',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    boxSizing: 'border-box',
  };

  // Fresa ASN / arrival / many ops samples: navy | orange | red footer band.
  return (
    <footer
      className={className}
      data-invoice-colorful-footer="bar"
      style={{
        width: '100%',
        flexShrink: 0,
        overflow: 'hidden',
        color: white,
        backgroundColor: white,
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          flexWrap: 'nowrap',
          alignItems: 'stretch',
        }}
      >
        <div style={{ ...cell, flex: '1 1 42%', backgroundColor: navy, minWidth: 0 }}>
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            <strong>User :</strong> {email}
          </span>
        </div>
        <div
          style={{
            ...cell,
            flex: '1 1 28%',
            backgroundColor: orange,
            justifyContent: 'center',
            textAlign: 'center',
            minWidth: 0,
          }}
        >
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
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
            minWidth: 0,
          }}
        >
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              flex: '1 1 auto',
            }}
          >
            <strong>Powered by</strong> {poweredBy}
          </span>
          <span style={{ flexShrink: 0, fontWeight: 700 }}>{pageLabel}</span>
        </div>
      </div>
    </footer>
  );
}
