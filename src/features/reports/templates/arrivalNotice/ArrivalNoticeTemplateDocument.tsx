import type { ArrivalNoticeViewModel } from '../../mappings/types';
import {
  BrandHeader,
  ChargesTable,
  DataTable,
  DocPageChrome,
  KeyValueGrid,
  PartyTriple,
  SectionTitle,
  SignatureBlock,
  colors,
} from '../shared';

type Props = { model: ArrivalNoticeViewModel };

/** Pilot family for print-CSS / PDF reliability (Phase 4). */
export function ArrivalNoticeTemplateDocument({ model }: Props) {
  return (
    <DocPageChrome data-report-template="arrival_notice.standard">
      <BrandHeader
        companyName={model.companyName}
        companyAddress={model.companyAddress}
        companyPhone={model.companyPhone}
        companyEmail={model.companyEmail}
        companyWeb={model.companyWeb}
        logoUrl={model.logoUrl}
        accent={colors.accent}
        subtitle="Arrival notice"
      />
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{model.formatName}</div>
      <div style={{ fontSize: 9, color: colors.muted, marginBottom: 10 }}>{model.formatCode}</div>
      <PartyTriple shipper={model.shipper} consignee={model.consignee} notify={model.notify} accent={colors.accent} />
      <SectionTitle accent={colors.accent}>Shipment</SectionTitle>
      <KeyValueGrid
        items={[
          { label: 'Vessel / flight', value: model.vesselFlight },
          { label: 'POL', value: model.pol },
          { label: 'POD', value: model.pod },
          { label: 'ETA', value: model.eta },
          { label: 'Reference', value: model.referenceNo },
          { label: 'Job', value: model.jobNumber || model.shipmentNumber },
        ]}
      />
      <SectionTitle accent={colors.accent}>Cargo details</SectionTitle>
      {model.commodity ? <div style={{ fontSize: 10, marginBottom: 6 }}>{model.commodity}</div> : null}
      <DataTable headers={model.tableHeaders} rows={model.tableRows} />
      {(model.lines?.length || model.total) && (
        <ChargesTable
          lines={model.lines}
          currencyCode={model.currencyCode}
          subtotal={model.subtotal}
          tax={model.tax}
          total={model.total}
          accent={colors.accent}
        />
      )}
      <div
        style={{
          marginTop: 12,
          padding: 8,
          border: `1px solid ${colors.accent}`,
          fontSize: 10,
          background: '#ecfeff',
        }}
      >
        Please arrange clearance and delivery. Contact operations with the job/reference above.
      </div>
      <SignatureBlock labels={['Operations', 'Customer acknowledgment']} />
    </DocPageChrome>
  );
}
