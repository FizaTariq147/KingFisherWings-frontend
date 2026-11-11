/**
 * Purchase (AP) invoice — vendor / bill-from layout.
 * Not a recolored commercial tax invoice.
 */
import type { PurchaseInvoiceViewModel } from '../../mappings/types';
import {
  BrandHeader,
  ChargesTable,
  DocPageChrome,
  KeyValueGrid,
  SignatureBlock,
  colors,
} from '../shared';

type Props = { model: PurchaseInvoiceViewModel };

export function PurchaseInvoiceTemplateDocument({ model }: Props) {
  return (
    <DocPageChrome data-report-template="purchase_invoice.ap">
      <BrandHeader
        companyName={model.companyName}
        companyAddress={model.companyAddress}
        companyPhone={model.companyPhone}
        companyEmail={model.companyEmail}
        companyWeb={model.companyWeb}
        logoUrl={model.logoUrl}
        accent={colors.bandWarn}
        subtitle="Purchase invoice · AP"
      />

      <div
        style={{
          background: colors.bandWarn,
          color: '#fff',
          padding: '8px 10px',
          fontWeight: 700,
          letterSpacing: 0.4,
          marginBottom: 12,
        }}
      >
        ACCOUNTS PAYABLE — VENDOR INVOICE
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, marginBottom: 12 }}>
        <div
          style={{
            border: `1px solid ${colors.bandWarn}`,
            padding: 10,
            background: '#fff7ed',
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: colors.bandWarn,
              textTransform: 'uppercase',
            }}
          >
            Vendor (bill from)
          </div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{model.vendorName || '—'}</div>
          <div style={{ fontSize: 10, whiteSpace: 'pre-line' }}>{model.vendorAddress || ''}</div>
          <div style={{ fontSize: 9, color: colors.muted }}>
            {[model.vendorPhone, model.vendorEmail].filter(Boolean).join(' · ')}
          </div>
        </div>
        <KeyValueGrid
          columns={2}
          items={[
            { label: 'Vendor invoice no.', value: model.invoiceNumber },
            { label: 'Invoice date', value: model.invoiceDate },
            { label: 'Due date', value: model.dueDate },
            { label: 'PO / reference', value: model.poReference },
            { label: 'Currency', value: model.currencyCode },
            { label: 'Discount', value: model.discount },
          ]}
        />
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{model.formatName}</div>
      <div style={{ fontSize: 9, color: colors.muted, marginBottom: 8 }}>{model.formatCode}</div>

      <ChargesTable
        lines={model.lines}
        currencyCode={model.currencyCode}
        subtotal={model.subtotal}
        tax={model.tax}
        total={model.total}
        accent={colors.bandWarn}
        sectionTitle="Vendor line items"
      />

      <SignatureBlock labels={['AP checked by', 'Approved for payment']} />
    </DocPageChrome>
  );
}
