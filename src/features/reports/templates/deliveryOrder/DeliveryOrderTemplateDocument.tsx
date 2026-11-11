import type { DeliveryOrderViewModel } from '../../mappings/types';
import {
  BrandHeader,
  DataTable,
  DocPageChrome,
  KeyValueGrid,
  PartyTriple,
  SectionTitle,
  SignatureBlock,
  colors,
} from '../shared';

type Props = { model: DeliveryOrderViewModel };

export function DeliveryOrderTemplateDocument({ model }: Props) {
  return (
    <DocPageChrome data-report-template="delivery_order.release">
      <BrandHeader
        companyName={model.companyName}
        companyAddress={model.companyAddress}
        companyPhone={model.companyPhone}
        companyEmail={model.companyEmail}
        companyWeb={model.companyWeb}
        logoUrl={model.logoUrl}
        accent={colors.bandAlt}
        subtitle="Delivery order"
      />
      <div
        style={{
          background: colors.bandAlt,
          color: '#fff',
          padding: '8px 10px',
          fontWeight: 700,
          marginBottom: 12,
          letterSpacing: 0.4,
        }}
      >
        AUTHORIZATION TO RELEASE CARGO
      </div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{model.formatName}</div>
      <div style={{ fontSize: 9, color: colors.muted, marginBottom: 10 }}>{model.formatCode}</div>
      <PartyTriple
        shipper={model.shipper}
        consignee={model.consignee}
        notify={model.notify}
        accent={colors.bandAlt}
      />
      <SectionTitle accent={colors.bandAlt}>Delivery information</SectionTitle>
      <KeyValueGrid
        items={[
          { label: 'Release to', value: model.releaseTo },
          { label: 'Vessel / flight', value: model.vesselFlight },
          { label: 'POD', value: model.pod },
          { label: 'Reference', value: model.referenceNo },
          { label: 'Job', value: model.jobNumber },
          { label: 'Shipment', value: model.shipmentNumber },
        ]}
      />
      <SectionTitle accent={colors.bandAlt}>Cargo to release</SectionTitle>
      <DataTable headers={model.tableHeaders} rows={model.tableRows} />
      {model.deliveryInstructions ? (
        <div style={{ fontSize: 10, marginTop: 8 }}>
          <strong>Instructions:</strong> {model.deliveryInstructions}
        </div>
      ) : null}
      <SignatureBlock labels={['Issuing office', 'Warehouse / terminal', 'Receiver']} />
    </DocPageChrome>
  );
}
