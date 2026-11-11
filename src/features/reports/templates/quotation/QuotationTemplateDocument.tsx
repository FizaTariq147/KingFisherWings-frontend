/**
 * Quotation Format-N — commercial offer (validity + routing), not a tax invoice clone.
 * Does not replace default POST /quotations/:id/pdf (KFW_STANDARD).
 */
import type { QuotationDocViewModel } from '../../mappings/types';
import {
  BrandHeader,
  ChargesTable,
  DocPageChrome,
  KeyValueGrid,
  SignatureBlock,
  colors,
} from '../shared';

type Props = { model: QuotationDocViewModel };

export function QuotationTemplateDocument({ model }: Props) {
  return (
    <DocPageChrome data-report-template="quotation.offer">
      <BrandHeader
        companyName={model.companyName}
        companyAddress={model.companyAddress}
        companyPhone={model.companyPhone}
        companyEmail={model.companyEmail}
        companyWeb={model.companyWeb}
        logoUrl={model.logoUrl}
        accent={colors.accent}
        subtitle="Quotation / offer"
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          alignItems: 'stretch',
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{model.formatName}</div>
          <div style={{ fontSize: 9, color: colors.muted }}>{model.formatCode}</div>
          <div style={{ fontSize: 11, marginTop: 6 }}>
            Quote no. <strong>{model.quotationNumber || '—'}</strong>
          </div>
        </div>
        <div
          style={{
            minWidth: 160,
            border: `2px dashed ${colors.accent}`,
            background: '#ecfeff',
            padding: 10,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 8, fontWeight: 700, color: colors.accent }}>VALID UNTIL</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>
            {model.validUntil || '—'}
          </div>
          <div style={{ fontSize: 8, color: colors.muted, marginTop: 4 }}>
            Subject to carrier space &amp; rates
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div style={{ border: `1px solid ${colors.line}`, padding: 10, background: colors.wash }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: colors.accent }}>Offer to</div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>{model.billToName || '—'}</div>
          <div style={{ fontSize: 10, whiteSpace: 'pre-line' }}>{model.billToAddress || ''}</div>
        </div>
        <KeyValueGrid
          columns={2}
          items={[
            { label: 'POL', value: model.pol },
            { label: 'POD', value: model.pod },
            { label: 'Incoterm', value: model.incoterm },
            { label: 'Currency', value: model.currencyCode },
          ]}
        />
      </div>

      <ChargesTable
        lines={model.lines}
        currencyCode={model.currencyCode}
        subtotal={model.subtotal}
        tax={model.tax}
        total={model.total}
        accent={colors.accent}
        sectionTitle="Quoted charges (indicative)"
      />

      <div style={{ fontSize: 9, color: colors.muted, marginTop: 8 }}>
        This quotation is not a tax invoice. Acceptance confirms rates and validity only.
      </div>

      <SignatureBlock labels={['Sales consultant', 'Customer acceptance']} />
    </DocPageChrome>
  );
}
