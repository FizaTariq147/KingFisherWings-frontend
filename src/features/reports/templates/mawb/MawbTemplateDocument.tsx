/**
 * Master Air Waybill document — airline / consolidator face.
 * Structurally distinct from house HAWB (no IATA house copy-set chrome).
 */
import type { MawbViewModel } from '../../mappings/types';
import {
  BrandHeader,
  DataTable,
  DocPageChrome,
  KeyValueGrid,
  SectionTitle,
  SignatureBlock,
  colors,
} from '../shared';

type Props = { model: MawbViewModel };

export function MawbTemplateDocument({ model }: Props) {
  return (
    <DocPageChrome data-report-template="mawb.standard">
      <BrandHeader
        companyName={model.companyName}
        companyAddress={model.companyAddress}
        companyPhone={model.companyPhone}
        companyEmail={model.companyEmail}
        companyWeb={model.companyWeb}
        logoUrl={model.logoUrl}
        accent={colors.ink}
        subtitle="Master air waybill"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{model.formatName}</div>
          <div style={{ fontSize: 9, color: colors.muted }}>{model.formatCode}</div>
          <div
            style={{
              marginTop: 8,
              border: `2px solid ${colors.ink}`,
              padding: 8,
              background: colors.wash,
            }}
          >
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.6 }}>MAWB NUMBER</div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 1.2 }}>
              {model.mawbNumber || '— — —'}
            </div>
          </div>
        </div>
        <div
          style={{
            border: `1px solid ${colors.line}`,
            padding: 10,
            background: '#111827',
            color: '#fff',
          }}
        >
          <div style={{ fontSize: 8, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>
            Issuing carrier / airline
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>
            {model.airlineName || model.issuingCarrier || '—'}
          </div>
          <div style={{ fontSize: 9, marginTop: 8, opacity: 0.85 }}>
            Consolidator master document — houses listed below
          </div>
        </div>
      </div>

      <SectionTitle accent={colors.ink}>Consolidator</SectionTitle>
      <div
        style={{
          border: `1px solid ${colors.line}`,
          padding: 10,
          marginBottom: 10,
          background: colors.wash,
          fontSize: 10,
          whiteSpace: 'pre-line',
        }}
      >
        <strong>{model.consolidatorName || '—'}</strong>
        {'\n'}
        {(model.consolidatorLines.length ? model.consolidatorLines : ['—']).join('\n')}
      </div>

      <SectionTitle accent={colors.ink}>Routing</SectionTitle>
      <KeyValueGrid
        columns={4}
        items={[
          { label: 'Airport of departure', value: model.pol },
          { label: 'Airport of destination', value: model.pod },
          { label: 'Flight', value: model.vesselFlight },
          { label: 'ETD', value: model.etd },
          { label: 'ETA', value: model.eta },
          { label: 'Job', value: model.jobNumber },
          { label: 'Shipment', value: model.shipmentNumber },
          { label: 'Reference', value: model.referenceNo },
        ]}
      />

      <SectionTitle accent={colors.ink}>House shipments on this master</SectionTitle>
      <DataTable
        headers={
          model.houseRefsHeaders ||
          model.tableHeaders || ['HAWB / Ref', 'Shipper', 'Consignee', 'Pkgs', 'Weight']
        }
        rows={model.houseRefsRows || model.tableRows}
        dense
      />

      {model.commodity ? (
        <div style={{ fontSize: 10, marginTop: 8 }}>Nature of goods: {model.commodity}</div>
      ) : null}

      {model.verificationNote ? (
        <div style={{ fontSize: 8, color: colors.muted, marginTop: 8 }}>{model.verificationNote}</div>
      ) : null}

      <SignatureBlock labels={['Issuing carrier', 'Consolidator', 'Date']} />
    </DocPageChrome>
  );
}
