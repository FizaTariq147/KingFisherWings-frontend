import type { InvoiceDocViewModel } from '../../mappings/types';
import {
  BrandHeader,
  ChargesTable,
  DocPageChrome,
  KeyValueGrid,
  SignatureBlock,
  colors,
} from '../shared';

type Props = { model: InvoiceDocViewModel };

/** Commercial / tax invoice (AR). Purchase AP uses PurchaseInvoiceTemplateDocument. */
export function InvoiceTemplateDocument({ model }: Props) {
  return (
    <DocPageChrome data-report-template="invoice.commercial">
      <BrandHeader
        companyName={model.companyName}
        companyAddress={model.companyAddress}
        companyPhone={model.companyPhone}
        companyEmail={model.companyEmail}
        companyWeb={model.companyWeb}
        logoUrl={model.logoUrl}
        accent={colors.band}
        subtitle="Tax / commercial invoice"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{model.formatName}</div>
          <div style={{ fontSize: 9, color: colors.muted }}>{model.formatCode}</div>
        </div>
        <KeyValueGrid
          columns={2}
          items={[
            { label: 'Invoice no.', value: model.invoiceNumber },
            { label: 'Invoice date', value: model.invoiceDate },
            { label: 'Due date', value: model.dueDate },
            { label: 'Currency', value: model.currencyCode },
            { label: 'Discount', value: model.discount },
          ]}
        />
      </div>
      <div
        style={{
          border: `1px solid ${colors.line}`,
          padding: 10,
          marginBottom: 12,
          background: colors.wash,
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: colors.band,
            textTransform: 'uppercase',
          }}
        >
          Bill to
        </div>
        <div style={{ fontSize: 12, fontWeight: 700 }}>{model.billToName || '—'}</div>
        <div style={{ fontSize: 10, whiteSpace: 'pre-line' }}>{model.billToAddress || ''}</div>
        <div style={{ fontSize: 9, color: colors.muted }}>
          {[model.billToPhone, model.billToEmail].filter(Boolean).join(' · ')}
        </div>
      </div>
      <ChargesTable
        lines={model.lines}
        currencyCode={model.currencyCode}
        subtotal={model.subtotal}
        tax={model.tax}
        total={model.total}
        accent={colors.band}
        sectionTitle="Invoice charges"
      />
      <SignatureBlock labels={['Prepared by', 'Authorized signatory']} />
    </DocPageChrome>
  );
}
