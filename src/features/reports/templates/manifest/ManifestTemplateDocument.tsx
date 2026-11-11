import type { ManifestViewModel } from '../../mappings/types';
import {
  BrandHeader,
  DataTable,
  DocPageChrome,
  KeyValueGrid,
  SectionTitle,
  colors,
} from '../shared';

type Props = { model: ManifestViewModel };

export function ManifestTemplateDocument({ model }: Props) {
  return (
    <DocPageChrome orientation="landscape" data-report-template="cargo_manifest.dense">
      <BrandHeader
        companyName={model.companyName}
        companyAddress={model.companyAddress}
        companyPhone={model.companyPhone}
        companyEmail={model.companyEmail}
        companyWeb={model.companyWeb}
        logoUrl={model.logoUrl}
        accent={colors.ink}
        subtitle="Cargo manifest"
      />
      <div style={{ fontSize: 14, fontWeight: 700 }}>{model.formatName}</div>
      <div style={{ fontSize: 9, color: colors.muted, marginBottom: 8 }}>{model.formatCode}</div>
      <KeyValueGrid
        columns={4}
        items={[
          { label: 'Vessel / flight', value: model.vesselFlight },
          { label: 'POL', value: model.pol },
          { label: 'POD', value: model.pod },
          { label: 'ETD', value: model.etd },
          { label: 'ETA', value: model.eta },
          { label: 'Reference', value: model.referenceNo },
          { label: 'Job', value: model.jobNumber },
          { label: 'Shipment', value: model.shipmentNumber },
        ]}
      />
      <SectionTitle accent={colors.ink}>Manifest lines</SectionTitle>
      <DataTable headers={model.tableHeaders} rows={model.tableRows} dense />
    </DocPageChrome>
  );
}
