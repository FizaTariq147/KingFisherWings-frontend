/**
 * HBL template-v2 structured shipping document.
 * Catalogue browse still prefers official Fresa sample PDFs when available.
 * Classic family React docs remain available via generateHblFamilyClassicPdf.
 */
import type { HblViewModel } from '../../mappings/types';
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

type Props = { model: HblViewModel };

const variantAccent: Record<string, string> = {
  jasper: '#0f3d5e',
  combined: '#1e3a5f',
  multimodal: '#14532d',
  mt: '#7c2d12',
  ocean: '#0e7490',
};

export function HblTemplateDocument({ model }: Props) {
  const accent = variantAccent[model.variant] || colors.band;
  return (
    <DocPageChrome data-report-template={`hbl.${model.variant}`}>
      <BrandHeader
        companyName={model.companyName}
        companyAddress={model.companyAddress}
        companyPhone={model.companyPhone}
        companyEmail={model.companyEmail}
        companyWeb={model.companyWeb}
        logoUrl={model.logoUrl}
        accent={accent}
        subtitle={`HBL · ${model.variant}`}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{model.formatName}</div>
          <div style={{ fontSize: 9, color: colors.muted }}>{model.formatCode}</div>
        </div>
        <div
          style={{
            border: `2px solid ${accent}`,
            padding: '6px 10px',
            minWidth: 140,
            textAlign: 'right',
          }}
        >
          <div style={{ fontSize: 8, fontWeight: 700, color: colors.muted }}>BILL OF LADING NO.</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{model.blNumber || '—'}</div>
        </div>
      </div>
      <PartyTriple
        shipper={model.shipper}
        consignee={model.consignee}
        notify={model.notify}
        accent={accent}
      />
      <SectionTitle accent={accent}>Vessel / ports</SectionTitle>
      <KeyValueGrid
        items={[
          { label: 'Vessel / Voyage', value: model.vesselFlight },
          { label: 'Port of loading', value: model.pol },
          { label: 'Port of discharge', value: model.pod },
          { label: 'ETD', value: model.etd },
          { label: 'ETA', value: model.eta },
          { label: 'Job / shipment', value: model.jobNumber || model.shipmentNumber },
        ]}
      />
      <SectionTitle accent={accent}>Cargo</SectionTitle>
      {model.commodity ? (
        <div style={{ fontSize: 10, marginBottom: 6 }}>Commodity: {model.commodity}</div>
      ) : null}
      <DataTable headers={model.tableHeaders} rows={model.tableRows} />
      <SectionTitle accent={accent}>Freight</SectionTitle>
      <div style={{ fontSize: 10, color: colors.muted, marginBottom: 8 }}>
        Freight as arranged / per carrier tariff. Particulars furnished by shipper.
      </div>
      {model.verificationNote ? (
        <div style={{ fontSize: 8, color: colors.muted }}>{model.verificationNote}</div>
      ) : null}
      <SignatureBlock labels={['Carrier', 'Shipper', 'Date of issue']} />
    </DocPageChrome>
  );
}
